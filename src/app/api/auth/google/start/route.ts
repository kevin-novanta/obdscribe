// src/app/api/auth/google/start/route.ts
import { NextResponse } from "next/server";
import { buildGoogleAuthUrl } from "@/lib/googleAuth";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const redirect = url.searchParams.get("redirect") || "/app/new-report";

  // Simple, unsigned state for v0; later we can HMAC-sign + store
  const statePayload = new URLSearchParams({ redirect }).toString();
  const state = Buffer.from(statePayload, "utf8").toString("base64url");

  const authUrl = buildGoogleAuthUrl({ state, redirect });

  return NextResponse.json(
    { url: authUrl },
    { status: 200 }
  );
}
