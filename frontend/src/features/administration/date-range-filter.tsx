"use client";

import { useRef, useState } from "react";
import { CalendarDays, Check, ChevronDown } from "lucide-react";
import { dateRange, type DateRange, type DatePreset } from "@/shared/lib/date-range";

const presets = [
    { value: "7", label: "Ostatnie 7 dni" },
    { value: "30", label: "Ostatnie 30 dni" },
    { value: "90", label: "Ostatnie 90 dni" },
    { value: "month", label: "Bieżący miesiąc" },
] as const;
const format = new Intl.DateTimeFormat("pl", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Warsaw",
});
export function rangeLabel(range: DateRange) {
    if (range.preset === "unlimited") return "Bez ograniczenia daty";
    return `${format.format(new Date(`${range.from}T12:00:00Z`))} – ${format.format(new Date(`${range.to}T12:00:00Z`))}`;
}

export function DateRangeFilter({
    range,
    today,
    allowUnlimited,
    onChange,
}: {
    range: DateRange;
    today: string;
    allowUnlimited: boolean;
    onChange: (range: DateRange) => void;
}) {
    const details = useRef<HTMLDetailsElement>(null);
    const [custom, setCustom] = useState(range.preset === "custom");
    const [from, setFrom] = useState(range.from || dateRange("30", today).from);
    const [to, setTo] = useState(range.to || today);
    function apply(preset: Exclude<DatePreset, "custom">) {
        onChange(dateRange(preset, today));
        if (details.current) details.current.open = false;
    }
    const label =
        presets.find((item) => item.value === range.preset)?.label ??
        (range.preset === "custom" ? "Własny zakres" : "Bez ograniczenia daty");
    return (
        <details className="date-range-filter" ref={details}>
            <summary>
                <CalendarDays size={15} />
                <span>
                    <small>Data zgłoszenia</small>
                    <strong>{label}</strong>
                </span>
                <ChevronDown size={13} />
            </summary>
            <div className="date-range-filter__popover">
                <p className="date-range-filter__label">Zakres dat zgłoszenia</p>
                {allowUnlimited && (
                    <button
                        type="button"
                        aria-pressed={range.preset === "unlimited"}
                        onClick={() => apply("unlimited")}
                    >
                        Bez ograniczenia daty{range.preset === "unlimited" && <Check size={14} />}
                    </button>
                )}
                {presets.map(({ value, label: name }) => (
                    <button
                        key={value}
                        type="button"
                        aria-pressed={range.preset === value}
                        onClick={() => apply(value)}
                    >
                        {name}
                        {range.preset === value && <Check size={14} />}
                    </button>
                ))}
                <button type="button" aria-expanded={custom} onClick={() => setCustom(!custom)}>
                    Własny zakres
                    <CalendarDays size={13} />
                </button>
                {custom && (
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            if (!from || !to || from > to) return;
                            onChange({ preset: "custom", from, to });
                            if (details.current) details.current.open = false;
                        }}
                    >
                        <label className="field">
                            Od
                            <input
                                aria-label="Data zgłoszenia od"
                                type="date"
                                required
                                value={from}
                                max={to || today}
                                onChange={(event) => setFrom(event.target.value)}
                            />
                        </label>
                        <label className="field">
                            Do
                            <input
                                aria-label="Data zgłoszenia do"
                                type="date"
                                required
                                value={to}
                                min={from}
                                max={today}
                                onChange={(event) => setTo(event.target.value)}
                            />
                        </label>
                        {from && to && from > to && (
                            <p className="inline-error" role="alert">
                                Data końcowa nie może być wcześniejsza niż początkowa.
                            </p>
                        )}
                        <button className="button button--primary" type="submit">
                            Zastosuj zakres
                        </button>
                    </form>
                )}
            </div>
        </details>
    );
}
