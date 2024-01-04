import jwt from "jsonwebtoken";
import {EventHandlerRequest, H3Event} from "h3";

interface AuthTokenUser {
  id: number;
  username: string;
}

const secret = process.env.NUXT_JWT_SECRET ?? 'mysecrettoken';

export const createAuthToken = (user: AuthTokenUser): string => {
  return jwt.sign(user, secret);
};

export const parseAuthToken = (token: string): AuthTokenUser|null => {
  const decoded = jwt.decode(token);
  if (!decoded) {
    return null;
  }

  return decoded as AuthTokenUser;
};

export const requireAuth = (event: H3Event<EventHandlerRequest>) => {
  const authorization = event.headers.get('Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401 });
  }
  const token = authorization.slice(7);
  const user = parseAuthToken(token);
  if (!user) {
    throw createError({ statusCode: 401 });
  }

  return user;
};
