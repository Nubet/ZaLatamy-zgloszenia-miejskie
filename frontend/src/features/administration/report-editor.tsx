"use client";

import { useId, useState } from "react";
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
import { SelectControl } from "@/shared/ui/select-control";

export function ReportEditor({
    report,
    reports,
    initialStatus,
}: {
    report: Report;
    reports: Report[];
    initialStatus?: Status;
}) {
    const id = useId();
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
                    <label className="field" htmlFor={`${id}-status`}>
                        Status zgłoszenia
                        <SelectControl
                            id={`${id}-status`}
                            aria-label="Status zgłoszenia"
                            disabled={mutation.isPending}
                            value={status}
                            onValueChange={(value) => {
                                setChanges((current) => ({
                                    ...current,
                                    status: statusSchema.parse(value),
                                }));
                                mutation.reset();
                            }}
                            options={Object.entries(statuses).map(([value, label]) => ({
                                value,
                                label,
                            }))}
                        />
                    </label>
                    <label className="field" htmlFor={`${id}-priority`}>
                        Priorytet urzędu
                        <SelectControl
                            id={`${id}-priority`}
                            aria-label="Priorytet urzędu"
                            disabled={mutation.isPending}
                            value={priority}
                            onValueChange={(value) => {
                                setChanges((current) => ({
                                    ...current,
                                    priority: prioritySchema.parse(value),
                                }));
                                mutation.reset();
                            }}
                            options={Object.entries(priorities).map(([value, label]) => ({
                                value,
                                label,
                            }))}
                        />
                    </label>
                </div>
                <p className="form-hint">
                    Priorytet ustala urząd. Liczba potwierdzeń mieszkańców go nie zmienia.
                </p>
                {status === "duplicate" && (
                    <label className="field" htmlFor={`${id}-duplicate`}>
                        Połącz z istniejącą sprawą
                        <SelectControl
                            id={`${id}-duplicate`}
                            aria-label="Połącz z istniejącą sprawą"
                            disabled={mutation.isPending}
                            required
                            value={duplicateOf}
                            onValueChange={(value) => {
                                setChanges((current) => ({
                                    ...current,
                                    duplicateOf: value,
                                }));
                                mutation.reset();
                            }}
                            options={[
                                { value: "", label: "Wybierz zgłoszenie" },
                                ...reports
                                    .filter(
                                        (item) =>
                                            item.id !== report.id &&
                                            ((!item.duplicateOf && acceptsConfirmations(item)) ||
                                                item.id === report.duplicateOf),
                                    )
                                    .map((item) => ({
                                        value: item.id,
                                        label: `${item.id} — ${item.title}`,
                                    })),
                            ]}
                        />
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
