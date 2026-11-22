import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { testServer } from "./test-server.mjs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";

const directory = await mkdtemp(path.join(tmpdir(), "shortener-http-"));
const { origin, token, start, stop } = testServer(3197);
async function request(
  route,
  { method = "GET", cookie, body, headers = {}, expected = 200 } = {},
) {
  const response = await fetch(`${origin}${route}`, {
    method,
    redirect: "manual",
    headers: {
      ...(method !== "GET" && method !== "HEAD"
        ? { origin, "content-type": "application/json" }
        : {}),
      ...(cookie ? { cookie } : {}),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  assert.equal(
    response.status,
    expected,
    `${method} ${route}: ${await response.clone().text()}`,
  );
  return response;
}
async function checkRoot(destination) {
  for (const method of ["GET", "HEAD"]) {
    const response = await request("/?incoming=ignored", {
      method,
      expected: destination ? 302 : 404,
    });
    assert.equal(response.headers.get("location"), destination ?? null);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(
      await response.text(),
      method === "GET" && !destination ? "Not Found" : "",
    );
    if (!destination)
      assert.match(response.headers.get("content-type"), /^text\/plain\b/);
  }
}
const session = (response) => {
  const value = response.headers.get("set-cookie");
  assert.match(value, /HttpOnly/i);
  assert.match(value, /SameSite=lax/i);
  assert.match(value, /Expires=/i);
  return value.split(";")[0];
};
try {
  const database = path.join(directory, "fresh.db");
  await start(database);
  await checkRoot();
  assert.deepEqual(await (await request("/api/setup")).json(), {
    isSetup: false,
  });
  await request("/api/links", { expected: 401 });
  await request("/api/setup", {
    method: "POST",
    body: { username: "owner", password: "long-test-password", token: "wrong" },
    expected: 403,
  });
  const cookie = session(
    await request("/api/setup", {
      method: "POST",
      body: { username: "owner", password: "long-test-password", token },
      expected: 201,
    }),
  );
  await request("/api/setup", {
    method: "POST",
    body: { username: "other", password: "long-test-password", token },
    expected: 409,
  });
  await request("/api/links", {
    method: "POST",
    cookie,
    headers: { origin: "https://different.example" },
    body: { url: "https://example.com" },
    expected: 403,
  });
  await request("/api/links", {
    method: "POST",
    cookie,
    body: { key: "sample", url: "https://example.com/a" },
    expected: 201,
  });
  await request("/api/links", {
    method: "POST",
    cookie,
    body: { key: "sample", url: "https://example.com" },
    expected: 409,
  });
  await request("/api/links", {
    method: "POST",
    cookie,
    body: { key: "login", url: "https://example.com" },
    expected: 400,
  });
  await request("/api/links", {
    method: "POST",
    cookie,
    body: { url: "javascript:alert(1)" },
    expected: 400,
  });
  await request("/api/links", {
    method: "POST",
    cookie,
    body: { url: "https://example.com", extra: "x".repeat(70_000) },
    expected: 413,
  });
  const qrConfig = {
    pattern: "dots",
    ink: "#112233",
    paper: "#ffffff",
    logo: null,
  };
  const updated = await (
    await request("/api/links/sample", {
      method: "PATCH",
      cookie,
      body: { key: "renamed", qrConfig },
    })
  ).json();
  assert.equal(updated.url, "https://example.com/a");
  assert.deepEqual(updated.qrConfig, qrConfig);
  await request("/sample", { expected: 404 });
  const head = await request("/renamed", { method: "HEAD", expected: 302 });
  assert.equal(head.headers.get("location"), "https://example.com/a");
  assert.equal(
    (await (await request("/api/links/renamed/visits", { cookie })).json())
      .totalVisits,
    0,
  );
  await request("/renamed", {
    expected: 302,
    headers: {
      "x-forwarded-for": "192.0.2.1",
      "x-visitor-country": "CH",
      "x-visitor-city": "Zurich",
    },
  });
  const stats = await (
    await request("/api/links/renamed/visits", { cookie })
  ).json();
  assert.equal(stats.totalVisits, 1);
  assert.equal(stats.uniqueVisitors, 0);
  assert.equal(stats.visits[0].visitor, null);
  assert.equal(stats.visits[0].country, null);
  assert.equal(stats.visits[0].city, null);
  const db = new DatabaseSync(database);
  db.prepare("INSERT INTO users(username,password) VALUES (?,?)").run(
    "second",
    await bcrypt.hash("second-password", 10),
  );
  db.close();
  const secondCookie = session(
    await request("/api/auth", {
      method: "POST",
      body: { username: "second", password: "second-password" },
    }),
  );
  await request("/api/links/renamed", { cookie: secondCookie, expected: 404 });
  await request("/api/links/renamed/visits", {
    cookie: secondCookie,
    expected: 404,
  });
  await request("/api/links/renamed", {
    method: "PATCH",
    cookie: secondCookie,
    body: { url: "https://example.org" },
    expected: 404,
  });
  await request("/api/links/renamed", {
    method: "DELETE",
    cookie: secondCookie,
    body: {},
    expected: 404,
  });
  await stop();
  const rootDestination = "https://example.org/landing?source=root#details";
  await start(database, { rootRedirectUrl: rootDestination });
  await checkRoot(rootDestination);
  await request("/api/links", { cookie });
  const sessionDb = new DatabaseSync(database);
  sessionDb
    .prepare("UPDATE sessions SET expires_at = 0 WHERE token_hash = ?")
    .run(createHash("sha256").update(secondCookie.split("=")[1]).digest("hex"));
  sessionDb.close();
  await request("/api/links", { cookie: secondCookie, expected: 401 });
  await request("/api/links/renamed", { method: "DELETE", cookie, body: {} });
  await request("/renamed", { expected: 404 });
  await request("/api/logout", { method: "POST", cookie, body: {} });
  await request("/api/links", { cookie, expected: 401 });
  for (let i = 0; i < 10; i++)
    await request("/api/auth", {
      method: "POST",
      body: { username: "missing", password: "incorrect" },
      expected: 401,
    });
  await request("/api/auth", {
    method: "POST",
    body: { username: "missing", password: "incorrect" },
    expected: 429,
  });
  await stop();
  const legacyPath = path.join(directory, "legacy.db");
  const legacy = new DatabaseSync(legacyPath);
  legacy.exec(
    await readFile(
      new URL("../tests/fixtures/legacy.sql", import.meta.url),
      "utf8",
    ),
  );
  legacy
    .prepare("INSERT INTO users(username,password) VALUES (?,?)")
    .run(" legacy ", await bcrypt.hash("legacy-password".repeat(8), 10));
  legacy.close();
  await start(legacyPath, {
    trustProxy: true,
    rootRedirectUrl: "https://user:password@example.org/",
  });
  await checkRoot();
  assert.deepEqual(await (await request("/api/setup")).json(), {
    isSetup: true,
  });
  const legacyCookie = session(
    await request("/api/auth", {
      method: "POST",
      body: { username: " legacy ", password: "legacy-password".repeat(8) },
    }),
  );
  await request("/api/links", { cookie: legacyCookie });
  await request("/api/links", {
    method: "POST",
    cookie: legacyCookie,
    body: { key: "unicode", url: "https://example.com/日本" },
    expected: 201,
  });
  await request("/api/links", {
    method: "POST",
    cookie: legacyCookie,
    body: { url: "not a URL" },
    expected: 400,
  });
  const unicode = await request("/unicode", {
    expected: 302,
    headers: {
      "x-forwarded-for": "192.0.2.1",
      "x-visitor-country": "ch",
      "x-visitor-city": "Zurich",
    },
  });
  assert.equal(
    unicode.headers.get("location"),
    "https://example.com/%E6%97%A5%E6%9C%AC",
  );
  const located = await (
    await request("/api/links/unicode/visits", { cookie: legacyCookie })
  ).json();
  assert.equal(located.uniqueVisitors, 1);
  assert.match(located.visits[0].visitor, /^[a-f0-9]{12}$/);
  assert.equal(located.visits[0].country, "CH");
  assert.equal(located.visits[0].city, "Zurich");

  console.log(
    "HTTP verification passed: bootstrap, sessions, validation, ownership, CRUD, root responses, redirects, visits, throttling, and legacy bcrypt sign-in.",
  );
} finally {
  await stop();
  await rm(directory, { recursive: true, force: true });
}
