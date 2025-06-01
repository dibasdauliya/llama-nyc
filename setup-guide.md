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

## 🔐 **Step 2: GitHub OAuth Application (For Private Repository Access)**

### **Why OAuth App is Needed:**
- **Personal Access Tokens:** Work for your own repositories
- **OAuth Apps:** Allow other users to authenticate and access their private repositories
- **User Authentication:** Enables "Sign in with GitHub" functionality

### **Create GitHub OAuth Application:**

1. **Navigate to Developer Settings:**
   ```
   GitHub.com → Your Profile Photo → Settings → Developer settings → OAuth Apps
   ```

2. **Create New OAuth App:**
   - Click **"New OAuth App"** (or "Register a new application" if first time)

3. **Fill Out Application Details:**

   **Application name:**
   ```
   GitHub Project Analyzer
   ```

   **Homepage URL:**
   ```
   http://localhost:3000
   ```
   *(For production, use your actual domain: `https://yourdomain.com`)*

   **Application description:** *(Optional)*
   ```
   AI-powered GitHub repository analyzer with code insights and metrics
   ```

   **Authorization callback URL:**
   ```
   http://localhost:3000/api/auth/callback/github
   ```
   *(For production: `https://yourdomain.com/api/auth/callback/github`)*

4. **Register Application:**
   - Click **"Register application"**

5. **Get Your Credentials:**
   - **Client ID:** Copy this value (starts with `Iv1.`)
   - **Client Secret:** Click **"Generate a new client secret"** → Copy immediately
   
   **⚠️ IMPORTANT:** Store both securely - you won't see the secret again!

### **OAuth App vs Personal Token:**

| Feature | Personal Access Token | OAuth App |
|---------|----------------------|-----------|
| **Your repositories** | ✅ Full access | ✅ Full access |
| **Other users' private repos** | ❌ No access | ✅ With user consent |
| **Public repositories** | ✅ Higher rate limits | ✅ Higher rate limits |
| **User authentication** | ❌ Not possible | ✅ "Sign in with GitHub" |
| **Security** | Your account only | Per-user permissions |

---

## 🤖 **Step 3: Llama AI API Key**

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

## ⚙️ **Step 4: Environment Configuration**

### **Create Environment File:**

```bash
# Copy the example file
cp env.example .env.local
```

### **Edit `.env.local`:**

```env
# GitHub Configuration (REQUIRED for enhanced features)
GITHUB_ACCESS_TOKEN=ghp_your_github_token_here

# GitHub OAuth (REQUIRED for user authentication & private repos)
GITHUB_CLIENT_ID=Iv1.your_oauth_client_id_here
GITHUB_CLIENT_SECRET=your_oauth_client_secret_here

# AI Configuration (OPTIONAL - will use mock data if not provided)
LLAMA_API_KEY=lla_your_llama_api_key_here
# OR
LLAMA_API_KEY=sk_your_openai_key_here

# NextAuth (Required for user authentication)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key_here
```

### **Generate NextAuth Secret:**

```bash
# Generate a secure random secret
openssl rand -base64 32
```

---

## 🚀 **Step 5: Installation & Launch**

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

## 🧪 **Step 6: Test the Setup**

### **1. Test Public Repository (No GitHub Token Needed):**
- Try: `https://github.com/facebook/react`
- Should work with basic GitHub API limits

### **2. Test with GitHub Token:**
- Same repository should load faster
- Check browser console for API rate limit info

### **3. Test User Authentication:**
- Click "Sign in with GitHub" button
- Should redirect to GitHub OAuth authorization
- After authorization, should return to app as signed-in user

### **4. Test Private Repository Access:**
- Sign in with GitHub first
- Try a private repository URL (that you have access to)
- Should work only when signed in with proper permissions

### **5. Test AI Analysis:**
- Click "Generate AI Insights" button
- **With Llama API:** Real AI analysis
- **Without API key:** High-quality mock analysis

---

## 🔧 **Configuration Options**

### **Development vs Production URLs:**

**Development (localhost):**
```env
NEXTAUTH_URL=http://localhost:3000
# GitHub OAuth callback: http://localhost:3000/api/auth/callback/github
```

