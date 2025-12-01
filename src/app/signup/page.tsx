"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || "Failed to log in");
        return;
      }

      // On success, redirect into the app shell
      router.push("/app/new-report");
    } catch (err) {
      console.error("Login failed", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleClick() {
    try {
      const res = await fetch(
        "/api/auth/google/start?redirect=/app/new-report",
        {
          method: "POST",
        }
      );
      if (!res.ok) {
        alert("Failed to start Google sign-in.");
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Google login failed", err);
      alert("Something went wrong starting Google login.");
    }
  }

  function comingSoonAlert(provider: string) {
    alert(`${provider} login is not implemented yet, but the slot is reserved.`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white border rounded p-6 shadow-sm text-sm space-y-4">
        <h1 className="text-lg font-semibold text-gray-900">
          Log in to your OBDscribe account
        </h1>
        <p className="text-xs text-gray-500">
          Use Google or your email and password. Apple and phone sign-in will be added soon.
        </p>

        {/* Provider buttons */}
        <div className="space-y-2">
          <button
            type="button"
            className="w-full border rounded px-3 py-2 text-xs bg-white text-gray-800"
            onClick={handleGoogleClick}
          >
            Continue with Google
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
          <span>or log in with email</span>
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
            {loading ? "Logging in..." : "Log in with email"}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="underline text-blue-600">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}