export type DatePreset = "unlimited" | "7" | "30" | "90" | "month" | "custom";
export type DateRange = { preset: DatePreset; from: string; to: string };

const calendar = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

export function calendarDate(date: Date) {
    return calendar.format(date);
}

export function dateRange(preset: Exclude<DatePreset, "custom">, today: string): DateRange {
    if (preset === "unlimited") return { preset, from: "", to: "" };
    const start = new Date(`${today}T12:00:00Z`);
    if (preset === "month") start.setUTCDate(1);
    else start.setUTCDate(start.getUTCDate() - Number(preset) + 1);
    return { preset, from: start.toISOString().slice(0, 10), to: today };
}

export function isWithinDateRange(value: string, range: DateRange) {
    if (range.preset === "unlimited") return true;
    const day = calendarDate(new Date(value));
    return day >= range.from && day <= range.to;
}
