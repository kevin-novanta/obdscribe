// src/app/api/auth/google/callback/route.ts
import { NextResponse } from "next/server";
import { exchangeCodeForTokens, fetchGoogleProfile } from "@/lib/googleAuth";
import { loginWithGoogle } from "@/lib/auth";
import { signJwtSession } from "@/lib/session"; // make sure this exists / matches your login route

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    // User cancelled or Google returned an error
    const redirectUrl = `${process.env.APP_BASE_URL}/login?googleError=${encodeURIComponent(
      error
    )}`;
    return NextResponse.redirect(redirectUrl);
  }

  if (!code || !state) {
    const redirectUrl = `${process.env.APP_BASE_URL}/login?googleError=missing_code_or_state`;
    return NextResponse.redirect(redirectUrl);
  }

  // Decode our basic state payload
  let redirectPath = "/app/new-report";
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const params = new URLSearchParams(decoded);
    redirectPath = params.get("redirect") || redirectPath;
  } catch {
    // ignore and keep default redirect
  }

  try {
    // 1) Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // 2) Fetch profile
    const profile = await fetchGoogleProfile(tokens.access_token);

    // 3) Upsert / log in user
    const { user, shop } = await loginWithGoogle(profile);

    // 4) Create session + cookie (reuse your existing pattern)
    const sessionToken = signJwtSession({
      userId: user.id,
      shopId: shop.id,
    });

    const res = NextResponse.redirect(
      `${process.env.APP_BASE_URL}${redirectPath}`
    );

    res.cookies.set("obdscribe_session", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err) {
    console.error("[google/callback] error", err);
    const redirectUrl = `${process.env.APP_BASE_URL}/login?googleError=callback_failed`;
    return NextResponse.redirect(redirectUrl);
  }
}