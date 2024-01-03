import bcrypt from "bcryptjs";
import { users, InsertUser } from "@/server/db/schema";
import { db } from "~/server/db/sqlite-service";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const newUser: InsertUser = {
      username: body.username,
      password: await bcrypt.hash(body.password, 10),
    };
    const result = db.insert(users).values(newUser).run();
    return { username: newUser.username };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});
