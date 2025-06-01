"use client";

import { useState } from "react";
import { Search, Github, Lock, Globe, Loader2, BarChart3, GitBranch, Users, FileText, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [repoUrl, setRepoUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [urlError, setUrlError] = useState('')

  const validateGitHubUrl = (url: string): boolean => {
    const githubUrlPattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/
    return githubUrlPattern.test(url)
  }

  const handleAnalyze = async () => {
    setUrlError('')
    
    if (!repoUrl.trim()) {
      setUrlError('Please enter a GitHub repository URL')
      return
    }

    if (!validateGitHubUrl(repoUrl)) {
      setUrlError('Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)')
      return
    }

    setIsAnalyzing(true)
    
    // Extract owner and repo from URL
    const urlParts = repoUrl.replace('https://github.com/', '').split('/')
    const owner = urlParts[0]
    const repo = urlParts[1]
    
    // Navigate to analysis page
    window.location.href = `/analyze/${owner}/${repo}`
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze()
    }
  }

  const exampleRepos = [
    'https://github.com/microsoft/vscode',
    'https://github.com/facebook/react',
    'https://github.com/vercel/next.js',
    'https://github.com/nodejs/node'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <nav className="border-b border-gray-800 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Github className="h-8 w-8 text-white mr-3" />
              <span className="text-xl font-bold text-white">GitHub Analyzer</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin" className="text-gray-300 hover:text-white transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Analyze Any
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> GitHub </span>
            Repository
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Get comprehensive insights, code metrics, security analysis, and AI-powered recommendations for any GitHub repository - public or private.
          </p>

          {/* URL Input */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="https://github.com/owner/repository"
                className="block w-full pl-10 pr-3 py-4 border border-gray-600 rounded-lg bg-gray-200/50 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
            </div>
            {urlError && (
              <p className="text-red-400 text-sm mt-2 text-left">{urlError}</p>
            )}
            
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-8 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Analyze Repository
                </>
              )}
            </button>
          </div>

          {/* Example URLs */}
          <div className="mb-12">
            <p className="text-gray-400 mb-4">Try these popular repositories:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {exampleRepos.map((url) => (
                <button
                  key={url}
                  onClick={() => setRepoUrl(url)}
                  className="text-sm bg-gray-800/50 text-gray-300 px-3 py-1 rounded-full hover:bg-gray-700/50 transition-colors"
                >
                  {url.replace('https://github.com/', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center mb-4">
              <Globe className="h-8 w-8 text-green-400 mr-3" />
              <h3 className="text-xl font-semibold text-white">Public Repositories</h3>
            </div>
            <p className="text-gray-300">
              Instantly analyze any public GitHub repository without authentication. Get comprehensive insights in seconds.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center mb-4">
              <Lock className="h-8 w-8 text-yellow-400 mr-3" />
              <h3 className="text-xl font-semibold text-white">Private Access</h3>
            </div>
            <p className="text-gray-300">
              Authenticate with GitHub to analyze private repositories. Secure OAuth integration with proper permissions.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-8 w-8 text-blue-400 mr-3" />
              <h3 className="text-xl font-semibold text-white">Code Metrics</h3>
            </div>
            <p className="text-gray-300">
              Detailed analysis of code complexity, language distribution, file structure, and quality metrics.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center mb-4">
              <GitBranch className="h-8 w-8 text-purple-400 mr-3" />
              <h3 className="text-xl font-semibold text-white">Git History</h3>
            </div>
            <p className="text-gray-300">
              Analyze commit patterns, branch structure, contributor activity, and development timeline insights.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-red-400 mr-3" />
              <h3 className="text-xl font-semibold text-white">Security Analysis</h3>
            </div>
            <p className="text-gray-300">
              Identify potential security vulnerabilities, dependency issues, and best practice recommendations.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center mb-4">
              <Zap className="h-8 w-8 text-orange-400 mr-3" />
              <h3 className="text-xl font-semibold text-white">AI Insights</h3>
            </div>
            <p className="text-gray-300">
              Get AI-powered recommendations for code quality, architecture patterns, and optimization opportunities.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-800/20 to-pink-800/20 border border-purple-500/30 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to dive deep into any codebase?
          </h2>
          <p className="text-gray-300 mb-6 text-lg">
            Start analyzing repositories now and discover insights you never knew existed.
          </p>
          <div className="flex justify-center items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              50k+ repos analyzed
            </span>
            <span className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              Detailed reports
            </span>
            <span className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Secure & private
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
