"use client";

import { Fragment, useCallback, useId, useRef, useState } from "react";
import Link from "next/link";
import * as maplibregl from "maplibre-gl";
import { version as maplibreVersion } from "maplibre-gl/package.json";
import Map, {
    AttributionControl,
    FullscreenControl,
    Layer,
    Marker,
    NavigationControl,
    Source,
    type MapRef,
} from "react-map-gl/maplibre";
import { Crosshair, LocateFixed, MapPin, Maximize2 } from "lucide-react";
import { statuses, type Report } from "@/domain/reports/model";
import { lodzBoundary } from "@/domain/reports/rules";
import type { CityMapProps } from "./city-map";
import { useMapFocus } from "./use-map-focus";
import { useTheme } from "next-themes";
import "maplibre-gl/dist/maplibre-gl.css";

maplibregl.setWorkerUrl(`/maplibre-worker-${maplibreVersion}.mjs`);

const center = { longitude: 19.456, latitude: 51.7592, zoom: 12.3 };
// Allow roughly 5 km of navigation beyond the city boundary.
const bounds: [number, number, number, number] = [19.264, 51.642, 19.702, 51.904];

export function InteractiveMap({
    reports = [],
    selectedId,
    onSelect,
    location,
    onLocate,
    publicView = false,
}: CityMapProps) {
    const { resolvedTheme } = useTheme();
    const mapStyle = resolvedTheme === "light" ? "positron-gl-style" : "dark-matter-gl-style";
    const [boundaryColor, setBoundaryColor] = useState<string>();
    const map = useRef<MapRef>(null);
    const [loaded, setLoaded] = useState(false);
    const [mapVersion, setMapVersion] = useState(0);
    const attachMap = useCallback((instance: MapRef | null) => {
        if (map.current === instance) return;
        map.current = instance;
        setLoaded(instance?.loaded() ?? false);
        if (instance) setMapVersion((version) => version + 1);
    }, []);
    const [resourceError, setResourceError] = useState(false);
    const [unavailable, setUnavailable] = useState(false);
    const mapId = useId();
    const selected = reports.find((report) => report.id === selectedId);
    const target = selected?.location ?? location;
    useMapFocus(map, target, loaded ? mapVersion : 0);

    function resetView() {
        map.current?.flyTo({ ...center, bearing: 0, pitch: 0, duration: 600 });
    }

    if (unavailable)
        return (
            <div className="city-map">
                <div className="city-map__error" role="alert">
                    Nie można uruchomić mapy. Włącz WebGL w przeglądarce lub wybierz zgłoszenie z
                    listy.
                </div>
            </div>
        );

    return (
        <div
            id={mapId}
            className="city-map"
            aria-label="Mapa zgłoszeń w Łodzi"
            data-map-ready={loaded}
        >
            <Map
                mapLib={maplibregl}
                ref={attachMap}
                initialViewState={location ? { ...location, zoom: 15 } : center}
                mapStyle={`https://basemaps.cartocdn.com/gl/${mapStyle}/style.json`}
                maxBounds={bounds}
                minZoom={10}
                maxZoom={19}
                dragRotate={false}
                touchPitch={false}
                attributionControl={false}
                locale={{
                    "NavigationControl.ZoomIn": "Przybliż mapę",
                    "NavigationControl.ZoomOut": "Oddal mapę",
                    "FullscreenControl.Enter": "Włącz pełny ekran",
                    "FullscreenControl.Exit": "Wyłącz pełny ekran",
                    "AttributionControl.ToggleAttribution": "Autorzy mapy",
                }}
                canvasContextAttributes={{ antialias: true }}
                cursor={onLocate ? "crosshair" : "grab"}
                onLoad={() => setLoaded(true)}
                onStyleData={(event) => {
                    setBoundaryColor(
                        getComputedStyle(event.target.getContainer())
                            .getPropertyValue("--city-map-boundary")
                            .trim(),
                    );
                }}
                onError={(event) => {
                    if (!event.target) setUnavailable(true);
                    else setResourceError(true);
                }}
                onIdle={() => setResourceError(false)}
                onClick={
                    onLocate
                        ? (event) =>
                              onLocate({ longitude: event.lngLat.lng, latitude: event.lngLat.lat })
                        : undefined
                }
            >
                {/* Activity preserves React state while react-map-gl replaces the map instance. */}
                <Fragment key={mapVersion}>
                    <AttributionControl compact position="bottom-right" />
                    <NavigationControl showCompass={false} position="bottom-right" />
                    <FullscreenControl
                        containerId={
                            publicView ? "public-map" : onSelect ? "reports-map-panel" : mapId
                        }
                        position="top-right"
                    />
                    {boundaryColor && (
                        <Source id="lodz-boundary" type="geojson" data={lodzBoundary}>
                            <Layer
                                id="lodz-outline"
                                type="line"
                                paint={{
                                    "line-color": boundaryColor,
                                    "line-width": 2,
                                    "line-opacity": 0.65,
                                    "line-dasharray": [3, 3],
                                }}
                            />
                        </Source>
                    )}
                    {reports.map((report) => (
                        <ReportMarker
                            key={report.id}
                            report={report}
                            active={report.id === selectedId}
                            onSelect={onSelect}
                        />
                    ))}
                    {location && (
                        <Marker longitude={location.longitude} latitude={location.latitude}>
                            <span className="city-map__location" aria-label="Wybrana lokalizacja" />
                        </Marker>
                    )}
                </Fragment>
            </Map>
            {!loaded && !resourceError && (
                <output className="city-map__loading-indicator">Wczytujemy podkład mapy…</output>
            )}
            {resourceError && (
                <output className="city-map__error">
                    Nie udało się pobrać części mapy. Sprawdź połączenie z internetem. Zgłoszenia są
                    nadal dostępne.
                </output>
            )}
            <div className="city-map__city-label">
                <MapPin size={14} /> Łódź{" "}
                <small>{onLocate ? "Wskaż miejsce na mapie" : "Zgłoszenia mieszkańców"}</small>
            </div>
            {!onLocate && (
                <div className="city-map__legend" aria-label="Legenda statusów">
                    {Object.entries(statuses).map(([status, label]) => (
                        <span key={status}>
                            <i className={`city-map__status city-map__status--${status}`} />
                            {label}
                        </span>
                    ))}
                </div>
            )}
            <div className="city-map__actions">
                {!publicView && !onLocate && (
                    <Link
                        href={
                            selected
                                ? `/mapa?zgloszenie=${encodeURIComponent(selected.id)}`
                                : "/mapa"
                        }
                        className="icon-button"
                        aria-label="Otwórz publiczną mapę"
                        title="Otwórz publiczną mapę"
                    >
                        <Maximize2 size={17} />
                    </Link>
                )}
                <button
                    type="button"
                    className="icon-button"
                    aria-label="Przywróć widok Łodzi"
                    title="Przywróć widok Łodzi"
                    onClick={resetView}
                >
                    <LocateFixed size={17} />
                </button>
                {onLocate && (
                    <button
                        type="button"
                        className="icon-button"
                        aria-label="Wybierz środek mapy"
                        onClick={() => {
                            const point = map.current?.getCenter();
                            if (point) onLocate({ longitude: point.lng, latitude: point.lat });
                        }}
                    >
                        <Crosshair size={17} />
                    </button>
                )}
            </div>
        </div>
    );
}

function ReportMarker({
    report,
    active,
    onSelect,
}: {
    report: Report;
    active: boolean;
    onSelect: CityMapProps["onSelect"];
}) {
    return (
        <Marker
            longitude={report.location.longitude}
            latitude={report.location.latitude}
            style={{ zIndex: active ? 2 : 1 }}
        >
            <button
                type="button"
                className={`city-map__marker city-map__status city-map__status--${report.status}`}
                aria-label={`${report.title}, ${report.address}`}
                aria-pressed={active}
                title={`${report.title} · ${statuses[report.status]}`}
                onClick={(event) => {
                    event.stopPropagation();
                    onSelect?.(report.id);
                }}
            >
                <svg viewBox="-24 -24 48 48" aria-hidden="true">
                    <circle
                        r={active ? 23 : 17}
                        fill="currentColor"
                        opacity={active ? 0.25 : 0.1}
                    />
                    <circle
                        className="city-map__marker-center"
                        r={active ? 11 : 8}
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                    <circle r={active ? 5 : 3.5} fill="currentColor" />
                </svg>
            </button>
        </Marker>
    );
}
