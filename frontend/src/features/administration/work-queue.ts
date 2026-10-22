import type { Category, Priority, Report, Status } from "@/domain/reports/model";
import { reportSupport } from "@/domain/reports/rules";
import { dateRange, isWithinDateRange, type DateRange } from "@/shared/lib/date-range";

export const PAGE_SIZE = 25;
export const openStatuses: Status[] = ["new", "accepted", "progress"];
export const closedStatuses: Status[] = ["resolved", "rejected", "duplicate"];
export type WorkView = "active" | "all" | "archive";
export type WorkFilters = {
    view: WorkView;
    search: string;
    status: Status | "";
    category: Category | "";
    priority: Priority | "";
    sort: "priority" | "confirmations" | "newest" | "oldest";
    range: DateRange;
};

export function defaultFilters(view: WorkView, today: string): WorkFilters {
    return {
        view,
        search: "",
        status: "",
        category: "",
        priority: "",
        sort: view === "active" ? "priority" : "newest",
        range: dateRange(view === "archive" ? "90" : view === "all" ? "30" : "unlimited", today),
    };
}

export function viewStatuses(view: WorkView): Status[] {
    return view === "active"
        ? openStatuses
        : view === "archive"
          ? closedStatuses
          : [...openStatuses, ...closedStatuses];
}

// shortcut: the local demo filters in memory; move filtering, counts and pagination to the gateway when integrating a real backend.
export function filterWorkReports(reports: Report[], filters: WorkFilters) {
    const allowed = viewStatuses(filters.view);
    const search = filters.search.trim().toLocaleLowerCase("pl");
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    return reports
        .filter((report) => {
            if (
                !allowed.includes(report.status) ||
                (filters.status && report.status !== filters.status) ||
                (filters.category && report.category !== filters.category) ||
                (filters.priority && report.priority !== filters.priority)
            )
                return false;
            if (
                search &&
                !`${report.id} ${report.title} ${report.address}`
                    .toLocaleLowerCase("pl")
                    .includes(search)
            )
                return false;
            return isWithinDateRange(report.createdAt, filters.range);
        })
        .toSorted((a, b) => {
            const oldestFirst = Date.parse(a.createdAt) - Date.parse(b.createdAt);
            if (filters.sort === "priority")
                return priorityOrder[a.priority] - priorityOrder[b.priority] || oldestFirst;
            if (filters.sort === "confirmations")
                return (
                    reportSupport(b, reports).count - reportSupport(a, reports).count || oldestFirst
                );
            return filters.sort === "oldest" ? oldestFirst : -oldestFirst;
        });
}
