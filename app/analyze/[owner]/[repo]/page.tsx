'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { ArrowLeft, Github, ExternalLink, Star, GitFork, Eye, FileText, Code, Shield, Zap, BarChart3, Activity, AlertTriangle, CheckCircle, XCircle, Loader2, Download, Archive, Lock, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import ReactMarkdown from 'react-markdown'

interface RepoData {
  name: string
  description?: string | null
  stars?: number
  forks?: number
  watchers?: number
  language?: string | null
  languages?: { [key: string]: number }
  created_at: string
  updated_at: string
  size?: number
  open_issues?: number
  license?: string | null
  default_branch: string
  private: boolean
  html_url: string
  clone_url: string
  topics?: string[]
  has_wiki?: boolean
  has_pages?: boolean
  has_projects?: boolean
  archived?: boolean
  disabled?: boolean
  visibility?: string
}

interface AnalysisData {
  codeMetrics: {
    totalLines?: number
    totalFiles?: number
    avgComplexity?: number
    testCoverage?: number
  }
  securityScore?: number
  maintainabilityScore?: number
  documentationScore?: number
  commits?: Array<{
    date: string
    count: number
  }>
  contributors?: Array<{
    login?: string
    contributions?: number
    avatar_url?: string
  }>
  fileTypes?: Array<{
    name: string
    count: number
    lines: number
  }>
  vulnerabilities?: Array<{
    severity?: 'low' | 'medium' | 'high' | 'critical'
    title?: string
    description?: string
  }>
  techStack?: Array<{
    name: string
    type: string
    confidence: string
    icon?: string
    version?: string
  }>
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00c49f', '#ffbb28']

export default function AnalyzePage() {
  const params = useParams()
  const { owner, repo } = params as { owner: string; repo: string }
  const { data: session, status: sessionStatus } = useSession()
  
  const [repoData, setRepoData] = useState<RepoData | null>(null)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requiresAuth, setRequiresAuth] = useState(false)
  const [authMessage, setAuthMessage] = useState<string>('')
  const [currentStep, setCurrentStep] = useState('Fetching repository...')
  const [aiInsights, setAiInsights] = useState<string>('')
  const [generatingInsights, setGeneratingInsights] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const aiInsightsRef = useRef<HTMLDivElement>(null)
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [isNearBottom, setIsNearBottom] = useState(false)
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false)

  useEffect(() => {
    analyzeRepository()
  }, [owner, repo])

  // Auto-retry when user signs in after encountering auth error
  useEffect(() => {
    if (requiresAuth && session?.githubAccessToken) {
      console.log('User signed in, retrying repository analysis...')
      analyzeRepository()
    }
  }, [session?.githubAccessToken, requiresAuth])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  // Scroll detection for floating button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      // Consider "near bottom" when within 200px of the bottom
      const threshold = 200
      const isNear = scrollTop + windowHeight >= documentHeight - threshold
      
      setIsNearBottom(isNear)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Check initial position
    handleScroll()
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const analyzeRepository = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setRequiresAuth(false)
      
      // Step 1: Fetch repository data
      setCurrentStep('Fetching repository information...')
      const repoResponse = await fetch(`/api/github/repository?owner=${owner}&repo=${repo}`)
      
      if (!repoResponse.ok) {
        const errorData = await repoResponse.json()
        
        if (errorData.requiresAuth) {
          setRequiresAuth(true)
          setAuthMessage(errorData.message || 'Authentication required')
          setError('Authentication required for private repository')
          setLoading(false)
          return
        }
        
        throw new Error(errorData.message || 'Repository not found or access denied')
      }
      
      const repoData = await repoResponse.json()
      setRepoData(repoData)
      
      // Step 2: Analyze repository
      setCurrentStep('Analyzing code structure...')
      const analysisResponse = await fetch(`/api/github/analyze?owner=${owner}&repo=${repo}`)
      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze repository')
      }
      const analysisData = await analysisResponse.json()
      setAnalysisData(analysisData)
      
      setCurrentStep('Analysis complete!')
      setLoading(false)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
      setLoading(false)
    }
  }, [owner, repo])

  const generateAIInsights = useCallback(async () => {
    if (!repoData || !analysisData) return
    
    setGeneratingInsights(true)
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repository: repoData,
          analysis: analysisData
        })
      })
      
      if (response.ok) {
        const { insights } = await response.json()
        setAiInsights(insights)
      }
    } catch (error) {
      console.error('Failed to generate AI insights:', error)
    } finally {
      setGeneratingInsights(false)
    }
  }, [repoData, analysisData])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-400/20'
    if (score >= 60) return 'bg-yellow-400/20'
    return 'bg-red-400/20'
  }

  const handleCloneRepository = async () => {
    if (!repoData) return
    
    const cloneCommand = `git clone ${repoData.clone_url}`
    
    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(cloneCommand)
      alert(`✅ Clone command copied to clipboard!\n\nPaste it in your terminal.`)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      // Fallback: show the command in a prompt for manual copying
      alert(`📋 Copy this command and paste it in your terminal:\n\n${cloneCommand}`)
    }
  }

  const handleDownloadZip = () => {
    if (!repoData) return
    
    // GitHub's ZIP download URL format
    const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${repoData.default_branch}.zip`
    
    // Create temporary link and trigger download
    const link = document.createElement('a')
    link.href = zipUrl
    link.download = `${repoData.name}-${repoData.default_branch}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleGetAIAnalysis = () => {
    // Scroll to AI insights section
    if (aiInsightsRef.current) {
      aiInsightsRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }
    
    // Generate AI insights if not already generated
    if (!aiInsights && !generatingInsights) {
      // Small delay to let scroll complete before starting generation
      setTimeout(() => {
        generateAIInsights()
      }, 500)
    }
  }

  const sendChatMessage = useCallback(async (message: string) => {
    if (!message.trim() || !repoData || !analysisData) return

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: message.trim(),
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsChatLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          repository: repoData,
          analysis: analysisData,
          chatHistory: chatMessages.slice(-5) // Send last 5 messages for context
        })
      })

      if (response.ok) {
        const { reply } = await response.json()
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant' as const,
          content: reply,
          timestamp: new Date()
        }
        setChatMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsChatLoading(false)
    }
  }, [repoData, analysisData, chatMessages])

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendChatMessage(chatInput)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Analyzing Repository</h2>
          <p className="text-gray-300 mb-4">{currentStep}</p>
          <div className="w-64 bg-gray-700 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          {requiresAuth ? (
            <>
              <Lock className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Private Repository Access</h2>
              <p className="text-gray-300 mb-4">{authMessage}</p>
              
              {!session ? (
                <>
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <h3 className="text-blue-200 font-semibold mb-2">🔓 Unlock Private Repository Analysis</h3>
                    <ul className="text-sm text-blue-100 space-y-1">
                      <li>• Access your private repositories</li>
                      <li>• Get 5,000 API calls/hour (vs 60 without auth)</li>
                      <li>• Secure: read-only access, revoke anytime</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => signIn('github')}
                      className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center border border-gray-700"
                    >
                      <Github className="h-5 w-5 mr-2" />
                      Sign in with GitHub
                    </button>
                    <p className="text-sm text-gray-400 text-center">
                      Redirects to GitHub for secure authentication
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                    <p className="text-green-200 text-sm">
                      ✅ You're signed in as <strong>{session.user?.name}</strong>
                    </p>
                    <p className="text-green-100 text-xs mt-1">
                      Retrying repository access...
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center mb-4">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-400 mr-2" />
                    <span className="text-gray-300">Checking repository access...</span>
                  </div>
                </>
              )}
              
              <div className="flex space-x-4 mt-6">
                <Link href="/" className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-center">
                  Try Another Repository
                </Link>
                {session && (
                  <button onClick={analyzeRepository} className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                    Retry Analysis
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Analysis Failed</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <div className="space-x-4">
                <Link href="/" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-block">
                  Try Another Repository
                </Link>
                <button onClick={analyzeRepository} className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                  Retry Analysis
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (!repoData || !analysisData) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <nav className="border-b border-gray-800 bg-black/20 backdrop-blur-sm relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-300 hover:text-white transition-colors mr-6">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Link>
              <Github className="h-8 w-8 text-white mr-3" />
              <div>
                <span className="text-xl font-bold text-white">{owner}/{repo}</span>
                {repoData.private && <span className="ml-2 text-xs bg-yellow-600 text-white px-2 py-1 rounded">Private</span>}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {session && session.user ? (
                <div className="flex items-center space-x-2">
                  <img 
                    src={session.user?.image || ''} 
                    alt={session.user?.name || 'User'} 
                    className="w-8 h-8 rounded-full"
                  />
                  <Link 
                    href="/dashboard" 
                    className="text-sm text-gray-300 hover:text-white transition-colors px-2 py-1 rounded"
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
              ) : sessionStatus === 'loading' ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Loading...</span>
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
              {/* Download Actions Dropdown */}
              <div className="relative z-50" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center text-gray-300 hover:text-white transition-colors bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-600"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Actions
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute z-[9999] right-0 mt-2 w-56 bg-gray-800 border border-gray-600 rounded-lg shadow-xl">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleCloneRepository()
                          setIsDropdownOpen(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-3 text-green-400" />
                        <div className="text-left">
                          <div className="font-medium">Copy Clone Command</div>
                          <div className="text-xs text-gray-400">Copy git clone to clipboard</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleDownloadZip()
                          setIsDropdownOpen(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                      >
                        <Archive className="h-4 w-4 mr-3 text-blue-400" />
                        <div className="text-left">
                          <div className="font-medium">Download ZIP</div>
                          <div className="text-xs text-gray-400">Download repository archive</div>
                        </div>
                      </button>
                      
                      {/* {session && session.user && (
                        <>
                          <div className="border-t border-gray-600 my-1"></div>
                          <button
                            onClick={() => {
                              signOut()
                              setIsDropdownOpen(false)
                            }}
                            className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                          >
                            <Github className="h-4 w-4 mr-3 text-red-400" />
                            <div className="text-left">
                              <div className="font-medium">Sign Out</div>
                              <div className="text-xs text-gray-400">Sign out of GitHub</div>
                            </div>
                          </button>
                        </>
                      )} */}
                    </div>
                  </div>
                )}
              </div>
              
              <a 
                href={repoData.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Repository Overview */}
        <div className="relative z-10 bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{repoData.name}</h1>
              <p className="text-gray-300 mb-4">{repoData.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center text-gray-300">
                  <Star className="h-4 w-4 mr-1" />
                  {(repoData.stars || 0).toLocaleString()} stars
                </div>
                <div className="flex items-center text-gray-300">
                  <GitFork className="h-4 w-4 mr-1" />
                  {(repoData.forks || 0).toLocaleString()} forks
                </div>
                <div className="flex items-center text-gray-300">
                  <Eye className="h-4 w-4 mr-1" />
                  {(repoData.watchers || 0).toLocaleString()} watchers
                </div>
                <div className="flex items-center text-gray-300">
                  <Code className="h-4 w-4 mr-1" />
                  {repoData.language || 'Unknown'}
                </div>
              </div>
              
              {(repoData.topics && repoData.topics.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {repoData.topics.map((topic) => (
                    <span key={topic} className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-red-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Security Score</h3>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(analysisData.securityScore || 0)}`}>
                {analysisData.securityScore || 0}/100
              </span>
            </div>
            <div className={`w-full h-2 rounded-full ${getScoreBgColor(analysisData.securityScore || 0)}`}>
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-red-600 to-green-600" 
                style={{ width: `${analysisData.securityScore || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Activity className="h-6 w-6 text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Maintainability</h3>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(analysisData.maintainabilityScore || 0)}`}>
                {analysisData.maintainabilityScore || 0}/100
              </span>
            </div>
            <div className={`w-full h-2 rounded-full ${getScoreBgColor(analysisData.maintainabilityScore || 0)}`}>
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-red-600 to-green-600" 
                style={{ width: `${analysisData.maintainabilityScore || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-green-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Documentation</h3>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(analysisData.documentationScore || 0)}`}>
                {analysisData.documentationScore || 0}/100
              </span>
            </div>
            <div className={`w-full h-2 rounded-full ${getScoreBgColor(analysisData.documentationScore || 0)}`}>
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-red-600 to-green-600" 
                style={{ width: `${analysisData.documentationScore || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Code Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
            <Code className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{(analysisData.codeMetrics.totalLines || 0).toLocaleString()}</div>
            <div className="text-gray-300">Lines of Code</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
            <FileText className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{(analysisData.codeMetrics.totalFiles || 0).toLocaleString()}</div>
            <div className="text-gray-300">Total Files</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
            <BarChart3 className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{(analysisData.codeMetrics.avgComplexity || 0).toFixed(1)}</div>
            <div className="text-gray-300">Avg Complexity</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{analysisData.codeMetrics.testCoverage || 0}%</div>
            <div className="text-gray-300">Test Coverage</div>
          </div>
        </div>

        {/* Tech Stack */}
        {analysisData.techStack && analysisData.techStack.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8">
            <div className="flex items-center mb-6">
              <Zap className="h-6 w-6 text-orange-400 mr-2" />
              <h3 className="text-xl font-semibold text-white">Technology Stack</h3>
              <span className="ml-3 text-sm text-gray-400">
                {analysisData.techStack.length} technologies detected
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {analysisData.techStack.map((tech, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 bg-gray-800/50 hover:bg-gray-800/70 transition-colors p-3 rounded-lg border border-gray-600"
                >
                  <div className="text-2xl flex-shrink-0">
                    {tech.icon || '🔧'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-white truncate">{tech.name}</h4>
                      {/* {tech.confidence === 'high' && (
                        <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                      )}
                      {tech.confidence === 'medium' && (
                        <AlertCircle className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                      )} */}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{tech.type}</p>
                    {/* {tech.version && (
                      <p className="text-xs text-purple-300 truncate">{tech.version}</p>
                    )} */}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Tech Stack Summary */}
            <div className="mt-6 pt-4 border-t border-gray-600">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-white">
                    {analysisData.techStack.filter(t => t.type.includes('Language')).length}
                  </div>
                  <div className="text-xs text-gray-400">Languages</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {analysisData.techStack.filter(t => t.type.includes('Framework')).length}
                  </div>
                  <div className="text-xs text-gray-400">Frameworks</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {analysisData.techStack.filter(t => t.type.includes('Database') || t.type.includes('ORM')).length}
                  </div>
                  <div className="text-xs text-gray-400">Database</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {analysisData.techStack.filter(t => t.type.includes('Tool') || t.type.includes('Build')).length}
                  </div>
                  <div className="text-xs text-gray-400">Tools</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Language Distribution */}
          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Language Distribution</h3>
            
            {/* Languages List - 2 Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(analysisData.fileTypes || []).map((entry, index) => {
                const totalLines = analysisData.fileTypes?.reduce((sum, item) => sum + item.lines, 0) || 1;
                const rawPercentage = (entry.lines / totalLines) * 100;
                
                // Smart decimal formatting based on percentage size
                let percentage;
                if (rawPercentage < 0.01) {
                  percentage = rawPercentage.toFixed(3); // Very small: 0.001%
                } else {
                  percentage = rawPercentage.toFixed(2); 
                }
                
                return (
                  <div key={`lang-${index}`} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-white font-medium truncate">{entry.name}</span>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <span className="text-white font-semibold">{percentage}%</span>
                        <div className="text-xs text-gray-400">
                          {entry.lines.toLocaleString()} lines
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: COLORS[index % COLORS.length],
                          width: `${percentage}%`
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            
          
          </div>

          {/* Commit Activity */}
          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Commit Activity (Last 30 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analysisData.commits || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Contributors and Vulnerabilities */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Top Contributors */}
          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Top Contributors</h3>
            <div className="space-y-3">
              {(analysisData.contributors || []).slice(0, 5).map((contributor) => (
                <div key={contributor.login} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src={contributor.avatar_url || '/default-avatar.png'} 
                      alt={contributor.login || 'Contributor'}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <a 
                      href={`https://github.com/${contributor.login || ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue- hover:text-blue-300 underline transition-colors flex items-center group"
                    >
                      <span className="mr-1">{contributor.login || 'Unknown'}</span>
                      <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                  <span className="text-gray-300">{contributor.contributions?.toLocaleString() || 0} commits</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Vulnerabilities */}
          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Security Issues</h3>
            <div className="space-y-3">
              {(!analysisData.vulnerabilities || analysisData.vulnerabilities.length === 0) ? (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                  <p className="text-gray-300">No security vulnerabilities detected</p>
                </div>
              ) : (
                (analysisData.vulnerabilities || []).slice(0, 5).map((vuln, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <AlertTriangle className={`h-5 w-5 mt-1 ${
                      vuln.severity === 'critical' ? 'text-red-500' :
                      vuln.severity === 'high' ? 'text-orange-500' :
                      vuln.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-white font-medium">{vuln.title || 'Security Issue'}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          vuln.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          vuln.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          vuln.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {vuln.severity || 'unknown'}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{vuln.description || 'No description available'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div ref={aiInsightsRef} className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Zap className="h-6 w-6 text-orange-400 mr-2" />
              <h3 className="text-xl font-semibold text-white">AI-Powered Insights</h3>
            </div>
            {!aiInsights && (
              <button
                onClick={handleGetAIAnalysis}
                disabled={generatingInsights}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {generatingInsights ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate AI Insights
                  </>
                )}
              </button>
            )}
          </div>
          
          {aiInsights ? (
            <div className="prose prose-invert max-w-3xl text-white prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white prose-em:text-gray-200 prose-ul:text-gray-200 prose-ol:text-gray-200 prose-li:text-gray-200 prose-code:text-purple-300 prose-pre:text-gray-200 prose-blockquote:text-gray-200 prose-a:text-blue-400 prose-table:text-gray-200 prose-th:text-white prose-td:text-gray-200">
              <ReactMarkdown
                components={{
                  // Custom components for better styling
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-purple-300 mb-6">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-blue-300 mb-4 border-b border-gray-600 pb-2">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold text-green-300 mb-3">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-lg font-semibold text-yellow-300 mb-2">
                      {children}
                    </h4>
                  ),
                  // Custom paragraph styling
                  p: ({ children }) => (
                    <p className="text-gray-200 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  // Custom bullet points for lists
                  ul: ({ children }) => (
                    <ul className="space-y-2 ml-4 mb-4 text-gray-200">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="space-y-2 ml-4 mb-4 list-decimal text-gray-200">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="flex items-start text-gray-200 leading-relaxed">
                      <span className="text-purple-400 mr-2 mt-1.5">•</span>
                      <span className="text-gray-200">{children}</span>
                    </li>
                  ),
                  // Custom strong/bold styling
                  strong: ({ children }) => (
                    <strong className="text-white font-semibold">{children}</strong>
                  ),
                  // Custom emphasis styling
                  em: ({ children }) => (
                    <em className="text-gray-200 italic">{children}</em>
                  ),
                  // Custom code blocks
                  code: ({ children, className }) => {
                    const isInline = !className
                    if (isInline) {
                      return (
                        <code className="text-purple-300 bg-gray-800/50 px-2 py-1 rounded text-sm font-mono">
                          {children}
                        </code>
                      )
                    }
                    return (
                      <code className="block bg-gray-800/50 border border-gray-600 rounded-lg p-4 text-gray-200 font-mono text-sm overflow-x-auto">
                        {children}
                      </code>
                    )
                  },
                  // Custom blockquotes
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-purple-500 bg-purple-900/20 pl-4 py-2 my-4 italic text-gray-200">
                      {children}
                    </blockquote>
                  ),
                  // Custom links
                  a: ({ children, href }) => (
                    <a 
                      href={href} 
                      className="text-blue-400 underline hover:text-blue-300 transition-colors"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  // Custom horizontal rules
                  hr: () => (
                    <hr className="border-gray-600 my-8" />
                  ),
                  // Catch all other text elements
                  div: ({ children }) => (
                    <div className="text-gray-200">{children}</div>
                  ),
                  span: ({ children }) => (
                    <span className="text-gray-200">{children}</span>
                  ),
                }}
              >
                {aiInsights}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-4">
                Get AI-powered insights about code quality, architecture patterns, and optimization opportunities.
              </p>
              {!generatingInsights && (
                <button
                  onClick={handleGetAIAnalysis}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Generate AI Analysis
                </button>
              )}
            </div>
          )}
        </div>

        {/* Chat with Repository */}
        <div data-chat-section className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Activity className="h-6 w-6 text-blue-400 mr-2" />
              <h3 className="text-xl font-semibold text-white">Chat About This Repository</h3>
            </div>
            <button
              onClick={() => setShowChat(!showChat)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Activity className="h-4 w-4 mr-2" />
              {showChat ? 'Hide Chat' : 'Start Chat'}
            </button>
          </div>

          {showChat ? (
            <div className="space-y-4">
              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto bg-gray-800/50 rounded-lg p-4 space-y-4 border border-gray-600">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8 grid place-items-center h-full">
                    <Activity className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                    <p className="text-gray-300 mb-2 max-w-lg">
                      Ask me anything about this repository! I can help you understand the code structure, 
                      architecture patterns, dependencies, or suggest improvements.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => sendChatMessage("What are the main technologies used in this project?")}
                        className="text-sm bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full hover:bg-blue-600/30 transition-colors"
                      >
                        Main technologies?
                      </button>
                      <button
                        onClick={() => sendChatMessage("What could be improved in this codebase?")}
                        className="text-sm bg-green-600/20 text-green-300 px-3 py-1 rounded-full hover:bg-green-600/30 transition-colors"
                      >
                        Improvement suggestions?
                      </button>
                      <button
                        onClick={() => sendChatMessage("How is the code quality and maintainability?")}
                        className="text-sm bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full hover:bg-purple-600/30 transition-colors"
                      >
                        Code quality?
                      </button>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-200'
                        }`}
                      >
                        <div className="text-sm mb-1">
                          {message.role === 'user' ? 'You' : 'AI Assistant'}
                        </div>
                        <div className="prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                        <div className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-gray-200 p-3 rounded-lg">
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask anything about this repository..."
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  disabled={isChatLoading}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-4 max-w-lg text-center mx-auto">
                Have questions about this repository? Start a conversation with our AI assistant to learn more about the code structure, patterns, and get personalized recommendations.
              </p>
              <button
                onClick={() => setShowChat(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Chatting
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating AI Analysis Button */}
      {!loading && repoData && analysisData && (
        <div className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${
          isNearBottom ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          {/* Floating Action Menu */}
          <div className="relative">
            {/* Menu Options */}
            <div className={`absolute bottom-16 right-0 space-y-3 transition-all duration-300 ${
              isFloatingMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}>
              {/* AI Analysis Option */}
              {!aiInsights && (
                <button
                  onClick={() => {
                    handleGetAIAnalysis()
                    setIsFloatingMenuOpen(false)
                  }}
                  disabled={generatingInsights}
                  className="flex items-center space-x-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingInsights ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Zap className="h-5 w-5" />
                  )}
                  <span className="font-medium whitespace-nowrap">
                    {generatingInsights ? 'Generating...' : 'AI Analysis'}
                  </span>
                </button>
              )}
              
              {/* Chat Option */}
              <button
                onClick={() => {
                  setShowChat(true)
                  setIsFloatingMenuOpen(false)
                  // Scroll to chat section
                  const chatSection = document.querySelector('[data-chat-section]')
                  if (chatSection) {
                    chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }}
                className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Activity className="h-5 w-5" />
                <span className="font-medium whitespace-nowrap">Start Chat</span>
              </button>
            </div>
            
            {/* Main Toggle Button */}
            <button
              onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
              className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${
                isFloatingMenuOpen ? 'rotate-45' : 'rotate-0'
              }`}
            >
              <Zap className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 