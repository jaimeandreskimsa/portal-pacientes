import { NextRequest, NextResponse } from "next/server";
import { getPatientResults } from "@/services/irislab";
import { cleanRut, validateRut } from "@/lib/rut";
import { createOTPSession, sendOTP } from "@/lib/otp";
import { addAuditEntry } from "@/lib/audit";

// Simple in-memory rate limiter (use Redis for multi-instance deployments)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 10;

  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "";

  try {
    // Rate limiting
    if (!checkRateLimit(ip)) {
      addAuditEntry({
        event: "RATE_LIMIT",
        ip,
        userAgent,
        success: false,
        details: "Límite de intentos de login excedido",
      });
      return NextResponse.json(
        { error: "Demasiados intentos. Intente nuevamente en 15 minutos." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { identifier, folio, type = "rut" } = body;

    // Input validation
    if (!identifier || !folio) {
      return NextResponse.json(
        { error: "RUT/DNI y número de folio son requeridos." },
        { status: 400 }
      );
    }

    if (typeof identifier !== "string" || typeof folio !== "string") {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }

    // RUT validation
    if (type === "rut") {
      const cleanedRut = cleanRut(identifier);
      if (!validateRut(cleanedRut)) {
        addAuditEntry({
          event: "LOGIN_FAILED",
          ip,
          userAgent,
          rut: identifier,
          success: false,
          error: "RUT inválido",
        });
        return NextResponse.json(
          { error: "RUT inválido. Verifique el formato." },
          { status: 400 }
        );
      }
    }

    const safeIdentifier = identifier.trim().slice(0, 20);
    const safeFolio = folio.trim().replace(/\D/g, "").slice(0, 15);

    if (!safeFolio) {
      return NextResponse.json(
        { error: "Número de folio inválido." },
        { status: 400 }
      );
    }

    // Registrar intento
    addAuditEntry({
      event: "LOGIN_ATTEMPT",
      ip,
      userAgent,
      rut: safeIdentifier,
      folio: safeFolio,
      success: true,
    });

    // Query IRIS Lab
    const results = await getPatientResults(safeIdentifier, safeFolio, type);

    if (!results) {
      addAuditEntry({
        event: "LOGIN_FAILED",
        ip,
        userAgent,
        rut: safeIdentifier,
        folio: safeFolio,
        success: false,
        error: "Paciente no encontrado en IRIS Lab",
      });
      return NextResponse.json(
        { error: "No se encontraron resultados para los datos ingresados." },
        { status: 404 }
      );
    }

    const { mfaToken, otp } = createOTPSession(
      safeIdentifier,
      safeFolio,
      results.paciente.nombre
    );

    await sendOTP(otp, results.paciente.nombre);

    addAuditEntry({
      event: "OTP_SENT",
      ip,
      userAgent,
      rut: safeIdentifier,
      folio: safeFolio,
      success: true,
    });

    return NextResponse.json({
      mfaRequired: true,
      mfaToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
