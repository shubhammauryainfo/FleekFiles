import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Log middleware execution
  console.log("🔒 Middleware running on:", pathname);

  // Allow public routes and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/auth") ||
    pathname.includes(".") // static files like .ico, .png, etc.
  ) {
    return NextResponse.next();
  }

  // Protected routes
  const protectedRoutes = ["/files", "/upload"];
  const isProtected = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(route + "/")
  );

  if (isProtected) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

// ✅ Define where the middleware applies
export const config = {
  matcher: ["/files/:path*", "/upload/:path*"],
};
