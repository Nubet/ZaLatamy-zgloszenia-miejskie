import { copyFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { version } = require("maplibre-gl/package.json");

// Keep the worker on the same origin and version as the runtime; Turbopack rewrites its bundled URL
copyFileSync(
    require.resolve("maplibre-gl/dist/maplibre-gl-worker.mjs"),
    new URL(`../public/maplibre-worker-${version}.mjs`, import.meta.url),
);
