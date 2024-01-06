import jwt from "jsonwebtoken";
import { type EventHandlerRequest, H3Event } from "h3";

interface AuthTokenUser {
  id: number;
  username: string;
}

const secret =
  process.env.NUXT_JWT_SECRET ??
  "4be4f4806161fec5d1af8c04b01e3533f566fd8e5b53ef860f4aca82d95a0471";

export const createAuthToken = (user: AuthTokenUser): string => {
  // eslint-disable-next-line import/no-named-as-default-member
  return jwt.sign(user, secret);
};

export const parseAuthToken = (token: string): AuthTokenUser | null => {
  // eslint-disable-next-line import/no-named-as-default-member
  const decoded = jwt.decode(token);
  if (!decoded) {
    return null;
  }

  return decoded as AuthTokenUser;
};

export const optionalAuth = (
  event: H3Event<EventHandlerRequest>,
): AuthTokenUser | null => {
  const authorization = event.headers.get("Authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }
  const token = authorization.slice(7);

  return parseAuthToken(token);
};

export const requireAuth = (
  event: H3Event<EventHandlerRequest>,
): AuthTokenUser => {
  const user = optionalAuth(event);
  if (!user) {
    throw createError({ statusCode: 401 });
  }

  return user;
};
