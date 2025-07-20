import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register - Fleek Files",
  description:
    "FleekFiles is a powerful application for managing users, files, and analytics. Built for efficiency and insight.",



};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}