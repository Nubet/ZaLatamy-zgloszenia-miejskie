import { createContext, useContext, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReportsGateway } from './port';

const Context = createContext<ReportsGateway | null>(null);
export function ReportsProvider({ gateway, children }: { gateway: ReportsGateway; children: ReactNode }) { return <Context.Provider value={gateway}>{children}</Context.Provider>; }
export function useGateway() { const gateway = useContext(Context); if (!gateway) throw new Error('ReportsProvider is required'); return gateway; }
export function useReports() { const gateway = useGateway(); return useQuery({ queryKey: ['reports'], queryFn: () => gateway.load() }); }
export function useReportMutation<T, R = void>(action: (gateway: ReportsGateway, input: T) => Promise<R>) {
  const gateway = useGateway();
  const client = useQueryClient();
  return useMutation({ mutationKey: ['reports'], mutationFn: (input: T) => action(gateway, input), onSuccess: async () => { await client.invalidateQueries({ queryKey: ['reports'] }); } });
}
