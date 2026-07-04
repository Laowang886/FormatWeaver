import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, getUserFromSessionToken } from "@/lib/auth";

export default async function Header() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = getUserFromSessionToken(sessionToken);

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
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-sm text-slate-300 sm:block">
                {user.name}
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
    </header>
  );
}
