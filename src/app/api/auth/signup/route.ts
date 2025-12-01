// src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { emailSignupSchema } from "@/lib/validators/auth";
import { createPasswordUser } from "@/lib/auth";

export async function POST(req: Request) {
  let body: unknown;

  // Parse JSON body
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  // Validate input
  const parsed = emailSignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation failed",
        errors: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  try {
    // Create user + shop for password-based signup
    const { user, shop } = await createPasswordUser(parsed.data);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
        shop: {
          id: shop.id,
          name: shop.name,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err?.message === "USER_ALREADY_EXISTS") {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    console.error("[signup] Unexpected error", err);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
