import { useEffect, type RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import type { Location } from "@/domain/reports/model";
import { isWithinLodz } from "@/domain/reports/rules";

export function useMapFocus(
    map: RefObject<MapRef | null>,
    target: Location | null | undefined,
    readyVersion: number,
) {
    useEffect(() => {
        if (readyVersion > 0 && target && isWithinLodz(target)) {
            map.current?.easeTo({ center: [target.longitude, target.latitude], duration: 450 });
        }
    }, [readyVersion, map, target]);
}
