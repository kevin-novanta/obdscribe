"use client";

import React, { useEffect, useState } from "react";

type UserSettingsResponse = {
  id: string;
  email: string;
  displayName: string | null;
};

export default function UserSettingsPanel() {
  const [data, setData] = useState<UserSettingsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/settings/user");
        if (!res.ok) throw new Error("Failed to load user settings");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message ?? "Failed to load user settings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/settings/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: data.displayName,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to save user settings");
      }
      setSuccess("Saved!");
    } catch (err: any) {
      setError(err.message ?? "Failed to save user settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="border rounded p-4 text-sm">
        Loading user settings...
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
        No user settings available.
      </div>
    );
  }

  return (
    <div className="border rounded p-4 text-sm space-y-3">
      <h2 className="font-semibold text-sm">User Profile</h2>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="text-xs">Email</label>
          <input
            value={data.email}
            disabled
            className="border rounded px-2 py-1 bg-gray-100 text-xs"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs">Display Name</label>
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

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="border rounded px-3 py-1 bg-gray-900 text-white text-xs"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {success && (
            <span className="text-xs text-green-600">{success}</span>
          )}
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </form>
    </div>
  );
}
