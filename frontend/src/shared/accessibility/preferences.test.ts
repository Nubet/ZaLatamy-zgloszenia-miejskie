import { describe, expect, it } from "vite-plus/test";
import { runInNewContext } from "node:vm";
import { accessibilityBootstrap, defaultPreferences, parsePreferences } from "./preferences";

describe("accessibility preferences", () => {
    it("validates each persisted field without accepting unknown values", () => {
        expect(
            parsePreferences(
                '{"contrast":"yellow-on-black","fontSize":"huge","animations":"enabled"}',
            ),
        ).toEqual({ contrast: "yellow-on-black", fontSize: "default", animations: "enabled" });
        for (const raw of [null, "{", "null", "[]", '"dark"'])
            expect(parsePreferences(raw)).toEqual(defaultPreferences);
    });

    it("applies the same validated settings before hydration, including blocked storage", () => {
        for (const blocked of [false, true]) {
            const dataset = {};
            runInNewContext(accessibilityBootstrap, {
                document: { documentElement: { dataset } },
                localStorage: {
                    getItem: () => {
                        if (blocked) throw new Error("Storage blocked");
                        return '{"contrast":"high","fontSize":"large","animations":"reduced"}';
                    },
                },
            });
            expect(dataset).toEqual(
                blocked
                    ? defaultPreferences
                    : { contrast: "high", fontSize: "large", animations: "reduced" },
            );
        }
    });
});
