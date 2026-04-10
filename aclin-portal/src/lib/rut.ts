/**
 * Chilean RUT validation and formatting utilities
 */

/** Removes dots and hyphens from a RUT string */
export function cleanRut(rut: string): string {
  return rut.replace(/[.\-]/g, "").toUpperCase().trim();
}

/** Formats a clean RUT to XX.XXX.XXX-X format */
export function formatRut(rut: string): string {
  const clean = cleanRut(rut);
  if (clean.length < 2) return clean;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  let formatted = "";
  let count = 0;

  for (let i = body.length - 1; i >= 0; i--) {
    formatted = body[i] + formatted;
    count++;
    if (count % 3 === 0 && i !== 0) {
      formatted = "." + formatted;
    }
  }

  return `${formatted}-${dv}`;
}

/** Validates a Chilean RUT checksum */
export function validateRut(rut: string): boolean {
  const clean = cleanRut(rut);

  if (clean.length < 2) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();

  if (!/^\d+$/.test(body)) return false;

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  let expectedDv: string;

  if (remainder === 11) expectedDv = "0";
  else if (remainder === 10) expectedDv = "K";
  else expectedDv = remainder.toString();

  return dv === expectedDv;
}

/** Auto-formats RUT input as user types */
export function autoFormatRut(value: string): string {
  const clean = value.replace(/[^\dkK]/g, "").toUpperCase();
  if (clean.length === 0) return "";
  if (clean.length <= 1) return clean;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  let formatted = "";
  let count = 0;

  for (let i = body.length - 1; i >= 0; i--) {
    formatted = body[i] + formatted;
    count++;
    if (count % 3 === 0 && i !== 0) {
      formatted = "." + formatted;
    }
  }

  return `${formatted}-${dv}`;
}
