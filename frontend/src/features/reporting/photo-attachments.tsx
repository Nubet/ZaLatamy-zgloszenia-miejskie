"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useBlobUrl } from "@/shared/lib/use-blob-url";

export function PhotoAttachments({
    photos,
    disabled = false,
    onRemove,
    onMakeCover,
}: {
    photos: File[];
    disabled?: boolean;
    onRemove?: (index: number) => void;
    onMakeCover?: (index: number) => void;
}) {
    return (
        <div className="photo-upload__attachments">
            {photos.map((photo, index) => (
                <div
                    className="photo-upload__attachment"
                    key={`${photo.name}-${photo.lastModified}-${index}`}
                >
                    <AttachmentPreview photo={photo} index={index} />
                    {onRemove && (
                        <button
                            type="button"
                            className="icon-button photo-upload__remove"
                            disabled={disabled}
                            aria-label={`Usuń zdjęcie ${index + 1}`}
                            onClick={() => onRemove(index)}
                        >
                            <X size={16} />
                        </button>
                    )}
                    {index === 0 ? (
                        <span className="photo-upload__cover-label">Główne</span>
                    ) : (
                        onMakeCover && (
                            <button
                                type="button"
                                className="text-link"
                                disabled={disabled}
                                aria-label={`Ustaw zdjęcie ${index + 1} jako główne`}
                                onClick={() => onMakeCover(index)}
                            >
                                Ustaw jako główne
                            </button>
                        )
                    )}
                </div>
            ))}
        </div>
    );
}

function AttachmentPreview({ photo, index }: { photo: File; index: number }) {
    const url = useBlobUrl(photo);
    return url ? (
        <Image
            unoptimized
            src={url}
            width={240}
            height={180}
            alt={`Zdjęcie ${index + 1}: ${photo.name}`}
        />
    ) : (
        <span>Wczytywanie zdjęcia…</span>
    );
}
