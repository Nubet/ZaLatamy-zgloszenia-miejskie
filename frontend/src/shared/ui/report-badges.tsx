import { Circle, CircleCheck, Clock3, Copy, XCircle, Wrench } from "lucide-react";
import { statuses, categories, type Status, type Category } from "@/domain/reports/model";

const icons = {
    new: Circle,
    accepted: Clock3,
    progress: Wrench,
    resolved: CircleCheck,
    rejected: XCircle,
    duplicate: Copy,
};
export function StatusBadge({ status }: { status: Status }) {
    const Icon = icons[status];
    return (
        <span className={`status-badge status-badge--${status}`}>
            <Icon size={12} />
            {statuses[status]}
        </span>
    );
}
export function CategoryBadge({ category }: { category: Category }) {
    return <span className={`category-tag category-tag--${category}`}>{categories[category]}</span>;
}
