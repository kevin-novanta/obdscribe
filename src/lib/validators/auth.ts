// src/lib/validators/auth.ts
import { z } from "zod";

export const emailSignupSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
  displayName: z.string().min(1).max(80).optional(),
  shopName: z.string().min(1).max(120).optional(),
});

export type EmailSignupSchema = z.infer<typeof emailSignupSchema>;
