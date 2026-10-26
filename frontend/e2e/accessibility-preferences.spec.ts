import { expect, test } from "@playwright/test";

test("settings persist across routes and return focus on Escape", async ({ page }) => {
    await page.goto("/");
    const opener = page.getByRole("button", { name: "Ustawienia dostępności", exact: true });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Ustawienia dostępności" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("combobox", { name: "Kontrast", exact: true }).click();
    await page.getByRole("option", { name: "Żółty na czarnym", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-contrast", "yellow-on-black");
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(opener).toBeFocused();
    await page.goto("/panel");
    await expect(page.locator("html")).toHaveAttribute("data-contrast", "yellow-on-black");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-contrast", "yellow-on-black");
    await opener.click();
    await page.getByRole("button", { name: "Przywróć domyślną dostępność" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-contrast", "default");
});

test("blocked storage and malformed settings do not prevent opening the panel", async ({
    page,
}) => {
    await page.addInitScript(() => {
        Storage.prototype.getItem = () => {
            throw new Error("Storage blocked");
        };
        Storage.prototype.setItem = () => {
            throw new Error("Storage blocked");
        };
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Ustawienia dostępności", exact: true }).click();
    await page.getByRole("combobox", { name: "Kontrast", exact: true }).click();
    await page.getByRole("option", { name: "Wysoki kontrast", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");
});
