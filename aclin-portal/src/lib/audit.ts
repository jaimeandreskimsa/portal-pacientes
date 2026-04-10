/**
 * Audit Log — Registro de auditoría del sistema ACLIN Portal
 * Almacena todos los eventos de acceso. In-memory con global singleton
 * para persistir entre hot-reloads en desarrollo.
 */

export type AuditEventType =
  | "LOGIN_ATTEMPT"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "OTP_SENT"
  | "OTP_SUCCESS"
  | "OTP_FAILED"
  | "LOGOUT"
  | "PDF_DOWNLOAD"
  | "EXAM_VIEW"
  | "ADMIN_LOGIN"
  | "ADMIN_LOGOUT"
  | "RATE_LIMIT";

export interface AuditEntry {
  id: string;
  timestamp: string;
  event: AuditEventType;
  ip: string;
  userAgent: string;
  rut?: string;
  folio?: string;
  success: boolean;
  error?: string;
  details?: string;
}

export interface AuditStats {
  totalEntries: number;
  today: {
    total: number;
    loginAttempts: number;
    loginSuccess: number;
    loginFailed: number;
    pdfDownloads: number;
    otpSuccess: number;
    rateLimits: number;
  };
  lastHour: {
    total: number;
    loginAttempts: number;
  };
}

const MAX_ENTRIES = 2000;

// Global singleton para persistir entre hot-reloads de Next.js dev
declare global {
  // eslint-disable-next-line no-var
  var _aclinAuditLog: AuditEntry[] | undefined;
}

const auditLog: AuditEntry[] =
  globalThis._aclinAuditLog ?? (globalThis._aclinAuditLog = []);

function maskRut(rut: string): string {
  const idx = rut.lastIndexOf("-");
  if (idx !== -1) return rut.slice(0, idx + 1) + "*";
  return rut.slice(0, -1) + "*";
}

export function addAuditEntry(
  entry: Omit<AuditEntry, "id" | "timestamp">
): void {
  const newEntry: AuditEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry,
    rut: entry.rut ? maskRut(entry.rut) : undefined,
  };

  auditLog.unshift(newEntry);

  if (auditLog.length > MAX_ENTRIES) {
    auditLog.length = MAX_ENTRIES;
  }
}

export function getAuditLog(
  limit = 100,
  offset = 0,
  filter?: { event?: AuditEventType; search?: string }
): { entries: AuditEntry[]; total: number } {
  let filtered = auditLog;

  if (filter?.event) {
    filtered = filtered.filter((e) => e.event === filter.event);
  }

  if (filter?.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.ip.includes(s) ||
        e.rut?.toLowerCase().includes(s) ||
        e.folio?.includes(s) ||
        e.event.toLowerCase().includes(s)
    );
  }

  return {
    entries: filtered.slice(offset, offset + limit),
    total: filtered.length,
  };
}

export function getAuditStats(): AuditStats {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const oneHourMs = 60 * 60 * 1000;

  const today = auditLog.filter(
    (e) => now - new Date(e.timestamp).getTime() < oneDayMs
  );
  const lastHour = auditLog.filter(
    (e) => now - new Date(e.timestamp).getTime() < oneHourMs
  );

  return {
    totalEntries: auditLog.length,
    today: {
      total: today.length,
      loginAttempts: today.filter((e) => e.event === "LOGIN_ATTEMPT").length,
      loginSuccess: today.filter((e) => e.event === "OTP_SUCCESS").length,
      loginFailed: today.filter((e) => e.event === "LOGIN_FAILED").length,
      pdfDownloads: today.filter((e) => e.event === "PDF_DOWNLOAD").length,
      otpSuccess: today.filter((e) => e.event === "OTP_SUCCESS").length,
      rateLimits: today.filter((e) => e.event === "RATE_LIMIT").length,
    },
    lastHour: {
      total: lastHour.length,
      loginAttempts: lastHour.filter((e) => e.event === "LOGIN_ATTEMPT").length,
    },
  };
}
