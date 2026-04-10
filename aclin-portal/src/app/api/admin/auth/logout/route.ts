import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getAdminSession } from "@/lib/admin-auth";
import { addAuditEntry } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "";
  const session = await getAdminSession();

  addAuditEntry({
    event: "ADMIN_LOGOUT",
    ip,
    userAgent,
    success: true,
    details: session ? `Usuario: ${session.username}` : undefined,
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}
