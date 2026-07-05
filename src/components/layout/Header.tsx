import { cookies } from "next/headers";
import { auth } from "@/auth";
import HeaderClient, {
  type HeaderUser,
} from "@/components/layout/HeaderClient";
import { SESSION_COOKIE_NAME, getUserFromSessionToken } from "@/lib/auth";

export default async function Header() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const cookieUser = getUserFromSessionToken(sessionToken);
  const session = await auth();
  const authUser = session?.user;
  const user: HeaderUser | null = authUser
    ? {
        name: authUser.name ?? authUser.email ?? "Account",
        email: authUser.email ?? null,
        canViewHistory: true,
      }
    : cookieUser
      ? {
          name: cookieUser.name,
          email: cookieUser.email,
          canViewHistory: cookieUser.mode === "account",
        }
      : null;

  return <HeaderClient initialUser={user} />;
}
