"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Github, BarChart3, Clock, Star, GitFork, Eye, Calendar, Search, Filter, RefreshCw, ExternalLink, Lock, Globe, Loader2, User, LogOut } from "lucide-react";

interface Repository {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  watchers: number;
  isPrivate: boolean;
  htmlUrl: string;
  lastViewedAt: string;
  viewCount: number;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrivate, setFilterPrivate] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session?.user) {
      fetchRepositories();
    }
  }, [status, router, session]);

  const fetchRepositories = async () => {
    if (!session?.user) {
      console.log('No session found, cannot fetch repositories');
      setRepositories([]);
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      const params = new URLSearchParams({
        limit: '20',
        includePrivate: 'true' // Always include private repos if user is authenticated
      });
      
      const response = await fetch(`/api/repositories/viewed?${params}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard API response:', data);
        
        if (data?.repositories && Array.isArray(data.repositories)) {
          const validRepositories = data.repositories.filter((repo: any) => 
            repo && 
            repo.fullName && 
            typeof repo.stars === 'number' && 
            typeof repo.forks === 'number' && 
            typeof repo.watchers === 'number'
          );
          setRepositories(validRepositories);
          console.log(`Dashboard loaded ${validRepositories.length} repositories`);
        } else {
          console.warn('Invalid repositories data structure:', data);
          setRepositories([]);
        }
      } else {
        console.error('Failed to fetch repositories:', response.status);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
        setRepositories([]);
      }
    } catch (error) {
      console.error("Error fetching repositories:", error);
      setRepositories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredRepositories = repositories.filter(repo => {
    const matchesSearch = repo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrivateFilter = !filterPrivate || repo.isPrivate;
    return matchesSearch && matchesPrivateFilter;
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      'TypeScript': 'bg-blue-500',
      'JavaScript': 'bg-yellow-500',
      'Python': 'bg-green-500',
      'Java': 'bg-orange-500',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-red-500',
      'C++': 'bg-purple-500',
      'C#': 'bg-indigo-500',
    };
    return colors[language] || 'bg-gray-500';
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8 bg-black/20 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <Github className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">GitHub Analyzer</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
            <img 
                src={session?.user.image || ''} 
                alt={session?.user.name || 'User'} 
                className="w-8 h-8 rounded-full"
              />
              <span className="text-gray-200">{session?.user?.name || session?.user?.email}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {session?.user?.name || "User"}!
          </h1>
          <p className="text-gray-300">
            Track your repository analysis history and explore new codebases
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link href="/">
            <div className="group bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex p-3 rounded-lg bg-purple-500/20 mb-4">
                    <BarChart3 className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Analyze New Repository</h3>
                  <p className="text-gray-300">Analyze any GitHub repository for insights</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </Link>

          <div className="group bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex p-3 rounded-lg bg-blue-500/20 mb-4">
                  <Github className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Your Activity</h3>
                <p className="text-gray-300">
                  {repositories.length > 0 ? (
                    <>
                      {repositories.length} repositories analyzed
                      {session && repositories.some(r => r.isPrivate) && ` • ${repositories.filter(r => r.isPrivate).length} private`}
                      <br />
                      <span className="text-sm text-gray-400">
                        Total views: {repositories.reduce((sum, repo) => sum + repo.viewCount, 0)}
                      </span>
                    </>
                  ) : (
                    <>
                      Ready to start analyzing
                      <br />
                      <span className="text-sm text-gray-400">
                        Your repository history will appear here
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="text-right">
                <Github className="h-8 w-8 text-blue-400 mb-2" />
                <div className="text-2xl font-bold text-white">{repositories.length}</div>
                <div className="text-xs text-gray-400">analyzed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              {session && (
                <label className="flex items-center text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterPrivate}
                    onChange={(e) => setFilterPrivate(e.target.checked)}
                    className="mr-2 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <Lock className="h-4 w-4 mr-1" />
                  Private only
                </label>
              )}
              
              <button
                onClick={fetchRepositories}
                disabled={refreshing}
                className="flex items-center text-gray-300 hover:text-white transition-colors bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-600"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Repository History */}
        <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Recently Analyzed Repositories</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400 mr-3" />
              <span className="text-gray-300">Loading repositories...</span>
            </div>
          ) : filteredRepositories.length === 0 ? (
            <div className="text-center py-16">
              <Github className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm ? 'No repositories match your search' : 'No repositories analyzed yet'}
              </h3>
              <p className="text-gray-300 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search criteria or clear the search to see all repositories.' 
                  : 'Start analyzing repositories to see them in your dashboard. Your analysis history will appear here.'
                }
              </p>
              {!searchTerm && (
                <div className="space-y-4">
                  <Link 
                    href="/"
                    className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Analyze Your First Repository
                  </Link>
                  <div className="text-sm text-gray-400 mt-4">
                    <p>Try analyzing these popular repositories:</p>
                    <div className="flex flex-wrap gap-2 mt-2 justify-center">
                      <Link href="/analyze/facebook/react" className="text-blue-400 hover:text-blue-300 underline">facebook/react</Link>
                      <span className="text-gray-500">•</span>
                      <Link href="/analyze/microsoft/vscode" className="text-blue-400 hover:text-blue-300 underline">microsoft/vscode</Link>
                      <span className="text-gray-500">•</span>
                      <Link href="/analyze/vercel/next.js" className="text-blue-400 hover:text-blue-300 underline">vercel/next.js</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredRepositories.map((repo) => (
                <div 
                  key={repo.id} 
                  className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-white truncate">{repo.fullName}</h3>
                        {repo.isPrivate ? (
                          <Lock className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                        ) : (
                          <Globe className="h-4 w-4 text-green-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                        {repo.description || 'No description available'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1 text-xs">
                      <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`}></div>
                      <span className="text-gray-300">{repo.language}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-400">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        {repo.stars.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <GitFork className="h-3 w-3 mr-1" />
                        {repo.forks.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 text-xs text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatTimeAgo(repo.lastViewedAt)}
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {repo.viewCount} views
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link 
                      href={`/analyze/${repo.owner}/${repo.name}`}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-medium"
                    >
                      <BarChart3 className="h-4 w-4 inline mr-1" />
                      Re-analyze
                    </Link>
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 py-2 px-3 rounded-lg transition-all"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 