"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import styles from "./landing.module.css";

const scrollStep = 50;

function subscribeToScroll(onStoreChange: () => void) {
    window.addEventListener("scroll", onStoreChange, { passive: true });
    return () => window.removeEventListener("scroll", onStoreChange);
}

function getScrollStage() {
    return Math.min(3, Math.floor(window.scrollY / scrollStep));
}

export function LandingHeader() {
    const scrollStage = useSyncExternalStore(subscribeToScroll, getScrollStage, () => 0);
    const stageClass = scrollStage
        ? styles[`landing__header--stage-${scrollStage}` as keyof typeof styles]
        : "";

    return (
        <header className={`${styles["landing__header"]} ${stageClass}`}>
            <Link
                href="/"
                className={styles["landing__brand"]}
                aria-label="ZaŁatamy — strona główna"
            >
                <span className={styles["landing__logo"]} aria-hidden="true" />
                <strong>ZaŁatamy</strong>
            </Link>
            <nav className={styles["landing__section-nav"]} aria-label="O aplikacji">
                <a href="#co-zglosic">Co możesz zgłosić</a>
                <a href="#jak-zglosic">Jak to działa</a>
                <a href="#pytania">Pytania</a>
            </nav>
            <nav className={styles["landing__navigation"]} aria-label="Główna nawigacja">
                <Link href="/mapa" className={styles["landing__map-link"]}>
                    Mapa <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
                <Link href="/panel" className="button button--secondary">
                    Panel mieszkańca <ArrowRight size={14} aria-hidden="true" />
                </Link>
            </nav>
        </header>
    );
}
