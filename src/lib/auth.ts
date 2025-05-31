import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongoose";
import { User } from "@/models/User";
import { LoginLog } from "@/models/LoginLog";
import { UAParser } from "ua-parser-js";
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
      }
      return session;
    },

    async signIn({ 
      user, 
      account, 
      profile,
      email,
      credentials 
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
          });
          user.id = newUser._id.toString();
          existingUser = newUser;
        } else {
          user.id = existingUser._id.toString();
          (user as any).provider = existingUser.provider;
          (user as any).phone = existingUser.phone;
        }
      }
    
      // ✅ Log login with IP & device
      try {
        // Access request from NextAuth's internal context
        const req = (global as any).__NEXTAUTH_INTERNAL_REQUEST__ || {};
        const ip = req.headers?.["x-forwarded-for"]?.toString().split(",")[0] || 
                   req.connection?.remoteAddress || 
                   req.socket?.remoteAddress || 
                   "Unknown IP";
        const ua = req.headers?.["user-agent"] || "Unknown UA";
    
        const parser = new UAParser();
        parser.setUA(ua);
        const result = parser.getResult();
        const device = `${result.device.type || "Desktop"} - ${result.os.name} ${result.os.version}`;
    
        await LoginLog.create({
          email: user.email,
          userId: existingUser?._id.toString() || user.id,
          provider: account?.provider || "credentials",
          ip,
          device,
        });
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export const auth = handler.auth;
export const signIn = handler.signIn;
export const signOut = handler.signOut;