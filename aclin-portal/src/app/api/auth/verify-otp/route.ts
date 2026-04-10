import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp";
import { createSession, COOKIE_NAME } from "@/lib/auth";
import { addAuditEntry } from "@/lib/audit";

// Rate limiter para verificación OTP
const otpRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkOtpRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 15;

  const record = otpRateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    otpRateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) return false;

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "";

  try {
    if (!checkOtpRateLimit(ip)) {
      addAuditEntry({
        event: "RATE_LIMIT",
        ip,
        userAgent,
        success: false,
        details: "Límite de intentos OTP excedido",
      });
      return NextResponse.json(
        { error: "Demasiados intentos. Intente nuevamente en 15 minutos." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { mfaToken, otp } = body;

    if (
      !mfaToken ||
      !otp ||
      typeof mfaToken !== "string" ||
      typeof otp !== "string"
    ) {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }

    const safeOtp = otp.trim().replace(/\D/g, "").slice(0, 6);
    if (safeOtp.length !== 6) {
      return NextResponse.json(
        { error: "El código debe tener 6 dígitos." },
        { status: 400 }
      );
    }

    const result = verifyOTP(mfaToken, safeOtp);

    if (!result.valid || !result.payload) {
      addAuditEntry({
        event: "OTP_FAILED",
        ip,
        userAgent,
        rut: result.payload?.rut,
        folio: result.payload?.folio,
        success: false,
        error: result.error,
      });
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const token = await createSession(result.payload);

    addAuditEntry({
      event: "OTP_SUCCESS",
      ip,
      userAgent,
      rut: result.payload.rut,
      folio: result.payload.folio,
      success: true,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