**Production:**
```env
NEXTAUTH_URL=https://yourdomain.com
# GitHub OAuth callback: https://yourdomain.com/api/auth/callback/github
```

**⚠️ Important:** Update your GitHub OAuth app's callback URL when deploying to production!

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
- [ ] Token added to `.env.local` as `GITHUB_ACCESS_TOKEN`
- [ ] Can analyze public repositories
- [ ] API rate limits improved (5000/hour)

### **✅ GitHub OAuth Setup:**
- [ ] GitHub OAuth app created
- [ ] Client ID and Secret obtained
- [ ] Added to `.env.local` as `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
- [ ] "Sign in with GitHub" button works
- [ ] Can access private repositories when signed in

### **✅ AI Integration:**
- [ ] Llama API key obtained (optional)
- [ ] API key added to `.env.local` as `LLAMA_API_KEY`
- [ ] "Generate AI Insights" button works
- [ ] Receives real AI analysis (or falls back to mock)

### **✅ Features Working:**
- [ ] Repository URL validation
- [ ] Real-time repository data fetching
- [ ] Interactive charts and visualizations
- [ ] Security score calculation
- [ ] Contributor information display
- [ ] Commit activity charts
- [ ] User authentication (sign in/out)
- [ ] Private repository access (when signed in)
- [ ] AI-powered insights generation

---

## 🔍 **Troubleshooting**

### **GitHub Personal Access Token Issues:**

```bash
# Check if token is working
curl -H "Authorization: token YOUR_GITHUB_TOKEN" https://api.github.com/user
```

**Common Issues:**
- **403 Forbidden:** Token expired or invalid
- **Rate limit exceeded:** No token configured
- **Repository not found:** Private repo without proper access

### **GitHub OAuth Issues:**

**Error: "Invalid client_id"**
- Verify `GITHUB_CLIENT_ID` in `.env.local`
- Ensure no extra spaces or quotes
- Client ID should start with `Iv1.`

**Error: "Invalid redirect_uri"**
- Check OAuth app settings on GitHub
- Verify callback URL matches exactly: `http://localhost:3000/api/auth/callback/github`
- For production, update to your domain

**Authentication not working:**
- Restart development server after changing `.env.local`
- Clear browser cache and cookies
- Check browser console for errors

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

### **With GitHub Personal Access Token:**
- ✅ 5,000 API calls/hour (vs 60 without)
- ✅ Access to all your repositories
- ✅ Real contributor data
- ✅ Actual commit history
- ✅ Repository languages breakdown

### **With GitHub OAuth App:**
- ✅ User authentication ("Sign in with GitHub")
- ✅ Access to user's private repositories (with permission)
- ✅ Per-user rate limits (5,000/hour per signed-in user)
- ✅ Secure token management
- ✅ Multi-user support

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
5. **Clear browser cache** if authentication isn't working

### **Common Error Messages:**

| Error | Solution |
|-------|----------|
| "Repository not found" | Check if repo is private and you're signed in |
| "Rate limit exceeded" | Add GitHub token or sign in |
| "Authentication required" | Set up GitHub OAuth app |
| "Invalid client_id" | Check OAuth app configuration |

The application is designed to gracefully fallback when APIs are unavailable, so you'll always get a functional experience!

---

## 🎯 **Quick Start Summary**

```bash
# 1. Clone and install
git clone <your-repo-url>
cd github-project-analyzer
npm install

# 2. Create GitHub OAuth App
# Go to: GitHub.com → Settings → Developer settings → OAuth Apps
# Homepage URL: http://localhost:3000
# Callback URL: http://localhost:3000/api/auth/callback/github

# 3. Set up environment
cp env.example .env.local
# Edit .env.local with your tokens and OAuth credentials

# 4. Start the app
npm run dev

# 5. Test with a repository
# Open http://localhost:3000
# Sign in with GitHub for private repo access
# Paste: https://github.com/facebook/react
# Click "Analyze Repository"
```

🎉 **You're ready to analyze any GitHub repository with powerful AI insights and user authentication!** 