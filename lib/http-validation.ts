import { z } from "zod";
import { parseQrConfig } from "./qr";
import { HttpError } from "./http";
import { safeDestination } from "./store";

const reserved = new Set([
  "admin",
  "api",
  "login",
  "setup",
  "logout",
  "_next",
  "favicon.ico",
  "robots.txt",
  "password",
  "email",
  "username",
  "index",
]);
const key = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/)
  .refine((value) => !reserved.has(value.toLowerCase()));
export const credentials = z
  .object({
    username: z.string().min(1).max(2048),
    password: z.string().min(1).max(1024),
  })
  .strict();
export const setupCredentials = credentials.extend({
  username: z.string().trim().min(1).max(100),
  password: z
    .string()
    .min(12)
    .max(72)
    .refine((value) => Buffer.byteLength(value, "utf8") <= 72),
  token: z.string().min(1).max(1024),
});
const url = z.string().max(4096).refine(safeDestination);
const qrConfig = z.unknown().transform((value) => {
  if (value === null) return null;
  const parsed = parseQrConfig(value);
  if (!parsed) throw new HttpError(400, "Invalid QR settings");
  return parsed;
});
export const createLinkInput = z
  .object({ key: key.optional(), url, qrConfig: qrConfig.optional() })
  .strict();
export const updateLinkInput = z
  .object({
    key: key.optional(),
    url: url.optional(),
    qrConfig: qrConfig.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0);
