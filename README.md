# GitHub Project Analyzer

A comprehensive GitHub repository analyzer that provides detailed insights, statistics, and AI-powered analysis of public repositories and your own private repositories. Features an intelligent chat interface for interactive exploration of repository insights.

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
- **AI-Powered Insights**: Detailed AI analysis of code patterns, architecture, and best practices using **Llama-4-Maverick-17B-128E-Instruct-FP8**
- **AI Chat Interface**: Intelligent conversational interface powered by **Llama-4-Maverick-17B-128E-Instruct-FP8** to explore repository insights and get detailed explanations
- **Persistent Storage**: **AWS RDS Postgres database** stores analyzed repositories for quick access and maintains user sessions for seamless browsing experience
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

## AI Chat Integration

### Llama Model Configuration

The chat feature and report generation use the powerful **Llama-4-Maverick-17B-128E-Instruct-FP8** model through your existing `llama-api-client` package and `LLAMA_API_KEY` environment variable to provide intelligent responses about repositories.

#### Configuration
```bash
LLAMA_API_KEY="your-llama-api-key"
```

### Chat Features

- **Repository-aware conversations**: AI powered by **Llama-4-Maverick-17B-128E-Instruct-FP8** knows about the specific repository being analyzed
- **Contextual responses**: References actual code metrics, tech stack, and analysis data
- **Intelligent fallback**: Uses rule-based responses if AI service is unavailable
- **Conversation history**: Maintains context across multiple messages
- **Persistent Sessions**: **AWS RDS Postgres** stores chat history and analyzed repository data for quick retrieval

### System Prompt

The **Llama-4-Maverick-17B-128E-Instruct-FP8** AI assistant receives comprehensive repository information including:
- Repository metadata (stars, forks, language, license)
- Code analysis metrics (lines of code, complexity, test coverage)
- Quality scores (security, maintainability, documentation)
- Technology stack and dependencies
- Language distribution and file types
- Security vulnerabilities
- Top contributors

This enables the AI to provide accurate, data-driven insights about any repository.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- GitHub account (for private repository access)
- GitHub Personal Access Token (optional, for higher rate limits)

### Installation

1. Clone the repository
```bash
git clone https://github.com/dibasdauliya/llama-nyc
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
6. **AI Chat**: Have interactive conversations with AI about the repository analysis

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
- **AI Analysis**: **Llama-4-Maverick-17B-128E-Instruct-FP8** via Llama API
- **Visualization**: Recharts
- **Styling**: Tailwind CSS
- **Database**: **AWS RDS Postgres** with Prisma ORM for storing analyzed repositories, user sessions, and chat history

## Data Persistence & Sessions

- **Repository Storage**: Analyzed repositories are stored in **AWS RDS Postgres** for quick re-access without re-analysis
- **Session Management**: User sessions and browsing history are maintained in the database
- **Chat History**: Conversation history with the **Llama-4-Maverick-17B-128E-Instruct-FP8** AI is persisted for continuity
- **Performance Optimization**: Previously analyzed repositories load instantly from the database

## Privacy & Security

- Repository data is analyzed securely and stored in **AWS RDS Postgres** for faster subsequent access
- Authentication tokens are handled securely
- Repository analysis data is stored to improve user experience and reduce redundant API calls
- No repository code is shared with third parties

## License

This project is licensed under the MIT License.
