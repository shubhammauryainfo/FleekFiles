"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Swal from "sweetalert2";
import { FaUser , FaEnvelope, FaPhone, FaLock } from "react-icons/fa";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic front-end validation
    if (!form.email || !form.password) {
      setError("Email and password are required");
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
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: data.error || "Failed to register",
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
        Swal.fire({
          icon: 'error',
          title: 'Sign In Failed',
          text: "Failed to sign in after registration.",
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful',
          text: 'You have been registered successfully!',
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Unexpected error occurred. Please try again.");
      Swal.fire({
        icon: 'error',
        title: 'Unexpected Error',
        text: "Unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Register</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="flex items-center border rounded-lg shadow-sm">
            <FaUser  className="m-1 text-gray-500" />
            <input
              name="name"
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2 outline-none rounded-lg"
            />
          </div>
          <div className="flex items-center border rounded-lg shadow-sm">
            <FaEnvelope className="m-1 text-gray-500" />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-2 outline-none rounded-lg"
              required
              autoComplete="email"
            />
          </div>
          <div className="flex items-center border rounded-lg shadow-sm">
            <FaPhone className="m-1 text-gray-500" />
            <input
              name="phone"
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full p-2 outline-none rounded-lg"
              autoComplete="tel"
            />
          </div>
          <div className="flex items-center border rounded-lg shadow-sm">
            <FaLock className="m-1 text-gray-500" />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-2 outline-none rounded-lg"
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition duration-300"
          >
            Register
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/auth/signin" className="text-blue-600 hover:underline">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
