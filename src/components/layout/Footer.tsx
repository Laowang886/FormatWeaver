export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#060913]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-slate-500 sm:flex-row">
        <div>© {new Date().getFullYear()} FormatWeaver</div>
        <div className="flex gap-4">
          <a href="#" className="transition hover:text-slate-300">
            Privacy
          </a>
          <a href="#" className="transition hover:text-slate-300">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
