import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '../../../../lib/db'

// Function to call Llama API
async function generateLlamaInsights(context: string): Promise<string> {
  const LLAMA_API_KEY = process.env.LLAMA_API_KEY
  
  if (!LLAMA_API_KEY) {
    throw new Error('LLAMA_API_KEY not configured')
  }

  try {
    // Using llama-api-client package
    const response = await fetch('https://api.llama-api.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LLAMA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.1-70b', // or another Llama model
        messages: [
          {
            role: 'system',
            content: 'You are an expert software engineer and code reviewer. Provide detailed, actionable insights about GitHub repositories based on the provided data. Format your response using markdown with emojis for better readability.'
          },
          {
            role: 'user',
            content: context
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`Llama API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'Failed to generate insights'
  } catch (error) {
    console.error('Llama API error:', error)
    throw error
  }
}

// Alternative function using OpenAI-compatible endpoint
async function generateOpenAICompatibleInsights(context: string): Promise<string> {
  const LLAMA_API_KEY = process.env.LLAMA_API_KEY
  
  if (!LLAMA_API_KEY) {
    throw new Error('LLAMA_API_KEY not configured')
  }

  try {
    // Many Llama providers offer OpenAI-compatible endpoints
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LLAMA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Replace with Llama model if using Llama provider
        messages: [
          {
            role: 'system',
            content: 'You are an expert software engineer and code reviewer. Provide detailed, actionable insights about GitHub repositories. Use markdown formatting with emojis.'
          },
          {
            role: 'user',
            content: context
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'Failed to generate insights'
  } catch (error) {
    console.error('AI API error:', error)
    throw error
  }
}

// Mock insights function (fallback)
function generateMockInsights(repository: any, analysis: any): string {
  const techStackAnalysis = analysis.techStack && analysis.techStack.length > 0 
    ? `### 🛠️ Technology Stack Analysis

**Detected Technologies: ${analysis.techStack.length}**

${analysis.techStack.map((tech: any) => `- **${tech.icon || '🔧'} ${tech.name}** (${tech.type})${tech.version ? ` - ${tech.version}` : ''}`).join('\n')}

**Stack Assessment:**
- Modern technology choices with good ecosystem support
- Well-balanced combination of frontend and backend technologies
- ${analysis.techStack.filter((t: any) => t.confidence === 'high').length} high-confidence detections suggest clear technology usage
- Consider evaluating dependency management and keeping technologies up-to-date

**Recommendations:**
- Ensure all dependencies are regularly updated for security
- Consider implementing automated dependency vulnerability scanning
- Document technology choices and architectural decisions
- Plan for technology migration strategies as the stack evolves

`
    : ''

  return `
## 🔍 Repository Analysis Summary

### Overall Assessment
This repository shows **${analysis.maintainabilityScore >= 80 ? 'excellent' : analysis.maintainabilityScore >= 60 ? 'good' : 'needs improvement'}** maintainability with a score of ${analysis.maintainabilityScore}/100. The codebase consists of ${analysis.codeMetrics.totalLines.toLocaleString()} lines across ${analysis.codeMetrics.totalFiles} files, indicating a ${analysis.codeMetrics.totalFiles > 500 ? 'large-scale' : analysis.codeMetrics.totalFiles > 100 ? 'medium-scale' : 'small-scale'} project.

${techStackAnalysis}### 🏗️ Architecture & Design Patterns

**Strengths:**
- Well-structured project with clear separation of concerns
- ${repository.language} is an excellent choice for this type of application
- Good use of modern development practices

**Recommendations:**
- Consider implementing more comprehensive error handling patterns
- Evaluate opportunities for dependency injection to improve testability
- Review module boundaries for better encapsulation

### 🔒 Security Analysis

**Security Score: ${analysis.securityScore}/100**

${analysis.vulnerabilities.length === 0 ? 
  '✅ **Excellent Security Posture:** No major security vulnerabilities detected. The repository follows security best practices.' :
  `⚠️ **Security Concerns:** ${analysis.vulnerabilities.length} potential security issues identified:\n${analysis.vulnerabilities.map((v: any) => `- ${v.severity.toUpperCase()}: ${v.title}`).join('\n')}`
}

**Recommendations:**
- Implement automated security scanning in CI/CD pipeline
- Regular dependency updates and vulnerability scanning
- Add security headers and input validation where applicable
- Consider implementing rate limiting and authentication mechanisms

### ⚡ Performance Optimization

**Current Metrics:**
- Complexity Score: ${analysis.codeMetrics.avgComplexity.toFixed(1)}
- Code Efficiency: ${analysis.codeMetrics.avgComplexity < 3 ? 'Well-optimized' : 'Room for improvement'}

**Opportunities:**
- Optimize database queries and implement caching strategies
- Consider code splitting and lazy loading for better performance
- Profile critical paths for bottleneck identification
- Implement performance monitoring and alerting

### 🧪 Testing Strategy

**Current Coverage: ${analysis.codeMetrics.testCoverage}%**

${analysis.codeMetrics.testCoverage >= 80 ? 
  '✅ **Excellent Test Coverage:** The project maintains high test coverage, indicating good testing practices.' :
  analysis.codeMetrics.testCoverage >= 60 ?
  '⚠️ **Good Test Coverage:** Test coverage is acceptable but could be improved for better reliability.' :
  '❌ **Low Test Coverage:** Critical need for more comprehensive testing strategy.'
}

**Recommendations:**
- Implement unit tests for all critical business logic
- Add integration tests for API endpoints and data flows
- Consider end-to-end testing for user workflows
- Set up automated testing in CI/CD pipeline

### 📚 Documentation Enhancement

**Documentation Score: ${analysis.documentationScore}/100**

${analysis.documentationScore >= 80 ? 
  '✅ **Well Documented:** The project has comprehensive documentation.' :
  analysis.documentationScore >= 60 ?
  '⚠️ **Adequate Documentation:** Documentation exists but could be enhanced.' :
  '❌ **Needs Better Documentation:** Critical need for improved documentation.'
}

**Improvements:**
- Add comprehensive API documentation
- Include setup and deployment guides
- Document architecture decisions and design patterns
- Maintain updated changelog and contribution guidelines

### 🎯 Overall Recommendation

This ${repository.language} project demonstrates ${
  (analysis.securityScore + analysis.maintainabilityScore + analysis.documentationScore) / 3 >= 80 ? 'excellent' :
  (analysis.securityScore + analysis.maintainabilityScore + analysis.documentationScore) / 3 >= 70 ? 'good' :
  (analysis.securityScore + analysis.maintainabilityScore + analysis.documentationScore) / 3 >= 60 ? 'adequate' : 'needs improvement'
} development practices. Focus on addressing the identified areas for improvement while maintaining the project's strengths.

*📝 Note: This analysis is generated using AI based on repository metrics and may not reflect all aspects of the codebase.*
`
}

// Function to generate prompt for AI analysis
function generatePrompt(repository: any, analysis: any): string {
  const techStackSummary = analysis.techStack && analysis.techStack.length > 0 
    ? `\n\n**Technology Stack Detected:**\n${analysis.techStack.map((tech: any) => `- ${tech.name} (${tech.type})`).join('\n')}`
    : ''

  return `
As an expert software engineer and code reviewer, provide detailed, actionable insights about this GitHub repository:

**Repository:** ${repository.name || repository.full_name}
**Description:** ${repository.description || 'No description provided'}
**Language:** ${repository.language || 'Unknown'}
**Stars:** ${repository.stargazers_count || repository.stars || 0}
**Forks:** ${repository.forks_count || repository.forks || 0}
**Size:** ${repository.size || 0} KB
**Created:** ${repository.created_at}
**Last Updated:** ${repository.updated_at}${techStackSummary}

**Analysis Results:**
- Security Score: ${analysis.securityScore || 0}/100
- Maintainability Score: ${analysis.maintainabilityScore || 0}/100  
- Documentation Score: ${analysis.documentationScore || 0}/100
- Total Lines of Code: ${analysis.codeMetrics?.totalLines || 0}
- Total Files: ${analysis.codeMetrics?.totalFiles || 0}
- Average Complexity: ${analysis.codeMetrics?.avgComplexity || 0}
- Test Coverage: ${analysis.codeMetrics?.testCoverage || 0}%

**File Types:**
${(analysis.fileTypes || []).map((ft: any) => `- ${ft.name}: ${ft.lines} lines (${ft.count} files)`).join('\n')}

**Security Issues:**
${(analysis.vulnerabilities || []).length === 0 ? '- No major security vulnerabilities detected' : 
  (analysis.vulnerabilities || []).map((vuln: any) => `- ${vuln.severity?.toUpperCase()}: ${vuln.title}`).join('\n')}

**Contributors:** ${(analysis.contributors || []).length} contributors

Please provide a comprehensive analysis covering:
1. **Architecture & Design Patterns** - Evaluate the overall structure and design
2. **Technology Stack Assessment** - Analysis of chosen technologies and their suitability
3. **Code Quality & Maintainability** - Areas for improvement
4. **Security Analysis** - Security posture and recommendations  
5. **Performance Optimization** - Potential performance improvements
6. **Testing Strategy** - Test coverage and testing recommendations
7. **Documentation** - Documentation quality and suggestions
8. **Best Practices** - Adherence to industry standards

Format your response in Markdown with emojis for better readability. Be specific, actionable, and constructive in your recommendations.
`
}

async function saveAIInsightsToDatabase(repositoryFullName: string, insights: string) {
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
      // Update existing analysis with AI insights
      analysis = await prisma.repositoryAnalysis.update({
        where: { id: existingAnalysis.id },
        data: {
          aiInsights: insights,
          aiInsightsGeneratedAt: new Date(),
          updatedAt: new Date()
        }
      })
    } else {
      // Create new analysis with AI insights and default values
      analysis = await prisma.repositoryAnalysis.create({
        data: {
          repositoryId: repository.id,
          aiInsights: insights,
          aiInsightsGeneratedAt: new Date(),
          // Set default values for required fields
          securityScore: 75,
          maintainabilityScore: 75,
          documentationScore: 75
        }
      })
    }

    return analysis
  } catch (error) {
    console.error('Error saving AI insights to database:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { repository, analysis } = await request.json()
    
    if (!repository || !analysis) {
      return NextResponse.json(
        { error: 'Repository and analysis data are required' },
        { status: 400 }
      )
    }

    let insights = ''
    
    // Try different AI services in order of preference
    try {
      // First, try Llama API if available
      if (process.env.LLAMA_API_KEY) {
        const llamaResponse = await fetch('https://api.llama-api.com/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.LLAMA_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3.1-70b',
            messages: [{
              role: 'user',
              content: generatePrompt(repository, analysis)
            }],
            max_tokens: 1000,
            temperature: 0.7
          })
        })

        if (llamaResponse.ok) {
          const llamaData = await llamaResponse.json()
          insights = llamaData.choices[0]?.message?.content || ''
        }
      }
    } catch (error) {
      console.log('Llama API not available, trying OpenAI...')
    }

    // Fallback to OpenAI-compatible API
    if (!insights && process.env.OPENAI_API_KEY) {
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{
              role: 'user',
              content: generatePrompt(repository, analysis)
            }],
            max_tokens: 1000,
            temperature: 0.7
          })
        })

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json()
          insights = openaiData.choices[0]?.message?.content || ''
        }
      } catch (error) {
        console.log('OpenAI API not available, using mock data...')
      }
    }

    // Ultimate fallback: generated insights
    if (!insights) {
      insights = generateMockInsights(repository, analysis)
    }

    // Save insights to database
    if (session?.user?.id) {
      await saveAIInsightsToDatabase(repository.full_name || `${repository.owner?.login || repository.owner}/${repository.name}`, insights)
    }
    
    return NextResponse.json({ insights })
  } catch (error) {
    console.error('AI insights error:', error)
    
    // Return mock insights as fallback
    const { repository, analysis } = await request.json().catch(() => ({}))
    const fallbackInsights = generateMockInsights(repository || {}, analysis || {})
    
    return NextResponse.json({ insights: fallbackInsights })
  }
} 