import { redirect } from "next/navigation";
import { AuthForm } from "@/components/admin/auth-form";
import { setupComplete } from "@/lib/auth";
export default function SetupPage() {
  if (setupComplete()) redirect("/admin/login");
  return <AuthForm setup />;
}
