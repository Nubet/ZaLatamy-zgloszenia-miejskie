"use client";

import { createContext, useContext, useState } from "react";
import {
    QueryClient,
    QueryClientProvider,
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import type { ReportsGateway } from "./port";
import type { AnalysisGateway } from "@/application/analysis/port";

const GatewayContext = createContext<ReportsGateway | null>(null);
const AnalysisContext = createContext<AnalysisGateway | null>(null);
export function ReportsProvider({
    children,
    gateway,
    analysis,
}: {
    children: React.ReactNode;
    gateway: ReportsGateway;
    analysis: AnalysisGateway;
}) {
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: { staleTime: 10_000, retry: false, refetchOnWindowFocus: true },
                    mutations: { retry: false },
                },
            }),
    );
    return (
        <AnalysisContext.Provider value={analysis}>
            <GatewayContext.Provider value={gateway}>
                <QueryClientProvider client={client}>{children}</QueryClientProvider>
            </GatewayContext.Provider>
        </AnalysisContext.Provider>
    );
}
export function useAnalysis() {
    const analysis = useContext(AnalysisContext);
    if (!analysis) throw new Error("Analysis provider is required");
    return analysis;
}
export function useGateway() {
    const gateway = useContext(GatewayContext);
    if (!gateway) throw new Error("ReportsProvider is required");
    return gateway;
}
export function useReports() {
    const gateway = useGateway();
    return useQuery({ queryKey: ["reports"], queryFn: () => gateway.load() });
}
export function useReportMutation<T>(
    action: (gateway: ReportsGateway, input: T) => Promise<unknown>,
) {
    const gateway = useGateway();
    const client = useQueryClient();
    return useMutation({
        mutationKey: ["reports"],
        mutationFn: (input: T) => action(gateway, input),
        onSuccess: async () => {
            await client.invalidateQueries({ queryKey: ["reports"] });
        },
    });
}
