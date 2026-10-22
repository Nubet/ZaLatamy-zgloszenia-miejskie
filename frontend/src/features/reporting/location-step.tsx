"use client";

import { ArrowLeft, ArrowRight, LoaderCircle, LocateFixed } from "lucide-react";
import { isWithinLodz } from "@/domain/reports/rules";
import { LocationPicker } from "./location-picker";
import type { useReportForm } from "./use-report-form";

export function LocationStep({ form }: { form: ReturnType<typeof useReportForm> }) {
    const pending = form.analysisState.status === "pending";
    const disabled =
        pending || !form.location || !isWithinLodz(form.location) || form.address.trim().length < 3;

    return (
        <section>
            <h2>Gdzie jest problem?</h2>
            <p className="form-card__intro">
                Użyj GPS lub wskaż punkt na mapie. Możesz poprawić lokalizację i wpisać adres
                ręcznie.
            </p>
            <button
                type="button"
                className="button button--secondary"
                disabled={pending || form.gps.status === "pending"}
                onClick={() => void form.locate()}
            >
                {form.gps.status === "pending" ? (
                    <LoaderCircle size={16} className="loading-indicator" aria-hidden="true" />
                ) : (
                    <LocateFixed size={16} aria-hidden="true" />
                )}
                {form.gps.status === "pending"
                    ? "Ustalanie lokalizacji…"
                    : "Użyj mojej lokalizacji"}
            </button>
            <p className="form-hint">
                <output>
                    {form.gps.status === "found"
                        ? `Dokładność GPS: około ${form.gps.accuracy} m. Sprawdź punkt i w razie potrzeby popraw go na mapie.`
                        : form.gps.status === "pending"
                          ? "Czekamy na odczyt GPS. Możesz też od razu wskazać punkt na mapie."
                          : "Lokalizacja urządzenia nie musi być miejscem problemu — sprawdź wskazany punkt."}
                </output>
            </p>
            {form.gps.status === "error" && (
                <p className="inline-error" role="alert">
                    {form.gps.message}
                </p>
            )}
            <fieldset disabled={pending} className="form-fieldset">
                <LocationPicker
                    location={form.location}
                    address={form.address}
                    onChange={form.changeLocation}
                    onAddress={form.setAddress}
                />
            </fieldset>
            {form.analysisState.status === "error" && (
                <div className="inline-error" role="alert">
                    {form.analysisState.message}
                </div>
            )}
            <button
                type="button"
                className="text-link"
                disabled={disabled}
                onClick={() => void form.analyze()}
            >
                {pending ? "Przygotowywanie opisu…" : "Pomóż mi przygotować opis ze zdjęcia"}
                <ArrowRight size={13} />
            </button>
            <div className="form-actions">
                <button
                    className="button button--secondary"
                    disabled={pending}
                    onClick={() => form.setStep(0)}
                >
                    <ArrowLeft size={14} />
                    Wstecz
                </button>
                <button
                    className="button button--primary"
                    disabled={disabled}
                    onClick={form.manual}
                >
                    {pending ? (
                        <>
                            <LoaderCircle size={15} className="loading-indicator" />
                            Przetwarzanie zgłoszenia…
                        </>
                    ) : (
                        <>
                            Dalej: opis i kategoria
                            <ArrowRight size={15} />
                        </>
                    )}
                </button>
            </div>
        </section>
    );
}
