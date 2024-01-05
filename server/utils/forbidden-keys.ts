const forbiddenKeys = [
  "password",
  "email",
  "username",
  "admin",
  "login",
  "setup",
  "index",
];
export const isKeyForbidden = (key: string): boolean =>
  forbiddenKeys.includes(key.toLowerCase());
