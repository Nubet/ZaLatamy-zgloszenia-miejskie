"use client";

import { ReportsProvider } from "@/application/reports/provider";
import { mockGateway } from "@/infrastructure/mock/gateway";
import { mockAnalysis } from "@/infrastructure/mock/analysis";
import { httpGateway } from "@/infrastructure/http/gateway";
import { httpAnalysis } from "@/infrastructure/http/analysis";

const useApi = Boolean(process.env.NEXT_PUBLIC_API_URL);

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ReportsProvider
            gateway={useApi ? httpGateway : mockGateway}
            analysis={useApi ? httpAnalysis : mockAnalysis}
        >
            {children}
        </ReportsProvider>
    );
}
