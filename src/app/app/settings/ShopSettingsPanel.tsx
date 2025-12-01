

"use client";

import { useEffect, useState } from "react";

type ShopSettingsResponse = {
  id: string;
  name: string;
  displayName: string | null;
  phone: string | null;
  address: string | null;
  defaultReportMode: string | null;
  defaultReportTone: string | null;
  defaultIncludeMaint: boolean | null;
};

const MODES = [
  { value: "standard", label: "Standard (default)" },
  { value: "premium", label: "Premium" },
];

const TONES = [
  { value: "plain_english", label: "Plain English" },
  { value: "technical", label: "Technical" },
];

export default function ShopSettingsPanel() {
  const [data, setData] = useState<ShopSettingsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/settings/shop");
        if (!res.ok) throw new Error("Failed to load shop settings");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message ?? "Failed to load shop settings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/settings/shop", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: data.displayName,
          phone: data.phone,
          address: data.address,
          defaultReportMode: data.defaultReportMode,
          defaultReportTone: data.defaultReportTone,
          defaultIncludeMaint: data.defaultIncludeMaint ?? true,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to save shop settings");
      }
      setSuccess("Saved!");
    } catch (err: any) {
      setError(err.message ?? "Failed to save shop settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="border rounded p-4 text-sm">
        Loading shop settings...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="border rounded p-4 text-sm text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="border rounded p-4 text-sm">
        No shop settings available.
      </div>
    );
  }

  return (
    <div className="border rounded p-4 text-sm space-y-3">
      <h2 className="font-semibold text-sm">Shop Settings</h2>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="text-xs">Shop Name (internal)</label>
          <input
            value={data.name}
            disabled
            className="border rounded px-2 py-1 bg-gray-100 text-xs"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs">Display Name (shown in reports)</label>
          <input
            className="border rounded px-2 py-1 text-xs"
            value={data.displayName ?? ""}
            onChange={(e) =>
              setData((prev) =>
                prev ? { ...prev, displayName: e.target.value } : prev
              )
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs">Phone</label>
          <input
            className="border rounded px-2 py-1 text-xs"
            value={data.phone ?? ""}
            onChange={(e) =>
              setData((prev) =>
                prev ? { ...prev, phone: e.target.value } : prev
              )
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs">Address</label>
          <textarea
            className="border rounded px-2 py-1 text-xs"
            rows={2}
            value={data.address ?? ""}
            onChange={(e) =>
              setData((prev) =>
                prev ? { ...prev, address: e.target.value } : prev
              )
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs">Default Report Mode</label>
          <select
            className="border rounded px-2 py-1 text-xs"
            value={data.defaultReportMode ?? "standard"}
            onChange={(e) =>
              setData((prev) =>
                prev ? { ...prev, defaultReportMode: e.target.value } : prev
              )
            }
          >
            {MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs">Default Report Tone</label>
          <select
            className="border rounded px-2 py-1 text-xs"
            value={data.defaultReportTone ?? "plain_english"}
            onChange={(e) =>
              setData((prev) =>
                prev ? { ...prev, defaultReportTone: e.target.value } : prev
              )
            }
          >
            {TONES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="defaultIncludeMaint"
            type="checkbox"
            className="h-3 w-3"
            checked={data.defaultIncludeMaint ?? true}
            onChange={(e) =>
              setData((prev) =>
                prev
                  ? { ...prev, defaultIncludeMaint: e.target.checked }
                  : prev
              )
            }
          />
          <label htmlFor="defaultIncludeMaint" className="text-xs">
            Include maintenance suggestions by default
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="border rounded px-3 py-1 bg-gray-900 text-white text-xs"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {success && <span className="text-xs text-green-600">{success}</span>}
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </form>
    </div>
  );
}