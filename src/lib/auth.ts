import { prisma } from "./db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const AUTH_SECRET = process.env.AUTH_SECRET || "dev_secret_change_me";

export async function verifyUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  return user;
}

export function createSessionToken(userId: string, shopId: string) {
  return jwt.sign({ userId, shopId }, AUTH_SECRET, {
    expiresIn: "7d",
  });
}