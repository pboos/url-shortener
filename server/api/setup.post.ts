import bcrypt from "bcryptjs";
import { users, type InsertUser } from "@/server/db/schema";
import { db } from "~/server/db/sqlite-service";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    // eslint-disable-next-line import/no-named-as-default-member
    const passwordHashed = await bcrypt.hash(body.password, 10);
    const newUser: InsertUser = {
      username: body.username,
      password: passwordHashed,
    };
    db.insert(users).values(newUser).run();
    return {};
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});
