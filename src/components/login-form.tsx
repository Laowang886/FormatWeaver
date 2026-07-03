"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginMode = "guest" | "account";

type LoginFormProps = {
  initialMode?: LoginMode;
};

export default function LoginForm({ initialMode = "guest" }: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>(initialMode);
  const [email, setEmail] = useState("admin@formatweaver.com");
  const [password, setPassword] = useState("FormatWeaver123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enterGuestMode = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/guest", { method: "POST" });
      if (!response.ok) {
        throw new Error("游客进入失败，请稍后再试。");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (guestError) {
      setError(
        guestError instanceof Error
          ? guestError.message
          : "游客进入失败，请稍后再试。",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "guest") {
      await enterGuestMode();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data: { message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "登录失败，请检查账号信息。");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "登录失败，请稍后再试。",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 rounded-2xl bg-slate-950 p-1 ring-1 ring-slate-800">
        <button
          type="button"
          onClick={() => {
            setMode("guest");
            setError(null);
          }}
          className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
            mode === "guest"
              ? "bg-sky-500 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          游客模式
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("account");
            setError(null);
          }}
          className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
            mode === "account"
              ? "bg-sky-500 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          账号模式
        </button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">
            {mode === "guest" ? "游客进入" : "账号登录"}
          </h2>
          <p className="text-sm leading-6 text-slate-400">
            {mode === "guest"
              ? "游客模式无需密码，点击按钮即可进入。"
              : "默认演示账号已预填，直接提交即可体验完整登录流程。"}
          </p>
        </div>

        {mode === "account" ? (
          <>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">邮箱</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">密码</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="请输入密码"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </label>
          </>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm leading-6 text-slate-400">
            <p className="font-medium text-slate-200">游客模式说明</p>
            <p className="mt-2">
              你可以直接进入体验页面，不会要求输入账号密码；之后也可以随时切换到账号模式。
            </p>
          </div>
        )}

        {error ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-xl bg-sky-500 px-4 py-3 font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "进入中..."
            : mode === "guest"
              ? "以游客身份进入"
              : "登录并进入控制台"}
        </button>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm leading-6 text-slate-400">
          <p className="font-medium text-slate-200">测试账号</p>
          <p className="mt-2">邮箱：admin@formatweaver.com</p>
          <p>密码：FormatWeaver123!</p>
        </div>
      </form>
    </div>
  );
}
