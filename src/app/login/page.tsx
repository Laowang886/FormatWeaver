import LoginForm from "@/components/login-form";
import { X } from "lucide-react";
import Link from "next/link";

type LoginPageProps = {
  searchParams?: Promise<{ mode?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialMode =
    resolvedSearchParams?.mode === "account" ? "account" : "guest";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-emerald-950/20 backdrop-blur">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />

          <Link
            href="/"
            aria-label="Cancel and return home"
            className="absolute right-4 top-4 z-10 rounded-full border border-slate-700/80 bg-slate-900/70 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Link>

          <div className="p-6 sm:p-8 lg:p-10">
            <LoginForm initialMode={initialMode} />
          </div>
        </div>
      </section>
    </main>
  );
}
