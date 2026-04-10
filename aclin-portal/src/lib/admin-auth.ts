/**
 * Admin Authentication — Sesión separada del portal de pacientes
 * Cookie: aclin_admin_session | JWT 8h | Role: superadmin
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ||
    "aclin-admin-secret-key-change-in-production-2024"
);

export const ADMIN_COOKIE_NAME = "aclin_admin_session";

export interface AdminSessionPayload {
  username: string;
  role: "superadmin";
  iat?: number;
  exp?: number;
}

export async function createAdminSession(username: string): Promise<string> {
  return new SignJWT({ username, role: "superadmin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(ADMIN_JWT_SECRET);
}

export async function verifyAdminToken(
  token: string
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ADMIN_JWT_SECRET);
    return payload as unknown as AdminSessionPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

/** Para uso en middleware (recibe NextRequest, no usa cookies()) */
export async function verifyAdminSessionFromRequest(
  request: NextRequest
): Promise<AdminSessionPayload | null> {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function checkAdminCredentials(
  username: string,
  password: string
): boolean {
  const adminUser = process.env.ADMIN_USERNAME || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "aclin@2024";
  return username === adminUser && password === adminPass;
}
