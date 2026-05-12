import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionPayload, UserRole } from "@/types";

const COOKIE_NAME = "fg_token";
const EXPIRY = "7d";

function getSecret(): Uint8Array {
  // Fallback keeps dev working without .env.local — replace in production
  return new TextEncoder().encode(
    process.env.JWT_SECRET ?? "fallback-dev-secret-change-me"
  );
}

/** Sign a JWT and set it as an httpOnly cookie */
export async function createSession(payload: Omit<SessionPayload, "iat" | "exp">) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .setSubject(payload.sub)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return token;
}

/** Read and verify the session from the cookie */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Delete the session cookie */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Assert the current session has the required role */
export async function requireRole(role: UserRole): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  if (role === "admin" && session.role !== "admin") throw new Error("Forbidden");
  return session;
}
