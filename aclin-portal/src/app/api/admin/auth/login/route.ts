import { NextRequest, NextResponse } from "next/server";
import {
  checkAdminCredentials,
  createAdminSession,
  ADMIN_COOKIE_NAME,
} from "@/lib/admin-auth";
import { addAuditEntry } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "";

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 400 });
    }

    const valid = checkAdminCredentials(username.trim(), password);

    if (!valid) {
      addAuditEntry({
        event: "ADMIN_LOGIN",
        ip,
        userAgent,
        success: false,
        error: "Credenciales incorrectas",
        details: `Usuario: ${username.trim()}`,
      });
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos." },
        { status: 401 }
      );
    }

    const token = await createAdminSession(username.trim());

    addAuditEntry({
      event: "ADMIN_LOGIN",
      ip,
      userAgent,
      success: true,
      details: `Usuario: ${username.trim()}`,
    });

    const response = NextResponse.json({ success: true, username: username.trim() });
    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 8, // 8 horas
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
