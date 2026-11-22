import { getStore } from "@/lib/store";
import { clientIp, handle, HttpError, visitorLocation } from "@/lib/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ key: string }> };
async function redirect(request: Request, context: Context, track: boolean) {
  return handle(async () => {
    const url = getStore().redirect((await context.params).key, {
      track,
      ...visitorLocation(request),
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent")?.slice(0, 512) ?? "",
    });
    if (!url) throw new HttpError(404, "Link not found");
    return new Response(null, {
      status: 302,
      headers: {
        Location: new URL(url).href,
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    });
  });
}
export function GET(request: Request, context: Context) {
  return redirect(request, context, true);
}
export function HEAD(request: Request, context: Context) {
  return redirect(request, context, false);
}
