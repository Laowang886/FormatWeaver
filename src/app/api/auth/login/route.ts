import { NextResponse } from "next/server";
import { signIn } from "@/auth";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request format." },
      { status: 400 },
    );
  }

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { message: "Please enter your email address and password." },
      { status: 400 },
    );
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return NextResponse.json({ message: "Login successful." });
  } catch {
    return NextResponse.json(
      { message: "The username or password is incorrect." },
      { status: 401 },
    );
  }
}
