import jwt from "jsonwebtoken";

interface AuthTokenUser {
  id: number;
  username: string;
}

const secret = process.env.NUXT_JWT_SECRET ?? 'mysecrettoken';

export const createAuthToken = (user: AuthTokenUser): string => {
  return jwt.sign(user, secret);
};

export const parseAuthToken = (token: string): AuthTokenUser => {
  const decoded = jwt.decode(token);
  return decoded as AuthTokenUser;
};
