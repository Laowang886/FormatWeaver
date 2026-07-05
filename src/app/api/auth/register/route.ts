import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { validatePassword } from "@/lib/password-policy";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      password?: unknown;
      name?: unknown;
    };
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email address and password cannot be empty." },
        { status: 400 },
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ message: passwordError }, { status: 400 });
    }

    // Check if the email address has already been registered.
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "This email is already registered." },
        { status: 409 },
      );
    }

    // Encryption password (10 is salt rounds; the larger the value, the more secure but slower it is; 10 is a commonly used value)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Write to database
    await db.insert(users).values({
      email,
      name: name || email.split("@")[0],
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "Registration successful." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json(
      { message: "Server error, please try again later." },
      { status: 500 },
    );
  }
}
