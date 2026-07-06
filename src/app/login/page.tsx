import LoginForm from "@/components/login-form";
import { X } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#060913] text-white">
      <Header />
      <main className="flex flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <section className="mx-auto flex w-full max-w-5xl items-center justify-center">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1220] shadow-2xl shadow-black/20">
            <Link
              href="/"
              aria-label="Cancel and return home"
              className="absolute right-4 top-4 z-10 rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Link>

            <div className="p-6 sm:p-8 lg:p-10">
              <LoginForm initialMode="account" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
