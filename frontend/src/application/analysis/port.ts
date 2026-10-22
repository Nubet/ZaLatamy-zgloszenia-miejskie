import type { Category } from "@/domain/reports/model";

export type AnalysisResult = {
    title: string;
    description: string;
    category: Category;
};
export interface AnalysisGateway {
    analyze(photo: File | string, scenario: Category | "error"): Promise<AnalysisResult>;
}
