"use client";

import { Fragment, useCallback, useId, useMemo, useRef, useState } from "react";
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
import { useAccessibilityPreferences } from "@/shared/accessibility/preferences-store";
import { useReducedMotion } from "@/shared/accessibility/use-reduced-motion";
import { accessibleMapStyle, type MapColors } from "./accessible-map-style";
import { AccessibilitySettings } from "@/features/accessibility/accessibility-settings";
import "maplibre-gl/dist/maplibre-gl.css";

maplibregl.setWorkerUrl(`/maplibre-worker-${maplibreVersion}.mjs`);

const center = { longitude: 19.456, latitude: 51.7592, zoom: 12.3 };
const statusSymbols = {
    new: "N",
    accepted: "A",
    progress: "W",
    resolved: "✓",
    rejected: "×",
    duplicate: "D",
};
// Allow roughly 5 km of navigation beyond the city boundary.
const bounds: [number, number, number, number] = [19.264, 51.642, 19.702, 51.904];

export function InteractiveMap({
    reports = [],
    selectedId,
    onSelect,
    location,
    onLocate,
    publicView = false,
    minimal = false,
}: CityMapProps) {
    const { resolvedTheme } = useTheme();
    const { contrast } = useAccessibilityPreferences();
    const reducedMotion = useReducedMotion();
    const [colors, setColors] = useState<MapColors>();
    const [fontScale, setFontScale] = useState(1);
    const [fullscreen, setFullscreen] = useState(false);
    const attachContainer = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;
        function refresh() {
            const styles = getComputedStyle(node!);
            const next = {
                foreground: styles.getPropertyValue("--text-primary").trim(),
                background: styles.getPropertyValue("--page-background").trim(),
                boundary: styles.getPropertyValue("--city-map-boundary").trim(),
            };
            setColors((previous) =>
                previous &&
                Object.keys(next).every(
                    (key) => previous[key as keyof MapColors] === next[key as keyof MapColors],
                )
                    ? previous
                    : next,
            );
            setFontScale(parseFloat(getComputedStyle(document.documentElement).fontSize) / 16);
        }
        function onFullscreen() {
            setFullscreen(Boolean(document.fullscreenElement?.contains(node!)));
        }
        refresh();
        const observer = new MutationObserver(refresh);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme", "data-contrast", "data-font-size", "style"],
        });
        document.addEventListener("fullscreenchange", onFullscreen);
        return () => {
            observer.disconnect();
            document.removeEventListener("fullscreenchange", onFullscreen);
        };
    }, []);
    const mapStyle = useMemo(
        () =>
            contrast !== "default" && colors
                ? accessibleMapStyle(colors, fontScale)
                : `https://basemaps.cartocdn.com/gl/${resolvedTheme === "light" ? "positron-gl-style" : "dark-matter-gl-style"}/style.json`,
        [contrast, colors, fontScale, resolvedTheme],
    );
    const [viewport, setViewport] = useState({
        ...(location ?? center),
        zoom: location ? 15 : center.zoom,
    });
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
    useMapFocus(map, target, loaded ? mapVersion : 0, reducedMotion);

    function resetView() {
        map.current?.flyTo({ ...center, bearing: 0, pitch: 0, duration: reducedMotion ? 0 : 600 });
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
            ref={attachContainer}
            className="city-map"
            aria-label="Mapa zgłoszeń w Łodzi"
            data-map-ready={loaded}
            data-map-motion={reducedMotion ? "reduced" : "enabled"}
            data-map-contrast={contrast}
        >
            {(contrast === "default" || colors) && (
                <Map
                    key={reducedMotion ? "reduced" : "enabled"}
                    reduceMotion={reducedMotion}
                    fadeDuration={reducedMotion ? 0 : 300}
                    mapLib={maplibregl}
                    ref={attachMap}
                    initialViewState={viewport}
                    onMoveEnd={(event) => setViewport(event.viewState)}
                    mapStyle={mapStyle}
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
                    onLoad={(event) => {
                        event.target
                            .getCanvas()
                            .setAttribute(
                                "aria-label",
                                "Mapa Łodzi. Strzałki przesuwają mapę, plus i minus zmieniają przybliżenie. Zgłoszenia są również dostępne na liście.",
                            );
                        event.target
                            .getContainer()
                            .querySelector<HTMLElement>(
                                ".maplibregl-compact-show .maplibregl-ctrl-attrib-button",
                            )
                            ?.click();
                        setLoaded(true);
                    }}
                    onError={(event) => {
                        if (!event.target) setUnavailable(true);
                        else setResourceError(true);
                    }}
                    onIdle={() => setResourceError(false)}
                    onClick={
                        onLocate
                            ? (event) =>
                                  onLocate({
                                      longitude: event.lngLat.lng,
                                      latitude: event.lngLat.lat,
                                  })
                            : undefined
                    }
                >
                    {/* Activity preserves React state while react-map-gl replaces the map instance. */}
                    <Fragment key={mapVersion}>
                        <AttributionControl compact position="bottom-right" />
                        {!minimal && (
                            <NavigationControl showCompass={false} position="bottom-right" />
                        )}
                        {!minimal && (
                            <FullscreenControl
                                containerId={
                                    publicView
                                        ? "public-map"
                                        : onSelect
                                          ? "reports-map-panel"
                                          : mapId
                                }
                                position="top-right"
                            />
                        )}
                        {colors && (
                            <Source id="lodz-boundary" type="geojson" data={lodzBoundary}>
                                <Layer
                                    id="lodz-outline"
                                    type="line"
                                    paint={{
                                        "line-color": colors.boundary,
                                        "line-width": 2,
                                        "line-opacity": contrast === "default" ? 0.65 : 1,
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
                                accessible={contrast !== "default"}
                            />
                        ))}
                        {location && (
                            <Marker longitude={location.longitude} latitude={location.latitude}>
                                <svg className="city-map__location">
                                    <title>Wybrana lokalizacja</title>
                                </svg>
                            </Marker>
                        )}
                    </Fragment>
                </Map>
            )}
            {fullscreen && (
                <div className="city-map__accessibility">
                    <AccessibilitySettings />
                </div>
            )}
            {!loaded && !resourceError && (
                <output className="city-map__loading-indicator">Wczytujemy podkład mapy…</output>
            )}
            {resourceError && (
                <output className="city-map__error">
                    Nie udało się pobrać części mapy. Sprawdź połączenie z internetem. Zgłoszenia są
                    nadal dostępne.
                </output>
            )}
            {!minimal && onLocate && (
                <div className="city-map__city-label">
                    <MapPin size={14} /> Łódź <small>Wskaż miejsce na mapie</small>
                </div>
            )}
            {!minimal && !onLocate && (
                <details className="city-map__legend" open>
                    <summary className="city-map__legend-toggle">Legenda statusów</summary>
                    <div className="city-map__legend-items">
                        {Object.entries(statuses).map(([status, label]) => (
                            <span key={status}>
                                <i
                                    className={`city-map__status city-map__status--${status}`}
                                    aria-hidden="true"
                                >
                                    {contrast !== "default"
                                        ? statusSymbols[status as keyof typeof statusSymbols]
                                        : null}
                                </i>
                                {label}
                            </span>
                        ))}
                    </div>
                </details>
            )}
            {!minimal && (
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
            )}
        </div>
    );
}

function ReportMarker({
    report,
    active,
    onSelect,
    accessible,
}: {
    report: Report;
    active: boolean;
    onSelect: CityMapProps["onSelect"];
    accessible: boolean;
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
                aria-label={`${report.title}, ${report.address}, ${statuses[report.status]}`}
                aria-pressed={active}
                title={`${report.title} · ${statuses[report.status]}`}
                onClick={(event) => {
                    event.stopPropagation();
                    onSelect?.(report.id);
                }}
            >
                <svg viewBox="-24 -24 48 48" aria-hidden="true">
                    {accessible ? (
                        <>
                            <circle
                                r={active ? 21 : 18}
                                fill="var(--surface-background)"
                                stroke="currentColor"
                                strokeWidth={active ? 4 : 2}
                            />
                            <text
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill="currentColor"
                                fontSize="18"
                                fontWeight="700"
                            >
                                {statusSymbols[report.status]}
                            </text>
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </svg>
            </button>
        </Marker>
    );
}
