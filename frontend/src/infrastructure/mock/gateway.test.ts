import "fake-indexeddb/auto";
import { beforeEach, afterEach, expect, it, vi } from "vite-plus/test";
import { mockGateway } from "./gateway";
import { createSeed } from "./seed";
import { localResidentId } from "@/domain/reports/model";
import { reportSupport } from "@/domain/reports/rules";
import * as idb from "idb-keyval";

vi.mock("idb-keyval", async (importOriginal) => {
    const actual = await importOriginal<typeof import("idb-keyval")>();
    return { ...actual, set: vi.fn(actual.set) };
});

beforeEach(() => {
    vi.clearAllMocks();
    const storage = new Map<string, string>();
    vi.stubGlobal("localStorage", {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
    });
});
afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

it("persists a new report, status history, notification and read state", async () => {
    const fixture = createSeed().reports[0]!;
    const highPriorityInput = { ...fixture, priority: "high" as const };
    const report = await mockGateway.create(highPriorityInput, ["/demo/road.svg"]);
    expect(report.priority).toBe("normal");
    expect(reportSupport(report, [report])).toMatchObject({
        count: 1,
        confirmed: true,
        authored: true,
    });
    expect((await mockGateway.load()).reports[0]?.id).toBe(report.id);
    await mockGateway.update(report.id, {
        status: "resolved",
        priority: "high",
        comment: "Usterka została naprawiona.",
        duplicateOf: null,
    });
    const state = await mockGateway.load();
    expect(state.reports[0]).toMatchObject({ status: "resolved", priority: "high" });
    expect(state.reports[0]?.history.at(-1)?.text).toBe("Usterka została naprawiona.");
    expect(state.notifications[0]?.reportId).toBe(report.id);
    await mockGateway.markRead(state.notifications[0]!.id);
    expect((await mockGateway.load()).notifications[0]?.read).toBe(true);
});

it("keeps all five IndexedDB photos in order and removes them when resetting", async () => {
    const file = new File(["demo photo"], "demo.png", { type: "image/png" });
    const report = await mockGateway.create(
        createSeed().reports[0]!,
        Array.from({ length: 5 }, () => file),
    );
    expect(report.images).toHaveLength(5);
    expect(new Set(report.images).size).toBe(5);
    expect((await mockGateway.load()).reports[0]?.images).toEqual(report.images);
    for (const image of report.images) expect(await mockGateway.photo(image)).toBeInstanceOf(Blob);
    await mockGateway.reset();
    for (const image of report.images) expect(await mockGateway.photo(image)).toBeUndefined();
    expect((await mockGateway.load()).reports).toHaveLength(12);
});

it("rejects out-of-city submissions and retains data on a failed metadata write", async () => {
    const fixture = createSeed().reports[0]!;
    await expect(
        mockGateway.create({ ...fixture, location: { longitude: 21, latitude: 52 } }, [
            "/demo/road.svg",
        ]),
    ).rejects.toThrow(/Łodzi/);
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
    });
    const write = vi.mocked(idb.set);
    const file = new File(["photo"], "photo.png", { type: "image/png" });
    await expect(mockGateway.create(fixture, [file, file])).rejects.toThrow(/zapisać/);
    for (const [key] of write.mock.calls)
        expect(await mockGateway.photo(String(key))).toBeUndefined();
    expect((await mockGateway.load()).reports).toHaveLength(12);
});

it("rejects empty or oversized collections and invalid files without saving", async () => {
    const fixture = createSeed().reports[0]!;
    await expect(mockGateway.create(fixture, [])).rejects.toThrow(/od 1 do 5/);
    await expect(mockGateway.create(fixture, Array(6).fill("/demo/road.svg"))).rejects.toThrow(
        /od 1 do 5/,
    );
    await expect(
        mockGateway.create(fixture, [new File(["bad"], "bad.txt", { type: "text/plain" })]),
    ).rejects.toThrow(/JPG/);
    expect((await mockGateway.load()).reports).toHaveLength(12);
});

it("rejects invalid stored data without overwriting it", async () => {
    const raw = JSON.stringify({ ...createSeed(), reports: [null] });
    localStorage.setItem("lodz-reports-v1", raw);
    await expect(mockGateway.load()).rejects.toThrow(/nieobsługiwany format/);
    expect(localStorage.getItem("lodz-reports-v1")).toBe(raw);
});

