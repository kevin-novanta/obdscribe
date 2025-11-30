// src/app/api/reports/[id]/route.ts
//
// DELETE + GET endpoints for a single report, scoped to the current shop.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/session";
import { getReportByIdForShop } from "@/lib/history";

// In the App Router, `params` can be a Promise, so we type it that way
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(req: Request, context: RouteContext) {
  const { id } = await context.params; // ✅ unwrap params

  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const report = await prisma.report.findFirst({
    where: {
      id,
      shopId: session.shopId,
    },
  });

  if (!report) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await prisma.report.delete({
    where: { id: report.id },
  });

  return NextResponse.json({ ok: true });
}

export async function GET(req: Request, context: RouteContext) {
  const { id } = await context.params; // ✅ unwrap params

  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const report = await getReportByIdForShop(session.shopId, id);
  if (!report) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    vehicleYear: report.vehicleYear,
    vehicleMake: report.vehicleMake,
    vehicleModel: report.vehicleModel,
    vehicleTrim: report.vehicleTrim,
    mileage: report.mileage,
    complaint: report.complaint,
    notes: report.notes,
    codesRaw: report.codesRaw,
  });
}