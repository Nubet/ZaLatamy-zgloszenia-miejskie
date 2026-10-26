import { expect, test } from "@playwright/test";

test("settings persist across routes and return focus on Escape", async ({ page }, info) => {
    await page.goto("/");
    const opener = page.getByRole("button", { name: "Ustawienia dostępności", exact: true });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Ustawienia dostępności" });
    await expect(dialog).toBeVisible();
    await page.screenshot({ path: info.outputPath("floating-settings.png") });
    await dialog.getByRole("button", { name: "Żółty na czarnym", exact: true }).click();
    await expect(
        dialog.getByRole("button", { name: "Żółty na czarnym", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    const triggerBox = await opener.boundingBox();
    const panelBox = await dialog.boundingBox();
    expect(triggerBox!.x).toBeLessThan(32);
    expect(panelBox!.y + panelBox!.height).toBeLessThan(triggerBox!.y);
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

test("blocked storage does not prevent opening the panel", async ({ page }) => {
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
    await page.getByRole("button", { name: "Wysoki kontrast", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");
});

test("system theme reacts to OS changes and contrast keeps the saved theme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.getByRole("button", { name: "Ustawienia dostępności", exact: true }).click();
    await page.getByRole("combobox", { name: "Motyw", exact: true }).click();
    await page.getByRole("option", { name: "Systemowy", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: "Biały na czarnym", exact: true }).click();
    await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
    expect(await page.evaluate(() => localStorage.getItem("zalatamy-theme"))).toBe("system");
    await page.getByRole("button", { name: "Przywróć domyślną dostępność" }).click();
    await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
});

test("open tabs synchronize accessibility settings and storage reset", async ({
    page,
    context,
}) => {
    await page.goto("/");
    await expect(
        page.getByRole("button", { name: "Ustawienia dostępności", exact: true }),
    ).toBeVisible();
    const other = await context.newPage();
    await other.goto("/panel");
    await other.evaluate(() =>
        localStorage.setItem(
            "zalatamy-accessibility",
            '{"contrast":"yellow-on-black","fontSize":"large","animations":"reduced"}',
        ),
    );
    await expect(page.locator("html")).toHaveAttribute("data-contrast", "yellow-on-black");
    await expect(page.locator("html")).toHaveAttribute("data-font-size", "large");
    await other.evaluate(() => localStorage.removeItem("zalatamy-accessibility"));
    await expect(page.locator("html")).toHaveAttribute("data-contrast", "default");
    await other.close();
});

test("malformed saved settings use safe defaults without hydration errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
        if (message.type() === "error" && /hydrat/i.test(message.text()))
            errors.push(message.text());
    });
    await page.addInitScript(() =>
        localStorage.setItem(
            "zalatamy-accessibility",
            '{"contrast":"invalid","fontSize":"large","animations":"invalid"}',
        ),
    );
    await page.goto("/panel");
    await page.getByRole("button", { name: "Ustawienia dostępności", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-contrast", "default");
    await expect(page.locator("html")).toHaveAttribute("data-font-size", "large");
    await expect(page.locator("html")).toHaveAttribute("data-animations", "system");
    expect(errors).toEqual([]);
});
