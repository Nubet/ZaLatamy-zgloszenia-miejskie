"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock3, MapPin, Plus, Search, X } from "lucide-react";
import { useReports } from "@/application/reports/provider";
import { statuses, type Status } from "@/domain/reports/model";
import { CategoryBadge, StatusBadge } from "@/shared/ui/report-badges";
import { ReportGallery } from "@/shared/ui/report-gallery";
import { ReportSupport, ReportSupportCount } from "@/shared/ui/report-support";
import { primaryReport } from "@/domain/reports/rules";
import { formatDate } from "@/shared/lib/format";
import { ErrorState, LoadingState } from "@/shared/ui/feedback";
import { CityMap } from "./city-map";
import { ReportHistory } from "@/features/reports/report-history";
import { SelectControl } from "@/shared/ui/select-control";

function focusCloseButton(node: HTMLButtonElement | null) {
    node?.focus({ preventScroll: true });
}

export function PublicMap({ initialSelectedId }: { initialSelectedId: string | null }) {
    const query = useReports();
    const [selectedId, setSelectedId] = useState(initialSelectedId);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<Status | "">("");
    const [listOpen, setListOpen] = useState(false);

    if (query.isPending)
        return (
            <main className="public-map public-map--feedback">
                <LoadingState />
            </main>
        );
    if (query.error)
        return (
            <main className="public-map public-map--feedback">
                <ErrorState
                    message={query.error.message}
                    retry={() => {
                        void query.refetch();
                    }}
                />
            </main>
        );

    const reports = query.data.reports.filter(
        (report) =>
            (!status || report.status === status) &&
            (status === "duplicate" || !report.duplicateOf) &&
            `${report.title} ${report.address} ${report.id}`
                .toLocaleLowerCase("pl")
                .includes(search.toLocaleLowerCase("pl")),
    );
    const requested = query.data.reports.find((report) => report.id === selectedId);
    const primary = requested ? primaryReport(requested, query.data.reports) : undefined;
    const selected =
        primary && reports.some((report) => report.id === primary.id || report.id === requested?.id)
            ? primary
            : undefined;

    function selectReport(id: string) {
        setSelectedId(id);
        setListOpen(false);
        const url = new URL(window.location.href);
        url.searchParams.set("zgloszenie", id);
        window.history.replaceState(null, "", url);
    }

    function closePreview() {
        document
            .querySelector<HTMLButtonElement>('.city-map__marker[aria-pressed="true"]')
            ?.focus({ preventScroll: true });
        setSelectedId(null);
        const url = new URL(window.location.href);
        url.searchParams.delete("zgloszenie");
        window.history.replaceState(null, "", url);
    }

    return (
        <main id="public-map" className="public-map" aria-label="Publiczna mapa zgłoszeń w Łodzi">
            <CityMap
                reports={reports}
                selectedId={selected?.id}
                onSelect={selectReport}
                publicView
            />
            <section className="public-map__toolbar" aria-label="Wyszukiwanie zgłoszeń">
                <Link href="/" className="public-map__home-link">
                    <ArrowLeft size={14} aria-hidden="true" />
                    Strona główna
                </Link>
                <div className="public-map__title">
                    <MapPin size={19} />
                    <div>
                        <h1>Zgłoszenia · Łódź</h1>
                        <span>{reports.length} zgłoszeń na mapie</span>
                    </div>
                    <Link
                        href="/panel"
                        className="public-map__panel-link"
                        aria-label="Przejdź do panelu mieszkańca"
                        title="Panel mieszkańca"
                    >
                        Panel <ArrowUpRight size={14} />
                    </Link>
                </div>
                <Link href="/zgloszenia/nowe" className="button button--primary public-map__create">
                    <Plus size={18} aria-hidden="true" /> Zgłoś problem
                </Link>
                <label className="public-map__search">
                    <Search size={16} />
                    <input
                        type="search"
                        aria-label="Szukaj na mapie"
                        placeholder="Ulica, problem lub numer…"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    {search && (
                        <button
                            className="icon-button"
                            aria-label="Wyczyść wyszukiwanie"
                            onClick={() => setSearch("")}
                        >
                            <X size={14} />
                        </button>
                    )}
                </label>
                <div className="public-map__filters">
                    <SelectControl
                        aria-label="Status na mapie"
                        value={status}
                        onValueChange={(value) =>
                            setStatus(value in statuses ? (value as Status) : "")
                        }
                        options={[
                            { value: "", label: "Wszystkie statusy" },
                            ...Object.entries(statuses).map(([value, label]) => ({ value, label })),
                        ]}
                    />
                    <button
                        className="button button--secondary"
                        aria-expanded={listOpen}
                        aria-controls="public-map-results"
                        onClick={() => {
                            setListOpen(!listOpen);
                            closePreview();
                        }}
                    >
                        {listOpen ? "Ukryj listę" : `Lista (${reports.length})`}
                    </button>
                </div>
                {!reports.length && (
                    <output className="public-map__empty">
                        Brak zgłoszeń spełniających kryteria.
                    </output>
                )}
                {listOpen && (
                    <div
                        className="public-map__results"
                        id="public-map-results"
                        aria-label="Zgłoszenia na mapie"
                    >
                        {reports.map((report) => (
                            <button key={report.id} onClick={() => selectReport(report.id)}>
                                <StatusBadge status={report.status} />
                                <strong>{report.title}</strong>
                                <span>{report.address}</span>
                                <ReportSupportCount report={report} />
                            </button>
                        ))}
                    </div>
                )}
            </section>
            {selected && (
                <dialog
                    open
                    key={selected.id}
                    className="public-map__preview"
                    aria-label="Podgląd zgłoszenia"
                    onKeyDown={(event) => {
                        if (event.key === "Escape") closePreview();
                    }}
                >
                    <header>
                        <span>{selected.id}</span>
                        <button
                            className="icon-button"
                            aria-label="Zamknij podgląd"
                            onClick={closePreview}
                            ref={focusCloseButton}
                        >
                            <X size={18} />
                        </button>
                    </header>
                    <div className="public-map__preview-body">
                        <ReportGallery
                            key={selected.id}
                            images={selected.images}
                            title={selected.title}
                            className="public-map__photo"
                        />
                        <div className="public-map__badges">
                            <CategoryBadge category={selected.category} />
                            <StatusBadge status={selected.status} />
                        </div>
                        <h2>{selected.title}</h2>
                        <p className="public-map__address">
                            <MapPin size={14} />
                            {selected.address}
                        </p>
                        <p>{selected.description}</p>
                        {requested && requested.id !== selected.id && (
                            <p className="form-hint">
                                Zgłoszenie {requested.id} połączono z tą sprawą.
                            </p>
                        )}
                        <ReportSupport key={selected.id} report={selected} />
                        <p className="public-map__date">
                            <Clock3 size={14} />
                            Zgłoszono {formatDate(selected.createdAt)}
                        </p>
                        <h3>Historia zgłoszenia</h3>
                        <ReportHistory history={selected.history} />
                        <Link className="text-link" href={`/zgloszenia/${selected.id}`}>
                            Zobacz szczegóły i powiązane zgłoszenia <ArrowUpRight size={14} />
                        </Link>
                    </div>
                </dialog>
            )}
        </main>
    );
}
