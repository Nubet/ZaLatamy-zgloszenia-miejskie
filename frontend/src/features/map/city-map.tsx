"use client";

import dynamic from "next/dynamic";
import type { Location, Report } from "@/domain/reports/model";

export type CityMapProps = {
    reports?: Report[];
    selectedId?: string | null;
    onSelect?: (id: string) => void;
    location?: Location | null;
    onLocate?: (location: Location) => void;
    publicView?: boolean;
};

export const CityMap = dynamic<CityMapProps>(
    () => import("./interactive-map").then((module) => module.InteractiveMap),
    {
        ssr: false,
        loading: () => (
            <output className="city-map city-map--loading">Wczytujemy mapę Łodzi…</output>
        ),
    },
);
