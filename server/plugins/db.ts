import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import DrizzleConfig from "../../drizzle.config.js";
import { db } from "~/server/db/sqlite-service";

export default defineNitroPlugin(() => {
  migrate(db(), { migrationsFolder: DrizzleConfig.out });
});
