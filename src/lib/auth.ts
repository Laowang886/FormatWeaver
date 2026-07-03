import crypto from "crypto";

export type AuthUser = {
  email: string;
  name: string;
  mode: AuthMode;
};

export type AuthMode = "guest" | "account";

type SessionPayload = {
  mode: AuthMode;
  email: string;
};

export const SESSION_COOKIE_NAME = "formatweaver_session";

const DEMO_USER: AuthUser = {
  email: "admin@formatweaver.com",
  name: "FormatWeaver Admin",
  mode: "account",
};

const GUEST_USER: AuthUser = {
  email: "guest@formatweaver.com",
  name: "Guest Explorer",
  mode: "guest",
};

const DEMO_PASSWORD = "FormatWeaver123!";
const SESSION_SECRET = "formatweaver-demo-session-secret";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidCredentials(email: string, password: string) {
  return (
    normalizeEmail(email) === DEMO_USER.email && password === DEMO_PASSWORD
  );
}

export function createSessionToken(email: string) {
  return crypto
    .createHash("sha256")
    .update(`${normalizeEmail(email)}:${SESSION_SECRET}`)
    .digest("hex");
}

export function createGuestSessionToken() {
  return createSessionToken(GUEST_USER.email);
}

export function buildSessionPayload(
  email: string,
  mode: AuthMode,
): SessionPayload {
  return {
    mode,
    email: normalizeEmail(email),
  };
}

export function serializeSession(payload: SessionPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const signature = crypto
    .createHash("sha256")
    .update(`${encodedPayload}:${SESSION_SECRET}`)
    .digest("hex");

  return `${encodedPayload}.${signature}`;
}

export function createAccountSessionToken(email: string) {
  return serializeSession(buildSessionPayload(email, "account"));
}

export function createGuestSession() {
  return serializeSession(buildSessionPayload(GUEST_USER.email, "guest"));
}

export function getUserFromSessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHash("sha256")
    .update(`${encodedPayload}:${SESSION_SECRET}`)
    .digest("hex");

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (payload.mode === "guest") {
      return GUEST_USER;
    }

    if (payload.mode === "account" && payload.email === DEMO_USER.email) {
      return DEMO_USER;
    }
  } catch {
    return null;
  }

  return null;
}

export function getDemoUser() {
  return DEMO_USER;
}

export function getGuestUser() {
  return GUEST_USER;
}
