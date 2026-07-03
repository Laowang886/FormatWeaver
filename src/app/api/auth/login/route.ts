import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  createAccountSessionToken,
  getDemoUser,
  isValidCredentials,
} from "@/lib/auth";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "请求格式不正确。" }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { message: "请输入邮箱和密码。" },
      { status: 400 },
    );
  }

  if (!isValidCredentials(email, password)) {
    return NextResponse.json(
      { message: "账号或密码不正确。" },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    message: "登录成功。",
    user: getDemoUser(),
  });

  response.cookies.set(SESSION_COOKIE_NAME, createAccountSessionToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
