// src/app/app/history/page.tsx
//
// v0 history page with filters:
// - Reads session from cookies
// - Supports filters via searchParams (make, model, code, q, from, to)
// - Lists recent reports for the current shop in a basic table
// - "View" action links to /app/history/[id]
// - Delete/PDF actions wired via DeleteReportButton + PDF link

import Link from "next/link";
import { cookies } from "next/headers";
import { listRecentReportsForShop } from "@/lib/history";
import { parseSessionToken } from "@/lib/session";
import { DeleteReportButton } from "./DeleteReportButton";
import { MAKES, VEHICLE_MAKE_MODELS } from "@/data/vehicleOptions";

async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get("obdscribe_session")?.value;
  if (!token) return null;
  return parseSessionToken(token);
}

function formatDate(d: Date) {
  return d.toLocaleString();
}

type HistorySearchParams = {
  make?: string;
  model?: string;
  code?: string;
  q?: string;
  from?: string;
  to?: string;
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<HistorySearchParams>;
}) {
  const [session, sp] = await Promise.all([
    getSessionFromCookies(),
    searchParams,
  ]);

  const selectedMake = sp.make ?? "";
  const modelsForMake =
    selectedMake && VEHICLE_MAKE_MODELS[selectedMake]
      ? VEHICLE_MAKE_MODELS[selectedMake]
      : [];

  if (!session) {
    return (
      <div className="p-4 text-sm">
        You must be logged in to view history.
      </div>
    );
  }

  const filters = {
    make: sp.make || undefined,
    model: sp.model || undefined,
    code: sp.code || undefined,
    q: sp.q || undefined,
    from: sp.from ? new Date(sp.from) : undefined,
    to: sp.to ? new Date(sp.to) : undefined,
  };

  const reports = await listRecentReportsForShop(
    session.shopId,
    session.userId,
    filters
  );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-lg font-semibold mb-2">Report History</h1>

      {/* Filter form */}
      <form className="grid gap-2 md:grid-cols-6 text-sm mb-4" method="GET">
        <div className="flex flex-col">
          <label className="mb-1">Make</label>
          <select
            name="make"
            defaultValue={selectedMake}
            className="border rounded px-2 py-1 bg-white"
          >
            <option value="">All makes</option>
            {MAKES.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1">Model</label>
          <select
            name="model"
            defaultValue={sp.model ?? ""}
            className="border rounded px-2 py-1 bg-white"
            disabled={!selectedMake}
          >
            <option value="">All models</option>
            {modelsForMake.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1">OBD Code</label>
          <input
            name="code"
            defaultValue={sp.code ?? ""}
            className="border rounded px-2 py-1"
            placeholder="e.g. P0301"
          />
        </div>
        <div className="flex flex-col md:col-span-2">
          <label className="mb-1">Complaint Search</label>
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            className="border rounded px-2 py-1"
            placeholder="rough idle, misfire..."
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1">From</label>
          <input
            type="date"
            name="from"
            defaultValue={sp.from ?? ""}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1">To</label>
          <input
            type="date"
            name="to"
            defaultValue={sp.to ?? ""}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex items-end gap-2 md:col-span-2">
          <button
            type="submit"
            className="border rounded px-3 py-1 text-sm bg-gray-900 text-white"
          >
            Apply
          </button>
          <a
            href="/app/history"
            className="text-xs text-gray-600 underline"
          >
            Clear
          </a>
        </div>
      </form>

      {reports.length === 0 ? (
        <div className="text-sm text-gray-500">
          No reports yet. Generate your first report from the New Report page.
        </div>
      ) : (
        <div className="border rounded overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Year</th>
                <th className="px-3 py-2 text-left">Make</th>
                <th className="px-3 py-2 text-left">Model</th>
                <th className="px-3 py-2 text-left">Codes</th>
                <th className="px-3 py-2 text-left">Complaint</th>
                <th className="px-3 py-2 text-left">Mode</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">{formatDate(r.createdAt)}</td>
                  <td className="px-3 py-2">{r.vehicleYear ?? "—"}</td>
                  <td className="px-3 py-2">{r.vehicleMake ?? "—"}</td>
                  <td className="px-3 py-2">{r.vehicleModel ?? "—"}</td>
                  <td className="px-3 py-2">
                    {r.codesRaw && r.codesRaw.length
                      ? r.codesRaw.slice(0, 30)
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {r.complaint.length > 80
                      ? r.complaint.slice(0, 80) + "..."
                      : r.complaint}
                  </td>
                  <td className="px-3 py-2">
                    {(r as any).mode ?? "standard"}
                  </td>
                  <td className="px-3 py-2 space-x-2">
                    <Link
                      href={`/app/history/${r.id}`}
                      className="underline text-blue-600"
                    >
                      View
                    </Link>
                    <a
                      href={`/api/reports/${r.id}/pdf`}
                      className="underline text-blue-600"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      PDF
                    </a>
                    <DeleteReportButton reportId={r.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
