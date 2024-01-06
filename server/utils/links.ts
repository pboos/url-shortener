import { type EventHandlerRequest, H3Event } from "h3";
import { eq } from "drizzle-orm";
import { db } from "~/server/db/sqlite-service";
import { links } from "~/server/db/schema";
import { isKeyForbidden } from "~/server/utils/forbidden-keys";

export const requireLinkInPath = (event: H3Event<EventHandlerRequest>) => {
  const { key } = getRouterParams(event);

  const link = db().select().from(links).where(eq(links.key, key)).get();

  if (!link) {
    throw createError({ statusCode: 404 });
  }

  return link;
};

export const requireLinkKeyAcceptable = (key: string) => {
  if (isKeyForbidden(key)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Key is forbidden",
    });
  }
};
