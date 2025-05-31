"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { Video, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function SignIn() {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Video className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">AI Video Interviewer</span>
          </Link>
        </div>

        {/* Sign In Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Welcome!</h2>
          <p className="text-gray-600 mb-8 text-center">
            Sign in to start practicing interviews with AI
          </p>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">What you'll get:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>3 free AI video interviews to start</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Practice VISA and job interviews</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Get instant AI feedback</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Track your progress over time</span>
              </li>
            </ul>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium text-gray-700">Continue with Google</span>
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 