import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import {
  blob,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import type { LinkQrConfig } from "~/server/db/model/LinkQrConfig";

export const users = sqliteTable("users", {
  id: integer("id").notNull().primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
export type SelectUser = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

export const links = sqliteTable("links", {
  id: integer("id").notNull().primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  key: text("key").notNull().unique(),
  url: text("url").notNull(),
  qrConfig: blob("qr_config_json", { mode: "json" }).$type<LinkQrConfig>(),
  totalVisits: integer("total_visits").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
export type SelectLink = InferSelectModel<typeof links>;
export type InsertLink = InferInsertModel<typeof links>;

export const visits = sqliteTable("visits", {
  id: integer("id").notNull().primaryKey({ autoIncrement: true }),
  linkId: integer("link_id")
    .notNull()
    .references(() => links.id),
  ip: text("ip").notNull(),
  userAgent: text("user_agent"),
  country: text("country"),
  region: text("region"),
  city: text("city"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
export type SelectVisit = InferSelectModel<typeof visits>;
export type InsertVisit = InferInsertModel<typeof visits>;
