import { eq } from "drizzle-orm";
import { requireAuth } from "~/server/utils/auth";
import { requireLinkInPath } from "~/server/utils/links";
import { db } from "~/server/db/sqlite-service";
import { visits } from "~/server/db/schema";
import { mapDbVisitToVisit } from "~/server/utils/mapper";

export default defineEventHandler((event) => {
  const link = requireLinkInPath(event);
  const authUser = requireAuth(event);
  if (link.userId !== authUser.id) {
    throw createError({ statusCode: 403 });
  }

  const visitsResult = db
    .select()
    .from(visits)
    .where(eq(visits.linkId, link.id))
    .all();

  return visitsResult.map((link) => mapDbVisitToVisit(link));
});
