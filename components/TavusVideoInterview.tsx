"use client";

import { useEffect, useRef, useState } from 'react';
import { useTavusInterview } from '../hooks/useTavusInterview';
import { useInterviewSession } from '../hooks/useInterviewSession';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Settings } from 'lucide-react';
import { ResumeData } from '../lib/resumeParser';

interface TavusVideoInterviewProps {
  apiKey: string;
  interviewType: 'visa' | 'job' | 'technical';
  jobDetails?: {
    title: string;
    company: string;
    industry: string;
    description?: string;
  };
  visaType?: string;
  resumeData?: ResumeData | null;
  onInterviewEnd?: (interviewData?: any) => void;
  onInterviewStart?: (interviewData?: any) => void;
}

export default function TavusVideoInterview({
  apiKey,
  interviewType,
  jobDetails,
  visaType,
  resumeData,
  onInterviewEnd,
  onInterviewStart
}: TavusVideoInterviewProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showControls, setShowControls] = useState(true);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const {
    isLoading: tavusLoading,
    isConnected,
    conversationUrl,
    error: tavusError,
    startInterview: startTavusInterview,
    endInterview: endTavusInterview,
    resetInterview,
    markConversationReady
  } = useTavusInterview({
    apiKey,
    interviewType,
    jobDetails,
    visaType,
    resumeData
  });

  const {
    interviewSession,
    isLoading: sessionLoading,
    error: sessionError,
    startInterview: startInterviewSession,
    endInterview: endInterviewSession,
    addQuestion,
    getSessionDuration,
    resetSession
  } = useInterviewSession();

  const isLoading = tavusLoading || sessionLoading;
  const error = tavusError || sessionError;

  // Auto-hide controls after 3 seconds of no mouse movement
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    if (isConnected) {
      document.addEventListener('mousemove', handleMouseMove);
      timeout = setTimeout(() => setShowControls(false), 3000);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isConnected]);

  const handleStartInterview = async () => {
    try {
      // Start Tavus conversation
      const conversation = await startTavusInterview();
      
      // Map interview type to database enum
      const getInterviewType = () => {
        if (interviewType === 'visa') {
          if (visaType === 'F-1') return 'VISA_F1';
          if (visaType === 'B-2') return 'VISA_B2';
          if (visaType === 'H-1B') return 'VISA_H1B';
          return 'VISA_F1'; // default
        }
        if (interviewType === 'technical') return 'JOB_TECHNICAL';
        return 'JOB_HR'; // default for job interviews
      };

      // Start database interview session
      const interviewData = {
        type: getInterviewType() as any,
        jobTitle: jobDetails?.title,
        company: jobDetails?.company,
        industry: jobDetails?.industry,
        jobDescription: jobDetails?.description,
        visaType: visaType,
      };

      const dbInterview = await startInterviewSession(
        interviewData,
        conversation.conversation_id,
        '' // Use empty string as persona ID will be managed by Tavus hook
      );

      onInterviewStart?.(dbInterview);
    } catch (error) {
      console.error('Failed to start interview:', error);
    }
  };

  const handleEndInterview = async () => {
    try {
      // End Tavus conversation first
      await endTavusInterview();
      
      // End database interview session if active
      if (interviewSession.isActive) {
        // You can collect conversation data here if Tavus provides it
        const conversationData = {
          // This would come from Tavus conversation analysis
          // For now, we'll use placeholder data
          overallScore: undefined,
          communicationScore: undefined,
          technicalScore: undefined,
          confidenceScore: undefined,
          strengths: [],
          improvements: [],
          detailedFeedback: undefined,
          aiAnalysis: undefined
        };

        const completedInterview = await endInterviewSession('COMPLETED', conversationData);
        onInterviewEnd?.(completedInterview);
      } else {
        onInterviewEnd?.();
      }
    } catch (error) {
      console.error('Failed to end interview:', error);
      // Try to end the session even if there was an error
      try {
        if (interviewSession.isActive) {
          await endInterviewSession('FAILED');
        }
      } catch (sessionError) {
        console.error('Failed to end interview session:', sessionError);
      }
      onInterviewEnd?.();
    }
  };

  // Listen for conversation events from Tavus iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://tavusapi.com') return;
      
      const { type, data } = event.data;
      
      // Mark conversation as ready on first data received
      if (tavusLoading) {
        markConversationReady();
      }
      
      switch (type) {
        case 'conversation_question':
          // Add question to our session tracking
          if (data.question && interviewSession.isActive) {
            addQuestion({
              question: data.question,
              askedAt: new Date(),
            });
          }
          break;
          
        case 'conversation_answer':
          // Update the last question with the answer
          if (data.answer && interviewSession.isActive) {
            // Update the most recent question with the answer
            // This is a simplified approach - you might want more sophisticated tracking
          }
          break;
          
        case 'conversation_ended':
          // Conversation ended from Tavus side
          handleEndInterview();
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [interviewSession.isActive, addQuestion, tavusLoading, markConversationReady]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setIsAudioOn(!isMuted);
    // Send message to iframe to toggle audio
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'toggleAudio',
        muted: !isMuted
      }, '*');
    }
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // Send message to iframe to toggle video
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'toggleVideo',
        enabled: !isVideoOn
      }, '*');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-red-50 rounded-2xl border border-red-200">
        <div className="text-red-600 text-center">
          <h3 className="text-lg font-semibold mb-2">Interview Setup Error</h3>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={() => {
              resetInterview();
              resetSession();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-gray-200">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Video className="h-10 w-10 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Your AI Interview?
          </h3>
          
          <p className="text-gray-600 mb-8 max-w-md">
            Your AI interviewer is ready to conduct a professional {interviewType} interview. 
            Click below to begin the video conversation.
          </p>

          <button
            onClick={handleStartInterview}
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Setting up interview...</span>
              </span>
            ) : (
              'Start AI Interview'
            )}
          </button>

          <div className="mt-6 text-sm text-gray-500">
            <p>Make sure your camera and microphone are enabled</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 md:h-[600px] bg-black rounded-2xl overflow-hidden">
      {/* Video iframe */}
      {conversationUrl && (
        <iframe
          ref={iframeRef}
          src={conversationUrl}
          className="w-full h-full"
          allow="camera; microphone; autoplay; display-capture"
          allowFullScreen
        />
      )}

      {/* Control overlay */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex items-center justify-center space-x-4">
            {/* Mute/Unmute */}
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition-all duration-200 ${
                isMuted 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <MicOff className="h-5 w-5 text-white" />
              ) : (
                <Mic className="h-5 w-5 text-white" />
              )}
            </button>

            {/* Video toggle */}
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-all duration-200 ${
                !isVideoOn 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
              title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoOn ? (
                <Video className="h-5 w-5 text-white" />
              ) : (
                <VideoOff className="h-5 w-5 text-white" />
              )}
            </button>

            {/* End call */}
            <button
              onClick={handleEndInterview}
              className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition-all duration-200"
              title="End interview"
            >
              <PhoneOff className="h-5 w-5 text-white" />
            </button>

            {/* Volume control */}
            <button
              className="p-3 bg-gray-600 hover:bg-gray-700 rounded-full transition-all duration-200"
              title="Volume settings"
            >
              {isAudioOn ? (
                <Volume2 className="h-5 w-5 text-white" />
              ) : (
                <VolumeX className="h-5 w-5 text-white" />
              )}
            </button>
          </div>

          {/* Interview info */}
          <div className="text-center mt-4">
            <p className="text-white text-sm">
              {interviewType === 'visa' && `VISA Interview - ${visaType}`}
              {interviewType === 'job' && jobDetails && `Job Interview - ${jobDetails.title} at ${jobDetails.company}`}
              {interviewType === 'technical' && 'Technical Interview'}
            </p>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Connecting to your AI interviewer...</p>
          </div>
        </div>
      )}

      {/* Connection status indicator */}
      <div className="absolute top-4 right-4">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
          isConnected 
            ? 'bg-green-600 text-white' 
            : 'bg-yellow-600 text-white'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-300' : 'bg-yellow-300'
          } animate-pulse`}></div>
          <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
      </div>
    </div>
  );
} 