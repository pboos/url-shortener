import { z } from "zod";
import type { QrConfig } from "./contracts";

export const qrPatterns = [
  "square",
  "rounded",
  "dots",
  "classy",
  "classy-rounded",
  "extra-rounded",
] as const;
export const defaultQr: QrConfig = {
  pattern: "rounded",
  ink: "#153f34",
  paper: "#ffffff",
  logo: null,
};

const color = z.string().regex(/^#[a-f0-9]{6}$/i);
const pattern = z.enum(qrPatterns);
const logo = z.union([
  z
    .string()
    .max(44000)
    .regex(/^data:image\/png;base64,iVBORw0KGgo[A-Za-z0-9+/]*={0,2}$/),
  z
    .url({ protocol: /^https$/ })
    .max(2048)
    .refine((value) => {
      if (!URL.canParse(value)) return false;
      const url = new URL(value);
      return !url.username && !url.password;
    }),
]);
const style = z.object({
  pattern,
  ink: color,
  paper: color,
  logo: logo.nullable(),
});

export function parseQrConfig(value: unknown): QrConfig | null {
  const result = style.safeParse(value);
  return result.success ? result.data : null;
}

const legacyStyle = z.object({
  dotsOptions: z
    .object({ type: pattern.optional(), color: color.optional() })
    .optional(),
  backgroundOptions: z.object({ color: color.optional() }).optional(),
  image: z.string().optional(),
});

export function normalizeStoredQr(value: unknown): QrConfig | null {
  const current = parseQrConfig(value);
  if (current) return current;
  const legacy = legacyStyle.safeParse(value);
  if (!legacy.success) return null;
  const { dotsOptions, backgroundOptions, image } = legacy.data;
  const savedLogo = logo.safeParse(image);
  return {
    pattern: dotsOptions?.type ?? defaultQr.pattern,
    ink: dotsOptions?.color ?? defaultQr.ink,
    paper: backgroundOptions?.color ?? defaultQr.paper,
    logo: savedLogo.success ? savedLogo.data : null,
  };
}
