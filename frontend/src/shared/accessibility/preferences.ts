export const preferenceValues = {
    contrast: ["default", "high", "black-on-white", "white-on-black", "yellow-on-black"],
    fontSize: ["default", "large", "extra-large"],
    animations: ["system", "enabled", "reduced"],
} as const;

export type AccessibilityPreferences = {
    [K in keyof typeof preferenceValues]: (typeof preferenceValues)[K][number];
};

export const defaultPreferences: AccessibilityPreferences = {
    contrast: "default",
    fontSize: "default",
    animations: "system",
};

export const accessibilityStorageKey = "zalatamy-accessibility";

export function parsePreferences(raw: string | null): AccessibilityPreferences {
    try {
        const value: unknown = JSON.parse(raw ?? "null");
        if (!value || typeof value !== "object" || Array.isArray(value)) return defaultPreferences;
        const valid = <K extends keyof AccessibilityPreferences>(
            key: K,
        ): AccessibilityPreferences[K] => {
            const candidate = (value as Record<string, unknown>)[key];
            return typeof candidate === "string" &&
                (preferenceValues[key] as readonly string[]).includes(candidate)
                ? (candidate as AccessibilityPreferences[K])
                : defaultPreferences[key];
        };
        return {
            contrast: valid("contrast"),
            fontSize: valid("fontSize"),
            animations: valid("animations"),
        };
    } catch {
        return defaultPreferences;
    }
}

export function applyPreferences(preferences: AccessibilityPreferences) {
    const root = document.documentElement;
    root.dataset.contrast = preferences.contrast;
    root.dataset.fontSize = preferences.fontSize;
    root.dataset.animations = preferences.animations;
}

export const accessibilityBootstrap = `(()=>{const values=${JSON.stringify(preferenceValues)};let saved;try{saved=JSON.parse(localStorage.getItem(${JSON.stringify(accessibilityStorageKey)}))}catch{}for(const [key,allowed] of Object.entries(values)){document.documentElement.dataset[key]=saved&&typeof saved==='object'&&!Array.isArray(saved)&&allowed.includes(saved[key])?saved[key]:allowed[0]}})()`;
