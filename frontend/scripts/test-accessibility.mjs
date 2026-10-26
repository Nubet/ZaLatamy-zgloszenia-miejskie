import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

// Keep the audit runnable without committing dependency manifests.
try {
    createRequire(import.meta.url).resolve("@axe-core/playwright");
} catch {
    const install = spawnSync(
        "npm",
        ["install", "--no-save", "--package-lock=false", "@axe-core/playwright@4.14.0"],
        {
            cwd: fileURLToPath(new URL("..", import.meta.url)),
            stdio: "inherit",
            shell: process.platform === "win32",
        },
    );
    if (install.error) throw install.error;
    if (install.status !== 0) process.exit(install.status ?? 1);
}

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
