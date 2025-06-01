# GitHub Project Analyzer

A comprehensive GitHub repository analyzer that provides detailed insights, statistics, and AI-powered analysis of any public or private GitHub repository.

## Features

- **Repository URL Input**: Simply paste any GitHub repository URL to start analysis
- **Public Repository Support**: Instantly analyze any public GitHub repository
- **Private Repository Access**: Request and handle authentication for private repositories
- **Comprehensive Code Analysis**: 
  - Language distribution and statistics
  - File structure and organization analysis
  - Code complexity metrics
  - Documentation quality assessment
  - Security vulnerability scanning
  - Dependency analysis
  - Git history and contributor insights
- **AI-Powered Insights**: Detailed AI analysis of code patterns, architecture, and best practices
- **Interactive Reports**: Beautiful, detailed reports with charts and visualizations
- **Modern UI**: Clean, responsive interface with real-time analysis progress

## Analysis Features

### Code Metrics
- Lines of code by language
- File count and structure
- Code complexity analysis
- Cyclomatic complexity metrics

### Repository Insights
- Commit history and patterns
- Contributor statistics
- Branch analysis
- Release and tag information

### Quality Assessment
- Documentation coverage
- Code style consistency
- Test coverage analysis
- Security best practices

### AI Analysis
- Architecture pattern recognition
- Code quality recommendations
- Performance optimization suggestions
- Maintainability assessment

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- GitHub account (for private repository access)
- GitHub Personal Access Token (optional, for higher rate limits)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd github-project-analyzer
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env.local` file with the following:
```
GITHUB_CLIENT_ID=your_github_client_id (optional)
GITHUB_CLIENT_SECRET=your_github_client_secret (optional)
GITHUB_ACCESS_TOKEN=your_personal_access_token (optional)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
LLAMA_API_KEY=your_llama_api_key
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. **Enter Repository URL**: Paste any GitHub repository URL (e.g., `https://github.com/owner/repo`)
2. **Authentication**: For private repos, you'll be prompted to authenticate with GitHub
3. **Analysis**: Watch as the system analyzes the repository in real-time
4. **Review Results**: Explore comprehensive analysis results with interactive charts
5. **AI Insights**: Get detailed AI-powered recommendations and insights

## Supported Repository Types

- ✅ Public repositories (no authentication required)
- ✅ Private repositories (with proper authentication)
- ✅ Organization repositories
- ✅ Forked repositories
- ✅ Archived repositories

## Technologies Used

- **Frontend**: Next.js, React, TypeScript
- **Authentication**: NextAuth.js, GitHub OAuth
- **GitHub Integration**: Octokit (GitHub API)
- **AI Analysis**: Llama API
- **Visualization**: Recharts
- **Styling**: Tailwind CSS
- **Database**: Prisma (for caching analysis results)

## Privacy & Security

- Repository data is analyzed securely and not stored permanently
- Authentication tokens are handled securely
- Analysis results can be cached locally for faster subsequent access
- No repository code is shared with third parties

## License

This project is licensed under the MIT License - see the LICENSE file for details.
