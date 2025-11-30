// src/app/api/reports/export/route.ts
import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { listRecentReportsForShop } from "@/lib/history";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const make = searchParams.get("make") || undefined;
  const model = searchParams.get("model") || undefined;
  const code = searchParams.get("code") || undefined;
  const q = searchParams.get("q") || undefined;
  const fromStr = searchParams.get("from") || undefined;
  const toStr = searchParams.get("to") || undefined;

  const filters = {
    make,
    model,
    code,
    q,
    from: fromStr ? new Date(fromStr) : undefined,
    to: toStr ? new Date(toStr) : undefined,
  };

  const reports = await listRecentReportsForShop(
    session.shopId,
    session.userId,
    filters
  );

  const rows = [
    [
      "id",
      "createdAt",
      "vehicleYear",
      "vehicleMake",
      "vehicleModel",
      "vehicleTrim",
      "mileage",
      "codesRaw",
      "complaint",
      "status",
    ],
    ...reports.map((r) => [
      r.id,
      r.createdAt.toISOString(),
      r.vehicleYear ?? "",
      r.vehicleMake ?? "",
      r.vehicleModel ?? "",
      r.vehicleTrim ?? "",
      r.mileage ?? "",
      r.codesRaw ?? "",
      r.complaint ?? "",
      r.status ?? "",
    ]),
  ];

  const csv = rows
    .map((cols) =>
      cols
        .map((c) => {
          const value = String(c).replace(/"/g, '""');
          return `"${value}"`;
        })
        .join(",")
    )
    .join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="obdscribe-history.csv"',
    },
  });
}
