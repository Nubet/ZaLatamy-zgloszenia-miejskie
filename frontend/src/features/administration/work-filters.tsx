"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { FilterSelect, SearchField } from "@/shared/ui/filter-controls";
import {
    categories,
    statuses,
    priorities,
    categorySchema,
    statusSchema,
    prioritySchema,
} from "@/domain/reports/model";
import { DateRangeFilter, rangeLabel } from "./date-range-filter";
import { viewStatuses, type WorkFilters } from "./work-queue";

export function WorkFilterBar({
    filters,
    today,
    onChange,
}: {
    filters: WorkFilters;
    today: string;
    onChange: (next: WorkFilters) => void;
}) {
    const extraCount = [filters.status, filters.category, filters.priority].filter(Boolean).length;
    return (
        <>
            <div className="work-queue__navigation work-queue__navigation--filters">
                <DateRangeFilter
                    key={JSON.stringify(filters.range)}
                    range={filters.range}
                    today={today}
                    allowUnlimited={filters.view !== "archive"}
                    onChange={(range) => onChange({ ...filters, range })}
                />
                <div className="work-queue__toolbar">
                    <SearchField
                        value={filters.search}
                        onChange={(search) => onChange({ ...filters, search })}
                    />
                    <details className="work-queue__filters">
                        <summary>
                            <SlidersHorizontal size={14} />
                            Filtry
                            {extraCount > 0 && (
                                <span className="work-queue__count">{extraCount}</span>
                            )}
                        </summary>
                        <div className="work-queue__filter-popover">
                            <div className="work-queue__filter-heading">
                                <strong>Filtruj zgłoszenia</strong>
                                <button
                                    type="button"
                                    className="text-link"
                                    onClick={() =>
                                        onChange({
                                            ...filters,
                                            status: "",
                                            category: "",
                                            priority: "",
                                        })
                                    }
                                >
                                    Wyczyść
                                </button>
                            </div>
                            <FilterSelect
                                label="Status"
                                aria-label="Filtr statusu"
                                value={filters.status}
                                onValueChange={(value) =>
                                    onChange({
                                        ...filters,
                                        status: value ? statusSchema.parse(value) : "",
                                    })
                                }
                                options={[
                                    { value: "", label: "Wszystkie w tym widoku" },
                                    ...viewStatuses(filters.view).map((value) => ({
                                        value,
                                        label: statuses[value],
                                    })),
                                ]}
                            />
                            <FilterSelect
                                label="Kategoria"
                                aria-label="Filtr kategorii"
                                value={filters.category}
                                onValueChange={(value) =>
                                    onChange({
                                        ...filters,
                                        category: value ? categorySchema.parse(value) : "",
                                    })
                                }
                                options={[
                                    { value: "", label: "Wszystkie kategorie" },
                                    ...Object.entries(categories).map(([value, label]) => ({
                                        value,
                                        label,
                                    })),
                                ]}
                            />
                            <FilterSelect
                                label="Priorytet"
                                aria-label="Filtr priorytetu"
                                value={filters.priority}
                                onValueChange={(value) =>
                                    onChange({
                                        ...filters,
                                        priority: value ? prioritySchema.parse(value) : "",
                                    })
                                }
                                options={[
                                    { value: "", label: "Każdy priorytet" },
                                    ...Object.entries(priorities).map(([value, label]) => ({
                                        value,
                                        label,
                                    })),
                                ]}
                            />
                        </div>
                    </details>
                    <FilterSelect
                        label="Sortuj według"
                        aria-label="Sortowanie zgłoszeń"
                        value={filters.sort}
                        onValueChange={(value) =>
                            onChange({
                                ...filters,
                                sort:
                                    value === "priority"
                                        ? "priority"
                                        : value === "confirmations"
                                          ? "confirmations"
                                          : value === "oldest"
                                            ? "oldest"
                                            : "newest",
                            })
                        }
                        options={[
                            { value: "priority", label: "Pilne najpierw" },
                            { value: "confirmations", label: "Najwięcej potwierdzeń" },
                            { value: "oldest", label: "Najstarsze" },
                            { value: "newest", label: "Najnowsze" },
                        ]}
                    />
                </div>
            </div>
            <div className="work-queue__scope">
                <div>
                    <strong>
                        {filters.view === "active"
                            ? "Niezakończone sprawy"
                            : filters.view === "archive"
                              ? "Zakończone sprawy"
                              : "Wszystkie statusy"}
                    </strong>
                    <span>{rangeLabel(filters.range)}</span>
                    {filters.status && (
                        <span className="work-queue__filter-chip">
                            {statuses[filters.status]}
                            <button
                                aria-label="Usuń filtr statusu"
                                onClick={() => onChange({ ...filters, status: "" })}
                            >
                                <X size={11} />
                            </button>
                        </span>
                    )}
                    {filters.category && (
                        <span className="work-queue__filter-chip">
                            {categories[filters.category]}
                            <button
                                aria-label="Usuń filtr kategorii"
                                onClick={() => onChange({ ...filters, category: "" })}
                            >
                                <X size={11} />
                            </button>
                        </span>
                    )}
                    {filters.priority && (
                        <span className="work-queue__filter-chip">
                            {priorities[filters.priority]}
                            <button
                                aria-label="Usuń filtr priorytetu"
                                onClick={() => onChange({ ...filters, priority: "" })}
                            >
                                <X size={11} />
                            </button>
                        </span>
                    )}
                </div>
            </div>
            {filters.search.trim() && (
                <p className="work-queue__search-context">
                    Wyniki dla „{filters.search.trim()}” ·{" "}
                    {filters.range.preset === "unlimited"
                        ? "wszystkie daty"
                        : "w wybranym widoku i zakresie dat"}
                </p>
            )}
        </>
    );
}
