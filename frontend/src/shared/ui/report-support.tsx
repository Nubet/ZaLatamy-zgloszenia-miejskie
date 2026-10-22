"use client";

import { Check, LoaderCircle, ThumbsUp } from "lucide-react";
import { useIsMutating } from "@tanstack/react-query";
import { useReports, useReportMutation } from "@/application/reports/provider";
import type { Report } from "@/domain/reports/model";
import { acceptsConfirmations, primaryReport, reportSupport } from "@/domain/reports/rules";

const pluralRules = new Intl.PluralRules("pl");

export function ReportSupportCount({ report }: { report: Report }) {
    const query = useReports();
    const support = reportSupport(report, query.data?.reports ?? [report]);
    const plural = pluralRules.select(support.count);
    return (
        <span
            className="support-count"
            title="Liczba unikalnych osób, łącznie z autorem zgłoszenia"
        >
            <ThumbsUp size={13} aria-hidden="true" />
            <span>
                {support.count}{" "}
                {plural === "one"
                    ? "potwierdzenie"
                    : plural === "few"
                      ? "potwierdzenia"
                      : "potwierdzeń"}
            </span>
        </span>
    );
}

export function ReportSupport({
    report,
    onConfirmed,
}: {
    report: Report;
    onConfirmed?: (id: string) => void;
}) {
    const query = useReports();
    const saving = useIsMutating({ mutationKey: ["reports"] }) > 0;
    const reports = query.data?.reports ?? [report];
    const primary = primaryReport(report, reports);
    const support = reportSupport(primary, reports);
    const mutation = useReportMutation((gateway, confirmed: boolean) =>
        gateway.setConfirmation(primary.id, confirmed),
    );
    const closed = !acceptsConfirmations(primary);

    return (
        <section className="report-support" aria-label={`Potwierdzenia: ${primary.title}`}>
            <ReportSupportCount report={primary} />
            <button
                type="button"
                className={`button ${support.confirmed ? "button--secondary" : "button--primary"}`}
                aria-pressed={support.confirmed}
                disabled={saving || closed || (support.authored && !onConfirmed)}
                onClick={() =>
                    mutation.mutate(onConfirmed ? true : !support.confirmed, {
                        onSuccess: (id) => {
                            if (typeof id === "string") onConfirmed?.(id);
                        },
                    })
                }
            >
                {mutation.isPending ? (
                    <LoaderCircle size={15} className="loading-indicator" />
                ) : support.confirmed ? (
                    <Check size={15} />
                ) : (
                    <ThumbsUp size={15} />
                )}
                {closed
                    ? "Sprawa zakończona"
                    : support.authored
                      ? "To Twoje zgłoszenie"
                      : support.confirmed
                        ? "Potwierdzasz"
                        : "Też to widzę"}
                {onConfirmed && support.confirmed && !closed && " — przejdź do sprawy"}
            </button>
            {support.confirmed && !support.authored && !closed && !onConfirmed && (
                <span className="form-hint">Kliknij ponownie, aby cofnąć potwierdzenie.</span>
            )}
            {support.authored && !closed && (
                <span className="form-hint">
                    Twoje zgłoszenie już liczy się jako jedno potwierdzenie.
                </span>
            )}
            {mutation.isSuccess && !onConfirmed && (
                <output className="validation-success">
                    {support.confirmed ? "Potwierdzenie zapisane." : "Potwierdzenie wycofane."}
                </output>
            )}
            {mutation.error && (
                <p className="inline-error" role="alert">
                    {mutation.error.message}
                </p>
            )}
        </section>
    );
}
