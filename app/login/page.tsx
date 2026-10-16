
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"English" | "Amharic">("English");

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    // DEMO ONLY: This does not authenticate a real account.
    // No password is verified and no session is created.
    window.setTimeout(() => {
      setLoading(false);
      router.push("/");
    }, 500);
  }

  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Left branding panel */}
      <section className="relative flex min-h-[300px] flex-col justify-between overflow-hidden bg-[#092c45] p-8 text-white sm:p-12 lg:min-h-screen lg:p-16">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border border-white/10"
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-7 w-7"
              aria-hidden="true"
            >
              <path d="M7 3.75h7l5 5v11.5a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-13a2.5 2.5 0 0 1 2-2.5Z" />
              <path d="M14 4v5h5M8.5 13h7M8.5 16.5h7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold tracking-wide">
              Office File Management
            </p>
            <p className="text-xs text-slate-300">
              Office Administration System
            </p>
          </div>
        </div>

        <div className="relative z-10 my-12 max-w-lg">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
            Welcome to your workspace
          </p>

          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Every file.
            <br />
            In its right place.
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
            Organize office records, track file movements, and manage
            documents through one central workspace.
          </p>

          <div className="mt-10 space-y-5">
            {[
              "Centralized file registration",
              "Track transfers and assignments",
              "Manage office records efficiently",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="m4 10 4 4 8-8" />
                  </svg>
                </span>
                <span className="text-sm text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-400">
          Office File Management System
        </p>
      </section>

      {/* Right login panel */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:min-h-screen">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-[#092c45] lg:hidden">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-7 w-7"
                aria-hidden="true"
              >
                <path d="M7 3.75h7l5 5v11.5a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-13a2.5 2.5 0 0 1 2-2.5Z" />
                <path d="M14 4v5h5M8.5 13h7M8.5 16.5h7" />
              </svg>
            </div>

            <p className="text-sm font-semibold text-[#2563a6]">
              OFFICE WORKSPACE
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to continue to your office dashboard.
            </p>
          </div>

          {/* Demo notice */}
          <div
            role="status"
            className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3"
          >
            <p className="text-sm font-semibold text-amber-900">
              Demo mode — not real authentication
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              This form is for frontend testing only. Any non-empty email
              and password will continue to the dashboard. No account is
              verified.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@office.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2563a6] focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <span className="text-xs text-slate-400">
                  Demo only
                </span>
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter any demo password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2563a6] focus:ring-2 focus:ring-blue-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 text-sm font-medium text-slate-500 hover:text-[#092c45]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-[#092c45]"
              />
              Remember me on this device
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-[#092c45] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#124566] focus:outline-none focus:ring-2 focus:ring-[#2563a6] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Opening dashboard..." : "Sign in"}
              {!loading && (
                <span aria-hidden="true" className="ml-2">
                  →
                </span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs leading-5 text-slate-400">
            Authorized office personnel only.
            <br />
            Secure authentication will be added with the backend.
          </p>
        </div>
      </section>
    </main>
  );
}
