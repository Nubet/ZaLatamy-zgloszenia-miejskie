import { Archive, Columns3, List } from "lucide-react";

export const workNavigation = [
    { id: "board", label: "Tablica zgłoszeń", icon: Columns3, view: "active", layout: "board" },
    { id: "list", label: "Lista zgłoszeń", icon: List, view: "all", layout: "list" },
    { id: "archive", label: "Archiwum", icon: Archive, view: "archive", layout: "list" },
] as const;

export function workSection(id: string | undefined) {
    return workNavigation.find((item) => item.id === id) ?? workNavigation[0];
}
