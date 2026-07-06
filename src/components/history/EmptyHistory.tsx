import Link from "next/link";

export default function EmptyHistory() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0b1220] px-6 py-16 text-center sm:py-20">
      <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-slate-900 text-cyan-300 ring-1 ring-slate-800">
        <span className="text-lg">↻</span>
      </div>
      <h2 className="text-xl font-semibold text-white sm:text-2xl">
        No conversion history yet.
      </h2>
      <p className="mt-3 text-slate-400">
        Your completed conversions will appear here.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
      >
        Start Converting
      </Link>
    </div>
  );
}
