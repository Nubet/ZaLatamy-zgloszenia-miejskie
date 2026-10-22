import type { Metadata } from "next";
import { ReportsExplorer } from "@/features/reports/reports-explorer";

export const metadata: Metadata = { title: "Panel mieszkańca · Załatamy" };

export default function PanelPage() {
    return <ReportsExplorer />;
}
