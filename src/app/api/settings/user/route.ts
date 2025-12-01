// src/app/api/settings/user/route.ts
import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import {
  getUserSettings,
  updateUserSettings,
  type UserSettings,
} from "@/lib/settings";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserSettings(session.userId);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: UserSettings;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const updated = await updateUserSettings(session.userId, {
    displayName: body.displayName,
  });

  return NextResponse.json(updated);
}