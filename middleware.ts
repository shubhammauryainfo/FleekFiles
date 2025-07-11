import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Log middleware execution
  console.log("🔒 Middleware running on:", pathname);
  
  // ✅ Allow public routes and static files
  const publicPaths = ["/auth", "/_next", "/favicon.ico", "/logo.png", "/api/auth"];
  if (
    publicPaths.some(path => pathname.startsWith(path)) ||
    pathname.includes(".") // for static assets
  ) {
    console.log("✅ Public path, allowing access");
    return NextResponse.next();
  }
  
  // ✅ Protected routes
  const protectedRoutes = ["/files", "/upload"];
  const isProtected = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  if (isProtected) {
    console.log("🔐 Protected route detected, checking authentication...");
    
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        // Add these options for better token handling
        secureCookie: process.env.NODE_ENV === "production",
        cookieName: process.env.NODE_ENV === "production" 
          ? "__Secure-next-auth.session-token" 
          : "next-auth.session-token"
      });
      
      console.log("Token found:", !!token);
      
      if (!token) {
        console.log("❌ No token found, redirecting to sign-in");
        const signInUrl = new URL("/auth/signin", request.url);
        signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
      }
      
      console.log("✅ Valid token, allowing access");
    } catch (error) {
      console.error("Error getting token:", error);
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  return NextResponse.next();
}

// ✅ Define the matcher for protected routes
export const config = {
  matcher: [
    // Match protected routes
    "/files/:path*", 
    "/upload/:path*",
    // Exclude API routes and static files
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)"
  ],
};