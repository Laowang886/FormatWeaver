import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  createGuestSession,
  getGuestUser,
} from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({
    message: "以游客身份进入成功。",
    user: getGuestUser(),
  });

  response.cookies.set(SESSION_COOKIE_NAME, createGuestSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 2,
  });

  return response;
}
