import { z } from "zod";

export const categories = {
    road: "Drogi i chodniki",
    lighting: "Oświetlenie",
    waste: "Odpady",
    greenery: "Zieleń",
    other: "Inne",
} as const;
export const statuses = {
    new: "Nowe",
    accepted: "Przyjęte",
    progress: "W realizacji",
    resolved: "Rozwiązane",
    rejected: "Odrzucone",
    duplicate: "Połączone",
} as const;
export const priorities = { low: "Niski", normal: "Standardowy", high: "Pilny" } as const;
// shortcut: one local resident, replace with authenticated identity when connecting a backend
export const localResidentId = "resident:local";
export const categorySchema = z.enum(["road", "lighting", "waste", "greenery", "other"]);
export const statusSchema = z.enum([
    "new",
    "accepted",
    "progress",
    "resolved",
    "rejected",
    "duplicate",
]);
export const prioritySchema = z.enum(["low", "normal", "high"]);
export const locationSchema = z.object({
    longitude: z.number().min(-180).max(180),
    latitude: z.number().min(-90).max(90),
});
export const maxPhotos = 5;
export const reportCommentLimits = { min: 5, max: 2000 } as const;
export const imagesSchema = z.array(z.string().min(1)).min(1).max(maxPhotos);
export const draftSchema = z.object({
    title: z.string().trim().min(5, "Tytuł musi mieć co najmniej 5 znaków.").max(120),
    description: z.string().trim().min(15, "Opisz problem w co najmniej 15 znakach.").max(2000),
    category: categorySchema,
    location: locationSchema,
    address: z.string().trim().min(3).max(160),
});
export const historySchema = z.object({
    id: z.string(),
    at: z.iso.datetime(),
    text: z.string(),
    status: statusSchema.nullable(),
});
export const reportSchema = draftSchema.extend({
    priority: prioritySchema,
    id: z.string(),
    createdAt: z.iso.datetime(),
    status: statusSchema,
    images: imagesSchema,
    mine: z.boolean(),
    authorId: z.string().min(1),
    confirmations: z.array(z.string().min(1)),
    watching: z.boolean(),
    duplicateOf: z.string().nullable(),
    history: z.array(historySchema),
});
export const notificationSchema = z.object({
    id: z.string(),
    reportId: z.string(),
    title: z.string(),
    at: z.iso.datetime(),
    read: z.boolean(),
});
export const stateSchema = z.object({
    version: z.literal(1),
    reports: z.array(reportSchema),
    notifications: z.array(notificationSchema),
});
export type Category = z.infer<typeof categorySchema>;
export type Status = z.infer<typeof statusSchema>;
export type Priority = z.infer<typeof prioritySchema>;
export type Location = z.infer<typeof locationSchema>;
export type ReportDraft = z.infer<typeof draftSchema>;
export type Report = z.infer<typeof reportSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type DemoState = z.infer<typeof stateSchema>;
export type ReportUpdate = {
    status: Status;
    priority: Priority;
    comment: string;
    duplicateOf: string | null;
};
