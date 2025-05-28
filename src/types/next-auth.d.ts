// src/types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phone?: string | null;
      provider?: string | null;
    };
  }

  interface User {
    id?: string; 
    name?: string | null;
    email: string;
    image?: string | null;
    phone?: string | null;
    provider?: string | null;
    password?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    phone?: string | null;
    provider?: string | null;
    sub?: string;
  }
}
