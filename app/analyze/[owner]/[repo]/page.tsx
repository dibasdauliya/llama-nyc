'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Github, ExternalLink, Star, GitFork, Eye, Calendar, Users, FileText, Code, Shield, Zap, BarChart3, Clock, Activity, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import ReactMarkdown from 'react-markdown'

interface RepoData {
  name: string
  description: string
  stars: number
  forks: number
  watchers: number
  language: string
  languages: { [key: string]: number }
  created_at: string
  updated_at: string
  size: number
  open_issues: number
  license: string
  default_branch: string
  private: boolean
  html_url: string
  clone_url: string
  topics: string[]
  has_wiki: boolean
  has_pages: boolean
  has_projects: boolean
  archived: boolean
  disabled: boolean
  visibility: string
}

interface AnalysisData {
  codeMetrics: {
    totalLines: number
    totalFiles: number
    avgComplexity: number
    testCoverage: number
  }
  securityScore: number
  maintainabilityScore: number
  documentationScore: number
  commits: Array<{
    date: string
    count: number
  }>
  contributors: Array<{
    login: string
    contributions: number
    avatar_url: string
  }>
  fileTypes: Array<{
    name: string
    count: number
    lines: number
  }>
  vulnerabilities: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
  }>
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00c49f', '#ffbb28']

export default function AnalyzePage() {
  const params = useParams()
  const { owner, repo } = params as { owner: string; repo: string }
  
  const [repoData, setRepoData] = useState<RepoData | null>(null)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState('Fetching repository...')
  const [aiInsights, setAiInsights] = useState<string>('')
  const [generatingInsights, setGeneratingInsights] = useState(false)

  useEffect(() => {
    analyzeRepository()
  }, [owner, repo])

  const analyzeRepository = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Step 1: Fetch repository data
      setCurrentStep('Fetching repository information...')
      const repoResponse = await fetch(`/api/github/repository?owner=${owner}&repo=${repo}`)
      if (!repoResponse.ok) {
        throw new Error('Repository not found or access denied')
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
  }

  const generateAIInsights = async () => {
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
  }

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
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Analysis Failed</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-x-4">
            <Link href="/" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Try Another Repository
            </Link>
            <button onClick={analyzeRepository} className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              Retry Analysis
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!repoData || !analysisData) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <nav className="border-b border-gray-800 bg-black/20 backdrop-blur-sm">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Repository Overview */}
        <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{repoData.name}</h1>
              <p className="text-gray-300 mb-4">{repoData.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center text-gray-300">
                  <Star className="h-4 w-4 mr-1" />
                  {repoData.stars.toLocaleString()} stars
                </div>
                <div className="flex items-center text-gray-300">
                  <GitFork className="h-4 w-4 mr-1" />
                  {repoData.forks.toLocaleString()} forks
                </div>
                <div className="flex items-center text-gray-300">
                  <Eye className="h-4 w-4 mr-1" />
                  {repoData.watchers.toLocaleString()} watchers
                </div>
                <div className="flex items-center text-gray-300">
                  <Code className="h-4 w-4 mr-1" />
                  {repoData.language}
                </div>
              </div>
              
              {repoData.topics.length > 0 && (
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
              <span className={`text-2xl font-bold ${getScoreColor(analysisData.securityScore)}`}>
                {analysisData.securityScore}/100
              </span>
            </div>
            <div className={`w-full h-2 rounded-full ${getScoreBgColor(analysisData.securityScore)}`}>
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-red-600 to-green-600" 
                style={{ width: `${analysisData.securityScore}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Activity className="h-6 w-6 text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Maintainability</h3>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(analysisData.maintainabilityScore)}`}>
                {analysisData.maintainabilityScore}/100
              </span>
            </div>
            <div className={`w-full h-2 rounded-full ${getScoreBgColor(analysisData.maintainabilityScore)}`}>
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-red-600 to-green-600" 
                style={{ width: `${analysisData.maintainabilityScore}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-green-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Documentation</h3>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(analysisData.documentationScore)}`}>
                {analysisData.documentationScore}/100
              </span>
            </div>
            <div className={`w-full h-2 rounded-full ${getScoreBgColor(analysisData.documentationScore)}`}>
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-red-600 to-green-600" 
                style={{ width: `${analysisData.documentationScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Code Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
            <Code className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{analysisData.codeMetrics.totalLines.toLocaleString()}</div>
            <div className="text-gray-300">Lines of Code</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
            <FileText className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{analysisData.codeMetrics.totalFiles.toLocaleString()}</div>
            <div className="text-gray-300">Total Files</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
            <BarChart3 className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{analysisData.codeMetrics.avgComplexity.toFixed(1)}</div>
            <div className="text-gray-300">Avg Complexity</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{analysisData.codeMetrics.testCoverage}%</div>
            <div className="text-gray-300">Test Coverage</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Language Distribution */}
          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Language Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analysisData.fileTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="lines"
                  >
                    {analysisData.fileTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Commit Activity */}
          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Commit Activity (Last 30 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analysisData.commits}>
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
              {analysisData.contributors.slice(0, 5).map((contributor) => (
                <div key={contributor.login} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src={contributor.avatar_url} 
                      alt={contributor.login}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <span className="text-white">{contributor.login}</span>
                  </div>
                  <span className="text-gray-300">{contributor.contributions} commits</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Vulnerabilities */}
          <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Security Issues</h3>
            <div className="space-y-3">
              {analysisData.vulnerabilities.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                  <p className="text-gray-300">No security vulnerabilities detected</p>
                </div>
              ) : (
                analysisData.vulnerabilities.slice(0, 5).map((vuln, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <AlertTriangle className={`h-5 w-5 mt-1 ${
                      vuln.severity === 'critical' ? 'text-red-500' :
                      vuln.severity === 'high' ? 'text-orange-500' :
                      vuln.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-white font-medium">{vuln.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          vuln.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          vuln.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          vuln.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {vuln.severity}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{vuln.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Zap className="h-6 w-6 text-orange-400 mr-2" />
              <h3 className="text-xl font-semibold text-white">AI-Powered Insights</h3>
            </div>
            {!aiInsights && (
              <button
                onClick={generateAIInsights}
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
                  onClick={generateAIInsights}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Generate AI Analysis
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 