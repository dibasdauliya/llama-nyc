import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

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
          message: 'Please sign in with GitHub to access private repositories'
        },
        { status: 401 }
      )
    }

    const octokit = new Octokit({
      auth: githubToken,
    })

    try {
      const { data } = await octokit.repos.get({
        owner,
        repo,
      })

      // Transform the data to match our interface
      const repoData = {
        name: data.name,
        description: data.description,
        stars: data.stargazers_count,
        forks: data.forks_count,
        watchers: data.watchers_count,
        language: data.language,
        languages: {}, // Will be populated by a separate call if needed
        created_at: data.created_at,
        updated_at: data.updated_at,
        size: data.size,
        open_issues: data.open_issues_count,
        license: data.license?.name || 'No license',
        default_branch: data.default_branch,
        private: data.private,
        html_url: data.html_url,
        clone_url: data.clone_url,
        topics: data.topics || [],
        has_wiki: data.has_wiki,
        has_pages: data.has_pages,
        has_projects: data.has_projects,
        archived: data.archived,
        disabled: data.disabled,
        visibility: data.visibility,
      }

      return NextResponse.json(repoData)
    } catch (error: any) {
      console.error('GitHub API error:', error)
      
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
        { error: 'Failed to fetch repository data' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Repository API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 