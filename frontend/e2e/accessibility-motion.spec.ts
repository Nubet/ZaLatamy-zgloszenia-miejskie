import { expect, test } from "@playwright/test";

for (const system of ["reduce", "no-preference"] as const) {
    test(`animation overrides and map follow system ${system}`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: system });
        await page.addInitScript(() => {
            localStorage.setItem(
                "zalatamy-accessibility",
                JSON.stringify({ contrast: "yellow-on-black", animations: "system" }),
            );
        });
        await page.goto("/mapa");
        const map = page.locator(".city-map");
        await expect(map).toHaveAttribute("data-map-ready", "true", { timeout: 30_000 });
        await expect(map).toHaveAttribute(
            "data-map-motion",
            system === "reduce" ? "reduced" : "enabled",
        );
        for (const [label, motion] of [
            ["Włączone", "enabled"],
            ["Ograniczone", "reduced"],
            ["Systemowe", system === "reduce" ? "reduced" : "enabled"],
        ]) {
            await page.getByRole("button", { name: "Ustawienia dostępności", exact: true }).click();
            await page.getByRole("combobox", { name: "Animacje", exact: true }).click();
            await page.getByRole("option", { name: label, exact: true }).click();
            await page.getByRole("button", { name: "Gotowe", exact: true }).click();
            await expect(map).toHaveAttribute("data-map-motion", motion!);
            await expect(map).toHaveAttribute("data-map-ready", "true", { timeout: 30_000 });
            const transition = await page
                .getByRole("button", { name: "Ustawienia dostępności", exact: true })
                .evaluate((node) => getComputedStyle(node).transitionDuration);
            expect(transition.split(",").every((duration) => parseFloat(duration) === 0)).toBe(
                motion === "reduced",
            );
        }
    });
}
