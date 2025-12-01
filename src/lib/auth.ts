import { prisma } from "./db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { EmailSignupInput } from "@/types/auth";

export type AuthProvider = "password" | "google" | "apple" | "phone";

const AUTH_SECRET = process.env.AUTH_SECRET || "dev_secret_change_me";

export async function verifyUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  return user;
}

export async function createPasswordUser(input: EmailSignupInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existing) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  // For v0: always create a simple shop for the user
  const shopName =
    input.shopName || `${input.email.split("@")[0]}'s shop`;

  const shop = await prisma.shop.create({
    data: {
      name: shopName,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      role: "advisor", // align with your existing roles
      shopId: shop.id,
      displayName: input.displayName || null,
    },
  });

  return { user, shop };
}

export function createSessionToken(userId: string, shopId: string) {
  return jwt.sign({ userId, shopId }, AUTH_SECRET, {
    expiresIn: "7d",
  });
}

// Placeholder stubs – to be implemented when enabling providers

export async function loginWithGoogle(/* tokens / profile */) {
  throw new Error("GOOGLE_AUTH_NOT_IMPLEMENTED");
}

export async function loginWithApple(/* tokens / profile */) {
  throw new Error("APPLE_AUTH_NOT_IMPLEMENTED");
}

export async function loginWithPhone(/* phone + code */) {
  throw new Error("PHONE_AUTH_NOT_IMPLEMENTED");
}