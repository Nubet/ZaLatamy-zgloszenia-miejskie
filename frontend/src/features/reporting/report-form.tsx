"use client";

import Link from "next/link";
import { useCallback } from "react";
import { Check, CheckCircle2 } from "lucide-react";
import { PageHeading } from "@/shared/ui/page-heading";
import { useReportForm } from "./use-report-form";
import { PhotoStep } from "./photo-step";
import { LocationStep } from "./location-step";
import { ReviewStep } from "./review-step";
import { ReportingAside } from "./reporting-aside";

const steps = ["Dodaj zdjęcia", "Wskaż miejsce", "Opisz i wyślij"];

export function ReportForm() {
    const form = useReportForm();
    const focusStep = useCallback((element: HTMLDivElement | null) => {
        element?.focus({ preventScroll: true });
    }, []);
    if (form.createdId) return <ReportSuccess id={form.createdId} />;
    if (form.confirmedId) return <ReportSuccess id={form.confirmedId} confirmed />;

    return (
        <div className="page report-form">
            <PageHeading
                eyebrow="NOWE ZGŁOSZENIE"
                title="Małe zgłoszenie. Duża różnica."
                description="Pokaż, co wymaga uwagi. Przygotujemy zgłoszenie razem z Tobą."
            />
            <div className="report-form__layout">
                <div className="form-card">
                    <ol className="stepper">
                        {steps.map((label, index) => (
                            <li
                                key={label}
                                className={`stepper__step ${index < form.step ? "stepper__step--completed" : index === form.step ? "stepper__step--current" : ""}`}
                                aria-current={index === form.step ? "step" : undefined}
                            >
                                <span>{index < form.step ? <Check size={12} /> : index + 1}</span>
                                {label}
                            </li>
                        ))}
                    </ol>
                    <div
                        key={form.step}
                        ref={focusStep}
                        tabIndex={-1}
                        className="report-form__step-content"
                    >
                        {form.step === 0 && <PhotoStep form={form} />}
                        {form.step === 1 && <LocationStep form={form} />}
                        {form.step === 2 && <ReviewStep form={form} />}
                    </div>
                    {form.error && (
                        <div className="inline-error" role="alert">
                            {form.error}
                        </div>
                    )}
                </div>
                <ReportingAside />
            </div>
        </div>
    );
}

function ReportSuccess({ id, confirmed = false }: { id: string; confirmed?: boolean }) {
    return (
        <div className="page">
            <div
                className="success-card"
                tabIndex={-1}
                ref={(element) => {
                    element?.focus();
                }}
            >
                <span className="success-card__symbol">
                    <CheckCircle2 size={36} />
                </span>
                <h1>Dobry krok dla Twojej okolicy.</h1>
                <p>
                    {confirmed ? (
                        <>
                            Potwierdzasz problem w sprawie <strong>{id}</strong>. Nie utworzono
                            nowego zgłoszenia.
                        </>
                    ) : (
                        <>
                            Zgłoszenie <strong>{id}</strong> zostało pomyślnie zarejestrowane.
                        </>
                    )}
                </p>
                <div className="button-row">
                    <Link className="button button--primary" href={`/zgloszenia/${id}`}>
                        Śledź zgłoszenie
                    </Link>
                    <Link className="button button--secondary" href="/mapa">
                        Wróć do mapy
                    </Link>
                </div>
            </div>
        </div>
    );
}
