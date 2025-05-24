"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import { FaEnvelope, FaLock } from "react-icons/fa";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useSearchParams();

  const callbackUrl = params.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      setError(res.error);
      Swal.fire({
        icon: 'error',
        title: 'Sign In Failed',
        text: res.error,
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Sign In Successful',
        text: 'You have successfully signed in!',
      });
      router.push(res?.url || "/");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Sign In</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center border rounded-lg shadow-sm">
            <FaEnvelope className="m-1 text-gray-500" />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 outline-none rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center border rounded-lg shadow-sm">
            <FaLock className=" m-1 text-gray-500" />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 outline-none rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">Or sign in with</p>
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="mt-2 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-300"
          >
            Google
          </button>
          <p className="mt-4 text-sm text-gray-600">
            Don't have an account? <a href="/auth/register" className="text-blue-600 hover:underline">Register</a>
          </p>
        </div>
      </div>
    </div>
  );
}
