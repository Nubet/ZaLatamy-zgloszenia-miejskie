import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import distance from "@turf/distance";
import boundary from "./lodz-boundary.json";
import {
    localResidentId,
    reportCommentLimits,
    type Category,
    type Location,
    type Report,
    type ReportUpdate,
    type Status,
} from "./model";

export function primaryReport(report: Report, reports: Report[]) {
    const byId = new Map(reports.map((item) => [item.id, item]));
    const visited = new Set<string>();
    let current = report;
    while (current.duplicateOf) {
        if (visited.has(current.id)) throw new Error("Wykryto cykl połączonych zgłoszeń.");
        visited.add(current.id);
        const next = byId.get(current.duplicateOf);
        if (!next) throw new Error("Nie znaleziono sprawy nadrzędnej.");
        current = next;
    }
    return current;
}

export function relatedReports(report: Report, reports: Report[]) {
    const primary = primaryReport(report, reports);
    return reports.filter((item) => primaryReport(item, reports).id === primary.id);
}

export function reportSupport(report: Report, reports: Report[]) {
    const related = relatedReports(report, reports);
    const supporters = new Set(related.flatMap((item) => [item.authorId, ...item.confirmations]));
    return {
        count: supporters.size,
        confirmed: supporters.has(localResidentId),
        authored: related.some((item) => item.authorId === localResidentId),
    };
}

export function acceptsConfirmations(report: Report) {
    return ["new", "accepted", "progress"].includes(report.status);
}

// shortcut: simplified administrative geometry; use current PRG/PostGIS boundaries before a public rollout
export const lodzBoundary = {
    type: "Feature" as const,
    properties: boundary.properties,
    geometry: { type: "Polygon" as const, coordinates: boundary.geometry.coordinates },
};
export function isWithinLodz(location: Location) {
    return (
        Number.isFinite(location.longitude) &&
        Number.isFinite(location.latitude) &&
        booleanPointInPolygon([location.longitude, location.latitude], lodzBoundary)
    );
}
export function nearbyReports(reports: Report[], category: Category, location: Location) {
    return reports
        .filter(
            (report) =>
                report.category === category && acceptsConfirmations(report) && !report.duplicateOf,
        )
        .map((report) => ({
            report,
            meters: distance(
                [location.longitude, location.latitude],
                [report.location.longitude, report.location.latitude],
                { units: "meters" },
            ),
        }))
        .filter((match) => match.meters <= 100)
        .sort((a, b) => a.meters - b.meters);
}
export function requiresUpdateComment(status: Status) {
    return status === "rejected" || status === "duplicate";
}

export function validateUpdate(report: Report, update: ReportUpdate, reports: Report[]) {
    if (
        requiresUpdateComment(update.status) &&
        update.comment.trim().length < reportCommentLimits.min
    )
        throw new Error(`Dodaj uzasadnienie (minimum ${reportCommentLimits.min} znaków).`);
    if (update.comment.length > reportCommentLimits.max)
        throw new Error(`Komentarz może mieć maksymalnie ${reportCommentLimits.max} znaków.`);
    if (update.status !== "duplicate") return;
    const target = reports.find((item) => item.id === update.duplicateOf);
    if (!target || target.id === report.id) throw new Error("Wybierz inne istniejące zgłoszenie.");
    const visited = new Set([report.id]);
    const byId = new Map(reports.map((item) => [item.id, item]));
    let current: Report | undefined = target;
    while (current) {
        if (visited.has(current.id)) throw new Error("Powiązanie utworzyłoby cykl duplikatów.");
        visited.add(current.id);
        current = current.duplicateOf ? byId.get(current.duplicateOf) : undefined;
    }
    if (report.duplicateOf !== target.id && !acceptsConfirmations(primaryReport(target, reports)))
        throw new Error("Wybierz aktywną sprawę nadrzędną.");
}
export function validatePhoto(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
        throw new Error("Wybierz zdjęcie JPG, PNG lub WebP.");
    if (file.size > 8 * 1024 * 1024) throw new Error("Zdjęcie może mieć maksymalnie 8 MB.");
    if (file.size === 0) throw new Error("Plik jest pusty.");
}
