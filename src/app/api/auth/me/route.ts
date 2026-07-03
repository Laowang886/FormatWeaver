import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, getUserFromSessionToken } from "@/lib/auth";

export async function GET(request: Request) {
  const sessionToken = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`))
    ?.slice(SESSION_COOKIE_NAME.length + 1);

  const user = getUserFromSessionToken(sessionToken);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
