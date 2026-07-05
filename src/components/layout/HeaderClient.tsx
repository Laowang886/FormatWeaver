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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#060913]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 text-white">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-400 text-sm font-bold tracking-tight text-slate-950">
            FW
          </span>
          <span className="hidden text-base font-semibold tracking-tight sm:block">
            FormatWeaver
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/history"
            onClick={handleHistoryClick}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            History
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden max-w-40 truncate text-sm text-slate-400 md:block">
                {user.name ?? user.email ?? "Account"}
              </div>
              <form action="/api/auth/logout" method="post">
                <button className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white">
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {showHistoryPrompt ? (
        <div className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6">
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-slate-200">
              Please log in with an account to view your conversion history.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Login
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
