"use client";

import { useQuery } from "@tanstack/react-query";
import { useGateway } from "@/application/reports/provider";
import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useBlobUrl } from "@/shared/lib/use-blob-url";

export function ReportPhoto({
    image,
    title,
    className = "",
}: {
    image: string;
    title: string;
    className?: string;
}) {
    const gateway = useGateway();
    const { data } = useQuery({
        queryKey: ["photo", image],
        queryFn: async () => (await gateway.photo(image)) ?? null,
        enabled: image.startsWith("photo:"),
    });
    const url = useBlobUrl(data ?? undefined);
    const source = image.startsWith("/demo/") ? image : url;
    return source ? (
        <Image
            unoptimized
            width={800}
            height={480}
            className={className}
            src={source}
            alt={title}
            loading="lazy"
            onError={(event) => {
                event.currentTarget.alt = "Nie udało się wyświetlić zdjęcia";
            }}
        />
    ) : (
        <div className={`photo-fallback ${className}`}>
            <ImageOff size={22} />
            <span>Zdjęcie niedostępne</span>
        </div>
    );
}
