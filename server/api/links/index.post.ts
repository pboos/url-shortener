import { nanoid } from "nanoid";
import { db } from "~/server/db/sqlite-service";
import { type InsertLink, links } from "~/server/db/schema";
import { requireAuth } from "~/server/utils/auth";
import { isKeyForbidden } from "~/server/utils/forbidden-keys";

const createRandomKey = () => {
  // TODO check if already exists, if yes, try again until we have one
  return nanoid(6);
};

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const body = await readBody(event);
  const key = body.key ?? createRandomKey();

  if (isKeyForbidden(key)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Key is forbidden",
    });
  }

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
