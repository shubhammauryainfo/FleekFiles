import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("🔒 Middleware running for:", pathname);

  // Allow public API routes
  if (pathname.startsWith("/api")) {
    if (pathname.startsWith("/api/public") || pathname.startsWith("/api/auth")) {
      console.log("✅ Public API route - no auth required");
      return NextResponse.next();
    }

    const apiKey = request.headers.get("x-api-key");
    const validApiKey = process.env.NEXT_PUBLIC_API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
      console.log("❌ Unauthorized API access");
      return new NextResponse(
        JSON.stringify({
          error: "Unauthorized",
          message: "Missing or invalid API key. To request access, contact: shubham@nexbytes.in"
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.log("✅ API request authorized");
    return NextResponse.next();
  }

  // Get JWT token from session
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const isAuthPage = pathname.startsWith("/auth");
  const isPublicPath = pathname === "/" || pathname.startsWith("/about");
  const isStaticFile = pathname.includes(".") || pathname.startsWith("/_next");

  // Allow public or auth pages
  if (isAuthPage || isPublicPath || isStaticFile) {
    console.log("✅ Public route - no auth required");
    return NextResponse.next();
  }

  // Handle dashboard route - only allow if role === "admin"
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      console.log("❌ Unauthenticated access to /dashboard");
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    const userRole = token.role;
    if (userRole !== "admin") {
      console.log("❌ User role not authorized for /dashboard");
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    console.log("✅ Admin access to /dashboard");
    return NextResponse.next();
  }

  // Other protected routes
  const protectedRoutes = ["/files", "/upload"];
  const isProtected = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  );

  if (isProtected && !token) {
    console.log("❌ Unauthorized access to protected route");
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  console.log("✅ Request authorized");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
