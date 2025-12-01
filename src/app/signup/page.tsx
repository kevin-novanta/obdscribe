"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [shopName, setShopName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          displayName: displayName || undefined,
          shopName: shopName || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || "Failed to sign up");
        return;
      }

      // On success, redirect into the app shell
      router.push("/app/new-report");
    } catch (err: any) {
      console.error("Signup failed", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function comingSoonAlert(provider: string) {
    alert(`${provider} signup is not implemented yet, but the slot is reserved.`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white border rounded p-6 shadow-sm text-sm space-y-4">
        <h1 className="text-lg font-semibold text-gray-900">
          Create your OBDscribe account
        </h1>
        <p className="text-xs text-gray-500">
          Sign up with email for now. Google, Apple, and phone sign-in will be added soon.
        </p>

        {/* Provider buttons */}
        <div className="space-y-2">
          <button
            type="button"
            className="w-full border rounded px-3 py-2 text-xs bg-gray-100 text-gray-600 cursor-not-allowed"
            onClick={() => comingSoonAlert("Google")}
          >
            Continue with Google (coming soon)
          </button>
          <button
            type="button"
            className="w-full border rounded px-3 py-2 text-xs bg-gray-100 text-gray-600 cursor-not-allowed"
            onClick={() => comingSoonAlert("Apple")}
          >
            Continue with Apple (coming soon)
          </button>
          <button
            type="button"
            className="w-full border rounded px-3 py-2 text-xs bg-gray-100 text-gray-600 cursor-not-allowed"
            onClick={() => comingSoonAlert("Phone")}
          >
            Continue with phone (coming soon)
          </button>
        </div>

        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-gray-400">
          <div className="flex-1 h-px bg-gray-200" />
          <span>or sign up with email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-xs">Email</label>
            <input
              type="email"
              className="border rounded px-2 py-1 text-xs"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs">Password</label>
            <input
              type="password"
              className="border rounded px-2 py-1 text-xs"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-[10px] text-gray-500">
              At least 8 characters. We’ll add stronger rules later.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs">Display name (optional)</label>
            <input
              className="border rounded px-2 py-1 text-xs"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Kevin N."
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs">Shop name (optional)</label>
            <input
              className="border rounded px-2 py-1 text-xs"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g. Demo Auto Repair"
            />
          </div>

          {error && (
            <div className="text-xs text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border rounded px-3 py-2 bg-gray-900 text-white text-xs disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign up with email"}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center">
          Already have an account?{" "}
          <a href="/login" className="underline text-blue-600">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}