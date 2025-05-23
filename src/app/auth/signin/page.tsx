
"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={() => signIn("google")}
        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
      >
        Sign in with Google
      </button>
    </div>
  );
}
