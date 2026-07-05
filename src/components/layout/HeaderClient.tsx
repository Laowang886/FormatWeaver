"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type HeaderUser = {
  name?: string | null;
  email?: string | null;
  canViewHistory: boolean;
};

type HeaderClientProps = {
  initialUser: HeaderUser | null;
};

type CurrentUserResponse = {
  user?: HeaderUser | null;
};

async function fetchCurrentUser(): Promise<HeaderUser | null> {
  try {
    const response = await fetch("/api/auth/me");
    if (!response.ok) return null;

    const data = (await response.json()) as CurrentUserResponse;
    return data.user ?? null;
  } catch {
    return null;
  }
}

export default function HeaderClient({ initialUser }: HeaderClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<HeaderUser | null>(initialUser);
  const [authChecked, setAuthChecked] = useState(Boolean(initialUser));
  const [showHistoryPrompt, setShowHistoryPrompt] = useState(false);

  const handleHistoryClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (user?.canViewHistory) return;

    event.preventDefault();

    if (!authChecked) {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      setAuthChecked(true);

      if (currentUser?.canViewHistory) {
        router.push("/history");
        return;
      }
    }

    setShowHistoryPrompt(true);
  };

  return (
    <header className="w-full border-b border-white/10 bg-[#080b12]/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-white">
          <span className="grid h-9 w-9 place-items-center bg-cyan-400 text-sm font-bold text-slate-950">
            FW
          </span>
          <span className="text-lg font-semibold">FormatWeaver</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/history"
            onClick={handleHistoryClick}
            className="text-sm text-slate-300 transition hover:text-white"
          >
            History
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-sm text-slate-200 sm:block">
                {user.name ?? user.email ?? "Account"}
              </div>
              <form action="/api/auth/logout" method="post">
                <button className="border border-rose-400/40 px-3 py-2 text-sm font-medium text-rose-100 hover:bg-rose-500/10">
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {showHistoryPrompt ? (
        <div className="mx-auto w-full max-w-6xl px-6 pb-4">
          <div
            role="alert"
            className="flex flex-col gap-3 rounded border border-sky-400/20 bg-slate-950/70 px-4 py-3 shadow-lg shadow-sky-950/20 backdrop-blur sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-slate-200">
              Please log in with an account to view your conversion history.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400"
            >
              Login
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
