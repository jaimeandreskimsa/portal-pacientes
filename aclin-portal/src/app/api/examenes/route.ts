import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPatientResults } from "@/services/irislab";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const results = await getPatientResults(session.rut, session.folio);

  if (!results) {
    return NextResponse.json(
      { error: "No se encontraron resultados." },
      { status: 404 }
    );
  }

  return NextResponse.json(results);
}
