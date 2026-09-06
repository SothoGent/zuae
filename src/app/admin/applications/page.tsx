import { AdminApplications } from "@/components/admin-applications";

export const metadata = { title: "Admin · applications" };
export const dynamic = "force-dynamic";

export default function AdminApplicationsPage() {
  return <AdminApplications />;
}
