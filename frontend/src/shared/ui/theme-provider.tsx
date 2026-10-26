"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <NextThemeProvider
            attribute="data-theme"
            defaultTheme="dark"
            themes={["dark", "light"]}
            enableSystem
            storageKey="zalatamy-theme"
            disableTransitionOnChange
        >
            {children}
        </NextThemeProvider>
    );
}
