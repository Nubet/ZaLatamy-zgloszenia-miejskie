import { draftSchema, reportSchema, stateSchema } from "@/domain/reports/model";
import type { ReportsGateway } from "@/application/reports/port";
import { api } from "./client";

export const httpGateway: ReportsGateway = {
    async load() {
        return stateSchema.parse(await (await api("/api/state")).json());
    },
    async create(input, photos) {
        const draft = draftSchema.parse(input);
        const body = new FormData();
        body.set("title", draft.title);
        body.set("description", draft.description);
        body.set("category", draft.category);
        body.set("address", draft.address);
        body.set("longitude", String(draft.location.longitude));
        body.set("latitude", String(draft.location.latitude));
        if (!photos.length) throw new Error("Dodaj od 1 do 5 zdjęć.");
        for (const photo of photos) {
            if (typeof photo === "string") {
                throw new Error("Zdjęcia demonstracyjne można dodać tylko w trybie lokalnym.");
            }
            body.append("photos", photo);
        }
        return reportSchema.parse(await (await api("/api/reports", { method: "POST", body })).json());
    },
    async update(id, update) {
        await api(`/api/reports/${encodeURIComponent(id)}`, {
            method: "PATCH",
            body: JSON.stringify(update),
        });
    },
    async watch(id) {
        await api(`/api/reports/${encodeURIComponent(id)}/watch`, { method: "POST" });
    },
    async setConfirmation(id, confirmed) {
        const payload = (await (
            await api(`/api/reports/${encodeURIComponent(id)}/confirmation`, {
                method: "POST",
                body: JSON.stringify({ confirmed }),
            })
        ).json()) as { id: string };
        return payload.id;
    },
    async markRead(id) {
        await api(`/api/notifications/${encodeURIComponent(id)}/read`, { method: "POST" });
    },
    async reset() {
        await api("/api/reset", { method: "POST" });
    },
    async photo(key) {
        if (!key.startsWith("photo:")) return undefined;
        try {
            return await (await api(`/api/photos?key=${encodeURIComponent(key)}`)).blob();
        } catch {
            return undefined;
        }
    },
};
