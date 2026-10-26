import { defineConfig } from "@playwright/test";
import config from "./playwright.config";

export default defineConfig({
    ...config,
    testMatch: "accessibility*.spec.ts",
    testIgnore: [],
    outputDir: "test-results/accessibility-artifacts",
    timeout: 120_000,
    use: { ...config.use, trace: "off" },
    reporter: [["list"], ["html", { outputFolder: "test-results/accessibility", open: "never" }]],
});
