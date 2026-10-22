import type { ComponentProps } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export function FilterSelect({
    label,
    children,
    ...props
}: ComponentProps<"select"> & { label: string }) {
    return (
        <label className="filter-select">
            <span>{label}</span>
            <select {...props}>{children}</select>
            <ChevronDown size={12} aria-hidden="true" />
        </label>
    );
}

export function SearchField({
    value,
    onChange,
    label = "Szukaj zgłoszeń",
    placeholder = "Numer, tytuł lub ulica…",
}: {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
}) {
    return (
        <label className="search-field">
            <Search size={15} aria-hidden="true" />
            <input
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                aria-label={label}
            />
            {value && (
                <button
                    type="button"
                    className="search-field__clear"
                    aria-label="Wyczyść wyszukiwanie"
                    onClick={() => onChange("")}
                >
                    <X size={12} aria-hidden="true" />
                </button>
            )}
        </label>
    );
}
