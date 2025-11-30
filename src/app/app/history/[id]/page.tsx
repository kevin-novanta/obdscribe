// src/app/app/history/[id]/page.tsx
//
// Report detail page:
// - Server component
// - Loads a single report scoped to the current shop
// - Shows vehicle info, complaint, notes, codes, and both Tech/Customer views

import Link from "next/link";
import { cookies } from "next/headers";
import { getReportByIdForShop } from "@/lib/history";
import { parseSessionToken } from "@/lib/session";

type Params = { params: { id: string } };

async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get("obdscribe_session")?.value;
  return parseSessionToken(token);
}

export default async function ReportDetailPage({ params }: Params) {
  const session = await getSessionFromCookies();

  if (!session) {
    return (
      <div className="p-4 text-sm">
        You must be logged in to view reports.
      </div>
    );
  }

  const report = await getReportByIdForShop(session.shopId, params.id);

  if (!report) {
    return (
      <div className="p-6">
        <p className="text-sm mb-4">Report not found.</p>
        <Link
          href="/app/history"
          className="text-blue-600 underline text-sm"
        >
          Back to history
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">
            {report.vehicleYear} {report.vehicleMake} {report.vehicleModel}
          </h1>
          <p className="text-xs text-gray-500">
            Created at {report.createdAt.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            Status: {(report as any).status ?? "COMPLETED"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/api/reports/${report.id}/pdf`}
            className="text-sm underline text-blue-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download PDF
          </a>
          <Link
            href="/app/history"
            className="text-blue-600 underline text-sm"
          >
            Back to history
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 text-sm">
        <div className="space-y-2">
          <h2 className="font-semibold text-sm">Complaint</h2>
          <p className="border rounded px-3 py-2 bg-gray-50">
            {report.complaint}
          </p>

          {report.notes && (
            <>
              <h3 className="font-semibold text-sm">Notes</h3>
              <p className="border rounded px-3 py-2 bg-gray-50">
                {report.notes}
              </p>
            </>
          )}

          <h3 className="font-semibold text-sm">OBD Codes</h3>
          <p className="border rounded px-3 py-2 bg-gray-50">
            {report.codesRaw || "None recorded"}
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-semibold text-sm">Vehicle</h2>
          <p className="border rounded px-3 py-2 bg-gray-50">
            {report.vehicleYear} {report.vehicleMake} {report.vehicleModel}
            {report.vehicleTrim ? ` (${report.vehicleTrim})` : ""}
          </p>
          {/* You can add mileage, VIN, etc. here later */}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 text-sm">
        <div>
          <h2 className="font-semibold text-sm mb-1">Tech View</h2>
          <pre className="border rounded px-3 py-2 bg-gray-50 whitespace-pre-wrap">
            {report.techView}
          </pre>
        </div>
        <div>
          <h2 className="font-semibold text-sm mb-1">Customer View</h2>
          <pre className="border rounded px-3 py-2 bg-gray-50 whitespace-pre-wrap">
            {report.customerView}
          </pre>
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-sm mb-1">Maintenance Suggestions</h2>
        <pre className="border rounded px-3 py-2 bg-gray-50 whitespace-pre-wrap text-sm">
          {report.maintenanceSuggestions}
        </pre>
      </div>
    </div>
  );
}