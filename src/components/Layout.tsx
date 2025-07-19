import { signIn, signOut, useSession } from "next-auth/react";
import { FaUserCircle, FaSignOutAlt, FaSignInAlt, FaTachometerAlt } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Enhanced Navigation */}
        <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {session ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      {session.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt="User Avatar"
                          className="rounded-full ring-2 ring-blue-500/30 shadow-lg transition-all duration-300 group-hover:ring-blue-500/50"
                          width={50}
                          height={50}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                          <FaUserCircle className="text-white text-xl" />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-slate-600 font-medium text-sm">
                        Welcome back,
                      </span>
                      <span className="text-slate-900 font-bold text-lg leading-tight max-w-48">
                        {session.user?.name || "User"} 
                      </span>
                    </div>
                  </div>
  
                  <div className="flex items-center gap-4">
                  <Link
                        href="/files/user"
                        className="group flex items-center gap-3 px-6 py-3 text-sm font-semibold text-white 
                        bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25
                        hover:from-blue-600 hover:to-purple-700 hover:shadow-xl hover:shadow-blue-500/30 
                        hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 ease-out
                        focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white"
                      >
                        <FaUserCircle className="group-hover:rotate-12 transition-transform duration-300" />
                       Profile
                      </Link>
                    {/* Dashboard Button - Only visible for admin users */}
                    {session.user.role === "admin" && (
                      <Link
                        href="/dashboard"
                        className="group flex items-center gap-3 px-6 py-3 text-sm font-semibold text-white 
                        bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/25
                        hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/30 
                        hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 ease-out
                        focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-white"
                      >
                        <FaTachometerAlt className="group-hover:rotate-12 transition-transform duration-300" />
                        Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="group flex items-center gap-3 px-6 py-3 text-sm font-semibold text-white 
                      bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl shadow-lg shadow-red-500/25
                      hover:from-red-600 hover:to-rose-700 hover:shadow-xl hover:shadow-red-500/30 
                      hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 ease-out
                      focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-white"
                    >
                      <FaSignOutAlt className="group-hover:rotate-12 transition-transform duration-300" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center shadow-lg">
                      <FaUserCircle className="text-slate-600 text-xl" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-600 font-medium text-sm">
                        Welcome!
                      </span>
                      <span className="text-slate-800 font-bold text-lg">
                        Please sign in
                      </span>
                    </div>
                  </div>
  
                  <button
                    onClick={() => signIn()}
                    className="group flex items-center gap-3 px-8 py-3 text-sm font-semibold text-white 
                    bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25
                    hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 
                    hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 ease-out
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white"
                  >
                    <FaSignInAlt className="group-hover:translate-x-1 transition-transform duration-300" />
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
  
        <main className="max-w-7xl mx-auto px-6 py-6">
            {children}
        </main>
    </div>
    );
  }