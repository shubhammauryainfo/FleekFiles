import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongoose";
import { User } from "@/models/User";
import { logLoginActivity } from "@/lib/auth-utils";
import type { NextAuthOptions } from "next-auth";
import type { User as NextAuthUser, Account, Profile } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          phone: user.phone ?? null,
          provider: user.provider ?? null,
          role: user.role ?? "user",
          createdAt: user.createdAt?.toISOString() ?? null,
          updatedAt: user.updatedAt?.toISOString() ?? null,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? token.sub;
        token.name = user.name;
        token.email = user.email;
        token.provider = (user as any).provider;
        token.phone = (user as any).phone;
        token.role = (user as any).role ?? "user";
        token.createdAt = (user as any).createdAt ?? null;
        token.updatedAt = (user as any).updatedAt ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name ?? null;
        session.user.email = token.email ?? null;
        session.user.image = token.picture ?? token.image ?? null;
        (session.user as any).provider = token.provider ?? null;
        (session.user as any).phone = token.phone ?? null;
        (session.user as any).role = token.role ?? "user";
        (session.user as any).createdAt = token.createdAt ?? null;
        (session.user as any).updatedAt = token.updatedAt ?? null;
      }
      return session;
    },

    async signIn({
      user,
      account,
      profile,
      email,
      credentials,
    }: {
      user: NextAuthUser | AdapterUser;
      account: Account | null;
      profile?: Profile;
      email?: { verificationRequest?: boolean };
      credentials?: Record<string, any>;
    }) {
      await dbConnect();

      if (!user.email) return false;

      let existingUser = await User.findOne({ email: user.email });

      if (account?.provider === "google") {
        if (!existingUser) {
          const newUser = await User.create({
            name: user.name ?? "",
            email: user.email,
            provider: "google",
            role: "user",
          });
          user.id = newUser._id.toString();
          existingUser = newUser;
        } else {
          user.id = existingUser._id.toString();
        }

        (user as any).provider = existingUser.provider;
        (user as any).phone = existingUser.phone;
        (user as any).role = existingUser.role ?? "user";
        (user as any).createdAt = existingUser.createdAt?.toISOString() ?? null;
        (user as any).updatedAt = existingUser.updatedAt?.toISOString() ?? null;
      }

      try {
        const storedRequest = (global as any).__NEXT_AUTH_REQUEST__;
        await logLoginActivity(
          user.email,
          existingUser?._id.toString() || user.id,
          account?.provider || "credentials",
          storedRequest
        );
      } catch (error) {
        console.error("Failed to log login:", error);
      }

      return true;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
};

const baseHandler = NextAuth(authOptions);
export const auth = baseHandler.auth;
export const signIn = baseHandler.signIn;
export const signOut = baseHandler.signOut;
