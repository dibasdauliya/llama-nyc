import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
})

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

      return NextResponse.json(analysisData)
    } catch (error: any) {
      // If we can't fetch additional data, still return basic analysis
      console.warn('Could not fetch all repository data:', error.message)
      const analysisData = generateMockAnalysisData(repoData)
      return NextResponse.json(analysisData)
    }

  } catch (error: any) {
    console.error('Error analyzing repository:', error)
    
    if (error.status === 404) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      )
    }
    
    if (error.status === 403) {
      return NextResponse.json(
        { error: 'Access denied. Repository may be private.' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to analyze repository' },
      { status: 500 }
    )
  }
} 