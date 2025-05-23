"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function AuthNav() {
  const { data: session } = useSession();

  return session ? (
    <div className="flex gap-4 items-center">
      <span>Hello, {session.user?.name}</span>
      <button onClick={() => signOut()} className="text-sm text-red-600 underline">
        Logout
      </button>
    </div>
  ) : (
    <button onClick={() => signIn()} className="text-sm text-blue-600 underline">
      Login
    </button>
  );
}
