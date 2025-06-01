import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '../../../../lib/db'

// Helper function to normalize repository data
function normalizeRepositoryData(repo: any): any {
  return {
    id: repo.id || `temp-${Date.now()}`,
    owner: repo.owner || 'Unknown',
    name: repo.name || 'Unknown',
    fullName: repo.fullName || `${repo.owner}/${repo.name}`,
    description: repo.description || 'No description available',
    language: repo.language || 'Unknown',
    stars: Number(repo.stars) || 0,
    forks: Number(repo.forks) || 0,
    watchers: Number(repo.watchers) || 0,
    isPrivate: Boolean(repo.isPrivate),
    htmlUrl: repo.htmlUrl || `https://github.com/${repo.fullName}`,
    lastViewedAt: repo.lastViewedAt instanceof Date ? repo.lastViewedAt.toISOString() : repo.lastViewedAt,
    viewCount: Number(repo.viewCount) || 1
  }
}

async function getRepositoriesFromDatabase(userId?: string, includePrivate: boolean = false, limit: number = 10) {
  try {
    console.log(`Fetching repositories for user: ${userId}, includePrivate: ${includePrivate}, limit: ${limit}`)
    
    if (!userId) {
      console.log('No user ID provided, returning empty array')
      return []
    }

    // Get repositories viewed by the user, with view counts and latest view times
    const repoViews = await prisma.repositoryView.findMany({
      where: {
        userId: userId
      },
      include: {
        repository: {
          select: {
            id: true,
            owner: true,
            name: true,
            fullName: true,
            description: true,
            language: true,
            stars: true,
            forks: true,
            watchers: true,
            isPrivate: true,
            htmlUrl: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: {
        viewedAt: 'desc'
      },
      take: limit * 2 // Get more to handle grouping
    })

    console.log(`Found ${repoViews.length} repository views`)

    // Group by repository and count views, transform data to frontend format
    const repositoryMap = new Map<string, any>()
    
    repoViews.forEach((view: any) => {
      const repoId = view.repository.id
      if (!repositoryMap.has(repoId)) {
        // Transform database format to frontend format
        repositoryMap.set(repoId, normalizeRepositoryData({
          id: view.repository.id,
          owner: view.repository.owner,
          name: view.repository.name,
          fullName: view.repository.fullName,
          description: view.repository.description,
          language: view.repository.language,
          stars: view.repository.stars,
          forks: view.repository.forks,
          watchers: view.repository.watchers,
          isPrivate: view.repository.isPrivate,
          htmlUrl: view.repository.htmlUrl,
          lastViewedAt: view.viewedAt,
          viewCount: 1
        }))
      } else {
        const existing = repositoryMap.get(repoId)
        existing.viewCount += 1
        // Keep the latest view time
        if (view.viewedAt > existing.lastViewedAt) {
          existing.lastViewedAt = view.viewedAt
        }
      }
    })

    let repositories = Array.from(repositoryMap.values())

    // Filter by privacy if needed
    if (!includePrivate) {
      repositories = repositories.filter((repo: any) => !repo.isPrivate)
    }

    // Sort by last viewed date
    repositories.sort((a: any, b: any) => new Date(b.lastViewedAt).getTime() - new Date(a.lastViewedAt).getTime())

    console.log(`Returning ${repositories.length} repositories after filtering and sorting`)
    return repositories.slice(0, limit)
  } catch (error) {
    console.error('Error fetching repositories from database:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const includePrivate = searchParams.get('includePrivate') === 'true'

    console.log('Dashboard API called with session:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      includePrivate,
      limit
    })

    const repositories = await getRepositoriesFromDatabase(
      session?.user?.id,
      includePrivate && !!session,
      limit
    )

    return NextResponse.json({
      repositories: repositories.map(repo => ({
        ...repo,
        lastViewedAt: typeof repo.lastViewedAt === 'string' 
          ? repo.lastViewedAt 
          : repo.lastViewedAt.toISOString()
      })),
      total: repositories.length,
      hasMore: false // For now, we'll implement pagination later
    })
  } catch (error) {
    console.error('Error fetching viewed repositories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
} 