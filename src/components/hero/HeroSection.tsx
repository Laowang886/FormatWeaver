export default function HeroSection() {
  return (
    <section className="bg-[#080b12]">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_360px] lg:items-end">
        <div className="space-y-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300">
            FormatWeaver
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl">
            Convert documents without leaving the workflow.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            Pick a conversion, drop files, tune the output, and download the
            result from one focused workspace.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          {[
            ["10", "formats"],
            ["Queue", "background jobs"],
            ["Local", "file storage"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="text-lg font-semibold text-white">{value}</div>
              <div className="mt-1 text-xs leading-5 text-slate-400">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
