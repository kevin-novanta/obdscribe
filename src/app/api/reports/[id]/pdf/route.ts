// src/app/api/reports/[id]/pdf/route.ts
//
// v0 PDF download route for OBDscribe reports.
// - Validates session from the incoming Request
// - Ensures the report belongs to the current shop
// - Generates a simple one-page PDF summary using pdf-lib
// - Returns it as an attachment response

import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { getSessionFromRequest } from "@/lib/session";
import { getReportByIdForShop } from "@/lib/history";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const report = await getReportByIdForShop(session.shopId, id);
  if (!report) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 50;

  function sanitizeForPdf(text: string): string {
    // Replace non-breaking hyphen and similar with a normal hyphen
    let normalized = text.replace(/\u2010|\u2011|\u2012|\u2013|\u2014|\u2015/g, "-");
    // Remove any remaining non-ASCII characters that Helvetica WinAnsi can't encode
    normalized = normalized.replace(/[^\x20-\x7E\n]/g, "");
    return normalized;
  }

  function drawText(text: string, options?: { bold?: boolean }) {
    const usedFont = options?.bold ? fontBold : font;
    const safeText = sanitizeForPdf(text);
    if (!safeText) {
      y -= 14;
      return;
    }
    page.drawText(safeText, {
      x: 50,
      y,
      size: 10,
      font: usedFont,
    });
    y -= 14;
  }

  // Header
  drawText("OBDscribe Report", { bold: true });
  drawText("");

  // Vehicle + metadata
  drawText(
    `Vehicle: ${report.vehicleYear} ${report.vehicleMake} ${report.vehicleModel}`
  );
  drawText(`Created: ${report.createdAt.toLocaleString()}`);
  drawText("");

  // Complaint
  drawText("Complaint:", { bold: true });
  drawText(report.complaint || "(none)");
  drawText("");

  // Notes (optional)
  if (report.notes) {
    drawText("Notes:", { bold: true });
    drawText(report.notes);
    drawText("");
  }

  // Codes
  if (report.codesRaw) {
    drawText("OBD Codes:", { bold: true });
    drawText(report.codesRaw);
    drawText("");
  }

  // Tech View summary
  if (report.techView) {
    drawText("Tech View (summary):", { bold: true });
    drawText(report.techView.slice(0, 400)); // basic truncation for v0
    drawText("");
  }

  // Customer View summary
  if (report.customerView) {
    drawText("Customer View (summary):", { bold: true });
    drawText(report.customerView.slice(0, 400));
  }

  const pdfBytes = await pdfDoc.save();
  // Ensure we pass a pure ArrayBuffer to Blob to satisfy TypeScript's BlobPart typing
  const arrayBuffer: ArrayBuffer = pdfBytes.buffer as ArrayBuffer;
  const blob = new Blob([arrayBuffer], { type: "application/pdf" });

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=obdscribe-report-${report.id}.pdf`,
    },
  });
}