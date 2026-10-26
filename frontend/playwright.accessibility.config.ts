import { defineConfig } from "@playwright/test";
import config from "./playwright.config";

export default defineConfig({
    ...config,
    testMatch: "accessibility*.spec.ts",
    outputDir: "test-results/accessibility-artifacts",
    timeout: 120_000,
    reporter: [["list"], ["html", { outputFolder: "test-results/accessibility", open: "never" }]],
});
