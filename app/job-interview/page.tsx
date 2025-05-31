"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Upload, Play, BookOpen, Users, Briefcase, FileText, Building, Video, Settings } from "lucide-react";
import Link from "next/link";
import TavusVideoInterview from "../../components/TavusVideoInterview";
import { parseResume, ResumeData } from "../../lib/resumeParser";

interface JobDetails {
  title: string;
  company: string;
  description: string;
  industry: string;
}

export default function JobInterview() {
  const [step, setStep] = useState<'form' | 'interview' | 'success'>('form');
  const [jobDetails, setJobDetails] = useState<JobDetails>({
    title: '',
    company: '',
    description: '',
    industry: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeParseError, setResumeParseError] = useState<string | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // For demo purposes, you can set a default API key here
  const DEMO_API_KEY = process.env.NEXT_PUBLIC_TAVUS_API_KEY || "";

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setResumeParseError(null);
      setIsParsingResume(true);
      
      try {
        const result = await parseResume(file);
        if (result.success && result.data) {
          setResumeData(result.data);
          console.log('Resume parsed successfully:', {
            skills: result.data.skills.slice(0, 10),
            experienceCount: result.data.experience.length,
            educationCount: result.data.education.length,
            hasSummary: !!result.data.summary
          });
        } else {
          setResumeParseError(result.error || 'Failed to parse resume');
          setResumeData(null);
        }
      } catch (error) {
        setResumeParseError('Error processing resume file');
        setResumeData(null);
        console.error('Resume parsing error:', error);
      } finally {
        setIsParsingResume(false);
      }
    }
  };

  const handleStartInterview = () => {
    if (!jobDetails.title || !jobDetails.company) {
      alert('Please fill in at least the job title and company');
      return;
    }

    if (!DEMO_API_KEY && !apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    setStep('interview');
  };

  const handleInterviewEnd = (interviewData?: any) => {
    console.log('Interview completed and saved:', interviewData);
    setStep('success');
  };

  const handleInterviewStart = (interviewData?: any) => {
    console.log('Interview started and saved to database:', interviewData);
  };

  const handleBackToSetup = () => {
    setStep('form');
    setShowApiKeyInput(false);
  };

  const resetInterview = () => {
    setStep('form');
    setJobDetails({ title: '', company: '', description: '', industry: '' });
    setResumeFile(null);
    setResumeData(null);
    setResumeParseError(null);
    setShowApiKeyInput(false);
    setApiKey("");
  };

  // API Key input modal
  if (showApiKeyInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (apiKey.trim()) {
                    setShowApiKeyInput(false);
                    setStep('interview');
                  }
                }}
                disabled={!apiKey.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                Start Interview
              </button>
              <button
                onClick={handleBackToSetup}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-800">
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

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <header className="w-full py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Interview Completed!
            </h2>
            
            <p className="text-xl text-gray-600 mb-8">
              Great job! You've completed the AI video interview for the {jobDetails.title} position at {jobDetails.company}.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Interview Summary</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Position:</span>
                  <p className="font-medium">{jobDetails.title}</p>
                </div>
                <div>
                  <span className="text-gray-600">Company:</span>
                  <p className="font-medium">{jobDetails.company}</p>
                </div>
                <div>
                  <span className="text-gray-600">Industry:</span>
                  <p className="font-medium">{jobDetails.industry || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Resume Uploaded:</span>
                  <p className="font-medium">{resumeFile ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                In a real implementation, this would provide detailed feedback on your answers, 
                suggestions for improvement, and scoring across different interview criteria.
              </p>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetInterview}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
                >
                  Start New Interview
                </button>
                <Link
                  href="/"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (step === 'interview') {
    const interviewType = jobDetails.industry === 'technology' ? 'technical' : 'job';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <header className="w-full py-4 px-4 sm:px-6 lg:px-8 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={handleBackToSetup}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Setup</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{jobDetails.title}</h1>
                <p className="text-sm text-gray-600">AI Video Interview - {jobDetails.company}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video Interview - Takes most space */}
            <div className="lg:col-span-2">
              <TavusVideoInterview
                apiKey={DEMO_API_KEY || apiKey}
                interviewType={interviewType}
                jobDetails={jobDetails}
                resumeData={resumeData}
                onInterviewEnd={handleInterviewEnd}
                onInterviewStart={handleInterviewStart}
              />
            </div>

            {/* Information Sidebar */}
            <div className="space-y-6">
         

              {/* Job Details */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
                  Position Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Role:</span>
                    <p className="font-medium">{jobDetails.title}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Company:</span>
                    <p className="font-medium">{jobDetails.company}</p>
                  </div>
                  {jobDetails.industry && (
                    <div>
                      <span className="text-gray-600">Industry:</span>
                      <p className="font-medium capitalize">{jobDetails.industry}</p>
                    </div>
                  )}
                  {resumeFile && (
                    <div>
                      <span className="text-gray-600">Resume:</span>
                      <p className="font-medium text-green-600">Uploaded ✓</p>
                      {resumeData && resumeData.skills.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            Key skills detected: {resumeData.skills.slice(0, 3).join(', ')}
                            {resumeData.skills.length > 3 && ` +${resumeData.skills.length - 3} more`}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Interview Tips */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Interview Tips
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Use the STAR method for behavioral questions</li>
                  <li>• Provide specific examples from your experience</li>
                  <li>• Show enthusiasm for the role and company</li>
                  <li>• Ask thoughtful questions about the position</li>
                  <li>• Demonstrate how you can add value to the team</li>
                  <li>• Maintain good eye contact and posture</li>
                </ul>
              </div>

              {/* Technical Requirements */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-gray-600" />
                  Technical Setup
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Stable internet connection</li>
                  <li>• Camera and microphone enabled</li>
                  <li>• Quiet, professional environment</li>
                  <li>• Good lighting on your face</li>
                  <li>• Chrome or Safari browser recommended</li>
                </ul>
              </div>

              {/* Expected Questions */}
              {jobDetails.industry && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Expected Question Types</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {jobDetails.industry === 'technology' && (
                      <>
                        <li>• Technical problem-solving</li>
                        <li>• Programming languages & tools</li>
                        <li>• System design concepts</li>
                        <li>• Project experience</li>
                      </>
                    )}
                    {jobDetails.industry === 'finance' && (
                      <>
                        <li>• Financial analysis</li>
                        <li>• Market knowledge</li>
                        <li>• Risk assessment</li>
                        <li>• Regulatory understanding</li>
                      </>
                    )}
                    {jobDetails.industry === 'marketing' && (
                      <>
                        <li>• Campaign management</li>
                        <li>• Digital marketing tools</li>
                        <li>• Analytics & metrics</li>
                        <li>• Creative strategy</li>
                      </>
                    )}
                    {(!jobDetails.industry || jobDetails.industry === 'other') && (
                      <>
                        <li>• Behavioral questions</li>
                        <li>• Situational scenarios</li>
                        <li>• Leadership examples</li>
                        <li>• Problem-solving approach</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Job Interview</h1>
              <p className="text-sm text-gray-600">AI Video Interview</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Prepare for Your AI Video Interview
          </h2>
          <p className="text-xl text-gray-600">
            Tell us about the job you're interviewing for to get a personalized AI video interview experience
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Job Details Form */}
          <div className="space-y-6">
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                id="jobTitle"
                value={jobDetails.title}
                onChange={(e) => setJobDetails({ ...jobDetails, title: e.target.value })}
                placeholder="e.g. Software Engineer, Marketing Manager, Data Analyst"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                id="company"
                value={jobDetails.company}
                onChange={(e) => setJobDetails({ ...jobDetails, company: e.target.value })}
                placeholder="e.g. Google, Microsoft, Apple"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                id="industry"
                value={jobDetails.industry}
                onChange={(e) => setJobDetails({ ...jobDetails, industry: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select Industry</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="marketing">Marketing</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Selecting "Technology" will enable technical interview mode
              </p>
            </div>

            <div>
              <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Job Description (Optional)
              </label>
              <textarea
                id="jobDescription"
                rows={4}
                value={jobDetails.description}
                onChange={(e) => setJobDetails({ ...jobDetails, description: e.target.value })}
                placeholder="Paste the job description here to get more targeted questions..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Resume/CV (Optional)
              </label>
              <div
                onClick={() => !isParsingResume && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isParsingResume 
                    ? 'border-purple-300 cursor-wait' 
                    : 'border-gray-300 hover:border-purple-400 cursor-pointer'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isParsingResume}
                />
                
                {isParsingResume ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">Analyzing Resume...</p>
                      <p className="text-sm text-gray-500">Extracting skills and experience</p>
                    </div>
                  </div>
                ) : resumeFile ? (
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">{resumeFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {resumeData && (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ Resume analyzed successfully
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-600 mb-2">Click to upload your resume</p>
                    <p className="text-sm text-gray-500">PDF or Word document (Max 10MB)</p>
                  </div>
                )}
              </div>
              
              {/* Resume parsing error */}
              {resumeParseError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">⚠️ {resumeParseError}</p>
                  <p className="text-xs text-red-500 mt-1">
                    You can still proceed with the interview without resume analysis.
                  </p>
                </div>
              )}
              
              {/* Resume analysis summary */}
              {resumeData && !resumeParseError && (
                <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 mb-2">✓ Resume Analysis Complete</h4>
                  <div className="text-xs text-green-700 space-y-1">
                    {resumeData.skills.length > 0 && (
                      <p>• Found {resumeData.skills.length} relevant skills</p>
                    )}
                    {resumeData.experience.length > 0 && (
                      <p>• Detected {resumeData.experience.length} work experience entries</p>
                    )}
                    {resumeData.education.length > 0 && (
                      <p>• Found {resumeData.education.length} education entries</p>
                    )}
                    <p className="text-green-600 font-medium">The AI interviewer will ask questions based on your resume!</p>
                  </div>
                </div>
              )}
              
              {resumeFile && (
                <div className="mt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setResumeFile(null);
                      setResumeData(null);
                      setResumeParseError(null);
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove file
                  </button>
                  {resumeData && resumeData.skills.length > 0 && (
                    <p className="text-xs text-gray-500">
                      Key skills: {resumeData.skills.slice(0, 3).join(', ')}
                      {resumeData.skills.length > 3 && ` +${resumeData.skills.length - 3} more`}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Start Interview Button */}
            <div className="pt-6">
              <button
                onClick={handleStartInterview}
                disabled={!jobDetails.title || !jobDetails.company}
                className="w-full flex items-center justify-center space-x-2 py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg"
              >
                <Video className="h-6 w-6" />
                <span>Start AI Video Interview</span>
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg mb-4 flex items-center justify-center mx-auto">
              <Video className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Video Interviewer</h3>
            <p className="text-gray-600 text-sm">Experience a realistic video interview with an AI interviewer tailored to your role.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg mb-4 flex items-center justify-center mx-auto">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Resume Analysis</h3>
            <p className="text-gray-600 text-sm">Upload your resume to get questions based on your background and achievements.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg mb-4 flex items-center justify-center mx-auto">
              <Building className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Industry Specific</h3>
            <p className="text-gray-600 text-sm">Get questions and scenarios specific to your industry and role level.</p>
          </div>
        </div>
      </main>
    </div>
  );
} 