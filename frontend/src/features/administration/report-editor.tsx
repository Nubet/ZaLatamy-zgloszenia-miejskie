"use client";

import { useState } from "react";
import { Check, LoaderCircle, Save } from "lucide-react";
import {
    priorities,
    statuses,
    statusSchema,
    prioritySchema,
    reportCommentLimits,
    type Report,
    type ReportUpdate,
    type Status,
} from "@/domain/reports/model";
import { useReportMutation } from "@/application/reports/provider";
import { acceptsConfirmations, requiresUpdateComment } from "@/domain/reports/rules";

export function ReportEditor({
    report,
    reports,
    initialStatus,
}: {
    report: Report;
    reports: Report[];
    initialStatus?: Status;
}) {
    const [changes, setChanges] = useState<Partial<ReportUpdate>>(
        initialStatus ? { status: initialStatus } : {},
    );
    const status = changes.status ?? report.status;
    const commentRequired = requiresUpdateComment(status);
    const priority = changes.priority ?? report.priority;
    const duplicateOf = changes.duplicateOf ?? report.duplicateOf ?? "";
    const [comment, setComment] = useState("");
    const mutation = useReportMutation((gateway, update: ReportUpdate) =>
        gateway.update(report.id, update),
    );

    return (
        <form
            className="admin-editor"
            onSubmit={(event) => {
                event.preventDefault();
                mutation.mutate(
                    {
                        status,
                        priority,
                        comment,
                        duplicateOf: status === "duplicate" ? duplicateOf : null,
                    },
                    {
                        onSuccess: () => {
                            setComment("");
                            setChanges({});
                        },
                    },
                );
            }}
        >
            <div className="admin-editor__heading">
                <span>Aktualizacja statusu</span>
                <span>ID: {report.id}</span>
            </div>
            <fieldset disabled={mutation.isPending} className="form-fieldset">
                <div className="field-pair">
                    <label className="field">
                        Status zgłoszenia
                        <select
                            value={status}
                            onChange={(event) => {
                                setChanges((current) => ({
                                    ...current,
                                    status: statusSchema.parse(event.target.value),
                                }));
                                mutation.reset();
                            }}
                        >
                            {Object.entries(statuses).map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="field">
                        Priorytet urzędu
                        <select
                            value={priority}
                            onChange={(event) => {
                                setChanges((current) => ({
                                    ...current,
                                    priority: prioritySchema.parse(event.target.value),
                                }));
                                mutation.reset();
                            }}
                        >
                            {Object.entries(priorities).map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <p className="form-hint">
                    Priorytet ustala urząd. Liczba potwierdzeń mieszkańców go nie zmienia.
                </p>
                {status === "duplicate" && (
                    <label className="field">
                        Połącz z istniejącą sprawą
                        <select
                            required
                            value={duplicateOf}
                            onChange={(event) => {
                                setChanges((current) => ({
                                    ...current,
                                    duplicateOf: event.target.value,
                                }));
                                mutation.reset();
                            }}
                        >
                            <option value="">Wybierz zgłoszenie</option>
                            {reports
                                .filter(
                                    (item) =>
                                        item.id !== report.id &&
                                        ((!item.duplicateOf && acceptsConfirmations(item)) ||
                                            item.id === report.duplicateOf),
                                )
                                .map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.id} — {item.title}
                                    </option>
                                ))}
                        </select>
                    </label>
                )}
                <label className="field">
                    {commentRequired ? "Uzasadnienie (wymagane)" : "Publiczny komentarz"}
                    <textarea
                        rows={3}
                        value={comment}
                        onChange={(event) => {
                            setComment(event.target.value);
                            mutation.reset();
                        }}
                        required={commentRequired}
                        minLength={commentRequired ? reportCommentLimits.min : undefined}
                        maxLength={reportCommentLimits.max}
                        placeholder="Wpisz informację dla mieszkańców o podjętych działaniach..."
                    />
                </label>
            </fieldset>
            <p className="form-hint">
                Komentarz zostanie dodany do historii zgłoszenia. Zmiana statusu utworzy
                powiadomienie dla obserwujących.
                {status === "duplicate" &&
                    " Potwierdzenia połączonych spraw są liczone wspólnie, bez powielania osób. Zdjęcia i historie pozostają zachowane."}
            </p>
            <button className="button button--primary" disabled={mutation.isPending} type="submit">
                {mutation.isPending ? (
                    <LoaderCircle className="loading-indicator" size={15} />
                ) : (
                    <Save size={15} />
                )}
                Zapisz zmiany
            </button>
            {mutation.error && (
                <p className="inline-error" role="alert">
                    {mutation.error.message}
                </p>
            )}
            {mutation.isSuccess && (
                <output className="validation-success">
                    <Check size={14} />
                    Zmiany zapisane. Historia została zaktualizowana.
                </output>
            )}
        </form>
    );
}
