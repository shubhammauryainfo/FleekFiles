"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { FaSignInAlt, FaSignOutAlt, FaUserCircle } from "react-icons/fa";

export function AuthNav() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-md shadow-md">
      {session ? (
        <>
          <FaUserCircle className="text-blue-600 text-xl" title="User Icon" />

          <span className="text-gray-700 font-semibold">Hello, {session.user?.name}</span>
          <button
            onClick={() => signOut()}
            className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-full shadow-md 
            hover:bg-red-700 hover:shadow-lg active:scale-95  duration-300 ease-in-out"
            aria-label="Logout"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={() => signIn()}
          className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full shadow-md 
          hover:bg-blue-700 hover:shadow-lg active:scale-95  duration-300 ease-in-out"
          aria-label="Login"
        >
          <FaSignInAlt />
          Login
        </button>
      )}
    </nav>
  );
}

