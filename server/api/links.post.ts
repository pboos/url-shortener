import {db} from "~/server/db/sqlite-service";
import {InsertLink, links} from "~/server/db/schema";
import {parseAuthToken} from "~/server/utils/auth-token";
import {nanoid} from "nanoid";

export default defineEventHandler(async (event) => {

  // TODO AUTH!
  const authorization = event.headers.get('Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401 });
  }
  const token = authorization.slice(7);
  const user = parseAuthToken(token);
  if (!user) {
    throw createError({ statusCode: 401 });
  }
  console.log('auth user', user);

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
    console.log(newLink);
    return { ...newLink };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});
