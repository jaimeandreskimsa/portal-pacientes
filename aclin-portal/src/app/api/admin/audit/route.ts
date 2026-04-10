import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getAuditLog, type AuditEventType } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100"), 500);
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const event = searchParams.get("event") as AuditEventType | null;
  const search = searchParams.get("search") ?? undefined;

  const result = getAuditLog(limit, offset, {
    event: event ?? undefined,
    search,
  });

  return NextResponse.json(result);
}
