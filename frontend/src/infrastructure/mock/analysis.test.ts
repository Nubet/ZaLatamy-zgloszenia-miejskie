import { expect, it, vi } from "vite-plus/test";
import { mockAnalysis } from "./analysis";
import { validatePhoto } from "@/domain/reports/rules";

it("returns an editable proposal and a recoverable analysis error", async () => {
    vi.useFakeTimers();
    try {
        const proposal = mockAnalysis.analyze("/demo/road.svg", "road");
        await vi.runAllTimersAsync();
        expect(await proposal).toMatchObject({ category: "road" });
        const failure = expect(mockAnalysis.analyze("/demo/road.svg", "error")).rejects.toThrow(
            /Nie udało się przygotować opisu/,
        );
        await vi.runAllTimersAsync();
        await failure;
    } finally {
        vi.useRealTimers();
    }
});
it("rejects unsupported, empty and oversized uploads", () => {
    expect(() => validatePhoto(new File(["text"], "file.txt", { type: "text/plain" }))).toThrow(
        /JPG/,
    );
    expect(() => validatePhoto(new File([], "empty.jpg", { type: "image/jpeg" }))).toThrow(/pusty/);
    expect(() =>
        validatePhoto(
            new File([new Uint8Array(8 * 1024 * 1024 + 1)], "large.jpg", { type: "image/jpeg" }),
        ),
    ).toThrow(/8 MB/);
});
