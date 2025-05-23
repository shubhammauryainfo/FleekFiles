import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import type { ReactNode } from 'react';
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";



export const metadata: Metadata = {
  title: "FleekFiles - A Nexbytes Product",
  description: "FleekFiles is a cutting-edge file management system designed to streamline your workflow and enhance productivity. Developed by Nexbytes, a leader in innovative technology solutions.",
};



export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
