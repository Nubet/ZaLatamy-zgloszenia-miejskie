"use client";

import { useEffect, useState } from "react";

export function useBlobUrl(blob: Blob | undefined) {
    const [loaded, setLoaded] = useState<{ blob: Blob; url: string }>();
    useEffect(() => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") setLoaded({ blob, url: reader.result });
        };
        reader.readAsDataURL(blob);
        return () => {
            reader.onload = null;
            if (reader.readyState === FileReader.LOADING) reader.abort();
        };
    }, [blob]);
    return loaded?.blob === blob ? loaded?.url : undefined;
}
