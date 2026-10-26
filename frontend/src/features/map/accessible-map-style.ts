import type { StyleSpecification, SymbolLayerSpecification } from "maplibre-gl";

export type MapColors = { foreground: string; background: string; boundary: string };

export function accessibleMapStyle(colors: MapColors, fontScale: number): StyleSpecification {
    return {
        version: 8,
        glyphs: "https://tiles.basemaps.cartocdn.com/fonts/{fontstack}/{range}.pbf",
        sources: {
            carto: {
                type: "vector",
                url: "https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json",
                attribution:
                    '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
            },
        },
        layers: [
            {
                id: "background",
                type: "background",
                paint: { "background-color": colors.background },
            },
            {
                id: "water",
                type: "fill",
                source: "carto",
                "source-layer": "water",
                paint: { "fill-color": colors.background, "fill-outline-color": colors.foreground },
            },
            {
                id: "buildings",
                type: "fill",
                source: "carto",
                "source-layer": "building",
                minzoom: 14,
                paint: { "fill-color": colors.background, "fill-outline-color": colors.foreground },
            },
            {
                id: "roads",
                type: "line",
                source: "carto",
                "source-layer": "transportation",
                paint: {
                    "line-color": colors.foreground,
                    "line-width": ["interpolate", ["linear"], ["zoom"], 10, 1, 16, 4],
                },
            },
            ...(["transportation_name", "place"] as const).map(
                (sourceLayer): SymbolLayerSpecification => ({
                    id: `${sourceLayer}-labels`,
                    type: "symbol",
                    source: "carto",
                    "source-layer": sourceLayer,
                    layout: {
                        "symbol-placement":
                            sourceLayer === "transportation_name" ? "line" : "point",
                        "text-field": ["coalesce", ["get", "name:pl"], ["get", "name"]],
                        "text-font": ["Open Sans Regular"],
                        "text-size": 14 * fontScale,
                    },
                    paint: {
                        "text-color": colors.foreground,
                        "text-halo-color": colors.background,
                        "text-halo-width": 2,
                    },
                }),
            ),
        ],
        transition: { duration: 0, delay: 0 },
    };
}
