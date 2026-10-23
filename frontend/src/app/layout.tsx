import type { Metadata } from "next";
import "./reset.css";
import "@/shared/styles/palette.css";
import "@/shared/styles/tokens.css";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider } from "@/shared/ui/theme-provider";

export const metadata: Metadata = {
    title: "ZaŁatamy · Zgłoszenia miejskie w Łodzi",
    description: "Zgłoś problem w Łodzi i obserwuj postępy jego rozwiązania.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pl">
            <body>
                <ThemeProvider>
                    <Providers>{children}</Providers>
                </ThemeProvider>
            </body>
        </html>
    );
}
