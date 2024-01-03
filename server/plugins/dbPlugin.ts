import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from "~/server/db/sqlite-service";
import DrizzleConfig from '../../drizzle.config.js';

export default defineNitroPlugin((nitroApp) => {
  migrate(db, { migrationsFolder: DrizzleConfig.out });
});
