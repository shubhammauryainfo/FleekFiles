"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Swal from "sweetalert2";
import Image from "next/image";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaUserPlus } from "react-icons/fa";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/) || password.match(/[^a-zA-Z0-9]/)) strength += 25;
    return strength;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic front-end validation
    if (!form.email || !form.password) {
      setError("Email and password are required");
      setIsLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to register");
        setIsLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: data.error || "Failed to register",
          background: '#1f2937',
          color: '#f9fafb',
          confirmButtonColor: '#ef4444',
        });
        return;
      }

      // Auto sign-in after successful registration
      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: true,
        callbackUrl: "/",
      });

      // If for some reason signIn fails without redirect, handle fallback here
      if (signInResult?.error) {
        setError("Failed to sign in after registration.");
        setIsLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Sign In Failed',
          text: "Failed to sign in after registration.",
          background: '#1f2937',
          color: '#f9fafb',
          confirmButtonColor: '#ef4444',
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Welcome to FleekFiles!',
          text: 'Your account has been created successfully!',
          background: '#1f2937',
          color: '#f9fafb',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Unexpected error occurred. Please try again.");
      setIsLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Unexpected Error',
        text: "Unexpected error occurred. Please try again.",
        background: '#1f2937',
        color: '#f9fafb',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 transition-all duration-500 hover:shadow-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-100 to-teal-200 rounded-2xl mb-4 shadow-lg">
             <Image src="/logo.png" width={40} height={40} alt="logo" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Join FleekFiles</h2>
            <p className="text-slate-300">Create your account to get started</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
              <p className="text-red-200 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Name Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <FaUser className="text-slate-400 group-focus-within:text-emerald-400 transition-colors duration-300" />
              </div>
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl 
                text-white placeholder-slate-400 backdrop-blur-sm
                focus:bg-white/20 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20
                transition-all duration-300"
              />
            </div>

            {/* Email Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <FaEnvelope className="text-slate-400 group-focus-within:text-emerald-400 transition-colors duration-300" />
              </div>
              <input
                name="email"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl 
                text-white placeholder-slate-400 backdrop-blur-sm
                focus:bg-white/20 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20
                transition-all duration-300"
                required
                autoComplete="email"
              />
            </div>

            {/* Phone Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <FaPhone className="text-slate-400 group-focus-within:text-emerald-400 transition-colors duration-300" />
              </div>
              <input
                name="phone"
                type="tel"
                placeholder="Phone number (optional)"
                value={form.phone}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl 
                text-white placeholder-slate-400 backdrop-blur-sm
                focus:bg-white/20 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20
                transition-all duration-300"
                autoComplete="tel"
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <FaLock className="text-slate-400 group-focus-within:text-emerald-400 transition-colors duration-300" />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl 
                text-white placeholder-slate-400 backdrop-blur-sm
                focus:bg-white/20 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20
                transition-all duration-300"
                required
                autoComplete="new-password"
                minLength={6}
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

            {/* Password Strength Indicator */}
            {form.password && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Password Strength</span>
                  <span className={`font-medium ${
                    passwordStrength <= 25 ? 'text-red-400' :
                    passwordStrength <= 50 ? 'text-orange-400' :
                    passwordStrength <= 75 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-sm">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl
              hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/25
              active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300 ease-out"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-300 text-sm">
              Already have an account?{" "}
              <a 
                href="/auth/signin" 
                className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors duration-300"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 text-center">
          <p className="text-slate-400 text-xs">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors duration-300">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors duration-300">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}