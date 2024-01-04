import { sign, decode } from "jsonwebtoken";
import { type EventHandlerRequest, H3Event } from "h3";

interface AuthTokenUser {
  id: number;
  username: string;
}

const secret = process.env.NUXT_JWT_SECRET ?? "mysecrettoken";

export const createAuthToken = (user: AuthTokenUser): string => {
  return sign(user, secret);
};

export const parseAuthToken = (token: string): AuthTokenUser | null => {
  const decoded = decode(token);
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
