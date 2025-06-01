import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '../../../../lib/db'

// Mock data generator for demo purposes
// In a real implementation, you would analyze the actual repository code
function generateMockAnalysisData(repoData: any) {
  const languages = ['TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Rust']
  const fileTypes = languages.slice(0, Math.floor(Math.random() * 4) + 2).map(lang => ({
    name: lang,
    count: Math.floor(Math.random() * 100) + 10,
    lines: Math.floor(Math.random() * 10000) + 1000
  }))

  const commits = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    count: Math.floor(Math.random() * 10)
  }))

  const contributors = [
    { login: 'john-doe', contributions: 245, avatar_url: 'https://github.com/identicons/johndoe.png' },
    { login: 'jane-smith', contributions: 189, avatar_url: 'https://github.com/identicons/janesmith.png' },
    { login: 'dev-user', contributions: 156, avatar_url: 'https://github.com/identicons/devuser.png' },
    { login: 'code-master', contributions: 134, avatar_url: 'https://github.com/identicons/codemaster.png' },
    { login: 'tech-lead', contributions: 89, avatar_url: 'https://github.com/identicons/techlead.png' }
  ]

  const vulnerabilities = Math.random() > 0.7 ? [
    {
      severity: 'medium' as const,
      title: 'Outdated dependency detected',
      description: 'lodash version 4.17.15 has known security vulnerabilities'
    },
    {
      severity: 'low' as const,
      title: 'Missing security headers',
      description: 'Application should implement proper security headers'
    }
  ] : []

  return {
    codeMetrics: {
      totalLines: Math.floor(Math.random() * 50000) + 10000,
      totalFiles: Math.floor(Math.random() * 500) + 100,
      avgComplexity: Math.random() * 5 + 2,
      testCoverage: Math.floor(Math.random() * 40) + 60
    },
    securityScore: Math.floor(Math.random() * 40) + 60,
    maintainabilityScore: Math.floor(Math.random() * 30) + 70,
    documentationScore: Math.floor(Math.random() * 50) + 50,
    commits,
    contributors,
    fileTypes,
    vulnerabilities
  }
}

// Generate mock analysis data (replace with real analysis later)
function generateAnalysisData(owner: string, repo: string) {
  const baseScore = Math.floor(Math.random() * 40) + 50; // 50-90 range
  
  return {
    codeMetrics: {
      totalLines: Math.floor(Math.random() * 500000) + 10000,
      totalFiles: Math.floor(Math.random() * 5000) + 100,
      avgComplexity: +(Math.random() * 10 + 2).toFixed(1),
      testCoverage: Math.floor(Math.random() * 40) + 60
    },
    securityScore: baseScore + Math.floor(Math.random() * 20) - 10,
    maintainabilityScore: baseScore + Math.floor(Math.random() * 20) - 10,
    documentationScore: baseScore + Math.floor(Math.random() * 20) - 10,
    commits: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 15)
    })).reverse(),
    contributors: [
      {
        login: owner,
        contributions: Math.floor(Math.random() * 200) + 50,
        avatar_url: `https://github.com/${owner}.png`
      },
      {
        login: 'contributor1',
        contributions: Math.floor(Math.random() * 100) + 20,
        avatar_url: 'https://github.com/contributor1.png'
      },
      {
        login: 'contributor2',
        contributions: Math.floor(Math.random() * 80) + 10,
        avatar_url: 'https://github.com/contributor2.png'
      }
    ],
    fileTypes: [
      { name: 'TypeScript', count: 45, lines: 15000 },
      { name: 'JavaScript', count: 32, lines: 8000 },
      { name: 'CSS', count: 12, lines: 3000 },
      { name: 'HTML', count: 8, lines: 2000 },
      { name: 'JSON', count: 15, lines: 1500 }
    ],
    vulnerabilities: baseScore < 70 ? [
      {
        severity: 'medium' as const,
        title: 'Outdated Dependencies',
        description: 'Some dependencies are outdated and may contain security vulnerabilities'
      },
      {
        severity: 'low' as const,
        title: 'Missing Security Headers',
        description: 'Some recommended security headers are not configured'
      }
    ] : []
  }
}

