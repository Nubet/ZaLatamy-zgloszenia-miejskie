import { describe, expect, it } from "vite-plus/test";
import { createSeed } from "@/infrastructure/mock/seed";
import { defaultFilters, filterWorkReports } from "./work-queue";
import { dateRange } from "@/shared/lib/date-range";

const base = createSeed().reports[0]!;

describe("Officer work queue", () => {
    it("keeps old unfinished reports in the default queue without including closed cases", () => {
        const old = {
            ...base,
            id: "OLD",
            status: "progress" as const,
            createdAt: "2020-01-01T10:00:00Z",
        };
        const closed = { ...old, id: "CLOSED", status: "resolved" as const };
        expect(
            filterWorkReports([old, closed], defaultFilters("active", "2026-10-20")).map(
                (item) => item.id,
            ),
        ).toEqual(["OLD"]);
        expect(filterWorkReports([old, closed], defaultFilters("all", "2026-10-20"))).toHaveLength(
            0,
        );
        const listFilters = {
            ...defaultFilters("all", "2026-10-20"),
            range: dateRange("unlimited", "2026-10-20"),
        };
        expect(filterWorkReports([old, closed], listFilters)).toHaveLength(2);
        expect(
            filterWorkReports([old, closed], { ...listFilters, search: "CLOSED" }).map(
                (item) => item.id,
            ),
        ).toEqual(["CLOSED"]);
    });

    it("defaults the report list to the last 30 calendar days, including both endpoints", () => {
        const filters = defaultFilters("all", "2026-10-20");
        expect(filters.range).toEqual({ preset: "30", from: "2026-09-21", to: "2026-10-20" });
        const reports = [
            { ...base, id: "BEFORE", createdAt: "2026-09-20T12:00:00Z" },
            { ...base, id: "FIRST-DAY", createdAt: "2026-09-21T12:00:00Z" },
            {
                ...base,
                id: "LAST-DAY",
                status: "resolved" as const,
                createdAt: "2026-10-20T12:00:00Z",
            },
            { ...base, id: "AFTER", createdAt: "2026-10-21T12:00:00Z" },
        ];
        expect(filterWorkReports(reports, filters).map((report) => report.id)).toEqual([
            "LAST-DAY",
            "FIRST-DAY",
        ]);
    });

    it("includes both ends of a Warsaw calendar day across the daylight saving change", () => {
        const dates = [
            "2026-03-28T22:59:59Z",
            "2026-03-28T23:00:00Z",
            "2026-03-29T21:59:59Z",
            "2026-03-29T22:00:00Z",
        ];
        const reports = dates.map((createdAt, index) => ({
            ...base,
            id: String(index),
            createdAt,
        }));
        const filters = {
            ...defaultFilters("all", "2026-03-29"),
            range: { preset: "custom" as const, from: "2026-03-29", to: "2026-03-29" },
        };
        expect(filterWorkReports(reports, filters).map((item) => item.id)).toEqual(["2", "1"]);
    });

    it("uses inclusive calendar presets, including month and leap-year boundaries", () => {
        expect(dateRange("30", "2026-10-20")).toEqual({
            preset: "30",
            from: "2026-09-21",
            to: "2026-10-20",
        });
        expect(dateRange("7", "2024-03-01").from).toBe("2024-02-24");
        expect(dateRange("month", "2026-10-20").from).toBe("2026-10-01");
        expect(defaultFilters("archive", "2026-10-20").range.preset).toBe("90");
    });

    it("restricts archives to closed cases and combines search, category and priority filters", () => {
        const reports = [
            {
                ...base,
                id: "CLOSED",
                status: "resolved" as const,
                title: "Latarnia przy szkole",
                category: "lighting" as const,
                priority: "high" as const,
                createdAt: "2026-10-20T10:00:00Z",
            },
            {
                ...base,
                id: "OPEN",
                status: "new" as const,
                title: "Latarnia przy szkole",
                category: "lighting" as const,
                priority: "high" as const,
                createdAt: "2026-10-20T10:00:00Z",
            },
        ];
        const filters = {
            ...defaultFilters("archive", "2026-10-20"),
            search: "  LATARNIA ",
            category: "lighting" as const,
            priority: "high" as const,
        };
        expect(filterWorkReports(reports, filters).map((item) => item.id)).toEqual(["CLOSED"]);
        expect(filterWorkReports(reports, { ...filters, category: "road" })).toHaveLength(0);
    });

    it("puts urgent and then oldest cases first without mutating the source list", () => {
        const reports = [
            {
                ...base,
                id: "NORMAL",
                status: "new" as const,
                priority: "normal" as const,
                createdAt: "2020-01-01T10:00:00Z",
            },
            {
                ...base,
                id: "NEW-URGENT",
                status: "new" as const,
                priority: "high" as const,
                createdAt: "2026-10-20T10:00:00Z",
            },
            {
                ...base,
                id: "OLD-URGENT",
                status: "new" as const,
                priority: "high" as const,
                createdAt: "2025-01-01T10:00:00Z",
            },
        ];
        expect(
            filterWorkReports(reports, defaultFilters("active", "2026-10-20")).map(
                (item) => item.id,
            ),
        ).toEqual(["OLD-URGENT", "NEW-URGENT", "NORMAL"]);
        expect(reports[0]?.id).toBe("NORMAL");
    });

    it("keeps priority sorting independent from confirmations and sorts confirmations without priority tie-breaks", () => {
        const reports = [
            {
                ...base,
                id: "POPULAR",
                status: "new" as const,
                priority: "normal" as const,
                createdAt: "2026-10-20T10:00:00Z",
                confirmations: ["a", "b", "c"],
            },
            {
                ...base,
                id: "OLD",
                status: "new" as const,
                priority: "normal" as const,
                createdAt: "2020-01-01T10:00:00Z",
                confirmations: [],
            },
            {
                ...base,
                id: "URGENT",
                status: "new" as const,
                priority: "high" as const,
                createdAt: "2026-10-20T11:00:00Z",
                confirmations: [],
            },
        ];
        const filters = defaultFilters("active", "2026-10-20");
        expect(filterWorkReports(reports, filters).map((item) => item.id)).toEqual([
            "URGENT",
            "OLD",
            "POPULAR",
        ]);
        expect(
            filterWorkReports(reports, { ...filters, sort: "confirmations" }).map(
                (item) => item.id,
            ),
        ).toEqual(["POPULAR", "OLD", "URGENT"]);
    });
});
