import fs from "fs";
import path from "path";
import {
  type BetterSQLite3Database,
  drizzle,
} from "drizzle-orm/better-sqlite3";
// eslint-disable-next-line import/no-named-as-default
import Database from "better-sqlite3";
import DrizzleConfig from "../../drizzle.config.js";

let internalDb: BetterSQLite3Database | null = null;

export const db = (): BetterSQLite3Database => {
  if (!internalDb) {
    // Create directory
    fs.mkdirSync(path.dirname(DrizzleConfig.dbCredentials.url), {
      recursive: true,
    });

    const sqlite = new Database(DrizzleConfig.dbCredentials.url);
    internalDb = drizzle(sqlite);
  }
  return internalDb;
};
