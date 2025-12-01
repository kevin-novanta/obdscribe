// src/types/auth.ts

/**
 * Payload for basic email + password signup.
 * 
 * For v0 we keep this minimal:
 * - `email` and `password` are required.
 * - `displayName` and `shopName` are optional and can be used later
 *   when we let users personalize their profile and shop.
 */
export type EmailSignupInput = {
  email: string;
  password: string;
  displayName?: string;
  shopName?: string; // optional – later we can let the user name their shop
};
