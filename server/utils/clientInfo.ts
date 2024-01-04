import { EventHandlerRequest, H3Event } from "h3";

export const clientInfo = (event: H3Event<EventHandlerRequest>) => {
  const ip =
    event.headers.get("x-forwarded-for") || event.context.clientAddress;

  return {
    userAgent: event.headers.get("user-agent") || "",
    ip: typeof ip === "string" ? ip : undefined,
  };
};
