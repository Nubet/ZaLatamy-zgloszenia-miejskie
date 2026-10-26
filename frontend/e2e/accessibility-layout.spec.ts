import { expect, test } from "@playwright/test";

const routes = [
    "/",
    "/panel",
    "/mapa",
    "/moje-zgloszenia",
    "/powiadomienia",
    "/zgloszenia/nowe",
    "/admin",
];

test("content reflows at 320 CSS pixels and 200% text size", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.addInitScript(() => {
        localStorage.setItem(
            "zalatamy-accessibility",
            JSON.stringify({ contrast: "yellow-on-black", fontSize: "extra-large" }),
        );
    });
    for (const route of routes) {
        await page.goto(route);
        await expect(
            page.getByRole("button", { name: "Ustawienia dostępności", exact: true }).first(),
        ).toBeVisible();
        await page.evaluate(() => {
            document.documentElement.style.fontSize = "200%";
        });
        await expect
            .poll(
                async () => {
                    const width = await page.evaluate(() => document.documentElement.scrollWidth);
                    const overflow =
                        width <= 320
                            ? []
                            : await page.locator("body *:visible").evaluateAll((nodes) =>
                                  nodes
                                      .filter(
                                          (node) =>
                                              !node.closest(".city-map") &&
                                              (node.getBoundingClientRect().right > 321 ||
                                                  node.scrollWidth > node.clientWidth + 1),
                                      )
                                      .map((node) => ({
                                          tag: node.tagName,
                                          class: node.className,
                                          width: node.getBoundingClientRect().width,
                                          scroll: node.scrollWidth,
                                      }))
                                      .slice(0, 20),
                              );
                    return { width, overflow };
                },
                { message: route },
            )
            .toEqual({ width: 320, overflow: [] });
        await page
            .getByRole("button", { name: "Ustawienia dostępności", exact: true })
            .first()
            .click();
        await page.getByRole("button", { name: "Gotowe", exact: true }).scrollIntoViewIfNeeded();
        await expect(page.getByRole("button", { name: "Gotowe", exact: true })).toBeInViewport();
        await page.keyboard.press("Escape");
    }
});

test("mobile navigation traps focus and closes with Escape", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto("/panel");
    const opener = page.getByRole("button", { name: "Otwórz nawigację" });
    await opener.click();
    const navigation = page.getByRole("dialog", { name: "Nawigacja" });
    await expect(navigation).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(navigation.getByRole("button", { name: "Pomoc i wskazówki" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(navigation.getByRole("button", { name: "Zamknij menu" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
});
