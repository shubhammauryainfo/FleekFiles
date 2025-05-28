
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Test JWT token
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    // Test server session
    const session = await getServerSession();
    
    return NextResponse.json(
        {
      environment: {
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "MISSING",
        NODE_ENV: process.env.NODE_ENV,
      },
      jwt_token: {
        exists: !!token,
        data: token
      },
      server_session: {
        exists: !!session,
        data: session?.user
      },
      cookies: req.cookies.getAll().map(cookie => ({
        name: cookie.name,
        hasValue: !!cookie.value
      }))
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}