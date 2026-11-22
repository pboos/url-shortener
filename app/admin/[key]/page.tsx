import { redirect } from "next/navigation";
import { LinkDetail } from "@/components/admin/link-detail";
import { getCurrentUser, setupComplete } from "@/lib/auth";
import { getPublicOrigin } from "@/lib/origin";
export default async function LinkPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  if (!setupComplete()) redirect("/admin/setup");
  if (!(await getCurrentUser())) redirect("/admin/login");
  const { key } = await params;
  return <LinkDetail origin={getPublicOrigin()} linkKey={key} />;
}
