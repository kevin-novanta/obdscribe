import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parseSessionToken } from "../../lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // cookies() returns a Promise<ReadonlyRequestCookies> in your setup
  const cookieStore = await cookies();
  const token = cookieStore.get("obdscribe_session")?.value;
  const session = token ? parseSessionToken(token) : null;

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="h-16 flex items-center px-4 border-b">
          <span className="font-semibold text-sm">OBDscribe</span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2 text-sm">
          <Link
            href="/app/new-report"
            className="block px-2 py-1 rounded hover:bg-slate-100"
          >
            New Report
          </Link>
          <Link
            href="/app/history"
            className="block px-2 py-1 rounded hover:bg-slate-100"
          >
            History
          </Link>
          <Link
            href="/app/settings"
            className="block px-2 py-1 rounded hover:bg-slate-100"
          >
            Settings (later)
          </Link>
        </nav>
      </aside>
      <main className="flex-1 min-h-screen">{children}</main>
    </div>
  );
}