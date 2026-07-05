"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  FileCode2,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

type LoginMode = "guest" | "account";

type LoginFormProps = {
  initialMode?: LoginMode;
};

const REMEMBER_DEVICE_STORAGE_KEY = "formatweaver-remember-device";
const SAVED_EMAIL_STORAGE_KEY = "formatweaver-saved-email";

function getStoredLoginPreferences() {
  const defaults = {
    rememberMe: false,
    email: "",
  };

  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const storedValue = window.localStorage.getItem(
      REMEMBER_DEVICE_STORAGE_KEY,
    );
    const storedEmail = window.localStorage.getItem(SAVED_EMAIL_STORAGE_KEY);

    return {
      rememberMe:
        storedValue === "true"
          ? true
          : storedValue === "false"
            ? false
            : defaults.rememberMe,
      email: storedEmail ?? defaults.email,
    };
  } catch {
    return defaults;
  }
}

export default function LoginForm({ initialMode = "guest" }: LoginFormProps) {
  const router = useRouter();
  const storedPreferences = getStoredLoginPreferences();
  const [mode, setMode] = useState<LoginMode>(initialMode);
  const [email, setEmail] = useState(storedPreferences.email);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(storedPreferences.rememberMe);

  useEffect(() => {
    try {
      if (rememberMe) {
        window.localStorage.setItem(REMEMBER_DEVICE_STORAGE_KEY, "true");
        window.localStorage.setItem(SAVED_EMAIL_STORAGE_KEY, email);
      } else {
        window.localStorage.removeItem(REMEMBER_DEVICE_STORAGE_KEY);
        window.localStorage.removeItem(SAVED_EMAIL_STORAGE_KEY);
      }
    } catch {
      // Ignore storage access issues.
    }
  }, [rememberMe, email]);

  const enterGuestMode = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/guest", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to enter guest mode. Please try again.");
      }

      router.push("/");
      router.refresh();
    } catch (guestError) {
      setError(
        guestError instanceof Error
          ? guestError.message
          : "Failed to enter guest mode. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "guest") {
      await enterGuestMode();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Login failed. Please check your email and password.");
      }

      router.push("/");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setError(
        "Google login is currently unavailable. Please configure Google OAuth credentials.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 rotate-3">
          <FileCode2 className="h-5.5 w-5.5 -rotate-3 text-slate-950" />
        </div>
        <h2 className="text-2xl font-bold text-white">Secure Member Login</h2>
        <p className="mt-1.5 text-xs text-slate-400">
          Access your secure file sandbox & concurrent job pipelines.
        </p>
      </div>

      <div className="grid grid-cols-2 rounded-2xl bg-slate-950 p-1 ring-1 ring-slate-800">
        <button
          type="button"
          onClick={() => {
            setMode("guest");
            setError(null);
          }}
          className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
            mode === "guest"
              ? "bg-emerald-500 text-slate-950"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Guest Mode
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("account");
            setError(null);
          }}
          className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
            mode === "account"
              ? "bg-emerald-500 text-slate-950"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Account Mode
        </button>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handleGoogleLogin}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-700 hover:bg-slate-950/80 hover:text-white disabled:opacity-50"
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
        <span>Continue with Google</span>
      </button>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-x-0 h-px bg-slate-800" />
        <span className="relative bg-slate-900 px-3 text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500">
          Or continue with email
        </span>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="leading-relaxed">{error}</p>
        </div>
      ) : null}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {mode === "account" ? (
          <>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-email"
                className="text-xs font-semibold text-slate-400"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  id="login-email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-xs font-semibold text-slate-400"
                >
                  Password
                </label>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    setError(
                      "Password reset instructions have been simulated & sent to " +
                        email,
                    )
                  }
                  className="text-xs font-medium text-emerald-400 transition hover:text-emerald-300 disabled:opacity-50"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  id="login-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your security credential"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3.5 text-slate-500 transition hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm leading-6 text-slate-400">
            <p className="font-medium text-slate-200">Guest mode</p>
            <p className="mt-2">
              You can enter the experience directly without providing
              credentials. You can switch to account mode anytime.
            </p>
          </div>
        )}

        {mode === "account" ? (
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400 hover:text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0 accent-emerald-500"
              />
              <span>Remember this sandbox device</span>
            </label>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Authorizing session...</span>
            </>
          ) : (
            <>
              <span>
                {mode === "guest" ? "Enter as Guest" : "Access Secure Sandbox"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {mode === "account" ? (
          <p className="text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="font-medium text-emerald-400 hover:text-emerald-300"
            >
              Create one
            </a>
          </p>
        ) : null}
      </form>

      <div className="flex items-center justify-center gap-2 border-t border-slate-800/50 pt-4 text-[10px] font-mono text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        <span>AES-256 Cloud Sandbox Security Protocol</span>
      </div>
    </div>
  );
}
