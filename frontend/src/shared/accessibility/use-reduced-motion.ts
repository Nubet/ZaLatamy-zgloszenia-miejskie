"use client";

import { useSyncExternalStore } from "react";
import { useAccessibilityPreferences } from "./preferences-store";

const query = "(prefers-reduced-motion: reduce)";
function subscribe(listener: () => void) {
    const media = window.matchMedia(query);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
}
const getSnapshot = () => window.matchMedia(query).matches;

export function useReducedMotion() {
    const { animations } = useAccessibilityPreferences();
    const systemReduced = useSyncExternalStore(subscribe, getSnapshot, () => false);
    return animations === "reduced" || (animations === "system" && systemReduced);
}
