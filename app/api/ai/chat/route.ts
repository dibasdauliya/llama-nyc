import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  try {
    const { message, repository, analysis, chatHistory } = await request.json()

    if (!message || !repository || !analysis) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user session for potential rate limiting
    const session = await getServerSession(authOptions)

    // Build context from repository and analysis data
    const context = `
Repository: ${repository.name}
Description: ${repository.description || 'No description'}
Language: ${repository.language || 'Unknown'}
Stars: ${repository.stars || 0}
Forks: ${repository.forks || 0}
Private: ${repository.private ? 'Yes' : 'No'}
License: ${repository.license || 'No license'}

Code Analysis:
- Total Lines: ${analysis.codeMetrics?.totalLines?.toLocaleString() || 'Unknown'}
- Total Files: ${analysis.codeMetrics?.totalFiles?.toLocaleString() || 'Unknown'}
- Average Complexity: ${analysis.codeMetrics?.avgComplexity || 'Unknown'}
- Test Coverage: ${analysis.codeMetrics?.testCoverage || 'Unknown'}%
- Security Score: ${analysis.securityScore || 'Unknown'}/100
- Maintainability Score: ${analysis.maintainabilityScore || 'Unknown'}/100
- Documentation Score: ${analysis.documentationScore || 'Unknown'}/100

Technology Stack:
${analysis.techStack?.map((tech: any) => `- ${tech.name} (${tech.type})`).join('\n') || 'No tech stack detected'}

File Types:
${analysis.fileTypes?.map((type: any) => `- ${type.name}: ${type.lines.toLocaleString()} lines`).join('\n') || 'No file types available'}

Security Issues:
${analysis.vulnerabilities?.length > 0 
  ? analysis.vulnerabilities.map((vuln: any) => `- ${vuln.severity}: ${vuln.title}`).join('\n')
  : 'No security vulnerabilities detected'
}

Top Contributors:
${analysis.contributors?.slice(0, 3).map((contrib: any) => `- ${contrib.login}: ${contrib.contributions} commits`).join('\n') || 'No contributors data'}
`

    // Build chat history context
    const historyContext = chatHistory?.length > 0 
      ? `\n\nRecent conversation:\n${chatHistory.map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}`
      : ''

    // Generate AI response
    const prompt = `You are an expert software engineer and code analyst. You have access to detailed information about a GitHub repository and its analysis data. Please provide helpful, accurate, and actionable insights based on the user's question.

Repository Context:
${context}${historyContext}

User Question: ${message}

Please provide a comprehensive answer that:
1. Directly addresses the user's question
2. References specific data from the repository analysis when relevant
3. Provides actionable insights and recommendations
4. Uses a friendly but professional tone
5. Formats the response clearly with bullet points or sections when appropriate

Keep your response focused and practical. If you don't have enough information to answer completely, explain what additional information would be helpful.`

    // In a real implementation, you would call an AI service like OpenAI
    // For now, we'll provide contextual responses based on the question
    let reply = generateContextualResponse(message.toLowerCase(), repository, analysis)

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

function generateContextualResponse(message: string, repository: any, analysis: any): string {
  // Technology-related questions
  if (message.includes('technolog') || message.includes('stack') || message.includes('framework')) {
    const techStack = analysis.techStack || []
    const languages = analysis.fileTypes || []
    
    return `## Technology Stack Analysis

**Primary Technologies:**
${techStack.slice(0, 5).map((tech: any) => `• **${tech.name}** - ${tech.type} ${tech.confidence === 'high' ? '✅' : '⚠️'}`).join('\n')}

**Language Distribution:**
${languages.slice(0, 3).map((lang: any) => {
  const total = languages.reduce((sum: number, l: any) => sum + l.lines, 0)
  const percentage = ((lang.lines / total) * 100).toFixed(1)
  return `• **${lang.name}**: ${percentage}% (${lang.lines.toLocaleString()} lines)`
}).join('\n')}

**Key Insights:**
- This project uses **${repository.language || 'multiple languages'}** as the primary language
- Technology stack suggests a **${getTechStackType(techStack)}** project
- The codebase shows **${getComplexityLevel(analysis.codeMetrics?.avgComplexity)}** complexity levels`
  }

  // Code quality questions
  if (message.includes('quality') || message.includes('maintainability') || message.includes('clean')) {
    return `## Code Quality Assessment

**Overall Scores:**
• **Security**: ${analysis.securityScore || 'N/A'}/100 ${getScoreEmoji(analysis.securityScore)}
• **Maintainability**: ${analysis.maintainabilityScore || 'N/A'}/100 ${getScoreEmoji(analysis.maintainabilityScore)}
• **Documentation**: ${analysis.documentationScore || 'N/A'}/100 ${getScoreEmoji(analysis.documentationScore)}

**Code Metrics:**
• **Lines of Code**: ${(analysis.codeMetrics?.totalLines || 0).toLocaleString()}
• **Files**: ${(analysis.codeMetrics?.totalFiles || 0).toLocaleString()}
• **Average Complexity**: ${analysis.codeMetrics?.avgComplexity || 'Unknown'}
• **Test Coverage**: ${analysis.codeMetrics?.testCoverage || 'Unknown'}%

**Quality Insights:**
${getQualityInsights(analysis)}`
  }

  // Improvement suggestions
  if (message.includes('improve') || message.includes('suggestion') || message.includes('recommend')) {
    return `## Improvement Recommendations

**Priority Areas:**
${getImprovementSuggestions(analysis)}

**Security Considerations:**
${analysis.vulnerabilities?.length > 0 
  ? analysis.vulnerabilities.map((vuln: any) => `• **${vuln.severity.toUpperCase()}**: ${vuln.title} - ${vuln.description}`).join('\n')
  : '✅ No immediate security vulnerabilities detected'}

**Next Steps:**
1. Focus on areas with lower scores first
2. Consider adding automated testing if coverage is low
3. Improve documentation for better maintainability
4. Regular security audits and dependency updates`
  }

  // General repository information
  if (message.includes('about') || message.includes('overview') || message.includes('summary')) {
    return `## Repository Overview

**${repository.name}**
${repository.description || 'No description available'}

**Key Statistics:**
• **Stars**: ${(repository.stars || 0).toLocaleString()} ⭐
• **Forks**: ${(repository.forks || 0).toLocaleString()} 🍴
• **Primary Language**: ${repository.language || 'Unknown'}
• **License**: ${repository.license || 'No license specified'}

**Codebase Size:**
• **${(analysis.codeMetrics?.totalLines || 0).toLocaleString()}** lines of code
• **${(analysis.codeMetrics?.totalFiles || 0).toLocaleString()}** files
• **${analysis.techStack?.length || 0}** technologies detected

**Activity:**
• **${analysis.contributors?.length || 0}** contributors
• **${repository.private ? 'Private' : 'Public'}** repository

This appears to be a **${getProjectType(repository, analysis)}** project with **${getActivityLevel(analysis)}** activity levels.`
  }

  // Default response
  return `I can help you understand this repository better! Here's what I can tell you:

**Repository**: ${repository.name}
**Language**: ${repository.language || 'Multiple languages'}
**Size**: ${(analysis.codeMetrics?.totalLines || 0).toLocaleString()} lines of code

I can provide insights about:
• Technology stack and frameworks used
• Code quality and maintainability
• Security analysis and vulnerabilities  
• Improvement suggestions and best practices
• Architecture patterns and structure

Feel free to ask specific questions about any of these areas!`
}

function getTechStackType(techStack: any[]): string {
  if (techStack.some(t => t.name.toLowerCase().includes('react') || t.name.toLowerCase().includes('vue') || t.name.toLowerCase().includes('angular'))) {
    return 'frontend-focused'
  }
  if (techStack.some(t => t.name.toLowerCase().includes('express') || t.name.toLowerCase().includes('fastify') || t.name.toLowerCase().includes('django'))) {
    return 'backend-focused'
  }
  if (techStack.some(t => t.name.toLowerCase().includes('next') || t.name.toLowerCase().includes('nuxt'))) {
    return 'full-stack'
  }
  return 'general purpose'
}

function getComplexityLevel(complexity: number): string {
  if (complexity > 8) return 'high'
  if (complexity > 5) return 'moderate'
  return 'low'
}

function getScoreEmoji(score: number): string {
  if (score >= 80) return '🟢'
  if (score >= 60) return '🟡'
  return '🔴'
}

function getQualityInsights(analysis: any): string {
  const insights = []
  
  if ((analysis.securityScore || 0) < 60) {
    insights.push('• Security needs attention - consider vulnerability scanning')
  }
  if ((analysis.maintainabilityScore || 0) < 60) {
    insights.push('• Maintainability could be improved with better code organization')
  }
  if ((analysis.documentationScore || 0) < 60) {
    insights.push('• Documentation is lacking - add README, comments, and API docs')
  }
  if ((analysis.codeMetrics?.testCoverage || 0) < 50) {
    insights.push('• Test coverage is low - consider adding more tests')
  }
  
  if (insights.length === 0) {
    insights.push('• Overall code quality looks good!')
  }
  
  return insights.join('\n')
}

function getImprovementSuggestions(analysis: any): string {
  const suggestions = []
  
  if ((analysis.securityScore || 0) < 70) {
    suggestions.push('🔒 **Security**: Update dependencies, add security headers, implement proper authentication')
  }
  if ((analysis.maintainabilityScore || 0) < 70) {
    suggestions.push('🔧 **Maintainability**: Refactor complex functions, improve code organization, add linting')
  }
  if ((analysis.documentationScore || 0) < 70) {
    suggestions.push('📚 **Documentation**: Add comprehensive README, API documentation, code comments')
  }
  if ((analysis.codeMetrics?.testCoverage || 0) < 60) {
    suggestions.push('🧪 **Testing**: Increase test coverage, add integration tests, setup CI/CD')
  }
  
  if (suggestions.length === 0) {
    suggestions.push('✅ **Great job!** Your codebase is in good shape. Consider minor optimizations and keeping dependencies updated.')
  }
  
  return suggestions.join('\n')
}

function getProjectType(repository: any, analysis: any): string {
  const techStack = analysis.techStack || []
  const name = repository.name.toLowerCase()
  
  if (name.includes('api') || techStack.some((t: any) => t.type.includes('Backend'))) {
    return 'API/Backend'
  }
  if (name.includes('app') || name.includes('ui') || techStack.some((t: any) => t.type.includes('Frontend'))) {
    return 'Application/Frontend'
  }
  if (name.includes('lib') || name.includes('package')) {
    return 'Library/Package'
  }
  return 'Development'
}

function getActivityLevel(analysis: any): string {
  const contributors = analysis.contributors?.length || 0
  const commits = analysis.commits?.reduce((sum: number, day: any) => sum + day.count, 0) || 0
  
  if (contributors > 10 && commits > 50) return 'high'
  if (contributors > 3 && commits > 20) return 'moderate'
  return 'low'
} 