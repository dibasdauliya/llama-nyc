# GitHub Project Analyzer - Demo Setup

## Quick Start Demo

The GitHub Project Analyzer is now ready to use! You can test it with any public GitHub repository without any configuration, and enhance it with real AI and unlimited GitHub access.

## 🚀 **Instant Demo (No Setup Required)**

### Testing with Public Repositories

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:** http://localhost:3000

3. **Try these sample repositories:**
   - `https://github.com/microsoft/vscode` - Popular code editor
   - `https://github.com/facebook/react` - React JavaScript library
   - `https://github.com/vercel/next.js` - Next.js framework
   - `https://github.com/nodejs/node` - Node.js runtime

### What You'll See

1. **Repository Overview:**
   - Basic information (stars, forks, language)
   - Topics and description
   - Public/private status

2. **Analysis Metrics:**
   - Security score
   - Maintainability score  
   - Documentation score
   - Code metrics (lines, files, complexity, test coverage)

3. **Visual Charts:**
   - Language distribution pie chart
   - Commit activity over time
   - Top contributors list
   - Security vulnerabilities (if any)

4. **AI Insights:**
   - Click "Generate AI Insights" for detailed analysis
   - **Without API key:** High-quality mock analysis
   - **With API key:** Real AI-powered insights

## 🔧 **Enhanced Setup (Recommended)**

### Step 1: GitHub Personal Access Token

**Get 5,000 API calls/hour instead of 60:**

1. **Go to GitHub Settings:** https://github.com/settings/tokens
2. **Generate new token (classic)**
3. **Select scopes:**
   - ✅ `public_repo` (access public repositories)
   - ✅ `repo` (access private repositories)
4. **Copy token:** `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Llama AI API Key (Optional)

**Get real AI analysis instead of mock data:**

**Option A - Llama-API.com (Recommended):**
- Sign up: https://www.llama-api.com/
- Get API key: `lla-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Option B - OpenAI:**
- Sign up: https://platform.openai.com/
- Get API key: `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Option C - Groq (Fast & Free):**
- Sign up: https://console.groq.com/
- Get API key for fast Llama models

### Step 3: Configure Environment

```bash
# Create environment file
cp env.example .env.local
```

**Edit `.env.local`:**
```env
# GitHub (RECOMMENDED - increases rate limits dramatically)
GITHUB_ACCESS_TOKEN=ghp_your_github_token_here

# AI Analysis (OPTIONAL - enables real AI insights)
LLAMA_API_KEY=your_ai_api_key_here

# Required for NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
```

**Generate secret:**
```bash
openssl rand -base64 32
```

## 🎯 **Feature Comparison**

### **Basic Setup (No API Keys):**
- ✅ Analyze public repositories (60 calls/hour)
- ✅ Interactive visualizations
- ✅ High-quality mock AI insights
- ✅ All UI features work perfectly
- ❌ Limited GitHub API calls
- ❌ No private repository access
- ❌ No real AI analysis

### **With GitHub Token:**
- ✅ 5,000 GitHub API calls/hour
- ✅ Access private repositories
- ✅ Real contributor data
- ✅ Actual commit history
- ✅ All repository languages
- ✅ Better rate limits

### **With AI API Key:**
- ✅ Real AI-powered analysis
- ✅ Personalized recommendations
- ✅ Architecture insights
- ✅ Security assessments
- ✅ Performance suggestions
- ✅ Custom recommendations per repository

### **Full Setup (Both APIs):**
- ✅ **Complete experience**
- ✅ **Unlimited repository analysis**
- ✅ **Real AI insights**
- ✅ **Private repository support**
- ✅ **Production-ready features**

## 📊 **Demo Scenarios**

### **Scenario 1: Popular Open Source Project**
```
Repository: https://github.com/facebook/react
Expected: High stars, many contributors, excellent metrics
AI Insights: Architecture patterns, React-specific recommendations
```

### **Scenario 2: Small Personal Project**  
```
Repository: Any smaller repository
Expected: Lower metrics, fewer contributors
AI Insights: Growth recommendations, best practices
```

### **Scenario 3: Different Languages**
```
Repositories: Python, Java, Go, Rust projects
Expected: Language-specific insights and recommendations
AI Insights: Language-specific best practices
```

### **Scenario 4: Private Repository (Requires GitHub Token)**
```
Repository: Your private repository
Expected: Full access with personal token
AI Insights: Confidential analysis of your code
```

## 🛠 **Technical Architecture**

### **Frontend Stack:**
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons

### **Backend Integration:**
- **GitHub API** via Octokit
- **Llama AI API** for insights
- **NextAuth.js** for authentication
- **Prisma** ready for database

### **Key Features:**
- **Responsive Design** - Works on all devices
- **Real-time Analysis** - Live GitHub data
- **Interactive Charts** - Beautiful visualizations
- **AI Insights** - Smart code analysis
- **Error Handling** - Graceful fallbacks
- **Rate Limiting** - Efficient API usage

## 🔍 **Troubleshooting**

### **GitHub API Issues:**
```bash
# Test your token
curl -H "Authorization: token YOUR_GITHUB_TOKEN" https://api.github.com/user
```

### **AI API Issues:**
- Check console logs in browser developer tools
- Verify API key in `.env.local`
- Restart server after changes: `npm run dev`

### **Environment Issues:**
```bash
# Verify environment file exists
ls -la .env.local

# Check if variables are loaded
# Look for console logs when generating insights
```

## 🎉 **Success Metrics**

After setup, you should see:

### **Console Logs:**
```
✅ Generated insights using Llama API
✅ GitHub API rate limit: 5000/hour remaining
✅ Repository data fetched successfully
```

### **In Application:**
- Fast repository loading
- Real contributor data
- Detailed AI analysis
- No rate limit warnings
- Access to private repos (if configured)

## 📚 **Next Steps**

This demo showcases the core functionality. In a production environment, you could enhance it with:

### **Advanced Features:**
- **Real-time Code Analysis** - AST parsing, complexity calculation
- **Security Scanning** - Dependency vulnerabilities, SAST analysis
- **Performance Benchmarking** - Code performance metrics
- **Team Collaboration** - Multi-user analysis, sharing reports
- **Database Storage** - Cache analysis results, user history
- **Advanced AI** - Custom models, domain-specific insights

### **Integration Options:**
- **CI/CD Integration** - Automatic analysis on commits
- **Slack/Discord Bots** - Repository analysis in chat
- **GitHub Apps** - Native GitHub integration
- **Enterprise Features** - Organization-wide analysis

### **Customization:**
- **Custom AI Prompts** - Tailored analysis for specific needs
- **White-label UI** - Custom branding and styling
- **API Endpoints** - Headless usage, integrations
- **Custom Metrics** - Domain-specific quality scores

## 🌟 **Ready to Analyze!**

**Quick Start:**
```bash
npm run dev
# Open http://localhost:3000
# Paste any GitHub URL
# Get instant insights!
```

**Enhanced Experience:**
- Add GitHub token for unlimited access
- Add AI API key for real analysis
- Enjoy production-grade repository intelligence

Enjoy exploring GitHub repositories with this powerful analysis tool! 🚀 