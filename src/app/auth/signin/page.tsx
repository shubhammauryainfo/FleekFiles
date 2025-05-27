"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import { FaEnvelope, FaLock, FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();


  const callbackUrl =  "/files";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Sign In Failed',
        text: res.error,
        background: '#1f2937',
        color: '#f9fafb',
        confirmButtonColor: '#3b82f6',
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Welcome Back!',
        text: 'You have successfully signed in!',
        background: '#1f2937',
        color: '#f9fafb',
        confirmButtonColor: '#10b981',
        timer: 2000,
        showConfirmButton: false,
      });
      router.push(res?.url || "/files");
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 transition-all duration-500 hover:shadow-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-200 rounded-2xl mb-4 shadow-lg">
            <Image src="/logo.png" width={40} height={40} alt="logo" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-300">Sign in to your account to continue</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
              <p className="text-red-200 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <FaEnvelope className="text-slate-400 group-focus-within:text-blue-400 transition-colors duration-300" />
              </div>
              <input
                type="email"
                placeholder="Email address"
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl 
                text-white placeholder-slate-400 backdrop-blur-sm
                focus:bg-white/20 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                transition-all duration-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <FaLock className="text-slate-400 group-focus-within:text-blue-400 transition-colors duration-300" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl 
                text-white placeholder-slate-400 backdrop-blur-sm
                focus:bg-white/20 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                transition-all duration-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center z-10"
              >
                {showPassword ? (
                  <FaEyeSlash className="text-slate-400 hover:text-white transition-colors duration-300" />
                ) : (
                  <FaEye className="text-slate-400 hover:text-white transition-colors duration-300" />
                )}
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl
              hover:from-blue-600 hover:to-purple-700 hover:shadow-xl hover:shadow-blue-500/25
              active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300 ease-out"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            <span className="px-4 text-slate-300 text-sm">or continue with</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl
            hover:bg-white/20 hover:border-white/30 hover:shadow-lg
            active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300 ease-out backdrop-blur-sm
            flex items-center justify-center gap-3"
          >
            <FaGoogle className="text-red-600" />
            Continue with Google
          </button>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-300 text-sm">
              Don't have an account?{" "}
              <a 
                href="/auth/register" 
                className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors duration-300"
              >
                Create account
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 text-center">
          <p className="text-slate-400 text-xs">
            By signing in, you agree to our{" "}
            <a href="#" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-300">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-300">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}