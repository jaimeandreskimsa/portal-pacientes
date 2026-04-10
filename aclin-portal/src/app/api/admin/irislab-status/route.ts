import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { checkIrisLabConnection } from "@/services/irislab";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const status = await checkIrisLabConnection();
  return NextResponse.json(status);
}
