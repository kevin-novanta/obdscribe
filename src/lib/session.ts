import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const AUTH_SECRET = process.env.AUTH_SECRET || "dev_secret_change_me";
const SESSION_COOKIE_NAME = "obdscribe_session";

export type Session = {
  userId: string;
  shopId: string;
};

/**
 * Low-level helper: given a raw JWT string, return a Session or null.
 */
export function parseSessionToken(
  token: string | undefined | null
): Session | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as Session;
    if (!decoded.userId || !decoded.shopId) return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extract a cookie value from a Cookie header string.
 * Very small, framework-agnostic parser good enough for v0.
 */
function getCookieFromHeader(
  cookieHeader: string | null,
  name: string
): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((c) => c.trim());
  for (const part of parts) {
    if (part.startsWith(name + "=")) {
      return decodeURIComponent(part.slice(name.length + 1));
    }
  }
  return null;
}

/**
 * Helper for API route handlers:
 * Given the native Request object, read the session cookie and
 * return the decoded Session or null.
 *
 * Used in: src/app/api/** where we wrote `getSessionFromRequest(req)`.
 */
export async function getSessionFromRequest(
  req: Request
): Promise<Session | null> {
  const cookieHeader = req.headers.get("cookie");
  const token = getCookieFromHeader(cookieHeader, SESSION_COOKIE_NAME);
  return parseSessionToken(token);
}

/**
 * Helper for server components / layouts:
 * Use Next.js `cookies()` to read the session cookie and decode it.
 */
export async function getSessionFromCookies(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return parseSessionToken(token ?? null);
}