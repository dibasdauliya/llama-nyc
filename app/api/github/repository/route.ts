import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '../../../../lib/db'

async function getGitHubData(owner: string, repo: string, accessToken?: string) {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Analyzer/1.0'
  }
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }
  
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers,
    next: { revalidate: 300 } // Cache for 5 minutes
  })
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Repository not found')
    }
    if (response.status === 403) {
      throw new Error('Access denied or rate limit exceeded')
    }
    throw new Error(`GitHub API error: ${response.status}`)
  }
  
  return response.json()
}

async function saveRepositoryToDatabase(repoData: any, userId?: string) {
  try {
    // First, upsert the repository
    const repository = await prisma.repository.upsert({
      where: {
        fullName: repoData.full_name
      },
      update: {
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        watchers: repoData.watchers_count,
        size: repoData.size,
        openIssues: repoData.open_issues_count,
        isPrivate: repoData.private,
        isArchived: repoData.archived,
        htmlUrl: repoData.html_url,
        cloneUrl: repoData.clone_url,
        defaultBranch: repoData.default_branch,
        topics: repoData.topics || [],
        license: repoData.license?.name,
        hasWiki: repoData.has_wiki,
        hasPages: repoData.has_pages,
        hasProjects: repoData.has_projects,
        lastSyncAt: new Date(),
        updatedAt: new Date()
      },
      create: {
        owner: repoData.owner.login,
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        watchers: repoData.watchers_count,
        size: repoData.size,
        openIssues: repoData.open_issues_count,
        isPrivate: repoData.private,
        isArchived: repoData.archived,
        htmlUrl: repoData.html_url,
        cloneUrl: repoData.clone_url,
        defaultBranch: repoData.default_branch,
        topics: repoData.topics || [],
        license: repoData.license?.name,
        hasWiki: repoData.has_wiki,
        hasPages: repoData.has_pages,
        hasProjects: repoData.has_projects,
        lastSyncAt: new Date()
      }
    })

    // Track the repository view only if we have a valid user ID
    if (userId) {
      try {
        // First check if the user exists in the database
        const userExists = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true }
        })
        
        if (userExists) {
          await prisma.repositoryView.create({
            data: {
              userId: userId,
              repositoryId: repository.id,
              viewedAt: new Date()
            }
          })
        } else {
          console.warn(`User with ID ${userId} not found in database, skipping repository view tracking`)
        }
      } catch (viewError) {
        console.error('Error creating repository view:', viewError)
        // Don't fail the whole operation if we can't track the view
      }
    }

    return repository
  } catch (error) {
    console.error('Error saving repository to database:', error)
    // Don't throw error here - just log it, as the main functionality should still work
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
    
    const session = await getServerSession(authOptions)
    const accessToken = session?.githubAccessToken
    
    try {
      const repoData = await getGitHubData(owner, repo, accessToken)
      
      // Save to database if possible
      if (session?.user?.id) {
        await saveRepositoryToDatabase(repoData, session.user.id)
      }
      
      return NextResponse.json(repoData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // If no access token and we get a 404, it might be a private repo
      if (!accessToken && errorMessage.includes('not found')) {
        return NextResponse.json(
          { 
            error: 'Repository not found or access denied',
            requiresAuth: true,
            message: 'This repository might be private. Sign in with GitHub to access it.'
          },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: errorMessage },
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