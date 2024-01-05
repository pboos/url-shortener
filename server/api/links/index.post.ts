import { nanoid } from "nanoid";
import { db } from "~/server/db/sqlite-service";
import { type InsertLink, links } from "~/server/db/schema";
import { requireAuth } from "~/server/utils/auth";
import { requireLinkKeyAcceptable } from "~/server/utils/links";

const createRandomKey = () => {
  // TODO check if already exists, if yes, try again until we have one
  return nanoid(6);
};

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const body = await readBody(event);
  const key = body.key ?? createRandomKey();

  requireLinkKeyAcceptable(key);

  const newLink: InsertLink = {
    userId: user.id,
    key,
    url: body.url,
  };

  try {
    db.insert(links).values(newLink).run();
    return { ...newLink };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});
