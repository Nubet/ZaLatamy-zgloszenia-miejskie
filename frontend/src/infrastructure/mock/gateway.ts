import { get, set, del } from "idb-keyval";
import {
    draftSchema,
    stateSchema,
    statusSchema,
    prioritySchema,
    statuses,
    maxPhotos,
    localResidentId,
    type DemoState,
} from "@/domain/reports/model";
import {
    acceptsConfirmations,
    isWithinLodz,
    primaryReport,
    relatedReports,
    validatePhoto,
    validateUpdate,
} from "@/domain/reports/rules";
import type { ReportsGateway } from "@/application/reports/port";
import { createSeed } from "./seed";

const storageKey = "lodz-reports-v1";
const delay = () => new Promise<void>((resolve) => setTimeout(resolve, 240));

function readState(): DemoState {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return createSeed();
    const result = stateSchema.safeParse(JSON.parse(raw));
    if (!result.success)
        throw new Error("Zapisane dane mają nieobsługiwany format. Nie można ich odczytać.");
    return result.data;
}
function save(state: DemoState) {
    try {
        localStorage.setItem(storageKey, JSON.stringify(stateSchema.parse(state)));
    } catch {
        throw new Error(
            "Nie udało się zapisać danych. Sprawdź dostęp do pamięci przeglądarki i wolne miejsce.",
        );
    }
}
function findReport(state: DemoState, id: string) {
    const report = state.reports.find((item) => item.id === id);
    if (!report) throw new Error("Nie znaleziono zgłoszenia.");
    return report;
}
export const mockGateway: ReportsGateway = {
    async load() {
        await delay();
        try {
            return readState();
        } catch (error) {
            throw new Error(
                error instanceof SyntaxError
                    ? "Zapisane dane są uszkodzone. Nie można ich odczytać."
                    : error instanceof Error
                      ? error.message
                      : "Nie można odczytać danych.",
            );
        }
    },
    async create(input, photos) {
        await delay();
        const draft = draftSchema.parse(input);
        if (!isWithinLodz(draft.location))
            throw new Error("Wybierz lokalizację w granicach Łodzi.");
        const state = readState();
        const id = `LDZ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
        const createdAt = new Date().toISOString();
        if (!Array.isArray(photos) || !photos.length || photos.length > maxPhotos)
            throw new Error(`Dodaj od 1 do ${maxPhotos} zdjęć.`);
        for (const photo of photos) {
            if (typeof photo === "string") {
                if (!/^\/demo\/(road|lighting|waste|greenery|other)\.svg$/.test(photo))
                    throw new Error("Nieprawidłowe zdjęcie.");
            } else validatePhoto(photo);
        }
        const images = photos.map((photo, index) =>
            typeof photo === "string" ? photo : `photo:${id}:${index}`,
        );
        const report = {
            ...draft,
            priority: "normal" as const,
            id,
            createdAt,
            images,
            status: "new" as const,
            mine: true,
            authorId: localResidentId,
            confirmations: [],
            watching: true,
            duplicateOf: null,
            history: [
                {
                    id: crypto.randomUUID(),
                    at: createdAt,
                    text: "Zgłoszenie zostało zapisane. Oczekuje na weryfikację.",
                    status: "new" as const,
                },
            ],
        };
        state.reports.unshift(report);
        try {
            // Complete writes in order so rollback cannot race an unfinished write.
            for (const [index, photo] of photos.entries())
                if (typeof photo !== "string") await set(images[index]!, photo);
            save(state);
        } catch (error) {
            await Promise.allSettled(
                images.filter((key) => key.startsWith("photo:")).map((key) => del(key)),
            );
            throw error;
        }
        return report;
    },
    async update(id, input) {
        await delay();
        const state = readState();
        const report = findReport(state, id);
        const update = {
            ...input,
            status: statusSchema.parse(input.status),
            priority: prioritySchema.parse(input.priority),
            comment: input.comment.trim(),
        };
        validateUpdate(report, update, state.reports);
        const at = new Date().toISOString();
        const statusChanged = report.status !== update.status;
        const priorityChanged = report.priority !== update.priority;
        report.status = update.status;
        report.priority = update.priority;
        report.duplicateOf = update.status === "duplicate" ? update.duplicateOf : null;
        report.history.push({
            id: crypto.randomUUID(),
            at,
            text:
                update.comment ||
                (statusChanged
                    ? `Status zmieniony na: ${statuses[update.status]}.`
                    : priorityChanged
                      ? "Zaktualizowano priorytet zgłoszenia."
                      : "Zweryfikowano zgłoszenie."),
            status: statusChanged ? update.status : null,
        });
        if (
            statusChanged &&
            relatedReports(report, state.reports).some((item) => item.mine || item.watching)
        )
            state.notifications.unshift({
                id: crypto.randomUUID(),
                reportId: id,
                title:
                    update.status === "duplicate"
                        ? `${report.title} — połączono ze sprawą ${primaryReport(report, state.reports).id}`
                        : `${report.title} — ${statuses[update.status]}`,
                at,
                read: false,
            });
        save(state);
    },
    async watch(id) {
        await delay();
        const state = readState();
        const report = primaryReport(findReport(state, id), state.reports);
        const related = relatedReports(report, state.reports);
        const watching = !related.some((item) => item.watching);
        for (const item of related) item.watching = watching;
        save(state);
    },
    async setConfirmation(id, confirmed) {
        await delay();
        if (typeof confirmed !== "boolean") throw new Error("Nieprawidłowe potwierdzenie.");
        const state = readState();
        const report = primaryReport(findReport(state, id), state.reports);
        if (!acceptsConfirmations(report))
            throw new Error("Ta sprawa jest zakończona. Nie można zmieniać potwierdzeń.");
        const related = relatedReports(report, state.reports);
        if (related.some((item) => item.authorId === localResidentId)) {
            if (!confirmed)
                throw new Error("Autor zgłoszenia jest już liczony jako jedno potwierdzenie.");
            return report.id;
        }
        for (const item of related)
            item.confirmations = item.confirmations.filter(
                (resident) => resident !== localResidentId,
            );
        if (confirmed) report.confirmations.push(localResidentId);
        save(state);
        return report.id;
    },
    async markRead(id) {
        const state = readState();
        const notification = state.notifications.find((item) => item.id === id);
        if (notification) {
            notification.read = true;
            save(state);
        }
    },
    async reset() {
        await delay();
        // Commit metadata first: a failed reset must not delete photos still referenced by reports.
        let photos: string[] = [];
        try {
            photos = readState()
                .reports.flatMap((report) => report.images)
                .filter((image) => image.startsWith("photo:"));
        } catch {
            /* A reset also recovers malformed persisted data. */
        }
        save(createSeed());
        await Promise.allSettled(photos.map((key) => del(key)));
    },
    async photo(key) {
        const value: unknown = await get(key);
        return value instanceof Blob ? value : undefined;
    },
};
