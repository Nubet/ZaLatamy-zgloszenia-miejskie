import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicMap } from "@/features/map/public-map";

export const metadata: Metadata = {
    title: "Publiczna mapa zgłoszeń · Łódź",
    description:
        "Interaktywna mapa zgłoszeń w Łodzi. Wybierz punkt i sprawdź szczegóły oraz postęp sprawy.",
};

async function MapRoute({ searchParams }: PageProps<"/mapa">) {
    const params = await searchParams;
    return (
        <PublicMap
            initialSelectedId={typeof params.zgloszenie === "string" ? params.zgloszenie : null}
        />
    );
}

export default function MapPage(props: PageProps<"/mapa">) {
    return (
        <Suspense
            fallback={
                <main className="public-map public-map--feedback">Wczytujemy mapę Łodzi…</main>
            }
        >
            <MapRoute {...props} />
        </Suspense>
    );
}
