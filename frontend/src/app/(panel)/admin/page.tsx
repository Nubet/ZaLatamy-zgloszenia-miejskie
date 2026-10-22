import { AdminDashboard } from "@/features/administration/admin-dashboard";
import { workSection } from "@/features/administration/work-navigation";

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
    const params = await searchParams;
    const section = workSection(typeof params.view === "string" ? params.view : undefined);
    return (
        <AdminDashboard
            key={section.view}
            sectionId={section.id}
            initialSearch={typeof params.search === "string" ? params.search : ""}
        />
    );
}
