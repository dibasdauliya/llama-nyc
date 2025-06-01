"use client";

import { useState } from "react";
import { ArrowLeft, Play, BookOpen, GraduationCap, Briefcase, Plane, Video, Settings } from "lucide-react";
import Link from "next/link";
import TavusVideoInterview from "../../components/TavusVideoInterview";

interface VisaType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  keyPoints: string[];
}

const visaTypes: VisaType[] = [
  {
    id: "student",
    name: "Student Visa (F-1)",
    description: "For academic studies in the US",
    icon: <GraduationCap className="h-6 w-6" />,
    color: "blue",
    keyPoints: [
      "Academic program and university choice",
      "Financing your education",
      "Plans after graduation",
      "Ties to home country",
      "Academic background and achievements"
    ]
  },
  {
    id: "tourist",
    name: "Tourist Visa (B-2)",
    description: "For tourism and leisure travel",
    icon: <Plane className="h-6 w-6" />,
    color: "green",
    keyPoints: [
      "Purpose and duration of visit",
      "Travel itinerary and accommodation",
      "Financial capability for the trip",
      "Employment and ties to home country",
      "Previous travel history"
    ]
  },
  {
    id: "work",
    name: "Work Visa (H-1B)",
    description: "For employment in specialty occupations",
    icon: <Briefcase className="h-6 w-6" />,
    color: "purple",
    keyPoints: [
      "Job position and responsibilities",
      "Educational qualifications",
      "Work experience and skills",
      "Employer and salary details",
      "Intent to return home"
    ]
  }
];

export default function VisaInterview() {
  const [selectedVisa, setSelectedVisa] = useState<VisaType | null>(null);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState("");

  // For demo purposes, you can set a default API key here
  // In production, this should come from environment variables or user input
  const DEMO_API_KEY = process.env.NEXT_PUBLIC_TAVUS_API_KEY || "";

  const handleStartInterview = (visa: VisaType) => {
    if (!DEMO_API_KEY && !apiKey) {
      setShowApiKeyInput(true);
      setSelectedVisa(visa);
      return;
    }
    
    setSelectedVisa(visa);
    setIsInterviewStarted(true);
  };

  const handleInterviewEnd = (interviewData?: any) => {
    console.log('Interview completed and saved:', interviewData);
    setIsInterviewStarted(false);
  };

  const handleInterviewStart = (interviewData?: any) => {
    console.log('Interview started and saved to database:', interviewData);
  };

  const handleBackToSelection = () => {
    setIsInterviewStarted(false);
    setSelectedVisa(null);
    setShowApiKeyInput(false);
  };

  // API Key input modal
  if (showApiKeyInput && selectedVisa) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Tavus API Key Required</h3>
          <p className="text-gray-600 mb-6">
            To start the AI video interview, please enter your Tavus API key. You can get one from the Tavus dashboard.
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                Tavus API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Tavus API key"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (apiKey.trim()) {
                    setShowApiKeyInput(false);
                    setIsInterviewStarted(true);
                  }
                }}
                disabled={!apiKey.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                Start Interview
              </button>
              <button
                onClick={handleBackToSelection}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Get your API key from{" "}
              <a href="https://tavusapi.com" target="_blank" rel="noopener noreferrer" className="underline">
                Tavus Dashboard
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Video interview interface
  if (isInterviewStarted && selectedVisa) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <header className="w-full py-4 px-4 sm:px-6 lg:px-8 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={handleBackToSelection}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Selection</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{selectedVisa.name}</h1>
                <p className="text-sm text-gray-600">AI Video Interview</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Interview Interface */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video Interview - Takes most space */}
            <div className="lg:col-span-2">
              <TavusVideoInterview
                apiKey={DEMO_API_KEY || apiKey}
                interviewType="visa"
                visaType={selectedVisa.name}
                onInterviewEnd={handleInterviewEnd}
                onInterviewStart={handleInterviewStart}
              />
            </div>

            {/* Information Sidebar */}
            <div className="space-y-6">


              {/* Interview Focus Areas */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Interview Focus Areas
                </h3>
                <ul className="space-y-3">
                  {selectedVisa.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interview Tips */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-yellow-600" />
                  Success Tips
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Be honest and consistent in your answers</li>
                  <li>• Speak clearly and maintain eye contact</li>
                  <li>• Have your documents ready if needed</li>
                  <li>• Answer directly without over-explaining</li>
                  <li>• Show strong ties to your home country</li>
                  <li>• Demonstrate genuine intent for your visit</li>
                </ul>
              </div>

              {/* Technical Requirements */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Technical Requirements</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Stable internet connection</li>
                  <li>• Camera and microphone enabled</li>
                  <li>• Quiet, well-lit environment</li>
                  <li>• Chrome or Safari browser recommended</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">US VISA Interview</h1>
              <p className="text-sm text-gray-600">AI Video Interview</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your VISA Type
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the type of US VISA you're applying for to practice with an AI interviewer 
            via video call. Get realistic interview experience with personalized feedback.
          </p>
        </div>

        {/* VISA Types Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {visaTypes.map((visa) => (
            <div
              key={visa.id}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
            >
              <div className={`inline-flex p-3 rounded-xl mb-6 bg-${visa.color}-100`}>
                <div className={`text-${visa.color}-600`}>
                  {visa.icon}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {visa.name}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {visa.description}
              </p>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Key Interview Areas:</h4>
                <ul className="space-y-2">
                  {visa.keyPoints.slice(0, 3).map((point, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="mr-2 mt-1.5 w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></span>
                      {point}
                    </li>
                  ))}
                  {/* <li className="text-sm text-gray-500 italic">
                    +{visa.keyPoints.length - 3} more areas
                  </li> */}
                </ul>
              </div>
              
              <button
                onClick={() => handleStartInterview(visa)}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-${visa.color}-600 to-${visa.color}-700 text-white rounded-lg hover:from-${visa.color}-700 hover:to-${visa.color}-800 transition-all duration-200 font-medium group-hover:scale-105`}
              >
                <Video className="h-5 w-5" />
                <span>Start AI Video Interview</span>
              </button>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">AI Video Interview Features</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Realistic Video Interview</h4>
              <p className="text-gray-600 text-sm">Face-to-face conversation with AI interviewer that looks and sounds like a real VISA officer.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Settings className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Adaptive Questions</h4>
              <p className="text-gray-600 text-sm">AI adjusts questions based on your responses for a truly personalized interview experience.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Instant Feedback</h4>
              <p className="text-gray-600 text-sm">Get immediate feedback on your performance and areas for improvement.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 