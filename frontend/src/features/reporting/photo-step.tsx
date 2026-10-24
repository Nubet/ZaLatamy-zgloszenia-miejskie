"use client";

import Link from "next/link";
import { ArrowRight, Camera, Upload, ImagePlus } from "lucide-react";
import { maxPhotos } from "@/domain/reports/model";
import { PhotoAttachments } from "./photo-attachments";
import type { useReportForm } from "./use-report-form";

export function PhotoStep({ form }: { form: ReturnType<typeof useReportForm> }) {
    return (
        <section className="photo-upload">
            <h2>Pokaż nam problem</h2>
            <p className="form-card__intro">
                Dodaj przynajmniej jedno zdjęcie. Możesz dołączyć do pięciu ujęć.
            </p>
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
                    <label
                        className={`photo-dropzone ${form.photos.length ? "photo-dropzone--compact" : ""}`}
                    >
                        <span className="photo-dropzone__icon">
                            {form.photos.length ? <ImagePlus size={24} /> : <Upload size={28} />}
                        </span>
                        <strong>
                            {form.photos.length
                                ? "Dodaj kolejne zdjęcia"
                                : "Dodaj zdjęcia problemu"}
                        </strong>
                        <span>Kliknij, aby wybrać pliki z urządzenia</span>
                        <small>JPG, PNG lub WebP · maks. 8 MB / zdjęcie</small>
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
                    <div className="photo-upload__alternative">
                        <span>lub</span>
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
                </div>
            )}
            <div className="form-actions">
                <Link href="/mapa" className="button button--secondary">
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
