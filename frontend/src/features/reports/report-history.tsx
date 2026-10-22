import type { Report } from "@/domain/reports/model";
import { formatDate } from "@/shared/lib/format";
import { StatusBadge } from "@/shared/ui/report-badges";

export function ReportHistory({ history }: { history: Report["history"] }) {
    return (
        <ol className="timeline">
            {history.toReversed().map((entry) => (
                <li key={entry.id}>
                    <span
                        className={`timeline__dot ${entry.status === "resolved" ? "timeline__dot--resolved" : ""}`}
                    />
                    <div>
                        <time dateTime={entry.at}>{formatDate(entry.at)}</time>
                        {entry.status && <StatusBadge status={entry.status} />}
                        <p>{entry.text}</p>
                    </div>
                </li>
            ))}
        </ol>
    );
}
