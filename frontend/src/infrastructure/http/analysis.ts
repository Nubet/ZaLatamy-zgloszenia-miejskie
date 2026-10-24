import type { AnalysisGateway } from "@/application/analysis/port";
import { categorySchema } from "@/domain/reports/model";
import { api } from "./client";

export const httpAnalysis: AnalysisGateway = {
    async analyze(photo, scenario) {
        const body = new FormData();
        body.set("scenario", scenario);
        if (typeof photo !== "string") body.set("photo", photo);
        const payload = await (await api("/api/analysis", { method: "POST", body })).json();
        if (!payload || typeof payload !== "object") throw new Error("Analiza nie powiodła się.");
        const result = payload as { title: unknown; description: unknown; category: unknown };
        return {
            title: String(result.title),
            description: String(result.description),
            category: categorySchema.parse(result.category),
        };
    },
};
