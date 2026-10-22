import type { Notification } from "@/domain/reports/model";
import { calendarDate } from "@/shared/lib/date-range";

export function groupNotifications(notifications: Notification[], unreadOnly: boolean) {
    const groups = new Map<string, Notification[]>();
    for (const notification of notifications.toSorted(
        (a, b) => Date.parse(b.at) - Date.parse(a.at),
    )) {
        if (unreadOnly && notification.read) continue;
        const day = calendarDate(new Date(notification.at));
        const group = groups.get(day);
        if (group) group.push(notification);
        else groups.set(day, [notification]);
    }
    return Array.from(groups, ([day, items]) => ({ day, items }));
}

export function notificationMessage(notification: Notification, reportTitle: string) {
    const prefix = `${reportTitle} — `;
    return notification.title.startsWith(prefix)
        ? notification.title.slice(prefix.length)
        : notification.title;
}
