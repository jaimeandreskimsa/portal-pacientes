import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "aclin-portal-secret-key-change-in-production-2024"
);

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ||
    "aclin-admin-secret-key-change-in-production-2024"
);

const PROTECTED_ROUTES = ["/resultados"];
const AUTH_ROUTES = ["/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin routes ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // /admin/login es siempre pública
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const adminToken = request.cookies.get("aclin_admin_session")?.value;
    let isValidAdmin = false;

    if (adminToken) {
      try {
        await jwtVerify(adminToken, ADMIN_JWT_SECRET);
        isValidAdmin = true;
      } catch {
        isValidAdmin = false;
      }
    }

    if (!isValidAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  // ── Patient portal routes ────────────────────────────────────────────────
  const token = request.cookies.get("aclin_session")?.value;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  let isValidSession = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isValidSession = true;
    } catch {
      isValidSession = false;
    }
  }

  if (isProtected && !isValidSession) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isValidSession) {
    return NextResponse.redirect(new URL("/resultados", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons).*)",
  ],
};
