// src/app/api/auth/apple/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Apple signup/login not implemented yet" },
    { status: 501 }
  );
}