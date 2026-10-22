import { MapPin } from "lucide-react";
import type { Report } from "@/domain/reports/model";
import { StatusBadge, CategoryBadge } from "@/shared/ui/report-badges";
import { ReportPhoto } from "@/shared/ui/report-photo";
import { formatDate } from "@/shared/lib/format";
import { ReportSupportCount } from "@/shared/ui/report-support";

export function ReportCard({
    report,
    selected = false,
    onSelect,
}: {
    report: Report;
    selected?: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            className={`report-card ${selected ? "report-card--selected" : ""}`}
            onClick={onSelect}
            aria-pressed={selected}
        >
            <span className="report-card__photo-wrapper">
                <ReportPhoto
                    image={report.images[0]!}
                    title={report.title}
                    className="report-card__photo"
                />
                {report.images.length > 1 && (
                    <span
                        className="report-card__photo-count"
                        aria-label={`${report.images.length} zdjęć`}
                    >
                        {report.images.length} zdj.
                    </span>
                )}
            </span>
            <span className="report-card__body">
                <span className="report-card__meta">
                    <CategoryBadge category={report.category} />
                    <span className="report-card__id">{report.id}</span>
                </span>
                <strong>{report.title}</strong>
                <span className="report-card__location">
                    <MapPin size={12} />
                    {report.address}
                </span>
                <span className="report-card__footer">
                    <StatusBadge status={report.status} />
                    <ReportSupportCount report={report} />
                    <time dateTime={report.createdAt}>
                        {formatDate(report.createdAt).split(",")[0]}
                    </time>
                </span>
            </span>
        </button>
    );
}
