"use client";

import { useState } from "react";
import { MessageSquare, Briefcase, GraduationCap, ArrowRight, Sparkles, Video, Users, Bot } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Video className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Video Interviewer</h1>
              <p className="text-sm text-gray-600">Powered by Tavus AI</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Bot className="h-4 w-4" />
            <span>Realistic AI Avatars</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Master Your Interview Skills with AI
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Experience realistic video interviews with AI avatars that look and sound like real interviewers. 
            Get personalized feedback and build confidence for your actual interviews.
          </p>
          
          {/* New video preview placeholder */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <Video className="h-8 w-8" />
                <span className="text-lg font-semibold">AI Video Interview Preview</span>
              </div>
              <p className="text-blue-100">
                Watch our AI interviewer conduct realistic interviews with natural conversation, 
                facial expressions, and adaptive questioning based on your responses.
              </p>
            </div>
          </div>
        </div>

        {/* Interview Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* VISA Interview Card */}
          <Link href="/visa-interview">
            <div
              className={`group relative p-8 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
                hoveredCard === "visa" 
                  ? "transform scale-105 shadow-2xl" 
                  : "shadow-lg hover:shadow-xl"
              }`}
              style={{
                background: hoveredCard === "visa" 
                  ? "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)"
                  : "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)"
              }}
              onMouseEnter={() => setHoveredCard("visa")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-xl mb-6 transition-colors duration-300 ${
                  hoveredCard === "visa" 
                    ? "bg-white/20" 
                    : "bg-blue-100"
                }`}>
                  <GraduationCap className={`h-8 w-8 transition-colors duration-300 ${
                    hoveredCard === "visa" ? "text-white" : "text-blue-600"
                  }`} />
                </div>
                
                <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                  hoveredCard === "visa" ? "text-white" : "text-gray-900"
                }`}>
                  US VISA Interview
                </h3>
                
                <p className={`text-lg mb-6 transition-colors duration-300 ${
                  hoveredCard === "visa" ? "text-blue-100" : "text-gray-600"
                }`}>
                  Practice with an AI VISA officer avatar. Experience authentic embassy interview 
                  scenarios with realistic questions and professional demeanor.
                </p>
                
                <ul className={`space-y-2 mb-8 transition-colors duration-300 ${
                  hoveredCard === "visa" ? "text-blue-100" : "text-gray-600"
                }`}>
                  <li className="flex items-center space-x-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      hoveredCard === "visa" ? "bg-white" : "bg-blue-600"
                    }`}></div>
                    <span>Student, Tourist & Work VISAs</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      hoveredCard === "visa" ? "bg-white" : "bg-blue-600"
                    }`}></div>
                    <span>AI avatar with professional demeanor</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      hoveredCard === "visa" ? "bg-white" : "bg-blue-600"
                    }`}></div>
                    <span>Real-time video conversation</span>
                  </li>
                </ul>
                
                <div className={`flex items-center space-x-2 font-semibold transition-colors duration-300 ${
                  hoveredCard === "visa" ? "text-white" : "text-blue-600"
                }`}>
                  <Video className="h-5 w-5" />
                  <span>Start AI Video Interview</span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
              
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-24 h-24 border border-current rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 border border-current rounded-full"></div>
              </div>
            </div>
          </Link>

          {/* Job Interview Card */}
          <Link href="/job-interview">
            <div
              className={`group relative p-8 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
                hoveredCard === "job" 
                  ? "transform scale-105 shadow-2xl" 
                  : "shadow-lg hover:shadow-xl"
              }`}
              style={{
                background: hoveredCard === "job" 
                  ? "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)"
                  : "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)"
              }}
              onMouseEnter={() => setHoveredCard("job")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-xl mb-6 transition-colors duration-300 ${
                  hoveredCard === "job" 
                    ? "bg-white/20" 
                    : "bg-purple-100"
                }`}>
                  <Briefcase className={`h-8 w-8 transition-colors duration-300 ${
                    hoveredCard === "job" ? "text-white" : "text-purple-600"
                  }`} />
                </div>
                
                <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                  hoveredCard === "job" ? "text-white" : "text-gray-900"
                }`}>
                  Job Interview
                </h3>
                
                <p className={`text-lg mb-6 transition-colors duration-300 ${
                  hoveredCard === "job" ? "text-purple-100" : "text-gray-600"
                }`}>
                  Interview with an AI HR professional or technical interviewer. 
                  Tailored questions based on your role, industry, and uploaded resume.
                </p>
                
                <ul className={`space-y-2 mb-8 transition-colors duration-300 ${
                  hoveredCard === "job" ? "text-purple-100" : "text-gray-600"
                }`}>
                  <li className="flex items-center space-x-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      hoveredCard === "job" ? "bg-white" : "bg-purple-600"
                    }`}></div>
                    <span>HR & Technical interview modes</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      hoveredCard === "job" ? "bg-white" : "bg-purple-600"
                    }`}></div>
                    <span>Resume analysis & personalization</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      hoveredCard === "job" ? "bg-white" : "bg-purple-600"
                    }`}></div>
                    <span>Industry-specific AI interviewer</span>
                  </li>
                </ul>
                
                <div className={`flex items-center space-x-2 font-semibold transition-colors duration-300 ${
                  hoveredCard === "job" ? "text-white" : "text-purple-600"
                }`}>
                  <Video className="h-5 w-5" />
                  <span>Start AI Video Interview</span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
              
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-24 h-24 border border-current rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 border border-current rounded-full"></div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-24 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">Why Choose AI Video Interviewer?</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Video className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Realistic AI Avatars</h4>
              <p className="text-gray-600">Experience face-to-face interviews with lifelike AI avatars that respond naturally and adapt to your answers.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Adaptive Conversations</h4>
              <p className="text-gray-600">AI interviewers adjust their questions and follow-ups based on your responses for authentic interview flow.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Instant Analysis</h4>
              <p className="text-gray-600">Get real-time feedback on your performance, communication skills, and areas for improvement.</p>
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="mt-24 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-white">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Powered by Tavus AI Technology</h3>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Our AI video interviews use cutting-edge avatar technology to create the most realistic 
              interview practice experience available. Each AI interviewer is designed with professional 
              expertise and industry knowledge.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Natural AI Avatars</h4>
              <p className="text-gray-400 text-sm">Lifelike appearance and behavior</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Real-time Conversation</h4>
              <p className="text-gray-400 text-sm">Instant responses and interactions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Contextual Intelligence</h4>
              <p className="text-gray-400 text-sm">Understands your background and role</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Personalized Feedback</h4>
              <p className="text-gray-400 text-sm">Detailed performance analysis</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8 mt-24">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p>&copy; 2024 AI Video Interviewer. Powered by Tavus AI & Next.js.</p>
        </div>
      </footer>
    </div>
  );
}
