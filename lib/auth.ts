import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { getStore } from "./store";
import { HttpError } from "./http";
import { getPublicOrigin } from "./origin";

const cookieName = "shortener_session";
const sessionDuration = 7 * 24 * 60 * 60 * 1000;
const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export function setupComplete(): boolean {
  return getStore().setupComplete();
}

export async function getCurrentUser() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return getStore().sessionUser(tokenHash(token), Date.now());
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Sign in required");
  return user;
}

const cookieOptions = () => ({
  httpOnly: true,
  secure:
    getPublicOrigin().startsWith("https:") ||
    (process.env.NODE_ENV === "production" &&
      !["localhost", "127.0.0.1", "[::1]"].includes(
        new URL(getPublicOrigin()).hostname,
      )),
  sameSite: "lax" as const,
  path: "/",
});

export async function startSession(response: NextResponse, userId: number) {
  await endSession(response);
  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + sessionDuration;
  getStore().createSession(userId, tokenHash(token), expiresAt);
  response.cookies.set(cookieName, token, {
    ...cookieOptions(),
    expires: new Date(expiresAt),
  });
}

export async function endSession(response: NextResponse) {
  const token = (await cookies()).get(cookieName)?.value;
  if (token) getStore().deleteSession(tokenHash(token));
  response.cookies.set(cookieName, "", { ...cookieOptions(), maxAge: 0 });
}

export function verifySetupToken(value: string): boolean {
  const expected = process.env.SETUP_TOKEN;
  if (!expected)
    throw new HttpError(
      503,
      "Set SETUP_TOKEN on the server before creating the first account",
    );
  return timingSafeEqual(
    createHash("sha256").update(value).digest(),
    createHash("sha256").update(expected).digest(),
  );
}
