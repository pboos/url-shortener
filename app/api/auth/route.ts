import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { getStore } from "@/lib/store";
import { startSession } from "@/lib/auth";
import { clientIp, handle, HttpError, json, readJson } from "@/lib/http";
import { credentials } from "@/lib/http-validation";

export const runtime = "nodejs";
export async function POST(request: Request) {
  return handle(async () => {
    const input = credentials.parse(await readJson(request));
    const store = getStore();
    const account = createHash("sha256").update(input.username).digest("hex");
    const now = Date.now();
    const addressAllowed = store.consumeRateLimit(
      `login-ip:${clientIp(request) || "untrusted"}`,
      60,
      900_000,
      now,
    );
    if (
      !addressAllowed ||
      !store.consumeRateLimit(`login-account:${account}`, 10, 900_000, now)
    )
      throw new HttpError(429, "Too many sign-in attempts. Try again later");
    const user = store.findUser(input.username);
    const matched = await bcrypt.compare(
      input.password,
      user?.password ??
        "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxPxN8h.gJ2VJjMUObf6dkRoHla",
    );
    if (!user || !matched)
      throw new HttpError(401, "Invalid username or password");
    const response = json({ user: { id: user.id, username: user.username } });
    await startSession(response, user.id);
    return response;
  });
}
