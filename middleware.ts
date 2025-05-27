import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Log to verify middleware is running
  console.log("🔐 Middleware triggered for:", pathname);

  // Define protected routes (App Router)
  const protectedRoutes = ["/files", "/upload"];
  const isProtected = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
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

export const config = {
    // Match all routes except static files and API
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)"],
  };
  