import { expect, test } from "@playwright/test";
import { accessiblePalettes, checkTokenContrast } from "./accessibility-helpers";

for (const { contrast, theme } of accessiblePalettes) {
    test(`${contrast}/${theme}: semantic color contrast`, async ({ page }) => {
        await page.addInitScript(
            ({ contrast, theme }) => {
                localStorage.setItem("zalatamy-theme", theme);
                localStorage.setItem("zalatamy-accessibility", JSON.stringify({ contrast }));
            },
            { contrast, theme },
        );
        await page.goto("/");
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(page.locator("html")).toHaveAttribute("data-contrast", contrast);
        await checkTokenContrast(page);
    });
}
