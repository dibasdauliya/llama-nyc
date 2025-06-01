import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
})

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

    // Fetch repository information
    const { data: repoData } = await octokit.rest.repos.get({
      owner,
      repo,
    })

    // Fetch repository languages
    const { data: languages } = await octokit.rest.repos.listLanguages({
      owner,
      repo,
    })

    // Transform the data to match our interface
    const transformedData = {
      name: repoData.name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      watchers: repoData.watchers_count,
      language: repoData.language,
      languages,
      created_at: repoData.created_at,
      updated_at: repoData.updated_at,
      size: repoData.size,
      open_issues: repoData.open_issues_count,
      license: repoData.license?.name || 'No license',
      default_branch: repoData.default_branch,
      private: repoData.private,
      html_url: repoData.html_url,
      clone_url: repoData.clone_url,
      topics: repoData.topics || [],
      has_wiki: repoData.has_wiki,
      has_pages: repoData.has_pages,
      has_projects: repoData.has_projects,
      archived: repoData.archived,
      disabled: repoData.disabled,
      visibility: repoData.visibility,
    }

    return NextResponse.json(transformedData)
  } catch (error: any) {
    console.error('Error fetching repository:', error)
    
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
      { error: 'Failed to fetch repository information' },
      { status: 500 }
    )
  }
} 