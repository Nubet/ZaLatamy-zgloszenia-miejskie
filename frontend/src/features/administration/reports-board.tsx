"use client";

import { useState } from "react";
import {
    Bell,
    CheckCheck,
    Circle,
    Clock3,
    Copy,
    Flag,
    History,
    MapPin,
    MoveRight,
    Wrench,
    XCircle,
} from "lucide-react";
import { useReportMutation } from "@/application/reports/provider";
import { openStatuses, PAGE_SIZE } from "./work-queue";
import { ReportSupportCount } from "@/shared/ui/report-support";
import { categories, priorities, statuses, type Report, type Status } from "@/domain/reports/model";
import { requiresUpdateComment } from "@/domain/reports/rules";

const columns = [
    { status: "new", icon: Circle },
    { status: "accepted", icon: Clock3 },
    { status: "progress", icon: Wrench },
    { status: "resolved", icon: CheckCheck },
    { status: "rejected", icon: XCircle },
    { status: "duplicate", icon: Copy },
] as const;

const dateFormat = new Intl.DateTimeFormat("pl", { day: "numeric", month: "short" });

export function ReportsBoard({
    reports,
    allowedStatuses,
    onOpen,
}: {
    reports: Report[];
    allowedStatuses: Status[];
    onOpen: (report: Report, suggestedStatus?: Status) => void;
}) {
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dropTarget, setDropTarget] = useState<Status | null>(null);
    const [limits, setLimits] = useState<Partial<Record<Status, number>>>({});
    const mutation = useReportMutation(
        (gateway, { report, target }: { report: Report; target: Status }) =>
            gateway.update(report.id, {
                status: target,
                priority: report.priority,
                comment: "",
                duplicateOf: null,
            }),
    );

    function move(report: Report, target: Status) {
        if (mutation.isPending || target === report.status) return;
        mutation.reset();
        if (requiresUpdateComment(target)) {
            onOpen(report, target);
            return;
        }
        mutation.mutate({ report, target });
    }

    return (
        <div className="reports-board">
            <div className="reports-board__instructions">
                <span>
                    <MoveRight size={13} /> Przeciągnij kartę, aby zmienić status. Kliknij tytuł,
                    aby obsłużyć sprawę.
                </span>
                <output aria-live="polite">
                    {mutation.isPending
                        ? "Zapisywanie zmiany statusu…"
                        : mutation.isSuccess
                          ? `${mutation.variables.report.id} → ${statuses[mutation.variables.target]}`
                          : ""}
                </output>
            </div>
            {mutation.error && (
                <p className="inline-error reports-board__error" role="alert">
                    {mutation.error.message}
                </p>
            )}
            <div
                className="reports-board__columns"
                aria-label="Tablica Kanban zgłoszeń"
                aria-busy={mutation.isPending}
            >
                {columns
                    .filter((column) => allowedStatuses.includes(column.status))
                    .map(({ status: columnStatus, icon: Icon }) => {
                        const items = reports.filter((report) => report.status === columnStatus);
                        const limit = limits[columnStatus] ?? PAGE_SIZE;
                        return (
                            <section
                                key={columnStatus}
                                className={`kanban-column ${dropTarget === columnStatus ? "kanban-column--drop-target" : ""}`}
                                aria-label={`Kolumna: ${statuses[columnStatus]}`}
                                data-status={columnStatus}
                            >
                                <div
                                    className="kanban-column__dropzone"
                                    onDragOver={(event) => {
                                        if (!draggedId || mutation.isPending) return;
                                        event.preventDefault();
                                        event.dataTransfer.dropEffect = "move";
                                        setDropTarget(columnStatus);
                                    }}
                                    onDragLeave={(event) => {
                                        if (
                                            !event.currentTarget.contains(
                                                event.relatedTarget as Node | null,
                                            )
                                        )
                                            setDropTarget(null);
                                    }}
                                    onDrop={(event) => {
                                        event.preventDefault();
                                        const report = reports.find(
                                            (item) =>
                                                item.id === draggedId &&
                                                item.id ===
                                                    event.dataTransfer.getData("text/plain"),
                                        );
                                        setDraggedId(null);
                                        setDropTarget(null);
                                        if (report) move(report, columnStatus);
                                    }}
                                >
                                    <header className="kanban-column__header">
                                        <span
                                            className={`status-badge status-badge--${columnStatus} kanban-column__status-icon`}
                                        >
                                            <Icon size={14} />
                                        </span>
                                        <h2>{statuses[columnStatus]}</h2>
                                        <span className="kanban-column__count">{items.length}</span>
                                        {dropTarget === columnStatus && (
                                            <span className="kanban-column__drop-label">
                                                Upuść tutaj
                                            </span>
                                        )}
                                    </header>
                                    <div className="kanban-column__cards">
                                        {items.slice(0, limit).map((report) => (
                                            <article
                                                key={report.id}
                                                className={`kanban-card ${draggedId === report.id ? "kanban-card--lifted" : ""}`}
                                            >
                                                <button
                                                    type="button"
                                                    className="kanban-card__open"
                                                    aria-label={`Obsłuż ${report.id}`}
                                                    onClick={() => onOpen(report)}
                                                    draggable={!mutation.isPending}
                                                    onDragStart={(event) => {
                                                        event.dataTransfer.setData(
                                                            "text/plain",
                                                            report.id,
                                                        );
                                                        event.dataTransfer.effectAllowed = "move";
                                                        setDraggedId(report.id);
                                                    }}
                                                    onDragEnd={() => {
                                                        setDraggedId(null);
                                                        setDropTarget(null);
                                                    }}
                                                >
                                                    <span className="kanban-card__reference">
                                                        <span>{report.id}</span>
                                                        <time dateTime={report.createdAt}>
                                                            {dateFormat.format(
                                                                new Date(report.createdAt),
                                                            )}
                                                        </time>
                                                    </span>
                                                    <span className="kanban-card__title">
                                                        <Icon
                                                            size={14}
                                                            className={`kanban-card__status kanban-card__status--${columnStatus}`}
                                                        />
                                                        <strong>{report.title}</strong>
                                                    </span>
                                                    <span className="kanban-card__address">
                                                        <MapPin size={12} />
                                                        {report.address}
                                                    </span>
                                                    {openStatuses.includes(report.status) &&
                                                        Date.now() - Date.parse(report.createdAt) >=
                                                            30 * 86400000 && (
                                                            <span className="kanban-card__age">
                                                                <Clock3 size={11} />
                                                                Zgłoszono{" "}
                                                                {Math.floor(
                                                                    (Date.now() -
                                                                        Date.parse(
                                                                            report.createdAt,
                                                                        )) /
                                                                        86400000,
                                                                )}{" "}
                                                                dni temu
                                                            </span>
                                                        )}
                                                </button>
                                                <div className="kanban-card__footer">
                                                    <span
                                                        className={`priority-label priority-label--${report.priority}`}
                                                    >
                                                        <Flag size={11} />
                                                        {priorities[report.priority]}
                                                    </span>
                                                    <span
                                                        className={`category-tag category-tag--${report.category}`}
                                                    >
                                                        {categories[report.category]}
                                                    </span>
                                                    <ReportSupportCount report={report} />
                                                    <span
                                                        className="kanban-card__history"
                                                        title="Liczba wpisów w historii"
                                                    >
                                                        <History size={12} />
                                                        <span className="sr-only">
                                                            Wpisy w historii:{" "}
                                                        </span>
                                                        {report.history.length}
                                                    </span>
                                                    {report.watching && (
                                                        <Bell
                                                            size={12}
                                                            className="kanban-card__watching"
                                                            aria-label="Obserwowane zgłoszenie"
                                                        />
                                                    )}
                                                </div>
                                            </article>
                                        ))}
                                        {items.length > 0 && (
                                            <div className="kanban-column__pagination">
                                                <span>
                                                    Wyświetlono {Math.min(limit, items.length)} z{" "}
                                                    {items.length}
                                                </span>
                                                {limit < items.length && (
                                                    <button
                                                        type="button"
                                                        className="button button--secondary"
                                                        onClick={() =>
                                                            setLimits((current) => ({
                                                                ...current,
                                                                [columnStatus]: limit + PAGE_SIZE,
                                                            }))
                                                        }
                                                    >
                                                        Pokaż kolejne{" "}
                                                        {Math.min(PAGE_SIZE, items.length - limit)}
                                                    </button>
                                                )}
                                                {limit > PAGE_SIZE && (
                                                    <button
                                                        type="button"
                                                        className="text-link"
                                                        onClick={() =>
                                                            setLimits((current) => ({
                                                                ...current,
                                                                [columnStatus]: PAGE_SIZE,
                                                            }))
                                                        }
                                                    >
                                                        Pokaż mniej
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {!items.length && (
                                            <div className="kanban-column__empty">
                                                <Icon size={20} />
                                                <strong>Brak zgłoszeń</strong>
                                                <span>
                                                    {draggedId
                                                        ? "Przenieś tutaj kartę"
                                                        : "Sprawy z tym statusem pojawią się tutaj"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        );
                    })}
            </div>
        </div>
    );
}
