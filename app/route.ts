import { safeDestination } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const destination = process.env.ROOT_REDIRECT_URL;
  if (!destination || !safeDestination(destination)) {
    return new Response("Not Found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }
  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL(destination).href,
      "Cache-Control": "no-store",
    },
  });
}
