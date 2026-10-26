import { expect, test } from "@playwright/test";
import { accessiblePalettes, scanAccessibility } from "./accessibility-helpers";

for (const { contrast, theme } of accessiblePalettes) {
    test(`${contrast}/${theme}: dialogs, reporting and administration`, async ({ page }, info) => {
        await page.addInitScript(
            ({ contrast, theme }) => {
                localStorage.setItem("zalatamy-theme", theme);
                localStorage.setItem(
                    "zalatamy-accessibility",
                    JSON.stringify({ contrast, fontSize: "extra-large", animations: "reduced" }),
                );
            },
            { contrast, theme },
        );
        await page.goto("/");
        await page.getByRole("button", { name: "Ustawienia dostępności", exact: true }).click();
        await scanAccessibility(page, info, "settings");
        await page.screenshot({ path: info.outputPath("settings.png") });
        await page.getByRole("combobox", { name: "Motyw", exact: true }).click();
        await expect(page.getByRole("listbox")).toBeVisible();
        await scanAccessibility(page, info, "settings-options");
        await page.keyboard.press("Escape");
        await page.keyboard.press("Escape");

        await page.goto("/zgloszenia/nowe");
        const image = await page.evaluate(() => {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 10;
            return canvas.toDataURL("image/png").split(",")[1]!;
        });
        await page.getByLabel("Dodaj zdjęcia problemu", { exact: true }).setInputFiles(
            ["first.png", "second.png"].map((name) => ({
                name,
                mimeType: "image/png",
                buffer: Buffer.from(image, "base64"),
            })),
        );
        await expect(page.getByText("Zdjęcia · 2/5", { exact: true })).toBeVisible();
        await scanAccessibility(page, info, "attachments");
        await page.getByRole("button", { name: "Dalej: lokalizacja" }).click();
        await page.getByText("Dokładne współrzędne lokalizacji", { exact: true }).click();
        await page.getByLabel("Długość geograficzna").fill("0");
        await page.getByLabel("Szerokość geograficzna").fill("0");
        await expect(
            page.getByRole("alert").filter({ hasText: "Wybierz lokalizację w granicach Łodzi." }),
        ).toBeVisible();
        await scanAccessibility(page, info, "location-error");
        await page.getByLabel("Długość geograficzna").fill("19.457");
        await page.getByLabel("Szerokość geograficzna").fill("51.759");
        await page.getByLabel("Adres lub opis miejsca").fill("Łódź, miejsce testowe");
        await scanAccessibility(page, info, "location");
        await page.getByRole("button", { name: "Dalej: opis i kategoria" }).click();
        await page.getByRole("button", { name: "Zaproponuj opis" }).click();
        await expect(
            page.getByRole("status").filter({ hasText: "Propozycja gotowa" }),
        ).toBeVisible();
        await scanAccessibility(page, info, "review");
        await page.getByLabel("Tytuł zgłoszenia").fill("Test dostępności formularza");
        await page
            .getByLabel("Opis problemu")
            .fill("Uszkodzona nawierzchnia utrudnia przejście chodnikiem.");
        const separate = page.getByRole("checkbox", { name: /To osobny problem/ });
        if (await separate.isVisible()) await separate.check();
        await page.getByRole("button", { name: "Wyślij zgłoszenie" }).click();
        await expect(page.locator(".report-details:visible")).toBeVisible();
        await scanAccessibility(page, info, "submitted-report");
        await page.getByRole("button", { name: "Powiększ zdjęcie 1 z 2" }).click();
        await expect(page.locator(".report-gallery__lightbox")).toBeVisible();
        await scanAccessibility(page, info, "gallery");
        await page.keyboard.press("Escape");

        await page.goto("/mapa");
        await page.getByRole("button", { name: /^Lista \(/ }).click();
        await page.locator(".public-map__results > button").first().click();
        await expect(page.getByRole("dialog", { name: "Podgląd zgłoszenia" })).toBeVisible();
        await scanAccessibility(page, info, "map-preview");
        await page.screenshot({ path: info.outputPath("map-preview.png") });

        await page.goto("/admin?view=list");
        await expect(page.locator(".work-queue__result-row").first()).toBeVisible();
        await page.locator(".work-queue__filters summary").click();
        await scanAccessibility(page, info, "admin-filters");
        await page.locator(".work-queue__filters summary").click();
        await page.locator(".date-range-filter summary").click();
        await page.getByRole("button", { name: "Własny zakres", exact: true }).click();
        await scanAccessibility(page, info, "admin-dates");
        await page.locator(".date-range-filter summary").click();
        await page.locator(".work-queue__result-row").first().click();
        await expect(page.locator(".admin-detail")).toBeVisible();
        await page.getByRole("combobox", { name: "Status zgłoszenia", exact: true }).click();
        await page.getByRole("option", { name: "Odrzucone", exact: true }).click();
        await expect(page.getByLabel("Uzasadnienie (wymagane)")).toBeVisible();
        await scanAccessibility(page, info, "admin-editor");
        await page.getByLabel("Uzasadnienie (wymagane)").fill("Sprawa wymaga odrębnej obsługi.");
        await page.getByRole("button", { name: "Zapisz zmiany" }).click();
        await expect(page.getByRole("status").filter({ hasText: "Zmiany zapisane" })).toBeVisible();
        await scanAccessibility(page, info, "admin-saved");
    });
}
