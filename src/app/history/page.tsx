import Link from "next/link";
import { auth } from "@/auth";
import HistoryList from "@/components/history/HistoryList";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default async function HistoryPage() {
  const session = await auth();
  const hasHistoryAccess = Boolean(session?.user);

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] text-white">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        {hasHistoryAccess ? (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white md:text-5xl">
                Conversion History
              </h1>
              <p className="mt-3 text-lg text-slate-300">
                View your previous document conversions.
              </p>
            </div>

            <HistoryList />
          </>
        ) : (
          <section className="flex min-h-[50vh] items-center justify-center">
            <div className="w-full max-w-xl rounded-3xl border border-sky-400/20 bg-slate-950/70 p-8 text-center shadow-2xl shadow-sky-950/30 backdrop-blur md:p-10">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
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
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-sky-500 px-5 py-3 font-medium text-white transition hover:bg-sky-400"
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
