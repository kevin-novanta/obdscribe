// src/app/app/settings/page.tsx
import { getSessionFromCookies } from "@/lib/session";
import ShopSettingsPanel from "./ShopSettingsPanel";
import UserSettingsPanel from "./UserSettingsPanel";

export default async function SettingsPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    return (
      <div className="p-6 text-sm">
        You must be logged in to view settings.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-semibold">Settings</h1>
      <p className="text-xs text-gray-500">
        Configure your shop profile, report defaults, and personal info. Visual
        polish will come later — this is a functional v0.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <ShopSettingsPanel />
        <UserSettingsPanel />
      </div>
    </div>
  );
}
