import { eq } from "drizzle-orm";
import { requireAuth } from "~/server/utils/auth";
import {
  requireLinkInPath,
  requireLinkKeyAcceptable,
} from "~/server/utils/links";
import { db } from "~/server/db/sqlite-service";
import { links } from "~/server/db/schema";
import type { Link } from "~/model/api/link";

export default defineEventHandler(async (event): Promise<Link> => {
  const authUser = requireAuth(event);
  const link = requireLinkInPath(event);

  if (link.userId !== authUser.id) {
    throw createError({ statusCode: 403 });
  }

  try {
    const body = await readBody(event);
    const key = body.key ?? link.key;
    const url = body.url ?? link.url;
    requireLinkKeyAcceptable(key);
    db.update(links).set({ key, url }).where(eq(links.id, link.id)).run();

    return mapDbLinkToLink({ ...link, key: body.key, url: body.url });
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});
