import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { Store, StoreConflictError } from "../lib/store";

function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "shortener-store-"));
  const path = join(directory, "legacy.db");
  const db = new DatabaseSync(path);
  db.exec(
    readFileSync(new URL("./fixtures/legacy.sql", import.meta.url), "utf8"),
  );
  db.exec(`INSERT INTO users(id,username,password) VALUES(1,'legacy','$2a$10$existingHash'),(2,'other','hash');
    INSERT INTO links(id,user_id,key,url,total_visits,created_at) VALUES(1,1,'legacy','https://example.com',9,'2024-05-10 12:30:00');
    INSERT INTO visits(link_id,ip,created_at) VALUES(1,'192.0.2.1','2024-05-10 12:30:01'),(1,'','2024-05-10 12:30:02');`);
  const qr = Buffer.from(
    JSON.stringify({
      dotsOptions: { type: "dots", color: "#112233" },
      backgroundOptions: { color: "#ffffff" },
      image: "data:image/png;base64,aGVsbG8=",
    }),
  );
  db.prepare("UPDATE links SET qr_config_json = ? WHERE id = 1").run(qr);
  db.close();
  return {
    path,
    cleanup: () => rmSync(directory, { recursive: true, force: true }),
    qr,
  };
}

test("legacy migration preserves records, anonymizes known addresses, and survives reopening", () => {
  const fixtureData = fixture();
  try {
    let store = new Store(fixtureData.path);
    assert.equal(store.findUser("legacy")?.password, "$2a$10$existingHash");
    assert.equal(store.bootstrap("replacement", "hash"), null);
    assert.equal(store.getLink(1, "legacy")?.totalVisits, 9);
    assert.equal(
      store.getLink(1, "legacy")?.createdAt,
      "2024-05-10T12:30:00.000Z",
    );
    assert.equal(store.getLink(1, "legacy")?.qrConfig?.pattern, "dots");
    assert.deepEqual(
      Buffer.from(
        store.db.prepare("SELECT qr_config_json FROM links").get()
          ?.qr_config_json as Uint8Array,
      ),
      fixtureData.qr,
    );
    store.updateLink(1, "legacy", { url: "https://example.org/updated" });
    assert.deepEqual(
      store.db.prepare("SELECT qr_config_json FROM links WHERE id = 1").get()
        ?.qr_config_json,
      new Uint8Array(fixtureData.qr),
    );
    const first = store.db
      .prepare("SELECT ip FROM visits WHERE id = 1")
      .get()?.ip;
    assert.match(String(first), /^[a-f0-9]{64}$/);
    assert.equal(
      store.statistics(1, "legacy", { page: 1, pageSize: 10 })?.uniqueVisitors,
      1,
    );
    store.close();
    store = new Store(fixtureData.path);
    assert.equal(
      store.db.prepare("SELECT ip FROM visits WHERE id = 1").get()?.ip,
      first,
    );
    store.redirect("legacy", { track: true, ip: "::ffff:192.0.2.1" });
    store.redirect("legacy", { track: true, ip: "::ffff:c000:201" });
    const stats = store.statistics(1, "legacy", { page: 1, pageSize: 10 });
    assert.equal(stats?.uniqueVisitors, 1);
    assert.equal(stats?.totalVisits, 11);
    assert.equal(stats?.daily.length, 7);
    assert.equal(stats?.daily.at(-1)?.visits, 2);
    assert.equal(stats?.visits.at(-1)?.createdAt, "2024-05-10T12:30:01.000Z");
    store.close();
  } finally {
    fixtureData.cleanup();
  }
});