it("rolls back earlier files if writing a later photo fails", async () => {
    const file = new File(["photo"], "photo.png", { type: "image/png" });
    const { set: original } = await vi.importActual<typeof import("idb-keyval")>("idb-keyval");
    const write = vi
        .mocked(idb.set)
        .mockImplementationOnce(original)
        .mockRejectedValueOnce(new Error("Storage full"));
    await expect(mockGateway.create(createSeed().reports[0]!, [file, file])).rejects.toThrow(
        "Storage full",
    );
    for (const [key] of write.mock.calls)
        expect(await mockGateway.photo(String(key))).toBeUndefined();
    expect((await mockGateway.load()).reports).toHaveLength(12);
});

it("persists idempotent confirmations and withdrawals without changing priority, history or watching", async () => {
    const initial = createSeed().reports[1]!;
    await mockGateway.setConfirmation(initial.id, true);
    await mockGateway.setConfirmation(initial.id, true);
    let reports = (await mockGateway.load()).reports;
    let report = reports.find((item) => item.id === initial.id)!;
    expect(reportSupport(report, reports)).toEqual({ count: 2, confirmed: true, authored: false });
    expect(report).toMatchObject({
        priority: initial.priority,
        history: initial.history,
        watching: initial.watching,
    });
    expect(report.confirmations).toEqual([localResidentId]);
    await mockGateway.setConfirmation(initial.id, false);
    await mockGateway.setConfirmation(initial.id, false);
    reports = (await mockGateway.load()).reports;
    report = reports.find((item) => item.id === initial.id)!;
    expect(reportSupport(report, reports)).toMatchObject({ count: 1, confirmed: false });
});

it("rejects changes to closed cases, unknown reports and withdrawal of the author's confirmation", async () => {
    const reports = createSeed().reports;
    await expect(mockGateway.setConfirmation("missing", true)).rejects.toThrow(/znaleziono/);
    await expect(mockGateway.setConfirmation(reports[4]!.id, true)).rejects.toThrow(/zakończona/);
    await expect(mockGateway.setConfirmation(reports[0]!.id, false)).rejects.toThrow(/Autor/);
    await mockGateway.setConfirmation(reports[0]!.id, true);
    const loaded = (await mockGateway.load()).reports;
    expect(reportSupport(loaded[0]!, loaded).count).toBe(1);
});

it("combines unique supporters on linking, routes confirmations and notifies watchers of linked cases", async () => {
    const state = createSeed();
    const target = state.reports[1]!;
    const source = state.reports[5]!;
    target.confirmations = ["resident:shared"];
    source.confirmations = ["resident:shared", localResidentId];
    source.watching = true;
    localStorage.setItem("lodz-reports-v1", JSON.stringify(state));
    await mockGateway.update(source.id, {
        status: "duplicate",
        priority: source.priority,
        comment: "Ten sam problem — połączono sprawy.",
        duplicateOf: target.id,
    });
    let loaded = await mockGateway.load();
    let merged = loaded.reports.find((item) => item.id === target.id)!;
    expect(reportSupport(merged, loaded.reports)).toMatchObject({ count: 4, confirmed: true });
    expect(loaded.reports.find((item) => item.id === source.id)).toMatchObject({
        images: source.images,
        duplicateOf: target.id,
    });
    await mockGateway.setConfirmation(source.id, false);
    expect(await mockGateway.setConfirmation(source.id, true)).toBe(target.id);
    loaded = await mockGateway.load();
    expect(loaded.reports.find((item) => item.id === source.id)?.confirmations).not.toContain(
        localResidentId,
    );
    merged = loaded.reports.find((item) => item.id === target.id)!;
    expect(merged.confirmations).toContain(localResidentId);
    await mockGateway.update(target.id, {
        status: "progress",
        priority: "normal",
        comment: "Rozpoczęto prace.",
        duplicateOf: null,
    });
    loaded = await mockGateway.load();
    expect(loaded.notifications[0]).toMatchObject({
        reportId: target.id,
        title: expect.stringContaining("W realizacji"),
    });
    expect(loaded.reports.find((item) => item.id === source.id)?.history).toHaveLength(
        source.history.length + 1,
    );
    await mockGateway.watch(target.id);
    loaded = await mockGateway.load();
    expect(
        loaded.reports
            .filter((item) => [source.id, target.id].includes(item.id))
            .every((item) => !item.watching),
    ).toBe(true);
});
