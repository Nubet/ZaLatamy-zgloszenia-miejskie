import { Camera, MapPin, FileText, Check } from "lucide-react";
import { categories } from "@/domain/reports/model";
import type { useReportForm } from "./use-report-form";

export function ReportingAside({ form }: { form: ReturnType<typeof useReportForm> }) {
    const items = [
        {
            icon: Camera,
            label: "Zdjęcia",
            value: form.photos.length ? `${form.photos.length} z 5 dodanych` : "Jeszcze nie dodano",
            done: form.photos.length > 0,
        },
        {
            icon: MapPin,
            label: "Miejsce",
            value: form.address || "Jeszcze nie wybrano",
            done: !!form.location && !!form.address,
        },
        {
            icon: FileText,
            label: "Opis",
            value: form.proposal.title || "Jeszcze nie uzupełniono",
            done: !!form.proposal.title && !!form.proposal.description,
        },
    ];
    return (
        <aside className="reporting-aside" aria-label="Podsumowanie przygotowywanego zgłoszenia">
            <h2>Twoje zgłoszenie</h2>
            <p className="reporting-aside__intro">Wszystko w jednym miejscu.</p>
            <ul className="reporting-aside__summary">
                {items.map(({ icon: Icon, label, value, done }) => (
                    <li key={label}>
                        <Icon size={18} aria-hidden="true" />
                        <span>
                            <strong>{label}</strong>
                            <small>{value}</small>
                        </span>
                        {done && (
                            <Check
                                size={16}
                                className="reporting-aside__check"
                                aria-label="Uzupełniono"
                            />
                        )}
                    </li>
                ))}
            </ul>
            {form.step === 2 && (
                <p className="reporting-aside__category">
                    Kategoria: {categories[form.proposal.category]}
                </p>
            )}
        </aside>
    );
}
