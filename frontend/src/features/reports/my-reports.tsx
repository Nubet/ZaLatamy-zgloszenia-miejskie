"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useReports } from "@/application/reports/provider";
import { PageHeading } from "@/shared/ui/page-heading";
import { LoadingState, ErrorState, EmptyState } from "@/shared/ui/feedback";
import { ReportCard } from "./report-card";

export function MyReports() {
    const query = useReports();
    const router = useRouter();
    const [tab, setTab] = useState<"mine" | "watching">("mine");

    if (query.isPending)
        return (
            <div className="page">
                <LoadingState />
            </div>
        );

    if (query.error)
        return (
            <div className="page">
                <ErrorState
                    message={query.error.message}
                    retry={() => {
                        void query.refetch();
                    }}
                />
            </div>
        );

    const reports = query.data.reports.filter((report) =>
        tab === "mine" ? report.mine : report.watching,
    );

    return (
        <div className="page my-reports">
            <PageHeading
                eyebrow="KONTO MIESZKAŃCA"
                title="Moje zgłoszenia"
                description="Przegląd spraw utworzonych przez Ciebie oraz tych, które obserwujesz."
                action={
                    <Link className="button button--primary" href="/zgloszenia/nowe">
                        <Plus size={15} />
                        Nowe zgłoszenie
                    </Link>
                }
            />
            <div className="tabs">
                <button aria-pressed={tab === "mine"} onClick={() => setTab("mine")}>
                    Utworzone przeze mnie{" "}
                    <span>{query.data.reports.filter((report) => report.mine).length}</span>
                </button>
                <button aria-pressed={tab === "watching"} onClick={() => setTab("watching")}>
                    Obserwowane{" "}
                    <span>{query.data.reports.filter((report) => report.watching).length}</span>
                </button>
            </div>
            {reports.length ? (
                <div className="my-reports__grid">
                    {reports.map((report) => (
                        <ReportCard
                            key={report.id}
                            report={report}
                            onSelect={() => router.push(`/zgloszenia/${report.id}`)}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title={
                        tab === "mine"
                            ? "Brak utworzonych zgłoszeń"
                            : "Nie obserwujesz jeszcze żadnych spraw"
                    }
                    description="Zgłoś nowy problem lub przejdź do mapy, aby wybrać sprawę do obserwacji."
                />
            )}
        </div>
    );
}
