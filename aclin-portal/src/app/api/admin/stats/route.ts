import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getAuditStats } from "@/lib/audit";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const stats = getAuditStats();
  return NextResponse.json(stats);
}
