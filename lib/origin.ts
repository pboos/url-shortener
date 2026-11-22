export function getPublicOrigin(): string {
  const configured =
    process.env.PUBLIC_BASE_URL ??
    process.env.NUXT_APP_BASE_URL ??
    process.env.NUXT_BASE_URL;
  const value =
    !configured || configured === "/" ? "http://localhost:3000" : configured;
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "PUBLIC_BASE_URL must be an HTTP(S) origin without a path, credentials, query, or fragment.",
    );
  }
  return url.origin;
}
