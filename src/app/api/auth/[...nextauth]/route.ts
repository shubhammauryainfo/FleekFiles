import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongoose";
import { User } from "@/models/User";

const handler = NextAuth({
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
        if (!credentials?.email || !credentials?.password) {
          return null; // Return null if credentials are missing
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name ?? null,
          phone: user.phone ?? null,
          provider: user.provider ?? null,
        };
      },
    }),
  ],
  callbacks: {
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

    async session({ session }) {
      if (!session.user?.email) {
        return session;
      }

      await dbConnect();

      const dbUser = await User.findOne({ email: session.user.email });
      if (!dbUser) {
        return session;
      }

      session.user.id = dbUser._id.toString();
      session.user.phone = dbUser.phone ?? null;
      session.user.provider = dbUser.provider ?? null;
      session.user.name = dbUser.name ?? null;
      session.user.email = dbUser.email;

      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
});

export { handler as GET, handler as POST };
