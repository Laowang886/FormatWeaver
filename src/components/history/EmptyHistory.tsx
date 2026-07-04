import Link from "next/link";

export default function EmptyHistory() {
  return (
    <div className="rounded-3xl bg-slate-900/60 px-6 py-16 text-center">
      <h2 className="text-2xl font-semibold text-white">
        No conversion history yet.
      </h2>
      <p className="mt-3 text-slate-300">
        Your completed conversions will appear here.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-xl bg-sky-500 px-5 py-3 font-medium text-white transition hover:bg-sky-400"
      >
        Start Converting
      </Link>
    </div>
  );
}
