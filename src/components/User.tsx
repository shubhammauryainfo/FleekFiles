"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { FaSignInAlt, FaSignOutAlt, FaUserCircle } from "react-icons/fa";

export function AuthNav() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 backdrop-blur-sm border border-slate-200/60 px-6 py-3 rounded-2xl shadow-lg shadow-slate-200/50">
      {session ? (
        <>
          {/* User Info Section */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full ring-2 ring-blue-500/20 shadow-md"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <FaUserCircle className="text-white text-lg" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-slate-800 font-medium text-sm leading-tight">
                Welcome back,
              </span>
              <span className="text-slate-900 font-semibold text-base leading-tight truncate max-w-32">
                {session.user?.name || "User"}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => signOut()}
            className="group flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium text-white 
            bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/25
            hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:shadow-red-500/30 
            hover:-translate-y-0.5 active:scale-95 transition-all duration-300 ease-out
            focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-slate-50"
            aria-label="Logout"
          >
            <FaSignOutAlt className="group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-medium">Sign Out</span>
          </button>
        </>
      ) : (
        <>
          {/* Welcome Message for Non-Authenticated */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center shadow-md">
              <FaUserCircle className="text-slate-600 text-lg" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-600 font-medium text-sm leading-tight">
                Welcome!
              </span>
              <span className="text-slate-800 font-semibold text-base leading-tight">
                Please sign in
              </span>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={() => signIn()}
            className="group flex items-center gap-2.5 px-6 py-2.5 text-sm font-medium text-white 
            bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25
            hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:shadow-blue-500/30 
            hover:-translate-y-0.5 active:scale-95 transition-all duration-300 ease-out
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-50"
            aria-label="Login"
          >
            <FaSignInAlt className="group-hover:translate-x-0.5 transition-transform duration-300" />
            <span className="font-medium">Sign In</span>
          </button>
        </>
      )}
    </nav>
  );
}