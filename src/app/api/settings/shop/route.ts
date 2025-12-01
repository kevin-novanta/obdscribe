

// src/app/api/settings/shop/route.ts
import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import {
  getShopSettings,
  updateShopSettings,
  type ShopSettings,
} from "@/lib/settings";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const shop = await getShopSettings(session.shopId);
  if (!shop) {
    return NextResponse.json({ message: "Shop not found" }, { status: 404 });
  }

  return NextResponse.json(shop);
}

export async function PATCH(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: ShopSettings;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  // Basic sanitization for mode/tone
  const allowedModes = ["standard", "premium"];
  const allowedTones = ["plain_english", "technical"];

  if (body.defaultReportMode && !allowedModes.includes(body.defaultReportMode)) {
    return NextResponse.json(
      { message: "Invalid defaultReportMode" },
      { status: 400 }
    );
  }

  if (body.defaultReportTone && !allowedTones.includes(body.defaultReportTone)) {
    return NextResponse.json(
      { message: "Invalid defaultReportTone" },
      { status: 400 }
    );
  }

  const updated = await updateShopSettings(session.shopId, body);

  return NextResponse.json(updated);
}