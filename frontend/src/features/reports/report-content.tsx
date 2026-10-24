"use client";

import Link from "next/link";
import { Clock3, MapPin, Flag, CornerDownRight, Check, Building2 } from "lucide-react";
import { priorities, type Report } from "@/domain/reports/model";
import { ReportGallery } from "@/shared/ui/report-gallery";
import { CategoryBadge, StatusBadge } from "@/shared/ui/report-badges";
import { formatDate } from "@/shared/lib/format";
import { CityMap } from "@/features/map/city-map";
import { ReportHistory } from "./report-history";
import { useReports } from "@/application/reports/provider";
import { relatedReports } from "@/domain/reports/rules";
import { ReportSupportCount } from "@/shared/ui/report-support";

export function ReportContent({
    report,
    minimalMap = false,
}: {
    report: Report;
    minimalMap?: boolean;
}) {
    const query = useReports();
    const linked = relatedReports(report, query.data?.reports ?? [report]).filter(
        (item) => item.id !== report.id,
    );
    const stages = ["new", "accepted", "progress", "resolved"];
    const activeStage = stages.indexOf(report.status);
    const unit = {
        road: "Zarząd Dróg i Transportu",
        lighting: "Zarząd Dróg i Transportu",
        waste: "Wydział Gospodarki Komunalnej",
        greenery: "Zarząd Zieleni Miejskiej",
        other: "Centrum Kontaktu z Mieszkańcami",
    }[report.category];
    return (
        <div className="report-content">
            {activeStage >= 0 && (
                <ol className="report-journey" aria-label="Postęp zgłoszenia">
                    {["Zgłoszono", "Przyjęto", "W realizacji", "Rozwiązano"].map((label, index) => (
                        <li
                            key={label}
                            className={`report-journey__step ${index <= activeStage ? "report-journey__step--reached" : ""}`}
                            aria-current={index === activeStage ? "step" : undefined}
                        >
                            <span>{index < activeStage ? <Check size={11} /> : index + 1}</span>
                            {label}
                        </li>
                    ))}
                </ol>
            )}
            <ReportGallery key={report.id} images={report.images} title={report.title} />
            <div className="report-content__meta">
                <CategoryBadge category={report.category} />
                <StatusBadge status={report.status} />
                <span className={`priority-label priority-label--${report.priority}`}>
                    <Flag size={13} />
                    {priorities[report.priority]}
                </span>
                <ReportSupportCount report={report} />
            </div>
            <h2>{report.title}</h2>
            <p className="report-content__description">{report.description}</p>
            <div className="report-content__facts">
                <span>
                    <MapPin size={14} />
                    {report.address}
                </span>
                <span>
                    <Clock3 size={14} />
                    {formatDate(report.createdAt)}
                </span>
            </div>
            <div className="responsible-unit">
                <Building2 size={16} />
                <span>
                    Sugerowana jednostka<small>{unit}</small>
                </span>
            </div>
            {report.duplicateOf && (
                <Link href={`/zgloszenia/${report.duplicateOf}`} className="duplicate-link">
                    <CornerDownRight size={15} />
                    <span>Sprawa połączona ze zgłoszeniem {report.duplicateOf}</span>
                    <span>Przejdź do sprawy nadrzędnej</span>
                </Link>
            )}
            {!report.duplicateOf && linked.length > 0 && (
                <div className="linked-reports">
                    <h3>Powiązane zgłoszenia</h3>
                    <p>Oryginalne zdjęcia i historie pozostają dostępne w połączonych sprawach.</p>
                    {linked.map((item) => (
                        <Link key={item.id} className="text-link" href={`/zgloszenia/${item.id}`}>
                            {item.id} — {item.title}
                        </Link>
                    ))}
                </div>
            )}
            <div className="report-content__location">
                <CityMap location={report.location} minimal={minimalMap} />
                {!minimalMap && (
                    <span>
                        Współrzędne: {report.location.latitude.toFixed(5)}° N,{" "}
                        {report.location.longitude.toFixed(5)}° E · Łódź
                    </span>
                )}
            </div>
            <h3 className="report-content__history-heading">Historia zgłoszenia</h3>
            <ReportHistory history={report.history} />
        </div>
    );
}
