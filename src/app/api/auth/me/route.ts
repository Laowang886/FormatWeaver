import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { SESSION_COOKIE_NAME, getUserFromSessionToken } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (session?.user) {
    return NextResponse.json({
      user: {
        name: session.user.name,
        email: session.user.email,
        canViewHistory: true,
      },
    });
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const cookieUser = getUserFromSessionToken(sessionToken);

  if (!cookieUser) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      name: cookieUser.name,
      email: cookieUser.email,
      canViewHistory: cookieUser.mode === "account",
    },
  });
}
