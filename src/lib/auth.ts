// src/lib/auth.ts (create this new file)
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
        token.id = user.id ?? token.sub;
        token.name = user.name;
        token.email = user.email;
        token.provider = user.provider;
        token.phone = user.phone;
      }
      return token;
    },
      
    async session({ session, token}) {
      
      if (session.user) {
        session.user.name = token.name ?? null;
        session.user.email = token.email ?? null;
        session.user.image = token.picture ?? token.image ?? null;
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
          const newUser = await User.create({
            name: user.name ?? "",
            email: user.email,
            provider: "google",
          });
         
          user.id = newUser._id.toString();
        } else {
       
          user.id = existingUser._id.toString();
          user.provider = existingUser.provider;
          user.phone = existingUser.phone;
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
export const auth = handler.auth;
export const signIn = handler.signIn;
export const signOut = handler.signOut;