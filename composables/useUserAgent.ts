type UserAgent = {
  userAgent: string;
  ip?: string;
};

export default function useUserAgent(): UserAgent | null {
  if (process.server) {
    const nuxtApp = useNuxtApp();
    const request = nuxtApp.ssrContext?.event?.node?.req;
    if (request) {
      const ip =
        request.headers["x-forwarded-for"] ||
        request.connection.remoteAddress || // for local dev
        request.socket.remoteAddress;

      return {
        userAgent: request.headers["user-agent"] || "",
        ip: typeof ip === "string" ? ip : undefined,
      };
    }
  } else {
    return { userAgent: navigator.userAgent };
  }

  return null;
}
