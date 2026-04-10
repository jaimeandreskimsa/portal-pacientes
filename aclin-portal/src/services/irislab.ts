/**
 * IRIS Lab Service
 *
 * This is the integration layer with IRIS Lab's web services.
 * Currently using mock data. When IRIS Lab provides their WSDL/REST docs,
 * replace the mock functions with real API calls — the rest of the portal stays unchanged.
 *
 * Expected integration: SOAP/REST web service (similar to iMed/GIS integrations)
 * Env vars needed: IRIS_ENDPOINT, IRIS_USERNAME, IRIS_PASSWORD
 */

export interface PatientInfo {
  rut: string;
  nombre: string;
  edad: number;
  fechaNacimiento: string;
  sexo: string;
}

export interface AttendanceInfo {
  numeroOrden: string;
  tomaMuestras: string;
  fechaAtencion: string;
  prevision: string;
  medico: string;
}

export interface Examen {
  codigo: string;
  descripcion: string;
  tipoPago: string;
  estado: "Disponible" | "En Proceso" | "Entregado";
  resultado?: string;
}

export interface PatientResults {
  paciente: PatientInfo;
  atencion: AttendanceInfo;
  examenes: Examen[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Replace this section with real IRIS Lab web service calls

const MOCK_RESULTS: PatientResults = {
  paciente: {
    rut: "11.111.11-1",
    nombre: "PACIENTE123 PRUEBA123",
    edad: 33,
    fechaNacimiento: "05/02/1988",
    sexo: "Masculino",
  },
  atencion: {
    numeroOrden: "019886940",
    tomaMuestras: "ACLIN NF",
    fechaAtencion: "17/01/2022",
    prevision: "PRESUPUESTO",
    medico: "MÉDICOS DISTINTOS",
  },
  examenes: [
    { codigo: "0303126", descripcion: "Tiroxina Libre (T4L)", tipoPago: "Sin Costo", estado: "Disponible" },
    { codigo: "0303108", descripcion: "Anticuerpos ENA (LA)", tipoPago: "Sin Costo", estado: "Disponible" },
    { codigo: "0303108", descripcion: "Anticuerpos ENA (Sm)", tipoPago: "Sin Costo", estado: "Disponible" },
    { codigo: "0303108", descripcion: "Anticuerpos ENA (RNP)", tipoPago: "Sin Costo", estado: "Disponible" },
    { codigo: "0305004", descripcion: "Anticuerpos ENA Screening", tipoPago: "Sin Costo", estado: "Disponible" },
    { codigo: "0303108", descripcion: "Anticuerpos ENA (RO)", tipoPago: "Sin Costo", estado: "Disponible" },
    { codigo: "0306044", descripcion: "FTA-ABS", tipoPago: "Sin Costo", estado: "Disponible" },
    { codigo: "0303022", descripcion: "Testosterona Total (Pool)", tipoPago: "Sin Costo", estado: "En Proceso" },
    { codigo: "98", descripcion: "Perfil Gastrointestinal Autoinmune (IgG)", tipoPago: "Sin Costo", estado: "En Proceso" },
    { codigo: "0306097", descripcion: "Panel Neisseria y Chlamydia por PCR", tipoPago: "Sin Costo", estado: "En Proceso" },
    { codigo: "030619", descripcion: "Quantiferon TB", tipoPago: "Sin Costo", estado: "En Proceso" },
    { codigo: "96", descripcion: "Perfil Citoplasmatico (IgG)", tipoPago: "Sin Costo", estado: "En Proceso" },
    { codigo: "95", descripcion: "Perfil Esclerosis Sistémica", tipoPago: "Sin Costo", estado: "En Proceso" },
    { codigo: "90", descripcion: "Perfil Hepatitis Autoinmune", tipoPago: "Sin Costo", estado: "En Proceso" },
    { codigo: "80", descripcion: "Perfil Miastria (OD5)", tipoPago: "Sin Costo", estado: "En Proceso" },
    { codigo: "81", descripcion: "Perfil Ana", tipoPago: "Sin Costo", estado: "En Proceso" },
    { codigo: "0306035", descripcion: "Haptoglobina", tipoPago: "Sin Costo", estado: "En Proceso" },
    { codigo: "0306022", descripcion: "Panel patógenos respiratorios viral por PCR", tipoPago: "Sin Costo", estado: "En Proceso" },
    { codigo: "030618", descripcion: "Panel patógenos respiratorios bacterianos por PCR", tipoPago: "Sin Costo", estado: "En Proceso" },
    { codigo: "0306099", descripcion: "Cultivo Streptococcus Grupo B Vaginal", tipoPago: "Sin Costo", estado: "En Proceso" },
    { codigo: "0306099", descripcion: "Cultivo Streptococcus Grupo B Perianal", tipoPago: "Sin Costo", estado: "En Proceso" },
    { codigo: "0302063", descripcion: "Transaminasas Pirúvica (GPT)", tipoPago: "Sin Costo", estado: "En Proceso" },
    { codigo: "0302063", descripcion: "Transaminasas Oxaloacética (GOT)", tipoPago: "Sin Costo", estado: "En Proceso" },
    { codigo: "0302075", descripcion: "Perfil Bioquímico", tipoPago: "Sin Costo", estado: "En Proceso" },
    { codigo: "0302076", descripcion: "Perfil Hepático", tipoPago: "Sin Costo", estado: "En Proceso" },
    { codigo: "0302076", descripcion: "Perfil Hepático", tipoPago: "Sin Costo", estado: "En Proceso" },
  ],
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get patient results from IRIS Lab.
 * @param identifier RUT or DNI/Pasaporte number
 * @param folio Order number (No. Folio)
 * @param type "rut" | "dni"
 */
export async function getPatientResults(
  identifier: string,
  folio: string,
  type: "rut" | "dni" = "rut"
): Promise<PatientResults | null> {
  // TODO: Replace with real IRIS Lab web service call
  // Example SOAP call:
  // const client = await soap.createClient(process.env.IRIS_ENDPOINT!);
  // const result = await client.GetResultadosAsync({ rut: identifier, folio, tipo: type });

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 800));

  // Mock validation: any non-empty rut + folio returns results
  if (!identifier || !folio) return null;

  return {
    ...MOCK_RESULTS,
    paciente: { ...MOCK_RESULTS.paciente, rut: identifier },
    atencion: { ...MOCK_RESULTS.atencion, numeroOrden: folio },
  };
}

/**
 * Get PDF data for a specific exam result.
 * Returns the full patient result set for PDF generation.
 */
export async function getResultsForPDF(
  identifier: string,
  folio: string
): Promise<PatientResults | null> {
  return getPatientResults(identifier, folio);
}

// ─── Health Check ─────────────────────────────────────────────────────────────

export interface IrisLabStatus {
  connected: boolean;
  lastChecked: string;
  responseTimeMs: number | null;
  error?: string;
  errorCode?: string;
  endpoint: string;
  mode: "mock" | "live";
}

/**
 * Verifica el estado de conexión con IRIS Lab.
 * Sin IRIS_ENDPOINT configurado → modo mock (desarrollo).
 */
export async function checkIrisLabConnection(): Promise<IrisLabStatus> {
  const endpoint = process.env.IRIS_ENDPOINT;
  const start = Date.now();

  if (!endpoint) {
    await new Promise((r) => setTimeout(r, 80 + Math.random() * 60));
    return {
      connected: true,
      lastChecked: new Date().toISOString(),
      responseTimeMs: Date.now() - start,
      endpoint: "Mock (Entorno de Desarrollo)",
      mode: "mock",
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${endpoint}?wsdl`, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "text/xml,application/xml" },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        connected: false,
        lastChecked: new Date().toISOString(),
        responseTimeMs: Date.now() - start,
        error: `El servidor respondió con HTTP ${response.status} ${response.statusText}`,
        errorCode: `HTTP_${response.status}`,
        endpoint,
        mode: "live",
      };
    }

    return {
      connected: true,
      lastChecked: new Date().toISOString(),
      responseTimeMs: Date.now() - start,
      endpoint,
      mode: "live",
    };
  } catch (err: unknown) {
    const error = err as Error;
    let errorCode = "CONNECTION_ERROR";
    let errorMsg = error.message || "Error de conexión desconocido";

    if (error.name === "AbortError") {
      errorCode = "TIMEOUT";
      errorMsg = "Tiempo de espera agotado (>6 segundos)";
    } else if (
      errorMsg.includes("ENOTFOUND") ||
      errorMsg.includes("ECONNREFUSED")
    ) {
      errorCode = "UNREACHABLE";
      errorMsg = "No se puede alcanzar el servidor. Verifique el endpoint.";
    } else if (
      errorMsg.includes("certificate") ||
      errorMsg.includes("SSL")
    ) {
      errorCode = "SSL_ERROR";
      errorMsg = "Error de certificado SSL/TLS";
    }

    return {
      connected: false,
      lastChecked: new Date().toISOString(),
      responseTimeMs: Date.now() - start,
      error: errorMsg,
      errorCode,
      endpoint,
      mode: "live",
    };
  }
}
