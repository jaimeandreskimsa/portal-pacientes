import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getResultsForPDF } from "@/services/irislab";
import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { AclinPDFDocument } from "@/components/AclinPDFDocument";
import { addAuditEntry } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "";
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const results = await getResultsForPDF(session.rut, session.folio);

  if (!results) {
    return NextResponse.json(
      { error: "No se encontraron resultados." },
      { status: 404 }
    );
  }

  const pdfBuffer = await renderToBuffer(
    createElement(AclinPDFDocument, { results }) as ReactElement<DocumentProps>
  );

  addAuditEntry({
    event: "PDF_DOWNLOAD",
    ip,
    userAgent,
    rut: session.rut,
    folio: session.folio,
    success: true,
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="resultados-aclin-${session.folio}.pdf"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
