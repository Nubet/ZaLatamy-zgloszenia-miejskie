import { Suspense } from "react";
import { AppShell } from "@/app/_components/app-shell";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<main className="page">Przygotowujemy widok…</main>}>
            <AppShell>{children}</AppShell>
        </Suspense>
    );
}
