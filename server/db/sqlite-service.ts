import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
// eslint-disable-next-line import/no-named-as-default
import Database from "better-sqlite3";
import DrizzleConfig from "../../drizzle.config.js";

export const sqlite = new Database(DrizzleConfig.dbCredentials.url);
export const db: BetterSQLite3Database = drizzle(sqlite);
