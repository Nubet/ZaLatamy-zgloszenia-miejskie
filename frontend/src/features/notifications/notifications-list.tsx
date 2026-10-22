"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bell, Check, CheckCheck, MapPin } from "lucide-react";
import { useReports, useReportMutation } from "@/application/reports/provider";
import { PageHeading } from "@/shared/ui/page-heading";
import { ErrorState, LoadingState } from "@/shared/ui/feedback";
import { formatDate } from "@/shared/lib/format";
import { ReportPhoto } from "@/shared/ui/report-photo";
import { StatusBadge } from "@/shared/ui/report-badges";
import type { Notification, Report } from "@/domain/reports/model";
import { groupNotifications, notificationMessage } from "./notification-feed";

const dayFormat = new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Warsaw",
});
const timeFormat = new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Warsaw",
});

export function NotificationsList() {
    const query = useReports();
    const [unreadOnly, setUnreadOnly] = useState(false);
    const unreadFilter = useRef<HTMLButtonElement>(null);
    const markRead = useReportMutation(async (gateway, ids: string[]) => {
        try {
            // shortcut: save marks sequentially; use a batch endpoint for large inboxes.
            for (const id of ids) await gateway.markRead(id);
        } catch (error) {
            await query.refetch();
            throw error;
        }
    });

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

    const notifications = query.data.notifications;
    const unread = notifications.filter((notification) => !notification.read);
    const groups = groupNotifications(notifications, unreadOnly);
    const reports = new Map(query.data.reports.map((report) => [report.id, report]));

    function read(ids: string[]) {
        markRead.mutate(ids, {
            onSuccess: () => {
                if (unreadOnly) unreadFilter.current?.focus({ preventScroll: true });
            },
        });
    }

    return (
        <div className="page notifications">
            <PageHeading
                eyebrow="TWOJE SPRAWY"
                title="Powiadomienia"
                description="Co zmieniło się w Twoich zgłoszeniach i sprawach, które obserwujesz."
                action={
                    <span
                        className={`notifications__summary ${unread.length ? "notifications__summary--unread" : ""}`}
                    >
                        <Bell size={16} aria-hidden="true" />
                        {unread.length ? `${unread.length} do przeczytania` : "Jesteś na bieżąco"}
                    </span>
                }
            />
            <div className="notifications__toolbar">
                <fieldset className="notifications__filters" aria-label="Filtruj powiadomienia">
                    <button aria-pressed={!unreadOnly} onClick={() => setUnreadOnly(false)}>
                        Wszystkie <span>{notifications.length}</span>
                    </button>
                    <button
                        ref={unreadFilter}
                        aria-pressed={unreadOnly}
                        onClick={() => setUnreadOnly(true)}
                    >
                        Nieprzeczytane <span>{unread.length}</span>
                    </button>
                </fieldset>
                <button
                    className="notifications__mark-all"
                    disabled={!unread.length || markRead.isPending}
                    onClick={() => read(unread.map((notification) => notification.id))}
                >
                    <CheckCheck size={16} aria-hidden="true" />
                    {markRead.isPending ? "Zapisywanie…" : "Oznacz wszystkie jako przeczytane"}
                </button>
            </div>
            {markRead.error && (
                <p className="inline-error" role="alert">
                    {markRead.error.message}
                </p>
            )}
            <output className="sr-only">
                {unread.length
                    ? `Nieprzeczytane powiadomienia: ${unread.length}.`
                    : "Wszystkie powiadomienia są przeczytane."}
            </output>
            {groups.length ? (
                <div className="notifications__feed">
                    {groups.map((group) => (
                        <section key={group.day} aria-labelledby={`day-${group.day}`}>
                            <h2 id={`day-${group.day}`} className="notifications__day">
                                {dayFormat.format(new Date(`${group.day}T12:00:00Z`))}
                                <span>{group.items.length}</span>
                            </h2>
                            <ul className="notifications__list">
                                {group.items.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        report={reports.get(notification.reportId)}
                                        pending={markRead.isPending}
                                        onRead={() => read([notification.id])}
                                    />
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            ) : (
                <NotificationEmpty
                    hasHistory={notifications.length > 0}
                    onShowAll={() => setUnreadOnly(false)}
                />
            )}
        </div>
    );
}

function NotificationEmpty({
    hasHistory,
    onShowAll,
}: {
    hasHistory: boolean;
    onShowAll: () => void;
}) {
    return (
        <div className="notifications__empty">
            <span className="notifications__empty-icon">
                <CheckCheck size={28} aria-hidden="true" />
            </span>
            <h2>{hasHistory ? "Wszystko przeczytane" : "Tu pojawią się aktualizacje"}</h2>
            <p>
                {hasHistory
                    ? "Nie masz zaległych powiadomień. Do wcześniejszych zmian możesz wrócić w każdej chwili."
                    : "Gdy zmieni się status Twojego zgłoszenia lub obserwowanej sprawy, znajdziesz tutaj szczegóły."}
            </p>
            {hasHistory ? (
                <button className="button button--secondary" onClick={onShowAll}>
                    Pokaż wszystkie powiadomienia
                </button>
            ) : (
                <Link className="button button--secondary" href="/moje-zgloszenia">
                    Przejdź do moich zgłoszeń <ArrowRight size={15} />
                </Link>
            )}
        </div>
    );
}

function NotificationItem({
    notification,
    report,
    pending,
    onRead,
}: {
    notification: Notification;
    report: Report | undefined;
    pending: boolean;
    onRead: () => void;
}) {
    return (
        <li
            className={`notification-card ${notification.read ? "notification-card--read" : "notification-card--unread"}`}
        >
            <Link
                className="notification-card__open"
                href={`/zgloszenia/${notification.reportId}`}
                onClick={() => {
                    if (!notification.read && !pending) onRead();
                }}
            >
                {report ? (
                    <ReportPhoto
                        image={report.images[0]!}
                        title={report.title}
                        className="notification-card__photo"
                    />
                ) : (
                    <span className="notification-card__photo notification-card__photo--placeholder">
                        <Bell size={22} aria-hidden="true" />
                    </span>
                )}
                <div className="notification-card__body">
                    <div className="notification-card__meta">
                        <span className="sr-only">
                            {notification.read ? "Aktualizacja zgłoszenia" : "Nowa aktualizacja"}
                        </span>
                        <time dateTime={notification.at} title={formatDate(notification.at)}>
                            {timeFormat.format(new Date(notification.at))}
                        </time>
                    </div>
                    <h3>{report?.title ?? notification.title}</h3>
                    {report && (
                        <p className="notification-card__change">
                            {notificationMessage(notification, report.title)}
                        </p>
                    )}
                    <div className="notification-card__context">
                        {report && (
                            <span>
                                <MapPin size={13} aria-hidden="true" />
                                {report.address}
                            </span>
                        )}
                        <span>{notification.reportId}</span>
                    </div>
                </div>
                <ArrowRight
                    size={18}
                    className="notification-card__open-arrow"
                    aria-hidden="true"
                />
            </Link>
            <div className="notification-card__footer">
                {report && (
                    <span className="notification-card__current-status">
                        Aktualny status <StatusBadge status={report.status} />
                    </span>
                )}
                {notification.read ? (
                    <span className="notification-card__read-label">
                        <CheckCheck size={14} aria-hidden="true" /> Przeczytane
                    </span>
                ) : (
                    <button
                        className="notification-card__mark-read"
                        disabled={pending}
                        onClick={onRead}
                        aria-label={`Oznacz powiadomienie o sprawie ${notification.reportId} jako przeczytane`}
                    >
                        <Check size={14} aria-hidden="true" /> Oznacz jako przeczytane
                    </button>
                )}
            </div>
        </li>
    );
}
