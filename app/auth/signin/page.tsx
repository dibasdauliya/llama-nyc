"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { Github, ArrowLeft } from "lucide-react";

export default function SignIn() {
  const handleGitHubSignIn = () => {
    signIn("github", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <Github className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">GitHub Project Analyzer</span>
          </Link>
        </div>

        {/* Sign In Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-2 text-center">Welcome!</h2>
          <p className="text-gray-300 mb-8 text-center">
            Sign in with GitHub to analyze private repositories
          </p>

          {/* Benefits */}
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-white mb-3">What you'll get:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Access to your private repositories</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>5,000 GitHub API calls per hour (vs 60 without)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>AI-powered code analysis and insights</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Detailed security and quality scoring</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Interactive charts and visualizations</span>
              </li>
            </ul>
          </div>

          {/* GitHub Sign In Button */}
          <button
            onClick={handleGitHubSignIn}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-600 rounded-lg transition-all duration-200 text-white"
          >
            <Github className="w-5 h-5" />
            <span className="font-medium">Continue with GitHub</span>
          </button>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-200 text-center">
              <strong>🔒 Secure:</strong> We only request read access to your repositories. 
              You can revoke access anytime in your GitHub settings.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 