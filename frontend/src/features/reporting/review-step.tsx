"use client";

import Link from "next/link";
import {
    ArrowLeft,
    Check,
    Sparkles,
    LoaderCircle,
    MapPin,
    Route,
    Lightbulb,
    Trash2,
    Trees,
    CircleEllipsis,
} from "lucide-react";
import { categories, categorySchema } from "@/domain/reports/model";
import { StatusBadge } from "@/shared/ui/report-badges";
import { ReportSupport } from "@/shared/ui/report-support";
import { ReportPhoto } from "@/shared/ui/report-photo";
import type { useReportForm } from "./use-report-form";
import { PhotoAttachments } from "./photo-attachments";

const categoryIcons = {
    road: Route,
    lighting: Lightbulb,
    waste: Trash2,
    greenery: Trees,
    other: CircleEllipsis,
};

export function ReviewStep({ form }: { form: ReturnType<typeof useReportForm> }) {
    return (
        <form onSubmit={form.submit}>
            <h2>Sprawdź, zanim wyślesz</h2>
            <p className="form-card__intro">
                Wybierz kategorię i opisz, co wymaga naprawy. Ty decydujesz o końcowej treści.
            </p>
            <fieldset
                disabled={form.saving || form.analysisState.status === "pending"}
                className="form-fieldset"
            >
                <div className="ai-note">
                    <Sparkles size={22} aria-hidden="true" />
                    <span>
                        <strong>Nie wiesz, jak to opisać?</strong>
                        <small>Przygotujemy propozycję na podstawie głównego zdjęcia.</small>
                    </span>
                    <button
                        type="button"
                        className="button button--secondary"
                        onClick={() => void form.analyze()}
                    >
                        {form.analysisState.status === "pending" ? (
                            <>
                                <LoaderCircle size={16} className="loading-indicator" />{" "}
                                Przygotowywanie…
                            </>
                        ) : (
                            "Zaproponuj opis"
                        )}
                    </button>
                </div>
                {form.analysisState.status === "error" && (
                    <p className="inline-error" role="alert">
                        {form.analysisState.message}
                    </p>
                )}
                {form.analysisState.status === "done" && (
                    <output className="validation-success">
                        <Check size={16} /> Propozycja gotowa. Sprawdź ją i popraw, jeśli trzeba.
                    </output>
                )}
                <fieldset className="report-categories">
                    <legend>Kategoria problemu</legend>
                    <div className="report-categories__options">
                        {Object.entries(categories).map(([value, label]) => {
                            const category = categorySchema.parse(value);
                            const Icon = categoryIcons[category];
                            return (
                                <label
                                    key={value}
                                    className={`report-categories__option ${form.proposal.category === value ? "report-categories__option--selected" : ""}`}
                                >
                                    <input
                                        type="radio"
                                        name="category"
                                        value={value}
                                        checked={form.proposal.category === value}
                                        onChange={() => form.changeProposal({ category })}
                                    />
                                    <Icon size={20} aria-hidden="true" />
                                    <span>{label}</span>
                                </label>
                            );
                        })}
                    </div>
                </fieldset>
                <label className="field">
                    Tytuł zgłoszenia
                    <input
                        value={form.proposal.title}
                        onChange={(event) => form.changeProposal({ title: event.target.value })}
                        minLength={5}
                        maxLength={120}
                        placeholder="Np. uszkodzony chodnik przy przystanku"
                        required
                    />
                </label>
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
                        placeholder="Co się stało? Jak duży jest problem? Co pomoże odnaleźć usterkę?"
                        required
                    />
                </label>
                <div className="report-review__attachments">
                    <div className="report-review__section-heading">
                        <h3>Zdjęcia · {form.photos.length}/5</h3>
                        <button type="button" className="text-link" onClick={() => form.setStep(0)}>
                            Zmień zdjęcia
                        </button>
                    </div>
                    <PhotoAttachments photos={form.photos} />
                    <div className="location-summary">
                        <MapPin size={18} />
                        <span>{form.address}</span>
                        <button type="button" className="text-link" onClick={() => form.setStep(1)}>
                            Zmień miejsce
                        </button>
                    </div>
                </div>
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
                    disabled={form.saving || form.analysisState.status === "pending"}
                    onClick={() => form.setStep(1)}
                >
                    <ArrowLeft size={14} />
                    Wstecz
                </button>
                <button
                    type="submit"
                    className="button button--primary"
                    disabled={
                        form.saving ||
                        form.analysisState.status === "pending" ||
                        form.reports.isPending ||
                        !!form.reports.error
                    }
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
