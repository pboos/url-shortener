import { EventHandlerRequest, H3Event } from "h3";
import { eq } from "drizzle-orm";
import { db } from "~/server/db/sqlite-service";
import { links } from "~/server/db/schema";

export const requireLinkInPath = (event: H3Event<EventHandlerRequest>) => {
  const { key } = getRouterParams(event);

  const link = db.select().from(links).where(eq(links.key, key)).get();

  if (!link) {
    throw createError({ statusCode: 404 });
  }

  return link;
};
