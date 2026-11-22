import { requireUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { handle, HttpError, json, readJson } from "@/lib/http";
import { updateLinkInput } from "@/lib/http-validation";
export const runtime = "nodejs";
type Context = { params: Promise<{ key: string }> };
export async function GET(_request: Request, context: Context) {
  return handle(async () => {
    const user = await requireUser();
    const link = getStore().getLink(user.id, (await context.params).key);
    if (!link) throw new HttpError(404, "Link not found");
    return json(link);
  });
}
export async function PATCH(request: Request, context: Context) {
  return handle(async () => {
    const user = await requireUser();
    const input = updateLinkInput.parse(await readJson(request));
    const key = (await context.params).key;
    const updated = getStore().updateLink(user.id, key, input);
    if (!updated) throw new HttpError(404, "Link not found");
    return json(updated);
  });
}
export async function DELETE(request: Request, context: Context) {
  return handle(async () => {
    const user = await requireUser();
    await readJson(request);
    if (!getStore().deleteLink(user.id, (await context.params).key))
      throw new HttpError(404, "Link not found");
    return json({ ok: true });
  });
}
