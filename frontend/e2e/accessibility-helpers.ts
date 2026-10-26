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
    expect.soft(results.violations, `${name}: WCAG 2.1 AA`).toEqual([]);
}

export async function checkTokenContrast(page: Page) {
    const pairs = [
        ["text-primary", "page-background"],
        ["text-primary", "surface-background"],
        ["text-secondary", "surface-background"],
        ["text-muted", "surface-background"],
        ["text-subtle", "control-background"],
        ["text-link", "surface-background"],
        ["text-inverse", "accent"],
        ["text-inverse", "accent-hover"],
        ["control-text", "control-background"],
        ["feedback-error-text", "feedback-error-background"],
        ...["new", "accepted", "progress", "resolved", "rejected", "duplicate"].map((status) => [
            `status-${status}-text`,
            `status-${status}-background`,
        ]),
    ];
    const ratios = await page.evaluate((pairs) => {
        const probe = document.createElement("span");
        document.body.append(probe);
        function luminance(token: string) {
            probe.style.color = `var(--${token})`;
            const color = getComputedStyle(probe).color;
            const rgb = color
                .match(/[\d.]+/g)!
                .slice(0, 3)
                .map(Number);
            return rgb
                .map((channel) => {
                    const value = channel / 255;
                    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
                })
                .reduce(
                    (sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index]!,
                    0,
                );
        }
        const result = pairs.map(([foreground, background]) => {
            const a = luminance(foreground!);
            const b = luminance(background!);
            return {
                foreground,
                background,
                ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
            };
        });
        probe.remove();
        return result;
    }, pairs);
    for (const pair of ratios)
        expect(pair.ratio, `${pair.foreground}/${pair.background}`).toBeGreaterThanOrEqual(4.5);
}
