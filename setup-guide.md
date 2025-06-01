# 🚀 GitHub Project Analyzer - Complete Setup Guide

## 📋 **Prerequisites**

- Node.js 18+ installed
- GitHub account
- Llama API account (optional, will fallback to mock data)

## 🔑 **Step 1: GitHub Personal Access Token**

### **Create Token:**

1. **Go to GitHub Settings:**
   ```
   GitHub.com → Your Profile Photo → Settings → Developer settings → Personal access tokens → Tokens (classic)
   ```

2. **Generate New Token:**
   - Click **"Generate new token (classic)"**
   - **Name:** `GitHub Project Analyzer`
   - **Expiration:** 90 days (recommended)
   - **Scopes:**
     - ✅ `public_repo` - Access public repositories
     - ✅ `repo` - Access private repositories (optional)
     - ✅ `read:user` - Read user profile data

3. **Copy Token:**
   - **⚠️ CRITICAL:** Copy the token immediately!
   - Format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Store it securely - you won't see it again

### **Why You Need This:**
- **Without token:** 60 API calls/hour (very limited)
- **With token:** 5,000 API calls/hour
- **Private repos:** Only accessible with token
- **Better rate limits:** Avoid API quota issues

---

## 🤖 **Step 2: Llama AI API Key**

### **Option A: Llama-API.com (Recommended)**

1. **Sign up:** https://www.llama-api.com/
2. **Get API key:** Dashboard → API Keys → Create New
3. **Copy key:** Format: `lla-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### **Option B: OpenAI (Alternative)**

1. **Sign up:** https://platform.openai.com/
2. **Get API key:** API Keys → Create new secret key
3. **Copy key:** Format: `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### **Option C: Other Providers**

- **Anthropic Claude:** https://console.anthropic.com/
- **Groq (Fast Llama):** https://console.groq.com/
- **Together AI:** https://api.together.xyz/
- **Replicate:** https://replicate.com/

---

## ⚙️ **Step 3: Environment Configuration**

### **Create Environment File:**

```bash
# Copy the example file
cp env.example .env.local
```

### **Edit `.env.local`:**

```env
# GitHub Configuration (REQUIRED for enhanced features)
GITHUB_ACCESS_TOKEN=ghp_your_github_token_here

# AI Configuration (OPTIONAL - will use mock data if not provided)
LLAMA_API_KEY=lla_your_llama_api_key_here
# OR
LLAMA_API_KEY=sk_your_openai_key_here

# NextAuth (Required for user authentication)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key_here

# Optional: GitHub OAuth (for user login)
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
```

### **Generate NextAuth Secret:**

```bash
# Generate a secure random secret
openssl rand -base64 32
```

---

## 🚀 **Step 4: Installation & Launch**

### **Install Dependencies:**

```bash
npm install
```

### **Start Development Server:**

```bash
npm run dev
```

### **Access Application:**

```
http://localhost:3000
```

---

## 🧪 **Step 5: Test the Setup**

### **1. Test Public Repository (No GitHub Token Needed):**
- Try: `https://github.com/facebook/react`
- Should work with basic GitHub API limits

### **2. Test with GitHub Token:**
- Same repository should load faster
- Check browser console for API rate limit info

### **3. Test AI Analysis:**
- Click "Generate AI Insights" button
- **With Llama API:** Real AI analysis
- **Without API key:** High-quality mock analysis

### **4. Test Private Repository (Requires GitHub Token):**
- Try a private repo URL (if you have access)
- Should work only with proper GitHub token

---

## 🔧 **Configuration Options**

### **AI Provider Configuration:**

The app supports multiple AI providers. Edit `app/api/ai/insights/route.ts`:

```typescript
// For Llama-API.com
const response = await fetch('https://api.llama-api.com/chat/completions', {
  // ... configuration
})

// For OpenAI
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  // ... configuration
})

// For Groq (Fast Llama)
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  // ... configuration
})
```

### **GitHub API Configuration:**

```typescript
// In app/api/github/repository/route.ts
const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN, // Your token here
})
```

---

## 🚦 **Verification Checklist**

### **✅ Basic Setup:**
- [ ] Node.js 18+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts (`npm run dev`)
- [ ] Home page loads at localhost:3000

### **✅ GitHub Integration:**
- [ ] GitHub Personal Access Token created
- [ ] Token added to `.env.local`
- [ ] Can analyze public repositories
- [ ] API rate limits improved (5000/hour)
- [ ] Can access private repositories (if token has `repo` scope)

### **✅ AI Integration:**
- [ ] Llama API key obtained (optional)
- [ ] API key added to `.env.local`
- [ ] "Generate AI Insights" button works
- [ ] Receives real AI analysis (or falls back to mock)

### **✅ Features Working:**
- [ ] Repository URL validation
- [ ] Real-time repository data fetching
- [ ] Interactive charts and visualizations
- [ ] Security score calculation
- [ ] Contributor information display
- [ ] Commit activity charts
- [ ] AI-powered insights generation

---

## 🔍 **Troubleshooting**

### **GitHub API Issues:**

```bash
# Check if token is working
curl -H "Authorization: token YOUR_GITHUB_TOKEN" https://api.github.com/user
```

**Common Issues:**
- **403 Forbidden:** Token expired or invalid
- **Rate limit exceeded:** No token configured
- **Repository not found:** Private repo without proper access

### **AI API Issues:**

**Error: "LLAMA_API_KEY not configured"**
- Add API key to `.env.local`
- Restart development server

**Error: "AI API error: 401"**
- Check API key validity
- Verify account has credits/quota

**Fallback to Mock Data:**
- Normal behavior when AI API fails
- Still provides comprehensive analysis
- Check console logs for details

### **Environment Issues:**

**Variables not loading:**
```bash
# Restart the development server
npm run dev
```

**File not found:**
```bash
# Ensure .env.local exists in project root
ls -la .env.local
```

---

## 🌟 **What You Get**

### **With GitHub Token:**
- ✅ 5,000 API calls/hour (vs 60 without)
- ✅ Access to private repositories
- ✅ Real contributor data
- ✅ Actual commit history
- ✅ Repository languages breakdown
- ✅ Real-time repository information

### **With AI API Key:**
- ✅ Real AI-powered code analysis
- ✅ Personalized recommendations
- ✅ Architecture pattern recognition
- ✅ Security assessment insights
- ✅ Performance optimization suggestions
- ✅ Detailed improvement roadmap

### **Without API Keys:**
- ✅ Basic repository analysis (60 calls/hour)
- ✅ Public repository access only
- ✅ High-quality mock AI insights
- ✅ All visualization features
- ✅ Complete UI experience

---

## 📞 **Support**

If you encounter issues:

1. **Check the console logs** in your browser developer tools
2. **Verify environment variables** are correctly set
3. **Test API keys** manually using curl commands
4. **Restart the development server** after changing environment variables

The application is designed to gracefully fallback when APIs are unavailable, so you'll always get a functional experience!

---

## 🎯 **Quick Start Summary**

```bash
# 1. Clone and install
git clone <your-repo-url>
cd github-project-analyzer
npm install

# 2. Set up environment
cp env.example .env.local
# Edit .env.local with your tokens

# 3. Start the app
npm run dev

# 4. Test with a repository
# Open http://localhost:3000
# Paste: https://github.com/facebook/react
# Click "Analyze Repository"
```

🎉 **You're ready to analyze any GitHub repository with powerful AI insights!** 