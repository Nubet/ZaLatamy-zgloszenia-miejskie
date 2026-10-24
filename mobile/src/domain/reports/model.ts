import { z } from 'zod';

export const categories = {
  road: 'Drogi i chodniki',
  lighting: 'Oświetlenie',
  waste: 'Odpady',
  greenery: 'Zieleń',
  other: 'Inne',
} as const;
export const statuses = {
  new: 'Nowe',
  accepted: 'Przyjęte',
  progress: 'W realizacji',
  resolved: 'Rozwiązane',
  rejected: 'Odrzucone',
  duplicate: 'Połączone',
} as const;
export const priorities = { low: 'Niski', normal: 'Standardowy', high: 'Pilny' } as const;
export const localResidentId = 'resident:local';
export const maxPhotos = 5;
export const categorySchema = z.enum(['road', 'lighting', 'waste', 'greenery', 'other']);
export const statusSchema = z.enum([
  'new',
  'accepted',
  'progress',
  'resolved',
  'rejected',
  'duplicate',
]);
export const prioritySchema = z.enum(['low', 'normal', 'high']);
export const locationSchema = z.object({
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
});
export const photoSchema = z
  .object({
    id: z.string().min(1),
    uri: z.string().min(1),
    kind: z.enum(['demo', 'file']),
    mime: z.string(),
    size: z.number().nonnegative(),
  })
  .refine(
    (photo) =>
      photo.kind === 'demo'
        ? /^demo:(road|lighting|waste|greenery|other)$/.test(photo.uri)
        : photo.uri.startsWith('file://') &&
          ['image/jpeg', 'image/png', 'image/webp'].includes(photo.mime) &&
          photo.size > 0 &&
          photo.size <= 8 * 1024 * 1024,
    { message: 'Nieprawidłowe zdjęcie lub rozmiar przekraczający 8 MB.' },
  );
export const draftSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Tytuł: minimum 5 znaków.')
    .max(120, 'Tytuł: maksymalnie 120 znaków.'),
  description: z
    .string()
    .trim()
    .min(15, 'Opis: minimum 15 znaków.')
    .max(2000, 'Opis: maksymalnie 2000 znaków.'),
  category: categorySchema,
  location: locationSchema,
  address: z.string().trim().min(3, 'Podaj adres lub opis miejsca.').max(160),
});
export const historySchema = z.object({
  id: z.string(),
  at: z.iso.datetime(),
  text: z.string(),
  status: statusSchema.nullable(),
});
export const reportSchema = draftSchema.extend({
  id: z.string(),
  createdAt: z.iso.datetime(),
  status: statusSchema,
  priority: prioritySchema,
  photos: z.array(photoSchema).min(1).max(maxPhotos),
  authorId: z.string().min(1),
  confirmations: z.array(z.string().min(1)),
  watching: z.boolean(),
  duplicateOf: z.string().nullable(),
  history: z.array(historySchema),
});
export const updateSchema = z.object({
  status: statusSchema,
  priority: prioritySchema,
  comment: z.string().trim().max(2000, 'Komentarz: maksymalnie 2000 znaków.'),
  duplicateOf: z.string().nullable(),
});
export const notificationSchema = z.object({
  id: z.string(),
  reportId: z.string(),
  title: z.string(),
  at: z.iso.datetime(),
  read: z.boolean(),
});
export const savedDraftSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: categorySchema,
  address: z.string(),
  location: locationSchema.nullable(),
  photos: z.array(photoSchema).max(maxPhotos),
  step: z.number().int().min(0).max(2),
});
export const stateSchema = z.object({
  version: z.literal(1),
  reports: z.array(reportSchema),
  notifications: z.array(notificationSchema),
  draft: savedDraftSchema.nullable(),
});
export type Category = z.infer<typeof categorySchema>;
export type Status = z.infer<typeof statusSchema>;
export type Priority = z.infer<typeof prioritySchema>;
export type Location = z.infer<typeof locationSchema>;
export type Photo = z.infer<typeof photoSchema>;
export type ReportDraft = z.infer<typeof draftSchema>;
export type SavedDraft = z.infer<typeof savedDraftSchema>;
export type Report = z.infer<typeof reportSchema>;
export type ReportUpdate = z.infer<typeof updateSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type DemoState = z.infer<typeof stateSchema>;
export function emptyDraft(): SavedDraft {
  return {
    title: '',
    description: '',
    category: 'road',
    address: '',
    location: null,
    photos: [],
    step: 0,
  };
}
