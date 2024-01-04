import { count } from "drizzle-orm";
import { users } from "@/server/db/schema";
import { db } from "~/server/db/sqlite-service";

export default defineEventHandler(async () => {
  try {
    const result = await db.select({ value: count() }).from(users);
    const usersCount = result[0].value;

    return { isSetup: usersCount > 0 };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});
