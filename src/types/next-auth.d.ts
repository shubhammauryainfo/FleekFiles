// src/types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phone?: string | null;
      provider?: string | null;
      role?: "user" | "admin" | null;
      createdAt?: string | null;
      updatedAt?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    phone?: string | null;
    provider?: string | null;
    password?: string;
    role?: "user" | "admin" | null;
    createdAt?: string | null;
    updatedAt?: string | null;
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
    role?: "user" | "admin" | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    sub?: string;
  }
}
