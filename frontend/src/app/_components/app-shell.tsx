"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { useReports } from "@/application/reports/provider";
import { AdminNavigation } from "@/features/administration/admin-navigation";
import {
    ArrowUpRight,
    Bell,
    Bookmark,
    Building2,
    Check,
    CircleHelp,
    MapPinned,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    Plus,
    X,
} from "lucide-react";

const navigation = [
    { href: "/panel", label: "Mapa zgłoszeń", icon: MapPinned },
    { href: "/moje-zgloszenia", label: "Moje zgłoszenia", icon: Bookmark },
    { href: "/powiadomienia", label: "Powiadomienia", icon: Bell },
];

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const query = useReports();
    const [menuOpen, setMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const unread = query.data?.notifications.filter((item) => !item.read).length ?? 0;
    const isAdmin = pathname.startsWith("/admin");
    const currentPage = isAdmin
        ? "Panel urzędnika"
        : pathname === "/zgloszenia/nowe"
          ? "Nowe zgłoszenie"
          : (navigation.find((item) => item.href === pathname)?.label ?? "Szczegóły zgłoszenia");

    return (
        <div
            className={`app-shell ${menuOpen ? "app-shell--navigation-open" : ""} ${sidebarCollapsed && !menuOpen ? "app-shell--sidebar-collapsed" : ""}`}
        >
            <a className="skip-link" href="#main">
                Przejdź do treści
            </a>
            {menuOpen && (
                <button
                    className="app-shell__scrim"
                    aria-label="Zamknij nawigację"
                    onClick={() => setMenuOpen(false)}
                />
            )}
            <aside
                className="sidebar"
                id="city-navigation"
                tabIndex={-1}
                ref={(element) => {
                    if (menuOpen && element && !element.contains(document.activeElement))
                        element.focus();
                }}
            >
                <div className="sidebar__brand-row">
                    <button
                        className="icon-button sidebar__close"
                        aria-label="Zamknij menu"
                        onClick={() => {
                            setMenuOpen(false);
                            document.getElementById("navigation-toggle")?.focus();
                        }}
                    >
                        <X size={17} />
                    </button>
                    <Link
                        href="/"
                        className="brand"
                        aria-label="Załatamy — strona główna"
                        onClick={() => setMenuOpen(false)}
                    >
                        <span className="brand__symbol">
                            <Building2 size={21} strokeWidth={1.6} />
                        </span>
                        <span className="sidebar__label">
                            <strong>Załatamy</strong>
                            <small>Zgłoszenia miejskie</small>
                        </span>
                    </Link>
                    <button
                        className="icon-button sidebar__collapse-toggle"
                        aria-label={sidebarCollapsed ? "Rozwiń panel boczny" : "Zwiń panel boczny"}
                        aria-expanded={!sidebarCollapsed}
                        aria-controls="sidebar-content"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        title={sidebarCollapsed ? "Rozwiń panel boczny" : "Zwiń panel boczny"}
                    >
                        {sidebarCollapsed ? (
                            <PanelLeftOpen size={14} />
                        ) : (
                            <PanelLeftClose size={14} />
                        )}
                    </button>
                </div>
                <div className="sidebar__content" id="sidebar-content">
                    <nav aria-label="Główna nawigacja">
                        <p className="sidebar__nav-label">Panel mieszkańca</p>
                        {navigation.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setMenuOpen(false)}
                                className={`sidebar__nav-link ${pathname === href ? "sidebar__nav-link--active" : ""}`}
                                aria-current={pathname === href ? "page" : undefined}
                                aria-label={label}
                                title={sidebarCollapsed ? label : undefined}
                            >
                                <Icon size={17} strokeWidth={1.6} />
                                <span className="sidebar__label">{label}</span>
                                {href === "/panel" && (
                                    <span className="count-badge">
                                        {query.data?.reports.length ?? "—"}
                                    </span>
                                )}
                                {href === "/powiadomienia" && unread > 0 && (
                                    <span className="count-badge sidebar__notification-count">
                                        {unread}
                                    </span>
                                )}
                            </Link>
                        ))}
                        <Link
                            href="/zgloszenia/nowe"
                            onClick={() => setMenuOpen(false)}
                            className="sidebar__nav-link sidebar__nav-link--create"
                            aria-label="Zgłoś problem"
                            title={sidebarCollapsed ? "Zgłoś problem" : undefined}
                        >
                            <Plus size={16} /> <span className="sidebar__label">Zgłoś problem</span>
                        </Link>
                    </nav>
                    <Suspense>
                        <AdminNavigation
                            collapsed={sidebarCollapsed}
                            onNavigate={() => setMenuOpen(false)}
                        />
                    </Suspense>
                    <div className="sidebar__workspace">
                        <p className="sidebar__nav-label">Twoje miasto</p>
                        <div className="sidebar__team" title="Łódź · przestrzeń miejska">
                            <span className="sidebar__workspace-icon">Ł</span>
                            <span className="sidebar__label">
                                Łódź <small>Przestrzeń miejska</small>
                            </span>
                            <span className="sidebar__online-indicator" />
                        </div>
                    </div>
                    <div className="sidebar__footer">
                        <button
                            className="sidebar__nav-link sidebar__nav-link--help"
                            aria-label="Jak korzystać z aplikacji"
                            title={sidebarCollapsed ? "Jak korzystać z aplikacji" : undefined}
                            onClick={() => setHelpOpen(true)}
                        >
                            <CircleHelp size={17} />
                            <span className="sidebar__label">Pomoc i wskazówki</span>
                        </button>
                        <div
                            className="sidebar__profile"
                            title={
                                isAdmin ? "Anna Kowalska · Urzędnik" : "Marta Kowalska · Mieszkanka"
                            }
                        >
                            <span className={`avatar ${isAdmin ? "avatar--official" : ""}`}>
                                {isAdmin ? "AK" : "MK"}
                            </span>
                            <span className="sidebar__label">
                                <strong>{isAdmin ? "Anna Kowalska" : "Marta Kowalska"}</strong>
                                <small>{isAdmin ? "Urzędnik" : "Mieszkanka"}</small>
                            </span>
                        </div>
                    </div>
                </div>
            </aside>
            <div className="app-shell__main">
                <header className="topbar">
                    <div className="topbar__breadcrumbs">
                        <button
                            className="icon-button topbar__menu-toggle"
                            id="navigation-toggle"
                            aria-expanded={menuOpen}
                            aria-controls="city-navigation"
                            aria-label="Otwórz nawigację"
                            onClick={() => setMenuOpen(true)}
                        >
                            <Menu size={18} />
                        </button>
                        <Building2 size={15} />
                        <span className="topbar__city">Przestrzeń miejska</span>
                        <span className="topbar__divider">/</span>
                        <span>{currentPage}</span>
                    </div>
                    <div className="topbar__actions">
                        <Link
                            href="/powiadomienia"
                            className="icon-button topbar__notifications"
                            aria-label="Powiadomienia"
                        >
                            <Bell size={17} />
                            {unread > 0 && <span className="topbar__unread-indicator" />}
                        </Link>
                    </div>
                </header>
                <main id="main" className="app-shell__content">
                    {children}
                </main>
            </div>
            {helpOpen && <HelpDialog onClose={() => setHelpOpen(false)} />}
        </div>
    );
}