test("owner scoping, literal pagination, updates and cascading delete", () => {
  const store = new Store(":memory:");
  try {
    store.bootstrap("alice", "hash");
    store.db
      .prepare("INSERT INTO users(username,password) VALUES (?,?)")
      .run("bob", "hash");
    store.createLink(1, { key: "a_1", url: "https://example.com/100%" });
    store.createLink(1, { key: "ab1", url: "https://example.com/plain" });
    store.createLink(2, { key: "private", url: "https://example.com" });
    assert.throws(
      () => store.createLink(1, { key: "private", url: "https://example.com" }),
      StoreConflictError,
    );
    assert.throws(
      () =>
        store.updateLink(1, "ab1", {
          key: "private",
          url: "https://example.com",
        }),
      StoreConflictError,
    );
    assert.equal(
      store.listLinks(1, { search: "_", page: 1, pageSize: 1 }).total,
      1,
    );
    assert.equal(
      store.listLinks(1, { search: "%", page: 1, pageSize: 1 }).links[0]?.key,
      "a_1",
    );
    assert.equal(
      store.listLinks(1, { page: 2, pageSize: 1 }).links[0]?.key,
      "a_1",
    );
    assert.equal(store.getLink(1, "private"), null);
    assert.equal(
      store.statistics(1, "private", { page: 1, pageSize: 5 }),
      null,
    );
    assert.equal(
      store.updateLink(1, "private", {
        key: "ab1",
        url: "https://changed.test",
      }),
      null,
    );
    assert.equal(store.deleteLink(1, "private"), false);
    assert.equal(
      store.updateLink(1, "ab1", {
        key: "renamed",
        url: "https://changed.test",
      })?.key,
      "renamed",
    );
    store.redirect("a_1", { track: true });
    assert.equal(store.deleteLink(1, "a_1"), true);
    assert.equal(
      store.db.prepare("SELECT COUNT(*) AS n FROM visits").get()?.n,
      0,
    );
  } finally {
    store.close();
  }
});

test("tracking and counters commit together, HEAD does not track, unsafe legacy URLs do not redirect", () => {
  const store = new Store(":memory:");
  try {
    store.bootstrap("alice", "hash");
    store.createLink(1, { key: "ok", url: "https://example.com" });
    store.createLink(1, { key: "bad", url: "javascript:alert(1)" });
    assert.equal(store.redirect("bad", { track: true }), null);
    assert.equal(store.redirect("ok", { track: false }), "https://example.com");
    assert.equal(store.getLink(1, "ok")?.totalVisits, 0);
    store.db.exec(
      "CREATE TRIGGER reject_counter BEFORE UPDATE OF total_visits ON links BEGIN SELECT RAISE(ABORT,'test rollback'); END;",
    );
    assert.throws(() => store.redirect("ok", { track: true, ip: "192.0.2.2" }));
    assert.equal(
      store.db.prepare("SELECT COUNT(*) AS n FROM visits").get()?.n,
      0,
    );
    assert.equal(store.getLink(1, "ok")?.totalVisits, 0);
  } finally {
    store.close();
  }
});

test("bootstrap is one-shot, sessions expire and throttles reset", () => {
  const store = new Store(":memory:");
  try {
    assert.equal(store.setupComplete(), false);
    assert.equal(store.bootstrap("alice", "hash")?.username, "alice");
    assert.equal(store.bootstrap("bob", "hash"), null);
    store.createSession(1, "token-hash", Date.now() + 100000);
    assert.deepEqual(store.sessionUser("token-hash"), {
      id: 1,
      username: "alice",
    });
    assert.equal(store.sessionUser("token-hash", Date.now() + 200000), null);
    store.deleteSession("token-hash");
    assert.equal(store.sessionUser("token-hash"), null);
    assert.equal(store.consumeRateLimit("192.0.2.5", 2, 1000, 1), true);
    assert.equal(store.consumeRateLimit("192.0.2.5", 2, 1000, 2), true);
    assert.equal(store.consumeRateLimit("192.0.2.5", 2, 1000, 3), false);
    assert.equal(store.consumeRateLimit("192.0.2.5", 2, 1000, 1001), true);
    assert.notEqual(
      store.db.prepare("SELECT key FROM rate_limits").get()?.key,
      "192.0.2.5",
    );
  } finally {
    store.close();
  }
});

test("failed legacy migration rolls back and can be retried", () => {
  const data = fixture();
  try {
    let db = new DatabaseSync(data.path);
    db.exec(
      "CREATE TRIGGER reject_migration BEFORE UPDATE OF ip ON visits BEGIN SELECT RAISE(ABORT,'migration interrupted'); END;",
    );
    db.close();
    assert.throws(() => new Store(data.path), /migration interrupted/);
    db = new DatabaseSync(data.path);
    assert.equal(
      db.prepare("SELECT ip FROM visits WHERE id = 1").get()?.ip,
      "192.0.2.1",
    );
    assert.equal(
      db
        .prepare("SELECT name FROM sqlite_master WHERE name='app_migrations'")
        .get(),
      undefined,
    );
    db.exec("DROP TRIGGER reject_migration");
    db.close();
    const store = new Store(data.path);
    assert.equal(
      store.statistics(1, "legacy", { page: 1, pageSize: 10 })?.uniqueVisitors,
      1,
    );
    store.close();
  } finally {
    data.cleanup();
  }
});