async function saveAnalysisToDatabase(
  repositoryFullName: string,
  analysisData: any,
  userId?: string
) {
  try {
    // Find the repository
    const repository = await prisma.repository.findUnique({
      where: { fullName: repositoryFullName }
    })

    if (!repository) {
      console.error(`Repository ${repositoryFullName} not found in database`)
      return null
    }

    // Check if analysis already exists for this repository
    const existingAnalysis = await prisma.repositoryAnalysis.findFirst({
      where: { repositoryId: repository.id }
    })

    let analysis
    if (existingAnalysis) {
      // Update existing analysis
      analysis = await prisma.repositoryAnalysis.update({
        where: { id: existingAnalysis.id },
        data: {
          totalLines: analysisData.codeMetrics.totalLines,
          totalFiles: analysisData.codeMetrics.totalFiles,
          avgComplexity: analysisData.codeMetrics.avgComplexity,
          testCoverage: analysisData.codeMetrics.testCoverage,
          securityScore: analysisData.securityScore,
          maintainabilityScore: analysisData.maintainabilityScore,
          documentationScore: analysisData.documentationScore,
          vulnerabilities: analysisData.vulnerabilities,
          contributors: analysisData.contributors,
          commits: analysisData.commits,
          fileTypes: analysisData.fileTypes,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new analysis
      analysis = await prisma.repositoryAnalysis.create({
        data: {
          repositoryId: repository.id,
          totalLines: analysisData.codeMetrics.totalLines,
          totalFiles: analysisData.codeMetrics.totalFiles,
          avgComplexity: analysisData.codeMetrics.avgComplexity,
          testCoverage: analysisData.codeMetrics.testCoverage,
          securityScore: analysisData.securityScore,
          maintainabilityScore: analysisData.maintainabilityScore,
          documentationScore: analysisData.documentationScore,
          vulnerabilities: analysisData.vulnerabilities,
          contributors: analysisData.contributors,
          commits: analysisData.commits,
          fileTypes: analysisData.fileTypes
        }
      })
    }

    return analysis
  } catch (error) {
    console.error('Error saving analysis to database:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')
    const repo = searchParams.get('repo')

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Owner and repo parameters are required' },
        { status: 400 }
      )
    }

    // Get user session to access their GitHub token
    const session = await getServerSession(authOptions)
    
    // Use user's GitHub token if available, otherwise fall back to server token
    const githubToken = session?.githubAccessToken || process.env.GITHUB_ACCESS_TOKEN
    
    if (!githubToken) {
      return NextResponse.json(
        { 
          error: 'GitHub access required',
          requiresAuth: true,
          message: 'Please sign in with GitHub to analyze private repositories'
        },
        { status: 401 }
      )
    }

    const octokit = new Octokit({
      auth: githubToken,
    })

    // Fetch basic repository data for analysis context
    const { data: repoData } = await octokit.rest.repos.get({
      owner,
      repo,
    })

    // Fetch contributors
    try {
      const { data: contributorsData } = await octokit.rest.repos.listContributors({
        owner,
        repo,
        per_page: 10
      })

      // Fetch commit activity
      const { data: commitActivity } = await octokit.rest.repos.getCommitActivityStats({
        owner,
        repo,
      })

      // Generate comprehensive analysis
      const analysisData = generateMockAnalysisData(repoData)
      
      // Override with real data where available
      if (contributorsData.length > 0) {
        analysisData.contributors = contributorsData.map(contributor => ({
          login: contributor.login || 'anonymous',
          contributions: contributor.contributions || 0,
          avatar_url: contributor.avatar_url || ''
        }))
      }

      // Save to database if possible
      if (session?.user?.id) {
        await saveAnalysisToDatabase(`${owner}/${repo}`, analysisData, session.user.id)
      }
      
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return NextResponse.json(analysisData)
    } catch (error: any) {
      // If we can't fetch additional data, still return basic analysis
      console.warn('Could not fetch all repository data:', error.message)
      const analysisData = generateMockAnalysisData(repoData)
      return NextResponse.json(analysisData)
    }

  } catch (error: any) {
    console.error('Error analyzing repository:', error)
    
    // Get session for error handling
    const session = await getServerSession(authOptions)
    
    if (error.status === 404) {
      return NextResponse.json(
        { 
          error: 'Repository not found or access denied',
          requiresAuth: !session?.githubAccessToken,
          message: session?.githubAccessToken 
            ? 'Repository not found or you do not have access to this private repository'
            : 'Repository not found. If this is a private repository, please sign in with GitHub'
        },
        { status: 404 }
      )
    }
    
    if (error.status === 403) {
      return NextResponse.json(
        { 
          error: 'GitHub API rate limit exceeded or access forbidden',
          requiresAuth: !session?.githubAccessToken,
          message: 'API rate limit exceeded. Please sign in with GitHub for higher rate limits'
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to analyze repository' },
      { status: 500 }
    )
  }
} 