import { redirect } from "next/navigation";
import { AuthForm } from "@/components/admin/auth-form";
import { getCurrentUser, setupComplete } from "@/lib/auth";
export default async function LoginPage() {
  if (!setupComplete()) redirect("/admin/setup");
  if (await getCurrentUser()) redirect("/admin");
  return <AuthForm />;
}
