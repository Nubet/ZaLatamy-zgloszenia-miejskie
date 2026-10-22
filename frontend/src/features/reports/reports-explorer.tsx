"use client";

import { useState } from "react";
import Link from "next/link";
import {
    List,
    MapPinned,
    X,
    MapPin,
    Plus,
    ArrowRight,
    CheckCheck,
    Activity,
    Sparkles,
} from "lucide-react";
import { useReports } from "@/application/reports/provider";
import { categories, statuses, type Category, type Status } from "@/domain/reports/model";
import { CityMap } from "@/features/map/city-map";
import { ReportCard } from "./report-card";
import { PageHeading } from "@/shared/ui/page-heading";
import { LoadingState, ErrorState, EmptyState } from "@/shared/ui/feedback";
import { StatusBadge } from "@/shared/ui/report-badges";
import { FilterSelect, SearchField } from "@/shared/ui/filter-controls";
import { ReportSupport } from "@/shared/ui/report-support";
import { calendarDate, dateRange, isWithinDateRange } from "@/shared/lib/date-range";

export function ReportsExplorer() {
    const query = useReports();
    const [category, setCategory] = useState<Category | "">("");
    const [status, setStatus] = useState<Status | "">("");
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [mobileView, setMobileView] = useState<"map" | "list">("map");

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

    const range = dateRange("30", calendarDate(new Date(query.dataUpdatedAt)));
    const reports = query.data.reports.filter((report) =>
        isWithinDateRange(report.createdAt, range),
    );
    const filtered = reports.filter(
        (report) =>
            (!category || report.category === category) &&
            (!status || report.status === status) &&
            (status === "duplicate" || !report.duplicateOf) &&
            `${report.title} ${report.address} ${report.id}`
                .toLocaleLowerCase("pl")
                .includes(search.toLocaleLowerCase("pl")),
    );
    const selected = filtered.find((report) => report.id === selectedId);

    return (
        <div className="page reports-explorer">
            <PageHeading
                eyebrow="ŁÓDŹ"
                title="Twoje miasto. W Twoich rękach."
                description="Zauważasz problem? Zgłoś go. Sprawdź, co zmienia się w Twojej okolicy."
                action={
                    <Link href="/zgloszenia/nowe" className="button button--primary">
                        <Plus size={16} />
                        Zgłoś problem
                    </Link>
                }
            />
            <div className="stats-strip">
                <div className="stats-strip__card">
                    <span className="stats-strip__icon" aria-hidden="true">
                        <MapPinned size={17} />
                    </span>
                    <span className="stats-strip__copy">
                        <span>Zgłoszenia w mieście</span>
                        <strong>
                            {reports.length}
                            <small>spraw na mapie Łodzi</small>
                        </strong>
                    </span>
                </div>
                <div className="stats-strip__card">
                    <span
                        className="stats-strip__icon stats-strip__icon--resolved"
                        aria-hidden="true"
                    >
                        <CheckCheck size={17} />
                    </span>
                    <span className="stats-strip__copy">
                        <span>Rozwiązane sprawy</span>
                        <strong>
                            {reports.filter((report) => report.status === "resolved").length}
                            <small>małych zmian na lepsze</small>
                        </strong>
                    </span>
                </div>
                <div className="stats-strip__card">
                    <span
                        className="stats-strip__icon stats-strip__icon--progress"
                        aria-hidden="true"
                    >
                        <Activity size={17} />
                    </span>
                    <span className="stats-strip__copy">
                        <span>W realizacji</span>
                        <strong>
                            {reports.filter((report) => report.status === "progress").length}
                            <small>miasto już działa</small>
                        </strong>
                    </span>
                </div>
            </div>
            <div className="section-nav">
                <span>
                    <MapPinned size={15} /> Mapa okolicy{" "}
                    <span className="count-badge">{reports.length}</span>
                </span>
                <span className="section-nav__note">Ostatnie 30 dni</span>
            </div>
            <div className="reports-explorer__toolbar">
                <SearchField
                    value={search}
                    onChange={setSearch}
                    label="Szukaj ulicy lub zgłoszenia"
                />
                <FilterSelect
                    label="Kategoria"
                    aria-label="Kategoria"
                    value={category}
                    onValueChange={(value) => {
                        setCategory(value in categories ? (value as Category) : "");
                    }}
                    options={[
                        { value: "", label: "Wszystkie kategorie" },
                        ...Object.entries(categories).map(([value, label]) => ({ value, label })),
                    ]}
                />
                <FilterSelect
                    label="Status"
                    aria-label="Status"
                    value={status}
                    onValueChange={(value) => {
                        setStatus(value in statuses ? (value as Status) : "");
                    }}
                    options={[
                        { value: "", label: "Wszystkie statusy" },
                        ...Object.entries(statuses).map(([value, label]) => ({ value, label })),
                    ]}
                />
                {(category || status || search) && (
                    <button
                        className="button button--secondary"
                        aria-label="Wyczyść filtry"
                        onClick={() => {
                            setCategory("");
                            setStatus("");
                            setSearch("");
                        }}
                    >
                        <X size={15} />
                        Wyczyść
                    </button>
                )}
            </div>
            <div className="reports-explorer__view-toggle">
                <button aria-pressed={mobileView === "map"} onClick={() => setMobileView("map")}>
                    <MapPinned size={15} />
                    Mapa
                </button>
                <button aria-pressed={mobileView === "list"} onClick={() => setMobileView("list")}>
                    <List size={15} />
                    Lista ({filtered.length})
                </button>
            </div>
            <section
                className={`reports-explorer__grid reports-explorer__grid--${mobileView}`}
                aria-label="Zgłoszenia mieszkańców"
            >
                <div className="map-panel" id="reports-map-panel">
                    <CityMap
                        reports={filtered}
                        selectedId={selected?.id ?? null}
                        onSelect={setSelectedId}
                    />
                    {selected && (
                        <div className="reports-explorer__selection">
                            <button
                                className="icon-button"
                                aria-label="Zamknij podgląd"
                                onClick={() => setSelectedId(null)}
                            >
                                <X size={14} />
                            </button>
                            <StatusBadge status={selected.status} />
                            <h3>{selected.title}</h3>
                            <p>
                                <MapPin size={13} />
                                {selected.address}
                            </p>
                            <Link href={`/zgloszenia/${selected.id}`} className="text-link">
                                Zobacz szczegóły <ArrowRight size={14} />
                            </Link>
                            <ReportSupport key={selected.id} report={selected} />
                        </div>
                    )}
                </div>
                <div className="reports-explorer__results">
                    <div className="reports-explorer__list-heading">
                        <h2>
                            W Twojej okolicy <span>{filtered.length}</span>
                        </h2>
                        <span>Lista zgłoszeń</span>
                    </div>
                    <div className="reports-explorer__list">
                        {filtered.length ? (
                            filtered.map((report) => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    selected={selectedId === report.id}
                                    onSelect={() => {
                                        setSelectedId(report.id);
                                        setMobileView("map");
                                    }}
                                />
                            ))
                        ) : (
                            <EmptyState
                                title="Brak zgłoszeń"
                                description="Brak wyników spełniających wybrane kryteria."
                            />
                        )}
                    </div>
                </div>
            </section>
            <Link href="/zgloszenia/nowe" className="community-banner">
                <span className="community-banner__icon">
                    <Sparkles size={18} />
                </span>
                <span>
                    <strong>Lepsza okolica zaczyna się od jednego zdjęcia.</strong>
                    <small>Dodaj zdjęcie, wskaż miejsce. Resztę pomożemy Ci przygotować.</small>
                </span>
                <span className="community-banner__action">
                    Zgłoś problem <ArrowRight size={16} />
                </span>
            </Link>
        </div>
    );
}
