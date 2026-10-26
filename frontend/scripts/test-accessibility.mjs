import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const result = spawnSync(
    process.execPath,
    [
        fileURLToPath(new URL("../node_modules/@playwright/test/cli.js", import.meta.url)),
        "test",
        "--config",
        "playwright.accessibility.config.ts",
        ...process.argv.slice(2),
    ],
    { cwd: fileURLToPath(new URL("..", import.meta.url)), stdio: "inherit" },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
