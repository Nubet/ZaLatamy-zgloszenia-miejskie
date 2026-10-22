"use client";

import { ReportsProvider } from "@/application/reports/provider";
import { mockGateway } from "@/infrastructure/mock/gateway";
import { mockAnalysis } from "@/infrastructure/mock/analysis";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ReportsProvider gateway={mockGateway} analysis={mockAnalysis}>
            {children}
        </ReportsProvider>
    );
}
