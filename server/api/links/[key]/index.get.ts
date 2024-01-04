import {db} from "~/server/db/sqlite-service";
import {eq} from "drizzle-orm";
import {links} from "~/server/db/schema";
import {optionalAuth} from "~/server/utils/auth";
import {Link} from "~/model/link";
import {LinkPublic} from "~/model/link-public";

export default defineEventHandler(async (event) => {
  const {key} = getRouterParams(event);

  const link = db.select().from(links)
    .where(eq(links.key, key))
    .get();

  if (!link) {
    throw createError({statusCode: 404});
  }

  const authUser = optionalAuth(event);
  if (authUser) {
    return {
      id: link.id,
      userId: link.userId,
      key,
      url: link.url,
      totalVisits: link.totalVisits,
      createdAt: new Date(link.createdAt).toISOString(),
    } satisfies Link;
  }

  return {
    key,
    url: link.url,
  } satisfies LinkPublic
});
