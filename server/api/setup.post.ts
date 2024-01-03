import { users, InsertUser } from "@/server/db/schema";
import { db } from "~/server/db/sqlite-service";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const newUser: InsertUser = {
      ...body
    }
    const result = db.insert(users).values(newUser).run();
    return { newUser : result}
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});
