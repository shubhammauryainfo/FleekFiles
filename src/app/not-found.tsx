"use client";

import Link from "next/link";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="text-center px-6 max-w-2xl mx-auto">
        {/* 404 Number */}
        <h1 className="text-8xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text mb-8">
          404
        </h1>

        {/* Error Message */}
        <h2 className="text-3xl font-bold text-white mb-4">
          Page Not Found
        </h2>
        
        <p className="text-lg text-gray-300 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Navigation Buttons */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg 
            hover:bg-blue-700 transition-colors duration-300"
          >
            Back to Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-block px-6 py-3 bg-white/10 text-white font-semibold rounded-lg border border-white/20
            hover:bg-white/20 transition-colors duration-300"
          >
            Go Back
          </button>
        </div>

        {/* Simple Links */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <p className="text-gray-400 mb-4">Quick Links:</p>
          <div className="flex justify-center gap-6">
            <Link href="/about" className="text-blue-400 hover:text-blue-300">
              About
            </Link>
            <Link href="/contact" className="text-purple-400 hover:text-purple-300">
              Contact
            </Link>
            <Link href="/help" className="text-pink-400 hover:text-pink-300">
              Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;