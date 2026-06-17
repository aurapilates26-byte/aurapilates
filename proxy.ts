import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  canAccessDashboardPath,
  parseDashboardRole,
  staffLandingPath,
} from "@/lib/admin/access";
import { resolveAuthSecret } from "@/lib/auth-secret";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: resolveAuthSecret() });
  if (!token) {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const role = parseDashboardRole(typeof token.role === "string" ? token.role : undefined);
  if (!canAccessDashboardPath(pathname, role)) {
    const target =
      role === "MEMBRE" ? "/dashboard" : staffLandingPath(role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN");
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
