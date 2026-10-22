import { expect, it } from "vite-plus/test";
import { calendarDate, dateRange, isWithinDateRange } from "./date-range";

it("uses the last 30 Warsaw calendar days including both full endpoint days", () => {
    const range = dateRange("30", calendarDate(new Date("2026-10-20T12:00:00Z")));
    expect(range).toEqual({ preset: "30", from: "2026-09-21", to: "2026-10-20" });
    expect(isWithinDateRange("2026-09-20T21:59:59Z", range)).toBe(false);
    expect(isWithinDateRange("2026-09-20T22:00:00Z", range)).toBe(true);
    expect(isWithinDateRange("2026-10-20T21:59:59Z", range)).toBe(true);
    expect(isWithinDateRange("2026-10-20T22:00:00Z", range)).toBe(false);
});

it("handles the daylight-saving change and leaves unlimited ranges unrestricted", () => {
    const range = dateRange("30", "2026-10-26");
    expect(isWithinDateRange("2026-10-26T22:59:59Z", range)).toBe(true);
    expect(isWithinDateRange("2026-10-26T23:00:00Z", range)).toBe(false);
    expect(isWithinDateRange("2020-01-01T00:00:00Z", dateRange("unlimited", "2026-10-26"))).toBe(
        true,
    );
});
