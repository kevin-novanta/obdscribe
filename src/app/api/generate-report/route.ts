import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { parseSessionToken } from "../../../lib/session";
import { generateReport } from "../../../lib/ai/engine";
import { logError } from "../../../lib/logger";

type Body = {
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  mileage?: number;
  codes: string;
  complaint: string;
  notes?: string;
};

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get("obdscribe_session")?.value;
  const session = parseSessionToken(cookie);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  if (!body.complaint || !body.codes) {
    return NextResponse.json(
      { message: "Complaint and codes are required" },
      { status: 400 }
    );
  }

  const codesArray = body.codes
    .split(",")
    .map(c => c.trim())
    .filter(Boolean);

  try {
    const aiOutput = await generateReport({
      mode: "production",
      shopId: session.shopId,
      userId: session.userId,
      vehicle: {
        year: body.year,
        make: body.make,
        model: body.model,
        trim: body.trim,
        mileage: body.mileage,
      },
      codes: codesArray,
      complaint: body.complaint,
      notes: body.notes,
    });

    const report = await prisma.report.create({
      data: {
        shopId: session.shopId,
        userId: session.userId,
        vehicleYear: body.year ?? null,
        vehicleMake: body.make ?? null,
        vehicleModel: body.model ?? null,
        vehicleTrim: body.trim ?? null,
        mileage: body.mileage ?? null,
        codesRaw: body.codes,
        complaint: body.complaint,
        notes: body.notes ?? "",
        techView: aiOutput.techView,
        customerView: aiOutput.customerView,
        maintenanceSuggestions: JSON.stringify(aiOutput.maintenanceSuggestions),
        promptVersion: "1",
        mode: "production",
      },
    });

    return NextResponse.json({
      id: report.id,
      techView: report.techView,
      customerView: report.customerView,
      maintenanceSuggestions: aiOutput.maintenanceSuggestions,
    });
  } catch (err) {
    logError("Failed to generate report", err);
    return NextResponse.json(
      { message: "Failed to generate report. Please try again." },
      { status: 500 }
    );
  }
}