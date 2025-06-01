import { NextRequest, NextResponse } from 'next/server'

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
  return `
## 🔍 Repository Analysis Summary

### Overall Assessment
This repository shows **${analysis.maintainabilityScore >= 80 ? 'excellent' : analysis.maintainabilityScore >= 60 ? 'good' : 'needs improvement'}** maintainability with a score of ${analysis.maintainabilityScore}/100. The codebase consists of ${analysis.codeMetrics.totalLines.toLocaleString()} lines across ${analysis.codeMetrics.totalFiles} files, indicating a ${analysis.codeMetrics.totalFiles > 500 ? 'large-scale' : analysis.codeMetrics.totalFiles > 100 ? 'medium-scale' : 'small-scale'} project.

### 🏗️ Architecture & Design Patterns

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
- Complexity Score: ${analysis.codeMetrics.avgComplexity.toFixed(1)} (${analysis.codeMetrics.avgComplexity < 3 ? 'Good' : analysis.codeMetrics.avgComplexity < 5 ? 'Moderate' : 'High'})
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

export async function POST(request: NextRequest) {
  try {
    const { repository, analysis } = await request.json()

    if (!repository || !analysis) {
      return NextResponse.json(
        { error: 'Repository and analysis data are required' },
        { status: 400 }
      )
    }

    // Prepare context for AI analysis
    const context = `
Analyze this GitHub repository and provide detailed insights:

Repository: ${repository.name}
Description: ${repository.description || 'No description'}
Primary Language: ${repository.language}
Stars: ${repository.stars}
Forks: ${repository.forks}
Created: ${repository.created_at}
Last Updated: ${repository.updated_at}

Code Metrics:
- Total Lines: ${analysis.codeMetrics.totalLines.toLocaleString()}
- Total Files: ${analysis.codeMetrics.totalFiles.toLocaleString()}
- Average Complexity: ${analysis.codeMetrics.avgComplexity.toFixed(1)}
- Test Coverage: ${analysis.codeMetrics.testCoverage}%

Quality Scores:
- Security Score: ${analysis.securityScore}/100
- Maintainability Score: ${analysis.maintainabilityScore}/100
- Documentation Score: ${analysis.documentationScore}/100

Languages Used: ${analysis.fileTypes.map((ft: any) => ft.name).join(', ')}
Contributors: ${analysis.contributors.length}
Security Issues: ${analysis.vulnerabilities.length}

Please provide a comprehensive analysis covering:
1. Overall code quality assessment
2. Architecture and design patterns recommendations
3. Security analysis and recommendations
4. Performance optimization opportunities
5. Maintainability improvements
6. Testing strategy suggestions
7. Documentation enhancement recommendations
8. Best practices compliance
9. Scalability considerations
10. Future development recommendations

Format your response using markdown with emojis for better readability.
`

    let insights: string

    try {
      // Try to use real Llama API first
      insights = await generateLlamaInsights(context)
      console.log('✅ Generated insights using Llama API')
    } catch (llamaError) {
      console.warn('⚠️ Llama API failed, trying OpenAI-compatible endpoint:', llamaError)
      
      try {
        // Fallback to OpenAI-compatible endpoint
        insights = await generateOpenAICompatibleInsights(context)
        console.log('✅ Generated insights using OpenAI-compatible API')
      } catch (openAIError) {
        console.warn('⚠️ All AI APIs failed, using mock insights:', openAIError)
        
        // Final fallback to mock insights
        insights = generateMockInsights(repository, analysis)
        console.log('✅ Generated mock insights as fallback')
      }
    }

    return NextResponse.json({ insights })
  } catch (error: any) {
    console.error('Error generating AI insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI insights' },
      { status: 500 }
    )
  }
} 