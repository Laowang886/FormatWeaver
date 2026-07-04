import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email address and password cannot be empty." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long." },
        { status: 400 },
      );
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
      name: name ?? email.split("@")[0],
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
