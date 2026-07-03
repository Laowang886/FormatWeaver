import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, getUserFromSessionToken } from "@/lib/auth";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = getUserFromSessionToken(sessionToken);

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020617_0%,#0f172a_100%)] px-6 py-10 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl shadow-sky-950/20 md:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.2em] text-sky-300">
                Dashboard
              </p>
              <h1 className="text-3xl font-semibold md:text-5xl">
                {user.mode === "guest"
                  ? "欢迎，游客朋友"
                  : `欢迎回来，${user.name}`}
              </h1>
              <p className="max-w-2xl text-slate-300">
                {user.mode === "guest"
                  ? "你当前处于游客模式，可先浏览核心功能；需要保存数据时再切换到账号模式。"
                  : "你已经通过后端接口完成登录。这里是一个受保护的页面示例，后续可以继续接入真实数据库、权限和文件处理能力。"}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-medium text-slate-100 transition hover:border-slate-500"
              >
                返回首页
              </Link>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-rose-500 px-5 py-3 font-medium text-white transition hover:bg-rose-400"
                >
                  退出登录
                </button>
              </form>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["已登录用户", user.email],
              [
                "当前模式",
                user.mode === "guest" ? "Guest Mode" : "Account Mode",
              ],
              ["后端接口", "/api/auth/guest / login / logout / me"],
            ].map(([title, value]) => (
              <div
                key={title}
                className="rounded-2xl bg-slate-900/80 p-5 ring-1 ring-white/5"
              >
                <p className="text-sm text-slate-400">{title}</p>
                <p className="mt-2 font-medium text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
