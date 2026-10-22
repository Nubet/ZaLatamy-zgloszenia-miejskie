"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Bell, Bookmark, MapPinned, Plus } from "lucide-react";
import { useReports } from "@/application/reports/provider";
import { CityMap } from "@/features/map/city-map";
import styles from "./landing.module.css";

export function LandingOverview() {
    const router = useRouter();
    const query = useReports();
    const reports = query.data?.reports.filter((report) => !report.duplicateOf) ?? [];

    return (
        <div className={styles["map-preview"]} aria-label="Podgląd publicznej mapy zgłoszeń">
            <div className={styles["map-preview__chrome"]}>
                <span className={styles["map-preview__window-dots"]} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                </span>
                <span>
                    ZaŁatamy <span className={styles["map-preview__divider"]}>/</span> Mapa zgłoszeń
                </span>
                <Link href="/mapa" aria-label="Otwórz pełną mapę zgłoszeń">
                    <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
            </div>
            <div className={styles["map-preview__body"]}>
                <aside className={styles["map-preview__sidebar"]} aria-label="Skróty do aplikacji">
                    <span className={styles["map-preview__brand"]}>
                        <span className={styles["landing__logo"]} aria-hidden="true" /> ZaŁatamy
                    </span>
                    <span className={styles["map-preview__sidebar-label"]}>PRZESTRZEŃ MIEJSKA</span>
                    <Link
                        href="/mapa"
                        className={`${styles["map-preview__link"]} ${styles["map-preview__link--active"]}`}
                    >
                        <MapPinned size={15} aria-hidden="true" /> Mapa zgłoszeń
                    </Link>
                    <Link href="/moje-zgloszenia" className={styles["map-preview__link"]}>
                        <Bookmark size={15} aria-hidden="true" /> Moje zgłoszenia
                    </Link>
                    <Link href="/powiadomienia" className={styles["map-preview__link"]}>
                        <Bell size={15} aria-hidden="true" /> Powiadomienia
                    </Link>
                    <Link
                        href="/zgloszenia/nowe"
                        className={`${styles["map-preview__link"]} ${styles["map-preview__link--create"]}`}
                    >
                        <Plus size={15} aria-hidden="true" /> Zgłoś problem
                    </Link>
                    <span className={styles["map-preview__sidebar-footer"]}>
                        Łódź<small>Publiczna mapa zgłoszeń</small>
                    </span>
                </aside>
                <div className={styles["map-preview__map"]} id="public-map">
                    <CityMap
                        reports={reports}
                        onSelect={(id) => router.push(`/mapa?zgloszenie=${encodeURIComponent(id)}`)}
                        publicView
                    />
                </div>
            </div>
        </div>
    );
}
