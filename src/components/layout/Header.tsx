"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CurrentUser = {
  name?: string | null;
  email?: string | null;
};

async function fetchCurrentUser(): Promise<CurrentUser | null> {
  try {
    const response = await fetch("/api/auth/me");
    if (!response.ok) return null;

    const data: { user?: CurrentUser | null } = await response.json();
    return data.user ?? null;
  } catch {
    return null;
  }
}

export default function Header() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [showHistoryPrompt, setShowHistoryPrompt] = useState(false);

  useEffect(() => {
    let isActive = true;

    void fetchCurrentUser().then((user) => {
      if (!isActive) return;

      setUserName(user?.name ?? user?.email ?? null);
      setIsAuthenticated(Boolean(user));
      setAuthChecked(true);
      if (user) setShowHistoryPrompt(false);
    });

    return () => {
      isActive = false;
    };
  }, []);

  const handleHistoryClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (isAuthenticated) return;

    event.preventDefault();

    if (!authChecked) {
      const user = await fetchCurrentUser();
      setUserName(user?.name ?? user?.email ?? null);
      setIsAuthenticated(Boolean(user));
      setAuthChecked(true);

      if (user) {
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

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-sm text-slate-200 sm:block">
                {userName ?? "Account"}
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
              Please log in to view your conversion history.
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
