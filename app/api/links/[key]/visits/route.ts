import { requireUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { handle, HttpError, json, pagination } from "@/lib/http";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  context: { params: Promise<{ key: string }> },
) {
  return handle(async () => {
    const user = await requireUser();
    const stats = getStore().statistics(
      user.id,
      (await context.params).key,
      pagination(request),
    );
    if (!stats) throw new HttpError(404, "Link not found");
    return json(stats);
  });
}
