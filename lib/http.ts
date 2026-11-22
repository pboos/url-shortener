import { isIP } from "node:net";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getPublicOrigin } from "./origin";
import { StoreConflictError } from "./store";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function handle(
  action: () => Response | Promise<Response>,
): Promise<Response> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof HttpError)
      return json({ error: error.message }, error.status);
    if (error instanceof ZodError)
      return json({ error: "Invalid request data" }, 400);
    if (error instanceof StoreConflictError)
      return json({ error: "This short link is already in use" }, 409);
    console.error("Request failed", error);
    return json({ error: "An unexpected error occurred" }, 500);
  }
}

export function checkMutation(request: Request): void {
  const origin = request.headers.get("origin");
  if (
    !origin ||
    origin !== getPublicOrigin() ||
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
    throw new HttpError(403, "Request origin is not allowed");
  }
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  ) {
    throw new HttpError(415, "Content-Type must be application/json");
  }
}

export async function readJson(request: Request): Promise<unknown> {
  checkMutation(request);
  const maxBytes = 65_536;
  if (Number(request.headers.get("content-length")) > maxBytes)
    throw new HttpError(413, "Request body is too large");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "JSON body is required");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new HttpError(413, "Request body is too large");
    }
    chunks.push(chunk.value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
}

export function clientIp(request: Request): string {
  if (process.env.TRUST_PROXY !== "true") return "";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "";
  return isIP(ip) ? ip : "";
}

export function pagination(request: Request) {
  const params = new URL(request.url).searchParams;
  const page = Number(params.get("page") ?? 1);
  const pageSize = Number(params.get("pageSize") ?? 20);
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > 1_000_000 ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100
  ) {
    throw new HttpError(400, "Invalid pagination");
  }
  return { page, pageSize };
}

export function visitorLocation(request: Request): {
  country?: string;
  city?: string;
} {
  if (process.env.TRUST_PROXY !== "true") return {};
  const country = request.headers.get("x-visitor-country") ?? "";
  const city = request.headers.get("x-visitor-city") ?? "";
  return {
    country: /^[A-Za-z]{2}$/.test(country) ? country.toUpperCase() : undefined,
    city:
      city.length > 0 && city.length <= 100 && !/[\x00-\x1f\x7f<>]/.test(city)
        ? city
        : undefined,
  };
}
