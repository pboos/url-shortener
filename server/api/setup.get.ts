import { users } from "@/server/db/schema";
import { db } from "~/server/db/sqlite-service";
import { count } from "drizzle-orm";

export default defineEventHandler(async (event) => {
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
