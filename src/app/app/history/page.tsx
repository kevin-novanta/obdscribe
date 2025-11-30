// src/app/app/history/page.tsx
//
// v0 history page:
// - Reads session from cookies
// - Lists recent reports for the current shop in a basic table
// - "View" action links to /app/history/[id]
// - Delete/PDF actions will be wired in later chapters

import Link from "next/link";
import { cookies } from "next/headers";
import { listRecentReportsForShop } from "@/lib/history";
import { parseSessionToken } from "@/lib/session";

function formatDate(d: Date) {
  return d.toLocaleString();
}

async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get("obdscribe_session")?.value;
  return parseSessionToken(token);
}

export default async function HistoryPage() {
  const session = await getSessionFromCookies();

  if (!session) {
    return (
      <div className="p-4 text-sm">
        You must be logged in to view history.
      </div>
    );
  }

  const reports = await listRecentReportsForShop(session.shopId);

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold mb-4">Report History</h1>

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
                <th className="px-3 py-2 text-left">Vehicle</th>
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
                  <td className="px-3 py-2">
                    {r.vehicleYear} {r.vehicleMake} {r.vehicleModel}
                  </td>
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
                    {/* Delete + PDF buttons will be wired in future chapters */}
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
