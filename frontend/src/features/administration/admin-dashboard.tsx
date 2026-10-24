"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { type Status } from "@/domain/reports/model";
import { useReports } from "@/application/reports/provider";
import { LoadingState, ErrorState } from "@/shared/ui/feedback";
import { StatusBadge } from "@/shared/ui/report-badges";
import { ReportContent } from "@/features/reports/report-content";
import { ReportEditor } from "./report-editor";
import { ReportsBoard } from "./reports-board";
import { ReportsList } from "./reports-list";
import { WorkFilterBar } from "./work-filters";
import { defaultFilters, filterWorkReports, viewStatuses } from "./work-queue";
import { calendarDate } from "@/shared/lib/date-range";
import { workSection } from "./work-navigation";

export function AdminDashboard({
    sectionId,
    initialSearch,
}: {
    sectionId: string;
    initialSearch: string;
}) {
    const section = workSection(sectionId);
    const Icon = section.icon;
    const query = useReports();
    const [today] = useState(() => calendarDate(new Date()));
    const [filters, setFilters] = useState(() => ({
        ...defaultFilters(section.view, today),
        search: initialSearch,
    }));
    const [selection, setSelection] = useState<{ id: string; status?: Status } | null>(null);
    const filtered = useMemo(
        () => filterWorkReports(query.data?.reports ?? [], filters),
        [query.data?.reports, filters],
    );

    if (query.isPending)
        return (
            <div className="page">
                <LoadingState />
            </div>
        );
    if (query.error)
        return (
            <div className="page">
                <ErrorState
                    message={query.error.message}
                    retry={() => {
                        void query.refetch();
                    }}
                />
            </div>
        );

    const reports = query.data.reports;
    const selected = reports.find((report) => report.id === selection?.id);
    const listView = section.layout === "list";
    const filterKey = JSON.stringify(filters);

    return (
        <div className="work-queue">
            <header className="work-queue__heading">
                <span className="work-queue__icon">
                    <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                    <h1>{section.label}</h1>
                    <p>
                        Urząd Miasta Łodzi <span>·</span> Panel urzędnika
                    </p>
                </div>
                <span className="work-queue__total" aria-live="polite">
                    Liczba zgłoszeń: {filtered.length}
                </span>
            </header>
            <WorkFilterBar filters={filters} today={today} onChange={setFilters} />
            {!filtered.length && (
                <div className="work-queue__no-results" aria-live="polite">
                    <strong>Brak zgłoszeń w tym zakresie</strong>
                    <span>Zmień daty, wyszukiwane hasło lub pozostałe filtry.</span>
                    <button
                        type="button"
                        className="text-link"
                        onClick={() => setFilters(defaultFilters(filters.view, today))}
                    >
                        Przywróć domyślny widok
                    </button>
                </div>
            )}
            {listView ? (
                <ReportsList
                    key={filterKey}
                    reports={filtered}
                    onOpen={(report) => setSelection({ id: report.id })}
                />
            ) : (
                <ReportsBoard
                    key={filterKey}
                    reports={filtered}
                    allowedStatuses={filters.status ? [filters.status] : viewStatuses(filters.view)}
                    onOpen={(report, suggestedStatus) =>
                        setSelection({ id: report.id, status: suggestedStatus })
                    }
                />
            )}
            {selected && (
                <dialog
                    className="admin-detail"
                    aria-label={`Obsługa ${selected.id}`}
                    ref={(element) => {
                        if (element && !element.open) element.showModal();
                    }}
                    onCancel={() => setSelection(null)}
                >
                    <div className="admin-detail__heading">
                        <h2>Obsługa sprawy {selected.id}</h2>
                        <button
                            className="icon-button"
                            aria-label="Zamknij"
                            onClick={() => setSelection(null)}
                        >
                            <X size={15} />
                        </button>
                    </div>
                    <div className="admin-detail__summary">
                        <span className="eyebrow">{selected.id}</span>
                        <h2>{selected.title}</h2>
                        <p>{selected.address}</p>
                        <StatusBadge status={selected.status} />
                    </div>
                    <ReportEditor
                        key={`${selected.id}-${selection?.status ?? ""}`}
                        report={selected}
                        reports={reports}
                        initialStatus={selection?.status}
                    />
                    <div className="admin-detail__content">
                        <ReportContent report={selected} minimalMap={filters.view === "archive"} />
                        <div className="admin-detail__public-link">
                            <Link href={`/zgloszenia/${selected.id}`} className="text-link">
                                Otwórz widok publiczny
                            </Link>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
}
