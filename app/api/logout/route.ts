import { endSession } from "@/lib/auth";
import { handle, json, readJson } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return handle(async () => {
    await readJson(request);
    const response = json({ ok: true });
    await endSession(response);
    return response;
  });
}
