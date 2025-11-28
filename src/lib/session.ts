import jwt from "jsonwebtoken";

const AUTH_SECRET = process.env.AUTH_SECRET || "dev_secret_change_me";

export type Session = {
  userId: string;
  shopId: string;
};

export function parseSessionToken(token: string | undefined | null): Session | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as Session;
    if (!decoded.userId || !decoded.shopId) return null;
    return decoded;
  } catch {
    return null;
  }
}