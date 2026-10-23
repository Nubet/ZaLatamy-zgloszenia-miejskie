"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { setTheme } = useTheme();

    return (
        <button
            type="button"
            className="icon-button theme-toggle"
            title="Przełącz jasny lub ciemny motyw"
            onClick={() =>
                setTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light")
            }
        >
            <span className="theme-toggle__sun">
                <Sun size={17} aria-hidden="true" />
                <span className="sr-only">Włącz jasny motyw</span>
            </span>
            <span className="theme-toggle__moon">
                <Moon size={17} aria-hidden="true" />
                <span className="sr-only">Włącz ciemny motyw</span>
            </span>
        </button>
    );
}
