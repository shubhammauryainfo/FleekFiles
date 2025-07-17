"use client";
import { signOut } from "next-auth/react";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaBars, FaTimes, FaHome, FaSignOutAlt } from "react-icons/fa";
import { FaPeopleGroup, FaWpforms } from "react-icons/fa6";
import { IconType } from "react-icons";
import { LuLogs } from "react-icons/lu";
import { LuFileStack } from "react-icons/lu";

interface LinkItem {
    href: string;
    label: string;
    icon: IconType;
}

interface DashLayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<DashLayoutProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState<boolean>(true);

    const toggleSidebar = (): void => {
        setIsOpen(!isOpen);
    };

    // Links data with enhanced styling
    const links: LinkItem[] = [
        { href: "/dashboard", label: "Home", icon: FaHome },
        { href: "/dashboard/users", label: "Users", icon: FaPeopleGroup },
        { href: "/dashboard/loginlogs", label: "Login Logs", icon: LuLogs },
        { href: "/dashboard/files", label: "Files Uploads", icon: LuFileStack  },
        { href: "/dashboard/feedbacks", label: "Feedbacks", icon: FaWpforms },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Backdrop for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                } w-64 lg:w-60`}
            >
                {/* Sidebar Header */}
                <div className="bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 text-white p-6 shadow-lg">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center relative">
                            <Image
                                src="/logo.png"
                                alt="FleekFiles Logo"
                                width={32}
                                height={32}
                                className="rounded-lg object-cover"
                                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.nextSibling as HTMLElement;
                                    if (fallback) {
                                        fallback.style.display = 'flex';
                                    }
                                }}
                            />
                            <div 
                                className="w-8 h-8 bg-white/30 rounded-lg hidden items-center justify-center absolute"
                            >
                                <span className="text-white font-bold text-sm">FF</span>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">FleekFiles</h2>
                            <p className="text-xs text-white/80">Admin Dashboard</p>
                        </div>
                    </div>
                    
                    {/* Circuit-style decorative lines */}
                    <div className="mt-4 relative">
                        <div className="absolute top-0 left-0 w-16 h-0.5 bg-white/30"></div>
                        <div className="absolute top-0 right-0 w-12 h-0.5 bg-white/30"></div>
                        <div className="absolute top-0 left-0 w-1 h-1 bg-white/40 rounded-full"></div>
                        <div className="absolute top-0 right-0 w-1 h-1 bg-white/40 rounded-full"></div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="bg-white/95 backdrop-blur-sm h-full pt-6 shadow-xl border-r border-teal-200">
                    <nav className="px-4 space-y-2">
                        {links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.href}
                                className="group flex items-center space-x-4 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-800 transition-all duration-200 hover:shadow-md hover:scale-[1.02] border border-transparent hover:border-teal-200"
                            >
                                <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                                    {React.createElement(link.icon)}
                                </span>
                                <span className="font-medium">{link.label}</span>
                                
                                {/* Hover indicator */}
                                <div className="ml-auto w-0 group-hover:w-2 h-2 bg-teal-400 rounded-full transition-all duration-200"></div>
                            </Link>
                        ))}
                    </nav>
                    
                    {/* Decorative tech elements */}
                    <div className="absolute bottom-8 left-4 right-4">
                        <div className="bg-gradient-to-r from-teal-100 to-cyan-100 rounded-lg p-3 border border-teal-200">
                            <div className="flex items-center space-x-2 text-teal-800">
                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                                <span className="text-xs font-medium">System Online</span>
                            </div>
                            <div className="mt-1 text-xs text-teal-600">All systems operational</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Wrapper */}
            <div
                className={`flex-1 transition-all duration-300 ease-in-out ${
                    isOpen ? "lg:ml-60" : "ml-0"
                }`}
            >
                {/* Enhanced Navbar */}
                <div className="sticky top-0 bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500 text-white shadow-lg z-30 border-b border-teal-300">
                    <div className="flex justify-between items-center px-4 lg:px-6 h-16">
                        {/* Left Section */}
                        <div className="flex items-center space-x-4">
                            <button
                                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                                onClick={toggleSidebar}
                                type="button"
                            >
                                {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
                            </button>
                            <div className="hidden md:block">
                                <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Dashboard</h1>
                                <div className="text-xs text-white/80">Control Panel</div>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center space-x-4">
                            {/* 
                            <div className="hidden sm:flex items-center space-x-3 bg-white/20 rounded-xl px-4 py-2">
                                <div className="w-8 h-8 rounded-lg bg-white/30 overflow-hidden">
                                    <Image
                                        src="/logo.jpg"
                                        alt="User Logo"
                                        width={32}
                                        height={32}
                                        className="object-cover"
                                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const fallback = target.nextSibling as HTMLElement;
                                            if (fallback) {
                                                fallback.style.display = 'flex';
                                            }
                                        }}
                                    />
                                    <div className="w-full h-full bg-white/40 hidden items-center justify-center">
                                        <span className="text-white font-bold text-sm">A</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">Admin</div>
                                    <div className="text-xs text-white/80">FleekFiles</div>
                                </div>
                            </div> */}

                            {/* Logout Button */}
                           
                                <button 
                                  onClick={() => signOut({ callbackUrl: "/" })}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                                    type="button"
                                >
                                    <FaSignOutAlt className="text-sm" />
                                    <span className="hidden sm:block">Logout</span>
                                </button>
                           
                        </div>
                    </div>

                    {/* Tech accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>

                {/* Main Content */}
                <div className="p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;