import type { DemoState, ReportDraft, Report, ReportUpdate } from "@/domain/reports/model";

export interface ReportsGateway {
    load(): Promise<DemoState>;
    create(draft: ReportDraft, photos: (File | string)[]): Promise<Report>;
    update(id: string, update: ReportUpdate): Promise<void>;
    watch(id: string): Promise<void>;
    setConfirmation(id: string, confirmed: boolean): Promise<string>;
    markRead(id: string): Promise<void>;
    reset(): Promise<void>;
    photo(key: string): Promise<Blob | undefined>;
}
