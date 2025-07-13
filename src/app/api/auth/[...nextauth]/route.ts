import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";


const baseHandler = NextAuth(authOptions);


const handler = (req: any, res: any) => {

  (global as any).__NEXT_AUTH_REQUEST__ = req;
  
  return baseHandler(req, res);
};

export { handler as GET, handler as POST };