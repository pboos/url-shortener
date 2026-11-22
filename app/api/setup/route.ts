import bcrypt from "bcryptjs";
import { setupComplete, startSession, verifySetupToken } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { clientIp, handle, HttpError, json, readJson } from "@/lib/http";
import { setupCredentials } from "@/lib/http-validation";

export const runtime = "nodejs";
export function GET() {
  return handle(() => json({ isSetup: setupComplete() }));
}
export async function POST(request: Request) {
  return handle(async () => {
    const input = setupCredentials.parse(await readJson(request));
    if (setupComplete()) throw new HttpError(409, "Setup is already complete");
    if (
      !getStore().consumeRateLimit(
        `setup:${clientIp(request) || "untrusted"}`,
        10,
        900_000,
        Date.now(),
      )
    )
      throw new HttpError(429, "Too many setup attempts. Try again later");
    if (!verifySetupToken(input.token))
      throw new HttpError(403, "Invalid setup token");
    const user = getStore().bootstrap(
      input.username,
      await bcrypt.hash(input.password, 12),
    );
    if (!user) throw new HttpError(409, "Setup is already complete");
    const response = json(
      { user: { id: user.id, username: user.username } },
      201,
    );
    await startSession(response, user.id);
    return response;
  });
}
