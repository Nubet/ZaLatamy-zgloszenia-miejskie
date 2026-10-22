"use client";

import Link from "next/link";
import { ArrowLeft, Check, Sparkles, LoaderCircle, MapPin } from "lucide-react";
import { categories, categorySchema } from "@/domain/reports/model";
import { StatusBadge } from "@/shared/ui/report-badges";
import { ReportSupport } from "@/shared/ui/report-support";
import { ReportPhoto } from "@/shared/ui/report-photo";
import type { useReportForm } from "./use-report-form";
import { PhotoAttachments } from "./photo-attachments";

export function ReviewStep({ form }: { form: ReturnType<typeof useReportForm> }) {
    return (
        <form onSubmit={form.submit}>
            <h2>Sprawdź, zanim wyślesz</h2>
            <div className="ai-note">
                <Sparkles size={18} />
                <span>
                    Sprawdź opis i kategorię — możesz zmienić każdy szczegół przed wysłaniem.
                </span>
            </div>
            <fieldset disabled={form.saving} className="form-fieldset">
                <h3>Zdjęcia · {form.photos.length}/5</h3>
                <PhotoAttachments photos={form.photos} />
                <button type="button" className="text-link" onClick={() => form.setStep(0)}>
                    Zmień zdjęcia
                </button>
                <label className="field">
                    Tytuł zgłoszenia
                    <input
                        value={form.proposal.title}
                        onChange={(event) => form.changeProposal({ title: event.target.value })}
                        minLength={5}
                        maxLength={120}
                        required
                    />
                </label>
                <div>
                    <label className="field">
                        Kategoria
                        <select
                            value={form.proposal.category}
                            onChange={(event) =>
                                form.changeProposal({
                                    category: categorySchema.parse(event.target.value),
                                })
                            }
                        >
                            {Object.entries(categories).map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <label className="field">
                    Opis problemu
                    <textarea
                        value={form.proposal.description}
                        onChange={(event) =>
                            form.changeProposal({ description: event.target.value })
                        }
                        minLength={15}
                        maxLength={2000}
                        rows={4}
                        required
                    />
                </label>
                <p className="location-summary">
                    <MapPin size={15} />
                    {form.address}
                </p>
                <button type="button" className="text-link" onClick={() => form.setStep(1)}>
                    Zmień lokalizację
                </button>
                {form.reports.isPending && (
                    <p className="form-hint">Weryfikacja pobliskich zgłoszeń…</p>
                )}
                {form.reports.error && (
                    <div className="inline-error" role="alert">
                        Nie udało się wczytać podobnych zgłoszeń.{" "}
                        <button
                            type="button"
                            className="text-link"
                            onClick={() => {
                                void form.reports.refetch();
                            }}
                        >
                            Ponów sprawdzenie
                        </button>
                    </div>
                )}
                {form.similar.length > 0 && (
                    <div className="similar-reports">
                        <h3>Czy chodzi o ten sam problem?</h3>
                        <p>
                            W promieniu 100 m są podobne aktywne sprawy. Potwierdź istniejącą lub
                            zgłoś osobną usterkę.
                        </p>
                        <p className="form-hint">
                            Potwierdzenie nie tworzy nowego zgłoszenia i nie przesyła przygotowanych
                            zdjęć ani opisu.
                        </p>
                        {form.similar.map(({ report, meters }) => (
                            <div key={report.id} className="similar-report">
                                <ReportPhoto
                                    image={report.images[0]!}
                                    title={report.title}
                                    className="similar-report__photo"
                                />
                                <span>
                                    <strong>{report.title}</strong>
                                    <small>{report.address}</small>
                                    <small>{Math.round(meters)} m od lokalizacji</small>
                                    <StatusBadge status={report.status} />
                                </span>
                                <ReportSupport report={report} onConfirmed={form.confirmExisting} />
                                <Link
                                    href={`/zgloszenia/${report.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-link"
                                >
                                    Zobacz szczegóły (nowa karta)
                                </Link>
                            </div>
                        ))}
                        <label className="checkbox-field">
                            <input
                                type="checkbox"
                                checked={form.reviewedDuplicates}
                                onChange={(event) =>
                                    form.setReviewedDuplicates(event.target.checked)
                                }
                            />
                            To osobny problem — utwórz nowe niezależne zgłoszenie.
                        </label>
                    </div>
                )}
            </fieldset>
            <p className="form-hint">
                Nie umieszczaj danych osobowych w treści opisu ani na zdjęciach.
            </p>
            <div className="form-actions">
                <button
                    type="button"
                    className="button button--secondary"
                    disabled={form.saving}
                    onClick={() => form.setStep(1)}
                >
                    <ArrowLeft size={14} />
                    Wstecz
                </button>
                <button
                    type="submit"
                    className="button button--primary"
                    disabled={form.saving || form.reports.isPending || !!form.reports.error}
                >
                    {form.saving ? (
                        <LoaderCircle className="loading-indicator" size={15} />
                    ) : (
                        <Check size={15} />
                    )}
                    Wyślij zgłoszenie
                </button>
            </div>
        </form>
    );
}
