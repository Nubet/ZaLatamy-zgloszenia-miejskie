import { createContext, useContext, type ReactNode } from 'react';
import type { Category, Location, Photo } from '@/domain/reports/model';

export interface ReportingServices {
  pickPhotos(source: 'camera' | 'library', remaining: number): Promise<Photo[]>;
  locate(): Promise<{ location: Location; accuracy: number | null }>;
  removePhoto(photo: Photo): void;
  describe(category: Category): Promise<{ title: string; description: string }>;
}
const Context = createContext<ReportingServices | null>(null);
export function ReportingProvider({ services, children }: { services: ReportingServices; children: ReactNode }) { return <Context.Provider value={services}>{children}</Context.Provider>; }
export function useReportingServices() { const value = useContext(Context); if (!value) throw new Error('ReportingProvider is required'); return value; }
