// src/lib/googleAuth.ts
import "server-only";

const GOOGLE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

type BuildAuthUrlOptions = {
  state: string;
  redirect?: string;
};

export function buildGoogleAuthUrl({ state, redirect }: BuildAuthUrlOptions) {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ??
    `${process.env.APP_BASE_URL}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: ["openid", "email", "profile"].join(" "),
    access_type: "offline",
    include_granted_scopes: "true",
    state,
  });

  // Optional: for first-time explicit consent UX
  if (redirect) {
    params.set("prompt", "consent");
  }

  return `${GOOGLE_AUTH_BASE}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ??
    `${process.env.APP_BASE_URL}/api/auth/google/callback`;

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to exchange code: ${text}`);
  }

  return (await res.json()) as {
    access_token: string;
    id_token?: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
    token_type: string;
  };
}

export type GoogleProfile = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

export async function fetchGoogleProfile(accessToken: string) {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch Google profile: ${text}`);
  }

  return (await res.json()) as GoogleProfile;
}
