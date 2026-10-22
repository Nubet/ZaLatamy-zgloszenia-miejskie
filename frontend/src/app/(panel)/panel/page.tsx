import type { Metadata } from "next";
import { ReportsExplorer } from "@/features/reports/reports-explorer";

export const metadata: Metadata = { title: "Panel mieszkańca · ZaŁatamy" };

export default function PanelPage() {
    return <ReportsExplorer />;
}
