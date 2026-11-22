import { redirect } from "next/navigation";
import { Dashboard } from "@/components/admin/dashboard";
import { getCurrentUser, setupComplete } from "@/lib/auth";
import { getPublicOrigin } from "@/lib/origin";
export default async function AdminPage() {
  if (!setupComplete()) redirect("/admin/setup");
  if (!(await getCurrentUser())) redirect("/admin/login");
  return <Dashboard origin={getPublicOrigin()} />;
}
