"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useIsMutating } from "@tanstack/react-query";
import { useAnalysis, useReports, useReportMutation } from "@/application/reports/provider";
import { draftSchema, maxPhotos, type Location, type ReportDraft } from "@/domain/reports/model";
import { isWithinLodz, nearbyReports, validatePhoto } from "@/domain/reports/rules";
import type { AnalysisResult } from "@/application/analysis/port";
import { locateInLodz } from "./geolocation";

type AnalysisState = { status: "idle" | "pending" | "done" } | { status: "error"; message: string };
type GpsState =
    | { status: "idle" | "pending" }
    | { status: "found"; accuracy: number }
    | { status: "error"; message: string };
const emptyProposal: AnalysisResult = {
    title: "",
    description: "",
    category: "road",
};

export function useReportForm() {
    const router = useRouter();
    const saving = useIsMutating({ mutationKey: ["reports"] }) > 0;
    const analysis = useAnalysis();
    const reports = useReports();
    const [step, setStep] = useState(0);
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPending, setPhotoPending] = useState(false);
    const [location, setLocation] = useState<Location | null>(null);
    const [address, setAddress] = useState("");
    const [gps, setGps] = useState<GpsState>({ status: "idle" });
    const gpsRequest = useRef(0);
    const [proposal, setProposal] = useState(emptyProposal);
    const [analysisState, setAnalysisState] = useState<AnalysisState>({ status: "idle" });
    const [error, setError] = useState("");
    const [reviewedDuplicates, setReviewedDuplicates] = useState(false);
    const create = useReportMutation(
        async (gateway, input: { draft: ReportDraft; photos: File[] }) => {
            const report = await gateway.create(input.draft, input.photos);
            router.push(`/zgloszenia/${report.id}`);
        },
    );
    const similar = location
        ? nearbyReports(reports.data?.reports ?? [], proposal.category, location)
        : [];

    function cancelGps() {
        gpsRequest.current += 1;
        setGps({ status: "idle" });
    }
    function goToStep(next: number) {
        cancelGps();
        setError("");
        setStep(next);
    }
    function changeLocation(point: Location, label: string) {
        cancelGps();
        setLocation(point);
        setAddress(label);
        setReviewedDuplicates(false);
    }
    async function locate() {
        if (gps.status === "pending") return;
        const request = ++gpsRequest.current;
        setGps({ status: "pending" });
        try {
            const result = await locateInLodz(navigator.geolocation);
            if (request !== gpsRequest.current) return;
            changeLocation(result.location, "Lokalizacja GPS, Łódź");
            setGps({ status: "found", accuracy: result.accuracy });
        } catch (cause) {
            if (request !== gpsRequest.current) return;
            setGps({
                status: "error",
                message: cause instanceof Error ? cause.message : "Wskaż miejsce na mapie.",
            });
        }
    }

    function changePhotos(next: File[]) {
        setPhotos(next);
        setProposal(emptyProposal);
        setAnalysisState({ status: "idle" });
        setReviewedDuplicates(false);
        setError("");
    }
    async function choosePhotos(files: File[]) {
        if (photoPending || !files.length) return;
        setError("");
        if (photos.length + files.length > maxPhotos) {
            setError(
                `Możesz dodać maksymalnie ${maxPhotos} zdjęć. Pozostało miejsc: ${maxPhotos - photos.length}.`,
            );
            return;
        }
        setPhotoPending(true);
        try {
            // Decode sequentially to avoid holding five full-resolution bitmaps in memory.
            for (const file of files) {
                validatePhoto(file);
                const bitmap = await createImageBitmap(file);
                bitmap.close();
            }
            changePhotos([...photos, ...files]);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Nie udało się otworzyć zdjęcia.");
        } finally {
            setPhotoPending(false);
        }
    }
    async function analyze() {
        const photo = photos[0];
        if (!photo || analysisState.status === "pending") return;
        setAnalysisState({ status: "pending" });
        try {
            setProposal(await analysis.analyze(photo, proposal.category));
            setReviewedDuplicates(false);
            setAnalysisState({ status: "done" });
            goToStep(2);
        } catch (cause) {
            setAnalysisState({
                status: "error",
                message: cause instanceof Error ? cause.message : "Analiza nie powiodła się.",
            });
        }
    }
    function changeProposal(update: Partial<AnalysisResult>) {
        if (update.category) setReviewedDuplicates(false);
        setProposal((current) => ({ ...current, ...update }));
    }
    function submit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving) return;
        setError("");
        if (!photos.length || photos.length > maxPhotos || !location) {
            setError("Dodaj zdjęcie i wybierz lokalizację.");
            return;
        }
        const result = draftSchema.safeParse({ ...proposal, location, address });
        if (!result.success) {
            setError(result.error.issues[0]?.message ?? "Sprawdź dane.");
            return;
        }
        if (!isWithinLodz(location)) {
            setError("Wybierz miejsce w Łodzi.");
            return;
        }
        if (similar.length && !reviewedDuplicates) {
            setError("Sprawdź podobne zgłoszenia i potwierdź, że zgłaszasz osobny problem.");
            return;
        }
        create.mutate({ draft: result.data, photos });
    }
    return {
        reports,
        step,
        setStep: goToStep,
        photos,
        photoPending,
        choosePhotos,
        removePhoto: (index: number) =>
            changePhotos(photos.filter((_, position) => position !== index)),
        makeCover: (index: number) => {
            const cover = photos[index];
            if (cover) changePhotos([cover, ...photos.filter((_, position) => position !== index)]);
        },
        location,
        address,
        setAddress: (label: string) => {
            cancelGps();
            setAddress(label);
        },
        changeLocation,
        gps,
        locate,
        proposal,
        changeProposal,
        analysisState,
        analyze,
        manual: () => {
            goToStep(2);
        },
        error: error || create.error?.message,
        confirmExisting: (id: string) => router.push(`/zgloszenia/${id}`),
        reviewedDuplicates,
        setReviewedDuplicates,
        similar,
        submit,
        saving,
    };
}
