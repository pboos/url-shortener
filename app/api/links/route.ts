import { randomBytes } from "node:crypto";
import { requireUser } from "@/lib/auth";
import { getStore, StoreConflictError } from "@/lib/store";
import { handle, HttpError, json, pagination, readJson } from "@/lib/http";
import { createLinkInput } from "@/lib/http-validation";
export const runtime = "nodejs";
export async function GET(request: Request) {
  return handle(async () => {
    const user = await requireUser();
    const search = new URL(request.url).searchParams.get("q") ?? "";
    if (search.length > 200) throw new HttpError(400, "Search is too long");
    return json(
      getStore().listLinks(user.id, { ...pagination(request), search }),
    );
  });
}
export async function POST(request: Request) {
  return handle(async () => {
    const user = await requireUser();
    const input = createLinkInput.parse(await readJson(request));
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return json(
          getStore().createLink(user.id, {
            ...input,
            key: input.key ?? randomBytes(6).toString("base64url"),
          }),
          201,
        );
      } catch (error) {
        if (input.key || !(error instanceof StoreConflictError)) throw error;
      }
    }
    throw new HttpError(503, "Could not generate a short link. Try again");
  });
}
