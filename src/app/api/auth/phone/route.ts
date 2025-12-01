import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Phone-based signup/login not implemented yet" },
    { status: 501 }
  );
}
