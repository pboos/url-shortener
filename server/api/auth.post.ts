import bcrypt from "bcryptjs";
import {eq} from "drizzle-orm";
import {users} from "@/server/db/schema";
import {db} from "~/server/db/sqlite-service";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const user = db.select().from(users)
      .where(eq(users.username, body.username))
      .get();

    if (!user) {
      throw new Error("User not found");
    }

    if (!await bcrypt.compare(body.password, user.password)) {
      throw new Error("User not found");
    }

    return {token: createAuthToken({ id: user.id, username: user.username })};
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});
