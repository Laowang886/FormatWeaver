import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, getUserFromSessionToken } from "@/lib/auth";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = getUserFromSessionToken(sessionToken);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#060913] text-white">
      <Header />
      <main className="flex flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <section className="mx-auto flex w-full max-w-5xl items-center justify-center">
          <div className="w-full rounded-2xl border border-slate-800 bg-[#0b1220] p-6 sm:p-8 md:p-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Dashboard
                </p>
                <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
                  {user.mode === "guest"
                    ? "Welcome, guest"
                    : `Welcome back, ${user.name}`}
                </h1>
                <p className="max-w-2xl leading-7 text-slate-400">
                  {user.mode === "guest"
                    ? "You are browsing in guest mode. Explore the core features now, then switch to an account when you need to save your data."
                    : "You signed in through the backend API. This protected page can later be connected to a production database, permissions, and file processing."}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-medium text-slate-100 transition hover:border-slate-600 hover:bg-slate-800"
                >
                  Back to Home
                </Link>
                <form action="/api/auth/logout" method="post">
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-300 transition hover:border-rose-400/50 hover:bg-rose-500/10 hover:text-rose-200"
                  >
                    Log Out
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                ["Signed-in User", user.email],
                [
                  "Current Mode",
                  user.mode === "guest" ? "Guest Mode" : "Account Mode",
                ],
                ["Backend APIs", "/api/auth/guest / login / logout / me"],
              ].map(([title, value]) => (
                <div
                  key={title}
                  className="rounded-xl border border-slate-800 bg-slate-950/40 p-5"
                >
                  <p className="text-sm text-slate-400">{title}</p>
                  <p className="mt-2 font-medium text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
