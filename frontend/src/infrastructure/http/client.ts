const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const resident = process.env.NEXT_PUBLIC_RESIDENT_ID ?? "resident:local";

function message(body: unknown, fallback: string) {
    if (!body || typeof body !== "object" || !("detail" in body)) return fallback;
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0] && typeof detail[0] === "object" && "msg" in detail[0]) {
        const msg = (detail[0] as { msg: unknown }).msg;
        if (typeof msg === "string") return msg;
    }
    return fallback;
}

export async function api(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    headers.set("X-Resident-Id", resident);
    if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    let response: Response;
    try {
        response = await fetch(`${base}${path}`, { ...init, headers });
    } catch {
        throw new Error("Nie można połączyć się z serwerem. Sprawdź, czy backend działa.");
    }
    if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        throw new Error(message(body, "Nie udało się wykonać żądania."));
    }
    return response;
}
