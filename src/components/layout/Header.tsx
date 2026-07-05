"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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

  const handleHistoryClick = async (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
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
    <header className="w-full border-b border-slate-800 bg-transparent">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-white">
          FormatWeaver
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
              <div className="text-sm text-slate-200">
                {userName ?? "Account"}
              </div>
              <form action="/api/auth/logout" method="post">
                <button className="rounded-md bg-rose-500 px-3 py-2 text-sm font-medium text-white hover:bg-rose-400">
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-sky-500 px-3 py-2 text-sm font-medium text-white hover:bg-sky-400"
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
            className="flex flex-col gap-3 rounded-2xl border border-sky-400/20 bg-slate-950/70 px-4 py-3 shadow-lg shadow-sky-950/20 backdrop-blur sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-slate-200">
              Please log in to view your conversion history.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400"
            >
              Login
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
