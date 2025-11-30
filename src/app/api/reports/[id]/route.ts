// src/app/api/reports/[id]/route.ts
//
// DELETE endpoint for removing a single report, scoped to the current shop.
// This ensures a user can only delete reports that belong to their shop.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/session";

type Params = { params: { id: string } };

export async function DELETE(req: Request, { params }: Params) {
  const session = await getSessionFromRequest(req);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const report = await prisma.report.findFirst({
    where: {
      id: params.id,
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
