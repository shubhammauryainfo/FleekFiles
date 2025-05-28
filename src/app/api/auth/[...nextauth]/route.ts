import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongoose";
import { User } from "@/models/User";
import type { NextAuthOptions } from "next-auth";

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
        token.id = (user as any).id ?? (user as any).sub;
        token.name = user.name;
        token.email = user.email;
        token.provider = (user as any).provider;
        token.phone = (user as any).phone;
      }
      return token;
    },
  
    async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id ?? token.sub ?? null;
      session.user.name = token.name ?? null;
      session.user.email = token.email ?? null;
      session.user.image = token.image ?? null;
      session.user.provider = token.provider ?? null;
      session.user.phone = token.phone ?? null;
    }
    return session;
  },

  
    async signIn({ user, account }) {
      await dbConnect();
      if (account?.provider === "google" && user.email) {
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name ?? "",
            email: user.email,
            provider: "google",
          });
        }
      }
      return true;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
