import Link from "next/link";
import { auth } from "@/auth";
import HistoryList from "@/components/history/HistoryList";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default async function HistoryPage() {
  const session = await auth();
  const hasHistoryAccess = Boolean(session?.user);

  return (
    <div className="flex min-h-screen flex-col bg-[#060913] text-white">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        {hasHistoryAccess ? (
          <>
            <div className="mb-8 sm:mb-10">
              <Link
                href="/"
                className="mb-4 inline-flex text-sm text-slate-400 transition-colors hover:text-slate-200"
              >
                ← Back to home
              </Link>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Your workspace
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
                Conversion History
              </h1>
              <p className="mt-3 text-base text-slate-400 sm:text-lg">
                View your previous document conversions.
              </p>
            </div>

            <HistoryList />
          </>
        ) : (
          <section className="flex min-h-[50vh] items-center justify-center">
            <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-[#0b1220] p-8 text-center md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Conversion History
              </p>
              <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
                Log in to view your history
              </h1>
              <p className="mt-4 text-slate-300">
                Please log in to view your conversion history.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Login
              </Link>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
