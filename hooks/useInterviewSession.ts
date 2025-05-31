import { useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface InterviewSession {
  id: string | null;
  isActive: boolean;
  startTime: Date | null;
  questions: InterviewQuestion[];
  conversationId: string | null;
  personaId: string | null;
}

interface InterviewQuestion {
  question: string;
  answer?: string;
  askedAt: Date;
  answeredAt?: Date;
  responseTime?: number;
  score?: number;
  feedback?: string;
}

interface InterviewData {
  type: 'VISA_F1' | 'VISA_B2' | 'VISA_H1B' | 'JOB_HR' | 'JOB_TECHNICAL';
  jobTitle?: string;
  company?: string;
  industry?: string;
  jobDescription?: string;
  visaType?: string;
  resumeUrl?: string;
}

interface ConversationData {
  overallScore?: number;
  communicationScore?: number;
  technicalScore?: number;
  confidenceScore?: number;
  strengths?: string[];
  improvements?: string[];
  detailedFeedback?: string;
  aiAnalysis?: any;
}

export function useInterviewSession() {
  const { data: session } = useSession();
  const [interviewSession, setInterviewSession] = useState<InterviewSession>({
    id: null,
    isActive: false,
    startTime: null,
    questions: [],
    conversationId: null,
    personaId: null,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start a new interview session
  const startInterview = useCallback(async (
    interviewData: InterviewData,
    conversationId: string,
    personaId: string
  ) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: interviewData.type,
          jobTitle: interviewData.jobTitle,
          company: interviewData.company,
          industry: interviewData.industry,
          jobDescription: interviewData.jobDescription,
          visaType: interviewData.visaType,
          resumeUrl: interviewData.resumeUrl,
          conversationId,
          personaId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start interview');
      }

      const interview = await response.json();

      setInterviewSession({
        id: interview.id,
        isActive: true,
        startTime: new Date(),
        questions: [],
        conversationId,
        personaId,
      });

      return interview;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start interview';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Add a question to the current session
  const addQuestion = useCallback((question: InterviewQuestion) => {
    setInterviewSession(prev => ({
      ...prev,
      questions: [...prev.questions, question]
    }));
  }, []);

  // Update an existing question (e.g., when answer is provided)
  const updateQuestion = useCallback((index: number, updates: Partial<InterviewQuestion>) => {
    setInterviewSession(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, ...updates } : q
      )
    }));
  }, []);

  // End the interview and save to database
  const endInterview = useCallback(async (
    status: 'COMPLETED' | 'CANCELLED' | 'FAILED' = 'COMPLETED',
    conversationData?: ConversationData
  ) => {
    if (!interviewSession.id) {
      throw new Error('No active interview session');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/interviews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewId: interviewSession.id,
          conversationId: interviewSession.conversationId,
          status,
          questions: interviewSession.questions,
          conversationData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to end interview');
      }

      const updatedInterview = await response.json();

      // Reset session
      setInterviewSession({
        id: null,
        isActive: false,
        startTime: null,
        questions: [],
        conversationId: null,
        personaId: null,
      });

      return updatedInterview;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to end interview';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [interviewSession]);

  // Get current session duration
  const getSessionDuration = useCallback(() => {
    if (!interviewSession.startTime) return 0;
    return Math.floor((Date.now() - interviewSession.startTime.getTime()) / 1000);
  }, [interviewSession.startTime]);

  // Reset session state (for cleanup)
  const resetSession = useCallback(() => {
    setInterviewSession({
      id: null,
      isActive: false,
      startTime: null,
      questions: [],
      conversationId: null,
      personaId: null,
    });
    setError(null);
  }, []);

  return {
    interviewSession,
    isLoading,
    error,
    startInterview,
    endInterview,
    addQuestion,
    updateQuestion,
    getSessionDuration,
    resetSession,
  };
} 