import type { DemoState, Report, ReportDraft, ReportUpdate, SavedDraft } from '@/domain/reports/model';

export interface ReportsGateway {
  load(): Promise<DemoState>;
  create(draft: ReportDraft): Promise<Report>;
  update(id: string, update: ReportUpdate): Promise<void>;
  watch(id: string): Promise<void>;
  setConfirmation(id: string, confirmed: boolean): Promise<string>;
  markRead(ids: string[]): Promise<void>;
  saveDraft(draft: SavedDraft | null): Promise<void>;
  reset(): Promise<void>;
}

export interface StateStorage { read(): Promise<string | null>; write(value: string): Promise<void> }
export interface PhotoFiles { exists(uri: string): boolean; remove(uri: string): void }
