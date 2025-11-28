// src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";
// OLD
// import { verifyUser, createSessionToken } from "@/lib/auth";
// import { logError } from "@/lib/logger";

// NEW (relative paths)
import { verifyUser, createSessionToken } from "../../../../lib/auth";
import { logError } from "../../../../lib/logger";
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await verifyUser(email, password);
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = createSessionToken(user.id, user.shopId);

    const res = NextResponse.json({ message: "ok" });
    res.cookies.set("obdscribe_session", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err) {
    logError("Login failed", err);
    return NextResponse.json(
      { message: "Unexpected error" },
      { status: 500 }
    );
  }
}