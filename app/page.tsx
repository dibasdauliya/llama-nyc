"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Search, Github, Lock, Globe, Loader2, BarChart3, GitBranch, Users, FileText, Shield, Zap, AlertCircle, CheckCircle, Info } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { data: session, status: sessionStatus } = useSession()
  const [repoUrl, setRepoUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCheckingRepo, setIsCheckingRepo] = useState(false)
  const [urlError, setUrlError] = useState('')
  const [repoStatus, setRepoStatus] = useState<{
    exists?: boolean
    isPrivate?: boolean
    needsAuth?: boolean
    message?: string
  } | null>(null)

  const validateGitHubUrl = (url: string): boolean => {
    const githubUrlPattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/
    return githubUrlPattern.test(url)
  }

  const checkRepositoryAccess = async (url: string) => {
    if (!validateGitHubUrl(url)) return

    setIsCheckingRepo(true)
    setRepoStatus(null)
    
    try {
      // Extract owner and repo from URL
      const urlParts = url.replace('https://github.com/', '').split('/')
      const owner = urlParts[0]
      const repo = urlParts[1]
      
      // Check repository accessibility
      const response = await fetch(`/api/github/repository?owner=${owner}&repo=${repo}`)
      const data = await response.json()
      
      if (response.ok) {
        setRepoStatus({
          exists: true,
          isPrivate: data.private,
          needsAuth: false,
          message: data.private 
            ? `✅ Private repository access confirmed. You can analyze this repository.`
            : `✅ Public repository found. Ready for analysis!`
        })
      } else {
        if (data.requiresAuth) {
          setRepoStatus({
            exists: true,
            isPrivate: true,
            needsAuth: true,
            message: `🔒 This appears to be a private repository. Sign in with GitHub to analyze it.`
          })
        } else {
          setRepoStatus({
            exists: false,
            needsAuth: false,
            message: `❌ Repository not found or you don&apos;t have access to it.`
          })
        }
      }
    } catch (error) {
      setRepoStatus({
        exists: false,
        needsAuth: false,
        message: `⚠️ Unable to check repository. It might be private or not exist.`
      })
    } finally {
      setIsCheckingRepo(false)
    }
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

    // If we haven't checked the repo yet, or if it needs auth and user isn't signed in
    if (!repoStatus || (repoStatus.needsAuth && !session)) {
      await checkRepositoryAccess(repoUrl)
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

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setRepoUrl(newUrl)
    setRepoStatus(null) // Reset status when URL changes
    setUrlError('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze()
    }
  }

  const getAnalyzeButtonText = () => {
    if (isAnalyzing) return 'Analyzing...'
    if (isCheckingRepo) return 'Checking Repository...'
    if (repoStatus?.needsAuth && !session) return 'Sign in to Analyze'
    if (repoStatus?.exists === false) return 'Repository Not Found'
    return 'Analyze Repository'
  }

  const getAnalyzeButtonAction = () => {
    if (repoStatus?.needsAuth && !session) {
      return () => signIn('github')
    }
    return handleAnalyze
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
            <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <Github className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">GitHub Analyzer</span>
          </div>
            <div className="flex items-center space-x-4">
              {session && session.user ? (
                <div className="flex items-center space-x-2">
                  <img 
                    src={session.user.image || ''} 
                    alt={session.user.name || 'User'} 
                    className="w-8 h-8 rounded-full"
                  />
                  <Link 
                    href="/dashboard" 
                    className="text-gray-300 hover:text-white transition-colors px-2 py-1 rounded"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-gray-400 hover:text-white transition-colors px-2 py-1 rounded"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn('github')}
                  className="flex items-center text-gray-300 hover:text-white transition-colors bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-600"
                >
                  <Github className="h-4 w-4 mr-1" />
                  Sign in with GitHub
                </button>
              )}
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
                onChange={handleUrlChange}
                onKeyPress={handleKeyPress}
                onBlur={() => {
                  if (repoUrl && validateGitHubUrl(repoUrl) && !repoStatus) {
                    checkRepositoryAccess(repoUrl)
                  }
                }}
                placeholder="https://github.com/owner/repository"
                className="block w-full pl-10 pr-3 py-4 border border-gray-600 rounded-lg bg-gray-200 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
              {isCheckingRepo && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
                </div>
              )}
            </div>
            
            {/* Repository Status */}
            {repoStatus && (
              <div className={`mt-3 p-3 rounded-lg border text-sm ${
                repoStatus.needsAuth 
                  ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-200'
                  : repoStatus.exists 
                    ? 'bg-green-900/20 border-green-500/30 text-green-200'
                    : 'bg-red-900/20 border-red-500/30 text-red-200'
              }`}>
                <div className="flex items-center">
                  {repoStatus.needsAuth ? (
                    <Lock className="h-4 w-4 mr-2 flex-shrink-0" />
                  ) : repoStatus.exists ? (
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  )}
                  <span>{repoStatus.message}</span>
                </div>
                
                {repoStatus.needsAuth && !session && (
                  <div className="mt-2 pt-2 border-t border-yellow-500/30">
                    <p className="text-xs text-yellow-100 mb-2">
                      Benefits of signing in:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        Access private repositories
                      </div>
                      <div className="flex items-center">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        5,000 API calls/hour
                      </div>
                      <div className="flex items-center">
                        <Zap className="h-3 w-3 mr-1" />
                        Full analysis features
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {urlError && (
              <p className="text-red-400 text-sm mt-2 text-left">{urlError}</p>
            )}
            
            <button
              onClick={getAnalyzeButtonAction()}
              disabled={isAnalyzing || isCheckingRepo || (repoStatus?.exists === false)}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-8 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Analyzing...
                </>
              ) : isCheckingRepo ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Checking Repository...
                </>
              ) : repoStatus?.needsAuth && !session ? (
                <>
                  <Github className="h-5 w-5 mr-2" />
                  Sign in to Analyze
                </>
              ) : repoStatus?.exists === false ? (
                <>
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Repository Not Found
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
                  onClick={() => {
                    setRepoUrl(url)
                    checkRepositoryAccess(url)
                  }}
                  className="text-sm bg-gray-800/50 text-gray-300 px-3 py-1 rounded-full hover:bg-gray-700/50 transition-colors"
                >
                  {url.replace('https://github.com/', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Private Repository Benefits - Show when not signed in */}
        {!session && (
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-8 mb-16">
            <div className="text-center">
              <Lock className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Want to Analyze Private Repositories?
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Sign in with GitHub to unlock private repository analysis, higher API rate limits, and personalized insights.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6 max-w-3xl mx-auto">
                <div className="bg-black/20 rounded-lg p-4">
                  <Shield className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Secure Access</strong><br />
                    Read-only permissions, revoke anytime
                  </p>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <BarChart3 className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Higher Limits</strong><br />
                    5,000 API calls/hour vs 60
                  </p>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <Zap className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Full Analysis</strong><br />
                    All features for private repos
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => signIn('github')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center mx-auto"
              >
                <Github className="h-5 w-5 mr-2" />
                Sign in with GitHub
              </button>
            </div>
          </div>
        )}

        {/* Smart Repository Detection Info */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <Info className="h-6 w-6 text-blue-400 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Repository Detection</h3>
              <p className="text-blue-100 text-sm mb-3">
                Our system automatically detects repository accessibility and guides you through the authentication process if needed.
              </p>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-100">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-green-400" />
                  Public repositories: Instant analysis
                </div>
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-yellow-400" />
                  Private repositories: Secure OAuth flow
                </div>
              </div>
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
              Free & open source
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
