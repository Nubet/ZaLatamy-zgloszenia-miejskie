"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { categories, priorities, type Report } from "@/domain/reports/model";
import { StatusBadge } from "@/shared/ui/report-badges";
import { PAGE_SIZE } from "./work-queue";
import { ReportSupportCount } from "@/shared/ui/report-support";

const dateFormat = new Intl.DateTimeFormat("pl", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Warsaw",
});

export function ReportsList({
    reports,
    onOpen,
}: {
    reports: Report[];
    onOpen: (report: Report) => void;
}) {
    const [requestedPage, setPage] = useState(1);
    const pages = Math.max(1, Math.ceil(reports.length / PAGE_SIZE));
    const page = Math.min(requestedPage, pages);
    const start = (page - 1) * PAGE_SIZE;
    return (
        <section className="work-queue__list" aria-label="Lista wyników zgłoszeń">
            <div className="work-queue__list-heading" aria-hidden="true">
                <span>Zgłoszenie / lokalizacja</span>
                <span>Status</span>
                <span>Kategoria</span>
                <span>Priorytet</span>
                <span>Potwierdzenia</span>
                <span>Data zgłoszenia</span>
            </div>
            <ul className="work-queue__result-list">
                {reports.slice(start, start + PAGE_SIZE).map((report) => (
                    <li key={report.id}>
                        <button
                            type="button"
                            className="work-queue__result-row"
                            aria-label={`Obsłuż ${report.id}`}
                            onClick={() => onOpen(report)}
                        >
                            <span className="work-queue__result-title">
                                <small>{report.id}</small>
                                <strong>{report.title}</strong>
                                <span>{report.address}</span>
                            </span>
                            <StatusBadge status={report.status} />
                            <span className={`category-tag category-tag--${report.category}`}>
                                {categories[report.category]}
                            </span>
                            <span className={`priority-label priority-label--${report.priority}`}>
                                <Flag size={11} />
                                {priorities[report.priority]}
                            </span>
                            <ReportSupportCount report={report} />
                            <time dateTime={report.createdAt}>
                                {dateFormat.format(new Date(report.createdAt))}
                            </time>
                        </button>
                    </li>
                ))}
            </ul>
            <nav className="work-queue__pagination" aria-label="Strony wyników">
                <span aria-live="polite">
                    {reports.length
                        ? `${start + 1}–${Math.min(start + PAGE_SIZE, reports.length)} z ${reports.length} zgłoszeń`
                        : "0 zgłoszeń"}
                </span>
                <div>
                    <button
                        type="button"
                        className="icon-button"
                        aria-label="Poprzednia strona"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        <ChevronLeft size={15} />
                    </button>
                    <span>
                        Strona {page} z {pages}
                    </span>
                    <button
                        type="button"
                        className="icon-button"
                        aria-label="Następna strona"
                        disabled={page === pages}
                        onClick={() => setPage(page + 1)}
                    >
                        <ChevronRight size={15} />
                    </button>
                </div>
            </nav>
        </section>
    );
}
