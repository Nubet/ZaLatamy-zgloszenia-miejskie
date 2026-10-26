"use client";

import { useSyncExternalStore } from "react";
import {
    accessibilityStorageKey,
    applyPreferences,
    defaultPreferences,
    parsePreferences,
    type AccessibilityPreferences,
} from "./preferences";

let snapshot = defaultPreferences;
let initialized = false;
const listeners = new Set<() => void>();

function readPreferences() {
    try {
        return parsePreferences(localStorage.getItem(accessibilityStorageKey));
    } catch {
        return defaultPreferences;
    }
}

function getSnapshot() {
    if (!initialized) {
        snapshot = readPreferences();
        initialized = true;
    }
    return snapshot;
}

function publish(next: AccessibilityPreferences) {
    snapshot = next;
    initialized = true;
    applyPreferences(next);
    listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
    if (event.key === accessibilityStorageKey || event.key === null) publish(readPreferences());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1) window.addEventListener("storage", onStorage);
    return () => {
        listeners.delete(listener);
        if (!listeners.size) window.removeEventListener("storage", onStorage);
    };
}

export function setAccessibilityPreferences(next: AccessibilityPreferences) {
    const validated = parsePreferences(JSON.stringify(next));
    publish(validated);
    try {
        localStorage.setItem(accessibilityStorageKey, JSON.stringify(validated));
    } catch {
        // Keep settings usable for this tab when persistent storage is unavailable.
    }
}

export function useAccessibilityPreferences() {
    return useSyncExternalStore(subscribe, getSnapshot, () => defaultPreferences);
}
