import {nanoid} from "nanoid";
import {db} from "~/server/db/sqlite-service";
import {InsertLink, links} from "~/server/db/schema";
import {requireAuth} from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  try {
    const body = await readBody(event);
    // TODO check if already exists, if yes, try again until we have one
    const key = body.key ?? nanoid(6);
    const newLink: InsertLink = {
      userId: user.id,
      key,
      url: body.url,
    };
    const result = db.insert(links).values(newLink).run();
    return { ...newLink };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});