function HelpDialog({ onClose }: { onClose: () => void }) {
    return (
        <dialog
            ref={(element) => {
                if (element && !element.open) element.showModal();
            }}
            className="help-dialog"
            aria-labelledby="help-title"
            onCancel={onClose}
        >
            <button className="icon-button" aria-label="Zamknij pomoc" onClick={onClose}>
                <X size={18} />
            </button>
            <span className="eyebrow">POMOC</span>
            <h2 id="help-title">Jak zgłosić problem?</h2>
            <p>Dodaj zgłoszenie i śledź postęp sprawy.</p>
            <ol>
                <li>
                    <Check size={17} />
                    <span>
                        <strong>Opisz problem</strong>Dodaj do 5 zdjęć, wskaż miejsce na mapie i
                        sprawdź opis przed wysłaniem.
                    </span>
                </li>
                <li>
                    <Check size={17} />
                    <span>
                        <strong>Śledź postęp</strong>Otwórz szczegóły zgłoszenia, aby sprawdzić jego
                        status i historię.
                    </span>
                </li>
                <li>
                    <Check size={17} />
                    <span>
                        <strong>Sprawdź powiadomienia</strong>Zobacz aktualizacje zgłoszonych i
                        obserwowanych spraw.
                    </span>
                </li>
            </ol>
            <button className="button button--primary" onClick={onClose}>
                Zaczynamy <ArrowUpRight size={15} />
            </button>
        </dialog>
    );
}
