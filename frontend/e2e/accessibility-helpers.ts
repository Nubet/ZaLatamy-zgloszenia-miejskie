import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, type TestInfo } from "@playwright/test";

export const accessiblePalettes = [
    { contrast: "high", theme: "light" },
    { contrast: "high", theme: "dark" },
    { contrast: "black-on-white", theme: "dark" },
    { contrast: "white-on-black", theme: "light" },
    { contrast: "yellow-on-black", theme: "light" },
] as const;

export async function scanAccessibility(page: Page, info: TestInfo, name: string) {
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
    await info.attach(name, {
        body: JSON.stringify(results, null, 2),
        contentType: "application/json",
    });
    expect(results.violations, `${name}: WCAG 2.1 AA`).toEqual([]);
}
