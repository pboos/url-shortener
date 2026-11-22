import { createHmac, randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import { isIP } from "node:net";
import { dirname } from "node:path";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import type { LinkRecord, LinkPage, LinkStats, QrConfig } from "./contracts";
import { normalizeStoredQr } from "./qr";

export interface StoredUser {
  id: number;
  username: string;
  password: string;
}
export interface PageOptions {
  page: number;
  pageSize: number;
}
export interface LinkInput {
  key: string;
  url: string;
  qrConfig?: QrConfig | null;
}

function number(value: unknown): number {
  if (typeof value !== "number")
    throw new Error("Invalid numeric database value");
  return value;
}
function string(value: unknown): string {
  if (typeof value !== "string") throw new Error("Invalid text database value");
  return value;
}
function timestamp(value: unknown): string {
  const text = string(value);
  return new Date(
    text.includes("T") ? text : `${text.replace(" ", "T")}Z`,
  ).toISOString();
}
function decodeQr(value: unknown): QrConfig | null {
  if (value == null) return null;
  try {
    return normalizeStoredQr(
      JSON.parse(
        typeof value === "string"
          ? value
          : Buffer.from(value instanceof Uint8Array ? value : []).toString(),
      ),
    );
  } catch {
    return null;
  }
}
function summary(row: Record<string, unknown>): Omit<LinkRecord, "qrConfig"> {
  return {
    id: number(row.id),
    key: string(row.key),
    url: string(row.url),
    totalVisits: number(row.total_visits),
    createdAt: timestamp(row.created_at),
  };
}
function link(row: Record<string, unknown>): LinkRecord {
  return { ...summary(row), qrConfig: decodeQr(row.qr_config_json) };
}
function user(row: Record<string, unknown>): StoredUser {
  return {
    id: number(row.id),
    username: string(row.username),
    password: string(row.password),
  };
}
export function safeDestination(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      !!url.hostname &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export class StoreConflictError extends Error {
  constructor() {
    super("This short link is already in use");
    this.name = "StoreConflictError";
  }
}
function writeUnique<T>(write: () => T): T {
  try {
    return write();
  } catch (error) {
    if (error instanceof Error && "errcode" in error && error.errcode === 2067)
      throw new StoreConflictError();
    throw error;
  }
}
export class Store {
  readonly db: DatabaseSync;
  private readonly ipKey: string;
  constructor(path = process.env.DATABASE_PATH || "./data/sqlite.db") {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(
      "PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;",
    );
    try {
      this.transaction(() => {
        this.db
          .exec(`CREATE TABLE IF NOT EXISTS app_migrations(version INTEGER PRIMARY KEY);
        CREATE TABLE IF NOT EXISTS app_meta(key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
        const version = this.db
          .prepare("SELECT MAX(version) AS version FROM app_migrations")
          .get()?.version;
        if (typeof version === "number" && version > 1)
          throw new Error("Database schema is newer than this application");
        if (version == null) {
          this.db
            .exec(`CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
          CREATE TABLE IF NOT EXISTS links(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id), key TEXT NOT NULL UNIQUE, url TEXT NOT NULL, qr_config_json BLOB, total_visits INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
          CREATE TABLE IF NOT EXISTS visits(id INTEGER PRIMARY KEY AUTOINCREMENT, link_id INTEGER NOT NULL REFERENCES links(id), ip TEXT NOT NULL, user_agent TEXT, country TEXT, region TEXT, city TEXT, latitude REAL, longitude REAL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
          CREATE TABLE sessions(token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), expires_at INTEGER NOT NULL);
          CREATE TABLE rate_limits(key TEXT PRIMARY KEY, count INTEGER NOT NULL, resets_at INTEGER NOT NULL);
          CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
          CREATE INDEX IF NOT EXISTS rate_limits_expiry ON rate_limits(resets_at);
          CREATE INDEX IF NOT EXISTS links_owner ON links(user_id, id DESC);
          CREATE INDEX IF NOT EXISTS visits_link_date ON visits(link_id, created_at DESC, id DESC);
          CREATE INDEX IF NOT EXISTS visits_link_ip ON visits(link_id, ip);`);
          this.db
            .prepare("INSERT OR IGNORE INTO app_meta(key,value) VALUES (?,?)")
            .run("ip_hash_key", randomBytes(32).toString("hex"));
          const key = string(
            this.db
              .prepare("SELECT value FROM app_meta WHERE key = ?")
              .get("ip_hash_key")?.value,
          );
          this.db.function("pseudonymize_ip", (value) =>
            this.hashIp(string(value), key),
          );
          this.db.exec("UPDATE visits SET ip = pseudonymize_ip(ip)");
          this.db.exec("INSERT INTO app_migrations(version) VALUES (1)");
        }
      });
    } catch (error) {
      this.db.close();
      throw error;
    }
    this.ipKey = string(
      this.db
        .prepare("SELECT value FROM app_meta WHERE key = ?")
        .get("ip_hash_key")?.value,
    );
  }
  close(): void {
    this.db.close();
  }
  private transaction<T>(work: () => T): T {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const result = work();
      this.db.exec("COMMIT");
      return result;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
  private hashIp(ip: string | undefined, key = this.ipKey): string {
    if (!ip) return "";
    let normalized = ip.split(",")[0].trim().toLowerCase();
    const zone = normalized.indexOf("%");
    if (zone !== -1 && normalized.includes(":"))
      normalized = normalized.slice(0, zone);
    const family = isIP(normalized);
    if (!family) return "";
    if (family === 6) {
      normalized = new URL(`http://[${normalized}]`).hostname.slice(1, -1);
      const mapped = /^::ffff:([0-9a-f]+):([0-9a-f]+)$/.exec(normalized);
      if (mapped) {
        const high = parseInt(mapped[1], 16);
        const low = parseInt(mapped[2], 16);
        normalized = [high >> 8, high & 255, low >> 8, low & 255].join(".");
      }
    }
    return createHmac("sha256", key).update(normalized).digest("hex");
  }
  setupComplete(): boolean {
    return !!this.db.prepare("SELECT 1 FROM users LIMIT 1").get();
  }
  findUser(username: string): StoredUser | null {
    const row = this.db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username);
    return row ? user(row) : null;
  }
  bootstrap(username: string, passwordHash: string): StoredUser | null {
    return this.transaction(() => {
      if (this.setupComplete()) return null;
      this.db
        .prepare("INSERT INTO users(username,password) VALUES (?,?)")
        .run(username, passwordHash);
      return this.findUser(username);
    });
  }
  createSession(userId: number, tokenHash: string, expiresAt: number): void {
    this.db
      .prepare("DELETE FROM sessions WHERE expires_at <= ?")
      .run(Date.now());
    this.db
      .prepare(
        "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES (?,?,?)",
      )
      .run(tokenHash, userId, expiresAt);
  }
  sessionUser(
    tokenHash: string,
    now = Date.now(),
  ): { id: number; username: string } | null {
    const row = this.db
      .prepare(
        "SELECT users.id, users.username FROM sessions JOIN users ON users.id = sessions.user_id WHERE token_hash = ? AND expires_at > ?",
      )
      .get(tokenHash, now);
    return row ? { id: number(row.id), username: string(row.username) } : null;
  }
  deleteSession(tokenHash: string): void {
    this.db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
  }
  consumeRateLimit(
    key: string,
    limit: number,
    windowMs: number,
    now = Date.now(),
  ): boolean {
    const digest = createHmac("sha256", this.ipKey).update(key).digest("hex");
    return this.transaction(() => {
      this.db.prepare("DELETE FROM rate_limits WHERE resets_at <= ?").run(now);
      this.db
        .prepare(
          "INSERT INTO rate_limits(key,count,resets_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count = count + 1",
        )
        .run(digest, now + windowMs);
      return (
        number(
          this.db
            .prepare("SELECT count FROM rate_limits WHERE key = ?")
            .get(digest)?.count,
        ) <= limit
      );
    });
  }
  getLink(userId: number, key: string): LinkRecord | null {
    const row = this.db
      .prepare("SELECT * FROM links WHERE user_id = ? AND key = ?")
      .get(userId, key);
    return row ? link(row) : null;
  }
  listLinks(
    userId: number,
    options: PageOptions & { search?: string },
  ): LinkPage {
    const pattern = `%${(options.search || "").replace(/[\\%_]/g, "\\$&")}%`;
    const args: SQLInputValue[] = [userId, pattern, pattern];
    const where =
      "user_id = ? AND (key LIKE ? ESCAPE '\\' OR url LIKE ? ESCAPE '\\')";
    const totals = this.db
      .prepare(
        "SELECT COUNT(*) AS totalLinks, COALESCE(SUM(total_visits), 0) AS totalVisits FROM links WHERE user_id = ?",
      )
      .get(userId);
    const workspace = {
      totalLinks: number(totals?.totalLinks),
      totalVisits: number(totals?.totalVisits),
    };
    const total = options.search
      ? number(
          this.db
            .prepare(`SELECT COUNT(*) AS total FROM links WHERE ${where}`)
            .get(...args)?.total,
        )
      : workspace.totalLinks;
    const items = this.db
      .prepare(
        `SELECT id, key, url, total_visits, created_at FROM links WHERE ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      )
      .all(...args, options.pageSize, (options.page - 1) * options.pageSize)
      .map(summary);
    return {
      links: items,
      workspace,
      total,
      page: options.page,
      pageSize: options.pageSize,
    };
  }
  createLink(userId: number, input: LinkInput): LinkRecord {
    writeUnique(() =>
      this.db
        .prepare(
          "INSERT INTO links(user_id,key,url,qr_config_json) VALUES (?,?,?,?)",
        )
        .run(
          userId,
          input.key,
          input.url,
          input.qrConfig == null ? null : JSON.stringify(input.qrConfig),
        ),
    );
    const result = this.getLink(userId, input.key);
    if (!result) throw new Error("Created link missing");
    return result;
  }
  updateLink(
    userId: number,
    key: string,
    changes: Partial<LinkInput>,
  ): LinkRecord | null {
    const result = writeUnique(() =>
      this.db
        .prepare(
          `UPDATE links SET key = COALESCE(?, key), url = COALESCE(?, url),
         qr_config_json = CASE WHEN ? THEN ? ELSE qr_config_json END
         WHERE user_id = ? AND key = ? RETURNING *`,
        )
        .get(
          changes.key ?? null,
          changes.url ?? null,
          Number(changes.qrConfig !== undefined),
          changes.qrConfig == null ? null : JSON.stringify(changes.qrConfig),
          userId,
          key,
        ),
    );
    return result ? link(result) : null;
  }
  deleteLink(userId: number, key: string): boolean {
    return this.transaction(() => {
      const current = this.getLink(userId, key);
      if (!current) return false;
      this.db.prepare("DELETE FROM visits WHERE link_id = ?").run(current.id);
      this.db.prepare("DELETE FROM links WHERE id = ?").run(current.id);
      return true;
    });
  }
  redirect(
    key: string,
    options: {
      track: boolean;
      ip?: string;
      userAgent?: string;
      country?: string;
      city?: string;
    },
  ): string | null {
    const work = () => {
      const row = this.db
        .prepare("SELECT id,url FROM links WHERE key = ?")
        .get(key);
      if (!row || !safeDestination(string(row.url))) return null;
      if (options.track) {
        this.db
          .prepare(
            "INSERT INTO visits(link_id,ip,user_agent,country,city) VALUES (?,?,?,?,?)",
          )
          .run(
            number(row.id),
            this.hashIp(options.ip),
            options.userAgent?.slice(0, 512) || null,
            options.country || null,
            options.city || null,
          );
        this.db
          .prepare(
            "UPDATE links SET total_visits = total_visits + 1 WHERE id = ?",
          )
          .run(number(row.id));
      }
      return string(row.url);
    };
    return options.track ? this.transaction(work) : work();
  }
  statistics(
    userId: number,
    key: string,
    options: PageOptions,
  ): LinkStats | null {
    const current = this.getLink(userId, key);
    if (!current) return null;
    const counts = this.db
      .prepare(
        "SELECT COUNT(*) AS total, COUNT(DISTINCT NULLIF(ip,'')) AS uniqueVisitors FROM visits WHERE link_id = ?",
      )
      .get(current.id);
    const items = this.db
      .prepare(
        "SELECT id,ip,user_agent,country,city,created_at FROM visits WHERE link_id = ? ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?",
      )
      .all(current.id, options.pageSize, (options.page - 1) * options.pageSize)
      .map((row) => ({
        id: number(row.id),
        visitor: row.ip ? string(row.ip).slice(0, 12) : null,
        userAgent: row.user_agent == null ? null : string(row.user_agent),
        country: row.country == null ? null : string(row.country),
        city: row.city == null ? null : string(row.city),
        createdAt: timestamp(row.created_at),
      }));
    const trend = this.db
      .prepare(
        "SELECT date(created_at) AS date, COUNT(*) AS visits FROM visits WHERE link_id = ? AND created_at >= datetime('now','-6 days','start of day') GROUP BY date(created_at) ORDER BY date(created_at)",
      )
      .all(current.id)
      .map((row) => ({ date: string(row.date), visits: number(row.visits) }));
    const days = new Map(trend.map((point) => [point.date, point.visits]));
    const daily = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - 6 + i);
      const day = date.toISOString().slice(0, 10);
      return { date: day, visits: days.get(day) || 0 };
    });
    return {
      totalVisits: current.totalVisits,
      uniqueVisitors: number(counts?.uniqueVisitors),
      daily,
      visits: items,
      totalRows: number(counts?.total),
      page: options.page,
      pageSize: options.pageSize,
    };
  }
}
let singleton: Store | undefined;
export function getStore(): Store {
  return (singleton ??= new Store());
}
