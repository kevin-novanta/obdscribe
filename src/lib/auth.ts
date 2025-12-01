import { prisma } from "./db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { EmailSignupInput } from "@/types/auth";
import type { GoogleProfile } from "./googleAuth";

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

export async function loginWithGoogle(profile: GoogleProfile) {
  // 1) Existing user by googleId
  const existingByGoogle = await prisma.user.findUnique({
    where: { googleId: profile.sub },
    include: { shop: true },
  });

  if (existingByGoogle) {
    return {
      user: existingByGoogle,
      shop: existingByGoogle.shop,
      created: false,
    };
  }

  // 2) (Optional) existing by email for future linking
  const email = profile.email?.toLowerCase();
  if (!email) {
    throw new Error("GOOGLE_EMAIL_REQUIRED");
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email },
    include: { shop: true },
  });

  if (existingByEmail) {
    // For now, we **don’t** auto-link (to avoid surprises).
    // You could later add a setting/flow to allow it.
    throw new Error("GOOGLE_EMAIL_ALREADY_EXISTS");
  }

  // 3) Create new shop + user
  const shopName = `${profile.name || email || "Google user"}'s shop`;

  const shop = await prisma.shop.create({
    data: {
      name: shopName,
    },
  });

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: "", // not used for Google users
      role: "advisor",
      shopId: shop.id,
      displayName: profile.name || null,
      provider: "google",
      googleId: profile.sub,
      emailVerifiedAt: profile.email_verified ? new Date() : null,
    },
  });

  return { user, shop, created: true };
}

export async function loginWithApple(/* tokens / profile */) {
  throw new Error("APPLE_AUTH_NOT_IMPLEMENTED");
}

export async function loginWithPhone(/* phone + code */) {
  throw new Error("PHONE_AUTH_NOT_IMPLEMENTED");
}