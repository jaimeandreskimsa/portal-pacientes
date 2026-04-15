/**
 * OTP (One-Time Password) — segundo factor de autenticación
 *
 * Almacenamiento en memoria (igual que el rate limiter).
 * Para despliegues multi-instancia, migrar a Redis.
 *
 * En producción: conectar sendOTP() a un proveedor SMS/email (Twilio, AWS SNS, SendGrid, etc.)
 */

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutos
const MAX_ATTEMPTS = 5;
const TEMP_OTP_CODE = "123456";

interface OTPRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
  rut: string;
  folio: string;
  patientName: string;
}

// Token MFA → registro OTP
const otpStore = new Map<string, OTPRecord>();

// Limpiar entradas expiradas periódicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of otpStore.entries()) {
    if (now > record.expiresAt) {
      otpStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function generateOTP(): string {
  // Temporal: OTP fijo mientras se define la implementación de envío/verificación real.
  return TEMP_OTP_CODE;
}

export interface CreateOTPResult {
  mfaToken: string;
  otp: string;
}

export function createOTPSession(
  rut: string,
  folio: string,
  patientName: string
): CreateOTPResult {
  // Invalidar sesión OTP previa para este paciente (evitar acumulación)
  for (const [key, record] of otpStore.entries()) {
    if (record.rut === rut && record.folio === folio) {
      otpStore.delete(key);
    }
  }

  const mfaToken = crypto.randomUUID();
  const otp = generateOTP();

  otpStore.set(mfaToken, {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    rut,
    folio,
    patientName,
  });

  return { mfaToken, otp };
}

export interface VerifyOTPResult {
  valid: boolean;
  payload?: { rut: string; folio: string; patientName: string };
  error?: string;
}

export function verifyOTP(mfaToken: string, otp: string): VerifyOTPResult {
  const record = otpStore.get(mfaToken);

  if (!record) {
    return { valid: false, error: "Sesión expirada. Inicie el proceso nuevamente." };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(mfaToken);
    return { valid: false, error: "El código expiró. Inicie el proceso nuevamente." };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(mfaToken);
    return { valid: false, error: "Demasiados intentos. Inicie el proceso nuevamente." };
  }

  record.attempts++;

  if (record.otp !== otp.trim()) {
    const remaining = MAX_ATTEMPTS - record.attempts;
    return {
      valid: false,
      error: remaining > 0
        ? `Código incorrecto. ${remaining} intento${remaining !== 1 ? "s" : ""} restante${remaining !== 1 ? "s" : ""}.`
        : "Código incorrecto.",
    };
  }

  // Válido — eliminar del store
  otpStore.delete(mfaToken);

  return {
    valid: true,
    payload: { rut: record.rut, folio: record.folio, patientName: record.patientName },
  };
}

/**
 * Envío del OTP al paciente.
 *
 * DEV: imprime en consola (visible en terminal del servidor Next.js).
 * PROD: reemplazar con llamada a proveedor SMS o email.
 */
export async function sendOTP(otp: string, patientName: string): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n╔══════════════════════════════╗`);
    console.log(`║  ACLIN MFA — Código OTP      ║`);
    console.log(`║  Paciente: ${patientName.split(" ")[0].padEnd(18)} ║`);
    console.log(`║  Código:   ${otp}               ║`);
    console.log(`║  Expira en: 5 minutos        ║`);
    console.log(`╚══════════════════════════════╝\n`);
    return;
  }

  // TODO: Integrar proveedor SMS/email en producción
  // Ejemplo Twilio:
  // await twilioClient.messages.create({
  //   body: `Tu código de verificación ACLIN es: ${otp}. Válido por 5 minutos.`,
  //   to: patientPhone,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  // });
  console.warn("sendOTP: No hay proveedor SMS/email configurado en producción.");
}
