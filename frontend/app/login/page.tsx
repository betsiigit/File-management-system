
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
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
      const response = await fetch(
        "http://localhost:8081/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid email or password.");
        }

        throw new Error(
          `Login failed (${response.status}). Please try again.`
        );
      }

      const user = await response.json();

      localStorage.setItem("currentUser", JSON.stringify(user));

      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full border-t-[3px] border-[#168BC5] bg-[#F3F7FA]">

      <div className="flex min-h-[calc(100vh-3px)] items-center justify-center px-5 py-10">

        {/* Login popup */}
        <section className="w-full max-w-[360px] rounded-xl border border-[#E7EDF2] bg-white px-8 py-9 shadow-[0_8px_35px_rgba(10,80,110,0.10)]">

          {/* Welcome heading */}
          <div className="mb-6">
            <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-[#0A506E]">
              Welcome back
            </h1>

            <p className="mt-2 text-[10px] text-[#47768C]">
              Sign in to access your organization's files.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[10px] font-medium text-[#47768C]"
              >
                Work email
              </label>

              <div className="flex h-[35px] items-center gap-2 rounded-md border border-[#E3EAF0] bg-white px-2.5 transition focus-within:border-[#0A506E]">
                <Mail size={13} className="shrink-0 text-[#0A506E]" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@organization.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-full w-full bg-transparent text-[10px] text-[#292D32] outline-none placeholder:text-[#47768C]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[10px] font-medium text-[#47768C]"
              >
                Password
              </label>

              <div className="flex h-[35px] items-center gap-2 rounded-md border border-[#E3EAF0] bg-white px-2.5 transition focus-within:border-[#0A506E]">
                <LockKeyhole size={13} className="shrink-0 text-[#0A506E]" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-full w-full bg-transparent text-[10px] text-[#292D32] outline-none placeholder:text-[#47768C]"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="shrink-0 text-[#0A506E] hover:text-[#176A87]"
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <label className="flex cursor-pointer items-center gap-1.5 text-[9px] text-[#47768C]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-[11px] w-[11px] rounded-sm accent-[#0A506E]"
                />
                Keep me signed in
              </label>

              <span
                title="Please contact your system administrator to reset your password."
                className="cursor-not-allowed text-[9px] text-[#47768C]"
              >
                Forgot password?
              </span>
            </div>

            {/* Error */}
            {error && (
              <p
                role="alert"
                className="rounded-md border border-red-100 bg-red-50 px-2.5 py-2 text-[10px] text-red-600"
              >
                {error}
              </p>
            )}

            {/* Sign in */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-[35px] w-full items-center justify-center gap-1.5 rounded-md bg-[#0A506E] text-[10px] font-semibold text-white transition hover:bg-[#176A87] focus:outline-none focus:ring-2 focus:ring-[#0A506E]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={13} />}
            </button>
          </form>

          {/* Request access */}
          <p className="mt-5 text-center text-[9px] text-[#47768C]">
            New to your workspace?{" "}
            <span className="font-semibold text-[#0A506E]">
              Request access
            </span>
          </p>

        </section>
      </div>
    </main>
  );
}
