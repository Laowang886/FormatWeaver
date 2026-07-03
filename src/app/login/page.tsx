import LoginForm from "@/components/login-form";
import Link from "next/link";

type LoginPageProps = {
  searchParams?: Promise<{ mode?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialMode =
    resolvedSearchParams?.mode === "account" ? "account" : "guest";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] px-6 py-10 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70 shadow-2xl shadow-sky-950/20 backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-between gap-10 p-8 md:p-12">
            <div className="space-y-6">
              <Link
                href="/"
                className="text-sm text-slate-400 hover:text-slate-200"
              >
                ← 返回首页
              </Link>

              <div className="inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-300">
                游客模式 + 账号模式
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
                  进入 FormatWeaver
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-300 md:text-lg">
                  你可以直接以游客身份进入，也可以切换到账号模式完成完整登录。
                </p>
              </div>
            </div>

            <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
              {[
                ["游客模式", "无需密码，点击即可进入。"],
                ["账号模式", "邮箱 + 密码验证后进入。"],
                ["自动识别", "页面会显示当前模式与用户状态。"],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-white/5"
                >
                  <p className="font-medium text-white">{title}</p>
                  <p className="mt-2 leading-6 text-slate-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 bg-slate-900/60 p-8 md:p-12 lg:border-l lg:border-t-0">
            <LoginForm initialMode={initialMode} />
          </div>
        </div>
      </section>
    </main>
  );
}
