export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#080b12]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6 text-sm text-slate-400">
        <div>© {new Date().getFullYear()} FormatWeaver</div>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">
            Privacy
          </a>
          <a href="#" className="hover:underline">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
