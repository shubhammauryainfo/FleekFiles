import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Log middleware execution
  console.log("🔒 Middleware running on:", pathname);

  // ✅ Allow public routes and static files
  const publicPaths = ["/auth", "/_next", "/favicon.ico", "/logo.png"];
  if (
    publicPaths.some(path => pathname.startsWith(path)) ||
    pathname.includes(".") // for static assets
  ) {
    return NextResponse.next();
  }

  // ✅ Protected routes
  const protectedRoutes = ["/files", "/upload"];
  const isProtected = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

// ✅ Define the matcher only for protected routes
export const config = {
  matcher: ["/files/:path*", "/upload/:path*"],
};
