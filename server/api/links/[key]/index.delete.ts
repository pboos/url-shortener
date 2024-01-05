import { eq } from "drizzle-orm";
import { requireAuth } from "~/server/utils/auth";
import { requireLinkInPath } from "~/server/utils/links";
import { db } from "~/server/db/sqlite-service";
import { links } from "~/server/db/schema";

export default defineEventHandler((event) => {
  const authUser = requireAuth(event);
  const link = requireLinkInPath(event);

  if (link.userId !== authUser.id) {
    throw createError({ statusCode: 403 });
  }

  try {
    db.delete(links).where(eq(links.id, link.id)).run();
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});
