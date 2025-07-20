// src/app/api/me/route.ts
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({
      id: null,
      name: null,
      email: null,
    });
  }

  return NextResponse.json({
    id: token.id ?? token.sub ?? null,
    name: token.name,
    email: token.email,
    role: token.role,  // image: token.picture ?? token.image ?? null,
    // provider: token.provider ?? null,
    // phone: token.phone ?? null,
  });
}
