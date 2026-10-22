"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { workNavigation, workSection } from "./work-navigation";

export function AdminNavigation({
    collapsed,
    onNavigate,
}: {
    collapsed: boolean;
    onNavigate: () => void;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const current =
        pathname === "/admin" ? workSection(searchParams.get("view") ?? undefined) : null;

    return (
        <nav className="sidebar__section" aria-label="Panel urzędnika">
            <p className="sidebar__nav-label">Panel urzędnika</p>
            {workNavigation.map(({ id, label, icon: Icon }) => (
                <Link
                    key={id}
                    href={id === "board" ? "/admin" : `/admin?view=${id}`}
                    className={`sidebar__nav-link ${current?.id === id ? "sidebar__nav-link--active" : ""}`}
                    aria-current={current?.id === id ? "page" : undefined}
                    aria-label={label}
                    title={collapsed ? label : undefined}
                    onClick={onNavigate}
                    scroll={false}
                >
                    <Icon size={17} strokeWidth={1.6} aria-hidden="true" />
                    <span className="sidebar__label">{label}</span>
                </Link>
            ))}
        </nav>
    );
}
