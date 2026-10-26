import { expect, test } from "@playwright/test";
import { accessiblePalettes, scanAccessibility } from "./accessibility-helpers";

const routes = [
    "/",
    "/panel",
    "/mapa",
    "/moje-zgloszenia",
    "/powiadomienia",
    "/zgloszenia/nowe",
    "/admin",
];

for (const { contrast, theme } of accessiblePalettes) {
    for (const fontSize of ["default", "large", "extra-large"]) {
        test(`${contrast}/${theme}/${fontSize}: WCAG 2.1 AA`, async ({ page }, info) => {
            await page.addInitScript(
                ({ contrast, theme, fontSize }) => {
                    localStorage.setItem("zalatamy-theme", theme);
                    localStorage.setItem(
                        "zalatamy-accessibility",
                        JSON.stringify({ contrast, fontSize, animations: "reduced" }),
                    );
                },
                { contrast, theme, fontSize },
            );

            for (const route of routes) {
                await page.goto(route);
                await expect(page.locator("html")).toHaveAttribute("data-contrast", contrast);
                await expect(
                    page
                        .getByRole("button", { name: "Ustawienia dostępności", exact: true })
                        .first(),
                ).toBeVisible();
                await expect(page.locator("main")).toBeVisible();
                await scanAccessibility(page, info, `${route}-${fontSize}`);
            }
        });
    }
}
