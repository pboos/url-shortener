import { eq } from "drizzle-orm";
import { db } from "~/server/db/sqlite-service";
import { links } from "~/server/db/schema";
import { requireAuth } from "~/server/utils/auth";
import { mapDbLinkToLink } from "~/server/utils/mapper";

export default defineEventHandler((event) => {
  const user = requireAuth(event);

  const linksResult = db()
    .select()
    .from(links)
    .where(eq(links.userId, user.id))
    .all();

  return linksResult.map((link) => mapDbLinkToLink(link));
});
