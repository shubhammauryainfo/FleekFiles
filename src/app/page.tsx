"use client";

import Link from "next/link";
import { AuthNav } from "@/components/User";

export default function HomePage() {

  return (

    <div className="min-h-screen flex flex-col font-sans">
      <AuthNav />
      {/* Header */}
      <header className="bg-gray-900 text-white px-8 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">FleekFiles</h1>
        <nav className="space-x-6">
          <Link href="#about" className="hover:underline">About</Link>
          <Link href="#features" className="hover:underline">Features</Link>
          <Link href="#footer" className="hover:underline">Contact</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 bg-gradient-to-br from-blue-100 to-blue-200">
        <h2 className="text-4xl font-bold mb-4 text-gray-800">Store and Share Your Files with Ease</h2>
        <p className="text-lg text-gray-700 max-w-xl">
          FleekFiles is your secure, FTP-backed file storage solution with a modern interface and MongoDB-powered metadata. Built for learning, ready for real use.
        </p>
        <Link href="/files">
          <button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">Get Started</button>
        </Link>
      </section>

      {/* About Section */}
      <section id="about" className="px-8 py-20 bg-white text-gray-800">
        <h3 className="text-3xl font-bold mb-6 text-center">About FleekFiles</h3>
        <p className="max-w-3xl mx-auto text-center text-lg">
          FleekFiles is a mini SaaS project combining modern web technologies with legacy FTP storage. Learn fullstack development with Next.js, TypeScript, MongoDB, and explore real-world API and data modeling patterns.
        </p>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-gray-900 text-white text-center py-8 mt-auto">
        <p>© {new Date().getFullYear()} FleekFiles. Built for learning and file mastery.</p>
        <p className="text-sm mt-1">Next.js + MongoDB + FTP + TypeScript</p>
      </footer>
    </div>
  );
}
