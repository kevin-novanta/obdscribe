import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { parseSessionToken } from "../../../lib/session";
import { generateReport } from "../../../lib/ai/engine";
import { logError } from "../../../lib/logger";
import { isRateLimited } from "../../../lib/rateLimiter";

export async function POST(req: NextRequest) {
  try {
    // 1) Auth/session (with dev fallback)
    const cookies = req.cookies;
    const sessionToken = cookies.get("session")?.value;

    let session = sessionToken
      ? await parseSessionToken(sessionToken)
      : null;

    // Dev-only fallback: allow anonymous usage by binding to demo shop/user
    if (
      (!session || !session.userId || !session.shopId) &&
      process.env.NODE_ENV !== "production"
    ) {
      session = {
        userId: "user_demo_1",
        shopId: "shop_demo_1",
      } as any;
    }

    if (!session || !session.userId || !session.shopId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2) Rate limiting (per IP)
    const ip =
      req.headers.get("x-forwarded-for") ??
      (req as any).ip ??
      "unknown";

    if (isRateLimited(String(ip))) {
      return NextResponse.json(
        {
          message: "Too many requests. Please wait a moment and try again.",
        },
        { status: 429 }
      );
    }

    // 3) Parse body
    const body = await req.json();
    const {
      make,
      model,
      trim,
      mileage,
      year,
      codes,
      complaint,
      notes,
      mode,
    } = body;

    // Normalize vehicle shape for AI engine + DB
    const vehicle = {
      year,
      make,
      model,
      trim,
      mileage,
    };

    // Normalize codes into an array (supports string or array input)
    const codesArray: string[] = Array.isArray(codes)
      ? codes
      : typeof codes === "string"
      ? codes
          .split(",")
          .map((c: string) => c.trim())
          .filter(Boolean)
      : [];

    if (
      !vehicle.make ||
      !vehicle.model ||
      !vehicle.year ||
      !Array.isArray(codesArray) ||
      codesArray.length === 0 ||
      !complaint
    ) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
    }

    // 4) Call AI engine
    const report = await generateReport({
      vehicle,
      codes: codesArray,
      complaint,
      notes,
      mode,
      shopContext: {}, // you can add laborRate etc. later
    });

    // 5) Persist report
    const persistedMode = mode ?? "production";

const created = await prisma.report.create({
  data: {
    vehicleYear: vehicle.year,
    vehicleMake: vehicle.make,
    vehicleModel: vehicle.model,
    vehicleTrim: vehicle.trim ?? null,
    mileage: vehicle.mileage ?? null,
    complaint,
    notes: notes ?? "",
    techView: report.techView,
    customerView: report.customerView,
    maintenanceSuggestions: JSON.stringify(
      report.maintenanceSuggestions ?? []
    ),
    promptVersion: "1",

    // NEW: required by your Prisma schema
    codesRaw: JSON.stringify(codesArray),      // or codes.join(",") if you defined it as a plain string
    mode: persistedMode,                  // matches Report.mode

    shop: {
      connect: { id: session.shopId },    // connect to existing Shop row
    },
    user: {
      connect: { id: session.userId },    // connect to existing User row
    },
  },
});
    // 6) Return JSON
    return NextResponse.json(
      {
        id: created.id,
        report,
      },
      { status: 200 }
    );
  } catch (err: any) {
    logError("[ERROR] Failed to generate report", err);

    return NextResponse.json(
      {
        message: "Failed to generate report. Please try again.",
      },
      { status: 500 }
    );
  }
}