"use client";

import { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Accessibility, X } from "lucide-react";
import { useTheme } from "next-themes";
import { SelectControl } from "@/shared/ui/select-control";
import {
    defaultPreferences,
    preferenceValues,
    type AccessibilityPreferences,
} from "@/shared/accessibility/preferences";
import {
    setAccessibilityPreferences,
    useAccessibilityPreferences,
} from "@/shared/accessibility/preferences-store";
import "./accessibility-settings.css";

const labels = {
    contrast: [
        "Domyślny",
        "Wysoki kontrast",
        "Czarny na białym",
        "Biały na czarnym",
        "Żółty na czarnym",
    ],
    fontSize: ["Domyślny", "Duży (125%)", "Bardzo duży (150%)"],
    animations: ["Systemowe", "Włączone", "Ograniczone"],
};

export function AccessibilitySettings() {
    useAccessibilityPreferences();
    const [open, setOpen] = useState(false);
    const opener = useRef<HTMLButtonElement>(null);
    return (
        <>
            <button
                ref={opener}
                type="button"
                className="icon-button accessibility-settings__trigger"
                aria-label="Ustawienia dostępności"
                title="Ustawienia dostępności"
                aria-haspopup="dialog"
                onClick={() => setOpen(true)}
            >
                <Accessibility size={18} aria-hidden="true" />
            </button>
            {open &&
                createPortal(
                    <SettingsDialog
                        onClose={() => {
                            setOpen(false);
                            opener.current?.focus({ preventScroll: true });
                        }}
                    />,
                    document.fullscreenElement ?? document.body,
                )}
        </>
    );
}

function SettingsDialog({ onClose }: { onClose: () => void }) {
    const id = useId();
    const dialog = useRef<HTMLDialogElement>(null);
    const preferences = useAccessibilityPreferences();
    const { theme, setTheme } = useTheme();
    function close() {
        dialog.current?.close();
        onClose();
    }
    function update<K extends keyof AccessibilityPreferences>(key: K, value: string) {
        if ((preferenceValues[key] as readonly string[]).includes(value)) {
            setAccessibilityPreferences({ ...preferences, [key]: value });
        }
    }
    return (
        <dialog
            className="accessibility-settings"
            aria-labelledby={`${id}-title`}
            aria-describedby={`${id}-description`}
            ref={(node) => {
                dialog.current = node;
                if (node && !node.open) node.showModal();
            }}
            onCancel={(event) => {
                event.preventDefault();
                close();
            }}
        >
            <header className="accessibility-settings__header">
                <h2 id={`${id}-title`}>Ustawienia dostępności</h2>
                <button
                    type="button"
                    className="icon-button"
                    aria-label="Zamknij ustawienia dostępności"
                    onClick={close}
                >
                    <X size={18} aria-hidden="true" />
                </button>
            </header>
            <p id={`${id}-description`}>
                Zmiany są stosowane od razu i zapamiętywane w tej przeglądarce.
            </p>
            <label className="field" htmlFor={`${id}-theme`}>
                Motyw
            </label>
            <SelectControl
                id={`${id}-theme`}
                value={theme ?? "dark"}
                onValueChange={setTheme}
                options={[
                    { value: "light", label: "Jasny" },
                    { value: "dark", label: "Ciemny" },
                    { value: "system", label: "Systemowy" },
                ]}
            />
            {(
                [
                    ["contrast", "Kontrast"],
                    ["fontSize", "Rozmiar tekstu"],
                    ["animations", "Animacje"],
                ] as const
            ).map(([key, label]) => (
                <div key={key}>
                    <label className="field" htmlFor={`${id}-${key}`}>
                        {label}
                    </label>
                    <SelectControl
                        id={`${id}-${key}`}
                        value={preferences[key]}
                        onValueChange={(value) => update(key, value)}
                        options={preferenceValues[key].map((value, index) => ({
                            value,
                            label: labels[key][index]!,
                        }))}
                    />
                </div>
            ))}
            {preferences.contrast !== "default" && preferences.contrast !== "high" && (
                <p className="accessibility-settings__note">
                    Wybrany kontrast nadpisuje kolory motywu. Powrót do domyślnego kontrastu
                    przywróci wybrany motyw.
                </p>
            )}
            <footer className="accessibility-settings__footer">
                <button
                    type="button"
                    className="button button--secondary"
                    onClick={() => setAccessibilityPreferences(defaultPreferences)}
                >
                    Przywróć domyślną dostępność
                </button>
                <button type="button" className="button button--primary" onClick={close}>
                    Gotowe
                </button>
            </footer>
        </dialog>
    );
}
