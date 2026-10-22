"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Camera } from "lucide-react";
import { maxPhotos } from "@/domain/reports/model";
import { PhotoAttachments } from "./photo-attachments";
import type { useReportForm } from "./use-report-form";

export function PhotoStep({ form }: { form: ReturnType<typeof useReportForm> }) {
    return (
        <section className="photo-upload">
            <h2>Pokaż nam problem</h2>
            <p className="form-card__intro">Dodaj zdjęcia pokazujące problem i jego otoczenie.</p>
            <p className="photo-upload__count" aria-live="polite">
                Zdjęcia · {form.photos.length}/{maxPhotos}
            </p>
            <PhotoAttachments
                photos={form.photos}
                disabled={form.photoPending}
                onRemove={form.removePhoto}
                onMakeCover={form.makeCover}
            />
            {form.photos.length < maxPhotos && (
                <div className="photo-upload__actions">
                    <label className="photo-dropzone">
                        <span className="photo-dropzone__icon">
                            <Camera size={26} />
                        </span>
                        <strong>
                            {form.photos.length
                                ? "Dodaj kolejne zdjęcia"
                                : "Dodaj zdjęcia problemu"}
                        </strong>
                        <span>Wybierz zdjęcia z urządzenia</span>
                        <small>JPG, PNG lub WebP · do 8 MB każde · maksymalnie 5</small>
                        <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/webp"
                            aria-label="Dodaj zdjęcia problemu"
                            disabled={form.photoPending}
                            onChange={(event) => {
                                void form.choosePhotos(Array.from(event.target.files ?? []));
                                event.target.value = "";
                            }}
                        />
                    </label>
                    <label className="button button--secondary photo-upload__camera">
                        <Camera size={16} /> Zrób zdjęcie
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            capture="environment"
                            aria-label="Zrób zdjęcie"
                            disabled={form.photoPending}
                            onChange={(event) => {
                                void form.choosePhotos(Array.from(event.target.files ?? []));
                                event.target.value = "";
                            }}
                        />
                    </label>
                </div>
            )}
            <div className="form-actions">
                <Link href="/mapa" className="text-link">
                    <ArrowLeft size={14} />
                    Anuluj
                </Link>
                <button
                    className="button button--primary"
                    disabled={!form.photos.length || form.photoPending}
                    onClick={() => form.setStep(1)}
                >
                    {form.photoPending ? "Sprawdzanie zdjęć…" : "Dalej: lokalizacja"}
                    <ArrowRight size={15} />
                </button>
            </div>
        </section>
    );
}
