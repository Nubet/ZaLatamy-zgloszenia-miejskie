import { expect, test } from "@playwright/test";
import { scanAccessibility } from "./accessibility-helpers";

test("text spacing does not hide controls or force page scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.addInitScript(() =>
        localStorage.setItem(
            "zalatamy-accessibility",
            '{"contrast":"black-on-white","fontSize":"extra-large","animations":"reduced"}',
        ),
    );
    for (const route of ["/", "/panel", "/mapa", "/zgloszenia/nowe", "/admin?view=list"]) {
        await page.goto(route);
        await expect(
            page.getByRole("button", { name: "Ustawienia dostępności", exact: true }).first(),
        ).toBeVisible();
        await page.addStyleTag({
            content:
                "* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }",
        });
        expect(
            await page.evaluate(() => document.documentElement.scrollWidth),
            route,
        ).toBeLessThanOrEqual(320);
        await page
            .getByRole("button", { name: "Ustawienia dostępności", exact: true })
            .first()
            .click();
        await page.getByRole("button", { name: "Gotowe", exact: true }).click();
    }
});

test("forced colors preserve keyboard focus and accessible controls", async ({ page }, info) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/");
    const opener = page.getByRole("button", { name: "Ustawienia dostępności", exact: true });
    await opener.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog", { name: "Ustawienia dostępności" })).toBeVisible();
    await scanAccessibility(page, info, "forced-colors-dialog");
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
});

test("fullscreen map keeps accessibility settings available", async ({ page }, info) => {
    await page.addInitScript(() =>
        localStorage.setItem(
            "zalatamy-accessibility",
            '{"contrast":"yellow-on-black","animations":"reduced"}',
        ),
    );
    await page.goto("/panel");
    test.skip(
        !(await page.evaluate(() => document.fullscreenEnabled)),
        "Fullscreen API is unavailable in this browser.",
    );
    await page.getByRole("button", { name: "Włącz pełny ekran" }).click();
    await expect(page.locator(".map-panel:fullscreen")).toBeVisible();
    await page
        .locator(".city-map__accessibility")
        .getByRole("button", { name: "Ustawienia dostępności", exact: true })
        .click();
    await expect(page.getByRole("dialog", { name: "Ustawienia dostępności" })).toBeVisible();
    await scanAccessibility(page, info, "fullscreen-settings");
    await page.getByRole("button", { name: "Gotowe", exact: true }).click();
    await page.getByRole("button", { name: "Wyłącz pełny ekran" }).click();
});
