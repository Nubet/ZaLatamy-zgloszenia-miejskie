import { expect, it } from "vite-plus/test";
import { validateStyleMin } from "@maplibre/maplibre-gl-style-spec";
import { accessibleMapStyle } from "./accessible-map-style";

it("builds a valid opaque map style with scalable, halo-backed labels", () => {
    const style = accessibleMapStyle(
        { foreground: "#ffff00", background: "#000000", boundary: "#ffff00" },
        1.5,
    );
    expect(validateStyleMin(style)).toEqual([]);
    const labels = style.layers.filter((layer) => layer.type === "symbol");
    expect(labels).toHaveLength(2);
    for (const layer of labels) {
        expect(layer.layout?.["text-size"]).toBe(21);
        expect(layer.paint?.["text-halo-color"]).toBe("#000000");
        expect(layer.paint?.["text-halo-width"]).toBe(2);
    }
});
