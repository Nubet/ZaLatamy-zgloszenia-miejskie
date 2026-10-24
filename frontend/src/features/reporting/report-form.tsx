"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCallback } from "react";
import { Check, ArrowUpRight } from "lucide-react";
import { useReportForm } from "./use-report-form";
import { PhotoStep } from "./photo-step";
import { LocationStep } from "./location-step";
import { ReviewStep } from "./review-step";
import { ReportingAside } from "./reporting-aside";

const steps = [
    { title: "Zdjęcia", description: "Pokaż problem" },
    { title: "Lokalizacja", description: "Zaznacz miejsce" },
    { title: "Opis i wysłanie", description: "Sprawdź szczegóły" },
];

export function ReportForm() {
    const { bfcacheId } = useRouter();
    return <ReportFormContent key={bfcacheId} />;
}

function ReportFormContent() {
    const form = useReportForm();
    const focusStep = useCallback((element: HTMLDivElement | null) => {
        element?.focus();
    }, []);

    return (
        <div className="page report-form">
            <header className="report-form__header">
                <div>
                    <span className="report-form__eyebrow">TWOJA OKOLICA, TWOJE ZGŁOSZENIE</span>
                    <h1>Zgłoś problem</h1>
                    <p>Zdjęcie, miejsce i krótki opis. Przejdziemy przez to krok po kroku.</p>
                </div>
                <Link href="/mapa" className="report-form__exit">
                    Wróć do mapy <ArrowUpRight size={16} />
                </Link>
            </header>
            <nav aria-label="Etapy zgłoszenia" className="report-form__navigation">
                <ol className="stepper">
                    {steps.map(({ title, description }, index) => (
                        <li
                            key={title}
                            className={`stepper__step ${index < form.step ? "stepper__step--completed" : index === form.step ? "stepper__step--current" : ""}`}
                        >
                            <button
                                type="button"
                                className="stepper__button"
                                aria-current={index === form.step ? "step" : undefined}
                                disabled={
                                    index > form.step ||
                                    form.saving ||
                                    form.analysisState.status === "pending"
                                }
                                onClick={() => form.setStep(index)}
                            >
                                <span className="stepper__number">
                                    {index < form.step ? <Check size={18} /> : `0${index + 1}`}
                                </span>
                                <span className="stepper__label">
                                    <strong>{title}</strong>
                                    <small>{description}</small>
                                </span>
                            </button>
                        </li>
                    ))}
                </ol>
            </nav>
            <div className="report-form__layout">
                <div className="form-card">
                    <p className="report-form__step-counter">Krok {form.step + 1} z 3</p>
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
                <ReportingAside form={form} />
            </div>
        </div>
    );
}
