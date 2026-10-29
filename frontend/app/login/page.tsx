
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Files,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  FolderOpen,
  ArrowLeftRight,
  ClipboardList,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid email or password.");
        }

        throw new Error(
          `Login failed (${response.status}). Please try again.`,
        );
      }

      const user = await response.json();

      // Store user information in localStorage or context
      localStorage.setItem("user", JSON.stringify(user));

      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the server. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="min-h-screen bg-[#214D6C] p-3 text-[#292D32] sm:p-6 lg:flex lg:items-center lg:justify-center lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] w-full max-w-[1440px] overflow-hidden rounded-2xl bg-white shadow-2xl sm:min-h-[calc(100vh-3rem)] lg:min-h-[min(820px,calc(100vh-4rem))] lg:grid-cols-2 lg:rounded-[24px]">
        {/* Left branding panel */}
        <section className="relative flex min-h-[420px] flex-col justify-between overflow-hidden bg-[#0A506E] p-7 text-white sm:p-10 lg:min-h-0 lg:p-12 xl:p-14">
          {/* Decorative background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-8 top-1/3 h-40 w-40 rounded-full bg-white/[0.04] blur-2xl"
          />

          {/* Brand */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
              <Files size={23} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide sm:text-base">
                Office File Management
              </p>
              <p className="mt-0.5 text-xs text-white/65">
                Office Administration System
              </p>
            </div>
          </div>

          {/* Main message */}
          <div className="relative z-10 my-10 max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90">
              <span className="h-2 w-2 rounded-full bg-[#B7D9E6]" />
              YOUR OFFICE WORKSPACE
            </div>

            <h1 className="max-w-lg text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl xl:text-[54px]">
              Every file.
              <br />
              In its right place.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/75 sm:text-base">
              A simpler way to organize office records, track file movements,
              and keep your documents under control.
            </p>

            {/* Document workspace illustration */}
            <div className="relative mt-9 max-w-lg rounded-2xl border border-white/15 bg-white/[0.09] p-4 shadow-xl backdrop-blur-sm sm:p-5">
              <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-4">
                <div>
                  <p className="text-xs text-white/60">WORKSPACE OVERVIEW</p>
                  <p className="mt-1 font-semibold">Office records</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <FolderOpen size={21} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                  <div className="flex items-center gap-2 text-white/70">
                    <ClipboardList size={16} />
                    <span className="text-xs">File registration</span>
                  </div>
                  <div className="mt-4 h-1.5 w-full rounded-full bg-white/15">
                    <div className="h-1.5 w-3/4 rounded-full bg-[#B7D9E6]" />
                  </div>
                  <p className="mt-2 text-[11px] text-white/60">
                    Organized records
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                  <div className="flex items-center gap-2 text-white/70">
                    <ArrowLeftRight size={16} />
                    <span className="text-xs">File movements</span>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#B7D9E6]" />
                    <span className="h-1.5 flex-1 rounded-full bg-white/15" />
                    <span className="h-2 w-2 rounded-full bg-white/60" />
                  </div>
                  <p className="mt-2 text-[11px] text-white/60">
                    Track transfers
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3 rounded-xl bg-white p-3 text-[#292D32]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E7F1F5] text-[#0A506E]">
                  <ShieldCheck size={19} />
                </div>
                <div>
                  <p className="text-xs font-semibold">
                    One central workspace
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#737B86]">
                    Keep office work organized
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-white/55">
            Office File Management System
          </p>
        </section>

        {/* Right sign-in panel */}
        <section className="flex items-center justify-center bg-white px-6 py-12 sm:px-12 lg:px-10 xl:px-16">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E7F1F5] text-[#0A506E] lg:hidden">
                <Files size={25} strokeWidth={1.8} />
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0A506E]">
                Office workspace
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#292D32] sm:text-[34px]">
                Welcome back
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#737B86]">
                Sign in to continue to your office dashboard.
              </p>
            </div>

            {/* Demo notice */}
            <div
              role="status"
              className="mb-6 rounded-xl border border-[#D6E2E8] bg-[#F4F8FA] p-3.5"
            >
              <p className="text-sm font-semibold text-[#0A506E]">
                Frontend demo mode
              </p>
              <p className="mt-1 text-xs leading-5 text-[#737B86]">
                Any non-empty email and password will continue to the
                dashboard. No account is verified yet.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#292D32]"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-xl border border-[#DDE2E7] bg-white px-4 text-sm text-[#292D32] outline-none transition placeholder:text-[#9298A1] hover:border-[#B8C8D0] focus:border-[#0A506E] focus:ring-4 focus:ring-[#E7F1F5]"
                  required
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-[#292D32]"
                  >
                    Password
                  </label>
                  <span className="text-xs text-[#9298A1]">Demo only</span>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 w-full rounded-xl border border-[#DDE2E7] bg-white px-4 pr-12 text-sm text-[#292D32] outline-none transition placeholder:text-[#9298A1] hover:border-[#B8C8D0] focus:border-[#0A506E] focus:ring-4 focus:ring-[#E7F1F5]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#737B86] transition hover:text-[#0A506E]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#737B86]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-[#D6E2E8] accent-[#0A506E] focus:ring-[#0A506E]"
                  />
                  Remember me
                </label>

                <span
                  title="Password recovery is not available in demo mode."
                  className="cursor-not-allowed text-sm text-[#9298A1]"
                >
                  Forgot password?
                </span>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0A506E] px-4 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-[#176A87] focus:outline-none focus:ring-4 focus:ring-[#E7F1F5] active:bg-[#135B74] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Opening dashboard..." : "Sign in"}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#ECEFF2]" />
              <span className="text-xs text-[#9298A1]">
                OFFICE FILE MANAGEMENT
              </span>
              <div className="h-px flex-1 bg-[#ECEFF2]" />
            </div>

            <div className="flex items-start justify-center gap-2 text-center text-xs leading-5 text-[#9298A1]">
              <ShieldCheck
                size={15}
                className="mt-0.5 shrink-0 text-[#0A506E]"
              />
              <p>
                Authorized office personnel only.
                <br />
                Secure authentication will be added with the backend.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
