"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // lightweight check for demo: read a cookie via /api/auth/me
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const { user } = await res.json();
          if (user?.name) setUserName(user.name);
        }
      } catch {}
    })();
  }, []);

  return (
    <header className="w-full border-b border-slate-800 bg-transparent">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-white">
          FormatWeaver
        </Link>

        <div className="flex items-center gap-3">
          {userName ? (
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-200">{userName}</div>
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
    </header>
  );
}
