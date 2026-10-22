import { Suspense } from "react";
import { ReportDetails } from "@/features/reports/report-details";
import { LoadingState } from "@/shared/ui/feedback";

async function DetailsRoute({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ReportDetails id={id} />;
}
export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense
            fallback={
                <div className="page">
                    <LoadingState />
                </div>
            }
        >
            <DetailsRoute params={params} />
        </Suspense>
    );
}
