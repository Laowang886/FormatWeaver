"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
  FileCode2,
  AlertCircle,
  User,
} from "lucide-react";
import {
  MIN_PASSWORD_LENGTH,
  getPasswordRequirements,
  validatePassword,
} from "@/lib/password-policy";

export default function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRequirements = getPasswordRequirements(password);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email) {
      setError("Please provide a valid email address.");
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create the account in the database
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password }),
      });

      const data: { message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ?? "Registration failed. Please try again.",
        );
      }

      // 2. Automatically sign the user in right after successful registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Account was created but auto-login failed — send them to the login page instead
        router.push("/login");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setError(
        "Google signup is currently unavailable. Please configure Google OAuth credentials.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1220] shadow-2xl shadow-black/20">
      <div className="p-6 pb-4 text-center sm:p-8 sm:pb-4">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400">
          <FileCode2 className="h-5.5 w-5.5 text-slate-950" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Create Secure Account
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Join FormatWeaver to preserve history and scale document pipelines.
        </p>
      </div>

      <div className="flex flex-col gap-5 px-6 pb-6 sm:px-8 sm:pb-8">
        <div className="w-full">
          <button
            id="btn-signup-social-google"
            type="button"
            disabled={isLoading}
            onClick={handleSocialSignUp}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-700 bg-slate-950/40 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white disabled:opacity-50"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign up with Google</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-x-0 h-px bg-slate-800" />
          <span className="relative bg-[#0b1220] px-3 text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Or register with email
          </span>
        </div>

        {error && (
          <div
            id="signup-error-banner"
            className="flex items-start gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="signup-name"
              className="text-xs font-semibold text-slate-400"
            >
              Full Name
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 h-4.5 w-4.5 text-slate-500" />
              <input
                id="signup-name"
                type="text"
                required
                disabled={isLoading}
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="signup-email"
              className="text-xs font-semibold text-slate-400"
            >
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4.5 w-4.5 text-slate-500" />
              <input
                id="signup-email"
                type="email"
                required
                disabled={isLoading}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="signup-password"
              className="text-xs font-semibold text-slate-400"
            >
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4.5 w-4.5 text-slate-500" />
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={MIN_PASSWORD_LENGTH}
                pattern={`(?=.*[^A-Za-z0-9]).{${MIN_PASSWORD_LENGTH},}`}
                disabled={isLoading}
                placeholder="Choose a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15 disabled:opacity-60"
              />
              <button
                id="btn-toggle-signup-password-view"
                type="button"
                disabled={isLoading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
            <div className="grid gap-1 text-xs">
              {passwordRequirements.map((requirement) => (
                <div
                  key={requirement.id}
                  className={
                    requirement.isMet ? "text-cyan-300" : "text-slate-500"
                  }
                >
                  {requirement.isMet ? "OK" : "-"} {requirement.label}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="signup-confirm-password"
              className="text-xs font-semibold text-slate-400"
            >
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4.5 w-4.5 text-slate-500" />
              <input
                id="signup-confirm-password"
                type={showPassword ? "text" : "password"}
                required
                disabled={isLoading}
                placeholder="Verify your security credential"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15 disabled:opacity-60"
              />
            </div>
          </div>

          <button
            id="btn-signup-submit"
            type="submit"
            disabled={isLoading}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:bg-slate-800 disabled:text-slate-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Provisioning account...</span>
              </>
            ) : (
              <>
                <span>Create Secure Account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 mt-2">
          <span>
            Already have an account?{" "}
            <Link
              id="btn-signup-switch-to-login"
              href="/login"
              className="font-semibold text-cyan-300 hover:text-cyan-200 focus:outline-none"
            >
              Log In
            </Link>
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-slate-800 pt-4 text-[10px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
          <span>AES-256 Cloud Sandbox Security Protocol</span>
        </div>
      </div>
    </div>
  );
}
