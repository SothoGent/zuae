import { AdminStudents } from "@/components/admin-students";

export const metadata = { title: "Admin · students" };
export const dynamic = "force-dynamic";

export default function AdminStudentsPage() {
  return <AdminStudents />;
}
