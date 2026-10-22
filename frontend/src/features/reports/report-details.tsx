"use client";

import Link from "next/link";
import { ArrowLeft, Bell, BellOff, Check } from "lucide-react";
import { useReports, useReportMutation } from "@/application/reports/provider";
import { PageHeading } from "@/shared/ui/page-heading";
import { LoadingState, ErrorState, EmptyState } from "@/shared/ui/feedback";
import { ReportContent } from "./report-content";
import { ReportSupport } from "@/shared/ui/report-support";
import { relatedReports } from "@/domain/reports/rules";

export function ReportDetails({ id }: { id: string }) {
    const query = useReports();
    const watch = useReportMutation((gateway, reportId: string) => gateway.watch(reportId));

    if (query.isPending)
        return (
            <div className="page">
                <LoadingState />
            </div>
        );

    if (query.error)
        return (
            <div className="page">
                <ErrorState
                    message={query.error.message}
                    retry={() => {
                        void query.refetch();
                    }}
                />
            </div>
        );

    const report = query.data.reports.find((item) => item.id === id);
    if (!report)
        return (
            <div className="page">
                <EmptyState
                    title="Nie znaleziono zgłoszenia"
                    description="Zgłoszenie nie istnieje lub zostało usunięte."
                />
                <div className="report-details__back-link">
                    <Link href="/panel" className="button button--secondary">
                        Wróć do mapy
                    </Link>
                </div>
            </div>
        );

    const watching = relatedReports(report, query.data.reports).some((item) => item.watching);

    return (
        <div className="page report-details">
            <Link href="/panel" className="back-link">
                <ArrowLeft size={14} />
                Wróć do mapy
            </Link>
            <PageHeading
                eyebrow={`ZGŁOSZENIE ${report.id}`}
                title={`Zgłoszenie ${report.id}`}
                description="Karta informacyjna sprawy oraz historia działań podjętych przez służby miejskie."
            />
            <div className="report-details__layout">
                <article className="report-details__card">
                    <ReportContent report={report} />
                </article>
                <aside className="report-details__sidebar">
                    <div className="watch-card">
                        <h2>Też widzisz ten problem?</h2>
                        <ReportSupport key={report.id} report={report} />
                    </div>
                    <div className="watch-card">
                        <h2>Obserwacja zgłoszenia</h2>
                        <p>Otrzymuj powiadomienia, gdy status tego zgłoszenia ulegnie zmianie.</p>
                        <button
                            className={`button ${watching ? "button--secondary" : "button--primary"}`}
                            disabled={watch.isPending}
                            onClick={() => watch.mutate(report.id)}
                        >
                            {watching ? (
                                <>
                                    <BellOff size={14} />
                                    Przestań obserwować
                                </>
                            ) : (
                                <>
                                    <Bell size={14} />
                                    Obserwuj zgłoszenie
                                </>
                            )}
                        </button>
                        {watching && (
                            <p className="validation-success">
                                <Check size={14} />
                                Obserwujesz tę sprawę.
                            </p>
                        )}
                        {watch.error && (
                            <p className="inline-error" role="alert">
                                {watch.error.message}
                            </p>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
