import { signIn, signOut, useSession } from "next-auth/react";
import { FaUserCircle, FaSignOutAlt, FaSignInAlt, FaTachometerAlt, FaBars, FaTimes } from "react-icons/fa";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const { user } = useCurrentUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Enhanced Navigation */}
            <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        {session ? (
                            <>
                                {/* Desktop Navigation */}
                                <div className="hidden lg:flex items-center gap-3 sm:gap-4">
                                    <div className="relative group">
                                        {session.user?.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt="User Avatar"
                                                className="rounded-full ring-2 ring-blue-500/30 shadow-lg transition-all duration-300 group-hover:ring-blue-500/50"
                                                width={40}
                                                height={40}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                                <FaUserCircle className="text-white text-lg sm:text-xl" />
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                                    </div>
                                    
                                    <div className="flex flex-col">
                                        <span className="text-slate-600 font-medium text-xs sm:text-sm">
                                            Welcome back,
                                        </span>
                                        <span className="text-slate-900 font-bold text-sm sm:text-lg leading-tight max-w-32 sm:max-w-48 truncate">
                                            {session.user?.name || "User"} 
                                        </span>
                                    </div>
                                </div>

                                {/* Mobile User Info */}
                                <div className="flex lg:hidden items-center gap-3">
                                    <div className="relative group">
                                        {session.user?.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt="User Avatar"
                                                className="rounded-full ring-2 ring-blue-500/30 shadow-lg"
                                                width={32}
                                                height={32}
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                                <FaUserCircle className="text-white text-sm" />
                                            </div>
                                        )}
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white shadow-sm"></div>
                                    </div>
                                    <span className="text-slate-900 font-bold text-sm truncate max-w-24 sm:max-w-32">
                                        {session.user?.name || "User"}
                                    </span>
                                </div>

                                {/* Desktop Action Buttons */}
                                <div className="hidden lg:flex items-center gap-3 xl:gap-4">
                                    <Link
                                        href="/files/user"
                                        className="group flex items-center gap-2 xl:gap-3 px-4 xl:px-6 py-2.5 xl:py-3 text-xs xl:text-sm font-semibold text-white 
                                        bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl xl:rounded-2xl shadow-lg shadow-blue-500/25
                                        hover:from-blue-600 hover:to-purple-700 hover:shadow-xl hover:shadow-blue-500/30 
                                        hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 ease-out
                                        focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white"
                                    >
                                        <FaUserCircle className="group-hover:rotate-12 transition-transform duration-300 text-sm xl:text-base" />
                                        Profile
                                    </Link>

                                    {user?.role === "admin" && (
                                        <Link
                                            href="/dashboard"
                                            className="group flex items-center gap-2 xl:gap-3 px-4 xl:px-6 py-2.5 xl:py-3 text-xs xl:text-sm font-semibold text-white 
                                            bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl xl:rounded-2xl shadow-lg shadow-emerald-500/25
                                            hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/30 
                                            hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 ease-out
                                            focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-white"
                                        >
                                            <FaTachometerAlt className="group-hover:rotate-12 transition-transform duration-300 text-sm xl:text-base" />
                                            Dashboard
                                        </Link>
                                    )}

                                    <button
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="group flex items-center gap-2 xl:gap-3 px-4 xl:px-6 py-2.5 xl:py-3 text-xs xl:text-sm font-semibold text-white 
                                        bg-gradient-to-r from-red-500 to-rose-600 rounded-xl xl:rounded-2xl shadow-lg shadow-red-500/25
                                        hover:from-red-600 hover:to-rose-700 hover:shadow-xl hover:shadow-red-500/30 
                                        hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 ease-out
                                        focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-white"
                                    >
                                        <FaSignOutAlt className="group-hover:rotate-12 transition-transform duration-300 text-sm xl:text-base" />
                                        <span className="hidden xl:inline">Sign Out</span>
                                        <span className="xl:hidden">Out</span>
                                    </button>
                                </div>

                                {/* Mobile Menu Toggle */}
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
                                    aria-label="Toggle mobile menu"
                                >
                                    {isMobileMenuOpen ? (
                                        <FaTimes className="text-slate-600 text-lg" />
                                    ) : (
                                        <FaBars className="text-slate-600 text-lg" />
                                    )}
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Not Signed In State */}
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center shadow-lg">
                                        <FaUserCircle className="text-slate-600 text-sm sm:text-xl" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-600 font-medium text-xs sm:text-sm">
                                            Welcome!
                                        </span>
                                        <span className="text-slate-800 font-bold text-sm sm:text-lg">
                                            Please sign in
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => signIn()}
                                    className="group flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white 
                                    bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/25
                                    hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 
                                    hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 ease-out
                                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white"
                                >
                                    <FaSignInAlt className="group-hover:translate-x-1 transition-transform duration-300 text-sm sm:text-base" />
                                    Sign In
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    {session && isMobileMenuOpen && (
                        <div className="lg:hidden mt-4 pb-4 border-t border-slate-200/60 pt-4">
                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/files/user"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="group flex items-center gap-3 px-4 py-3 text-sm font-semibold text-white 
                                    bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/25
                                    hover:from-blue-600 hover:to-purple-700 hover:shadow-xl hover:shadow-blue-500/30 
                                    active:scale-95 transition-all duration-300 ease-out
                                    focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                >
                                    <FaUserCircle className="text-base" />
                                    Profile
                                </Link>

                                {user?.role === "admin" && (
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="group flex items-center gap-3 px-4 py-3 text-sm font-semibold text-white 
                                        bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/25
                                        hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/30 
                                        active:scale-95 transition-all duration-300 ease-out
                                        focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    >
                                        <FaTachometerAlt className="text-base" />
                                        Dashboard
                                    </Link>
                                )}

                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        signOut({ callbackUrl: "/" });
                                    }}
                                    className="group flex items-center gap-3 px-4 py-3 text-sm font-semibold text-white 
                                    bg-gradient-to-r from-red-500 to-rose-600 rounded-xl shadow-lg shadow-red-500/25
                                    hover:from-red-600 hover:to-rose-700 hover:shadow-xl hover:shadow-red-500/30 
                                    active:scale-95 transition-all duration-300 ease-out
                                    focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                >
                                    <FaSignOutAlt className="text-base" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                {children}
            </main>
        </div>
    );
}