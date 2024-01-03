import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import DrizzleConfig from '../../drizzle.config.js';

export const sqlite = new Database(DrizzleConfig.dbCredentials.url);
export const db: BetterSQLite3Database = drizzle(sqlite);
