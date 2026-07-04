import { NextResponse } from "next/server";
import { signOut } from "@/auth";

export async function POST(request: Request) {
  await signOut({ redirect: false });

  return NextResponse.json({ message: "Logout." });
}
