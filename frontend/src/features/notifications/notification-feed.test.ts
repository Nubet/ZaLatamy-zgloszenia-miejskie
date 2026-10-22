import { expect, it } from "vite-plus/test";
import type { Notification } from "@/domain/reports/model";
import { groupNotifications, notificationMessage } from "./notification-feed";

const notifications: Notification[] = [
    {
        id: "older",
        reportId: "LDZ-1",
        title: "Ubytek — Przyjęte",
        at: "2026-10-19T20:00:00.000Z",
        read: true,
    },
    {
        id: "newer",
        reportId: "LDZ-1",
        title: "Ubytek — W realizacji",
        at: "2026-10-19T22:30:00.000Z",
        read: false,
    },
    {
        id: "newest",
        reportId: "LDZ-2",
        title: "Zakończono prace",
        at: "2026-10-20T08:00:00.000Z",
        read: false,
    },
];

it("groups by Warsaw calendar days, newest first, without reordering stored notifications", () => {
    expect(
        groupNotifications(notifications, false).map(({ day, items }) => [
            day,
            items.map((item) => item.id),
        ]),
    ).toEqual([
        ["2026-10-20", ["newest", "newer"]],
        ["2026-10-19", ["older"]],
    ]);
    expect(notifications.map((item) => item.id)).toEqual(["older", "newer", "newest"]);
});

it("shows only unread updates and removes empty date groups", () => {
    expect(
        groupNotifications(notifications, true).map((group) => group.items.map((item) => item.id)),
    ).toEqual([["newest", "newer"]]);
    expect(
        groupNotifications(
            notifications.map((item) => ({ ...item, read: true })),
            true,
        ),
    ).toEqual([]);
});

it("keeps the original event message even when the report title or current status has changed", () => {
    expect(notificationMessage(notifications[0]!, "Ubytek")).toBe("Przyjęte");
    expect(notificationMessage(notifications[0]!, "Zmieniony tytuł")).toBe("Ubytek — Przyjęte");
    expect(notificationMessage(notifications[2]!, "Inny problem")).toBe("Zakończono prace");
});
