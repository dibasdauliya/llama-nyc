import { useState, useCallback, useRef, useEffect } from 'react';
import { createTavusClient, getPersonaForInterviewType } from '../lib/tavus';
import { ResumeData, generateInterviewContext } from '../lib/resumeParser';

interface TavusInterviewState {
  isLoading: boolean;
  isConnected: boolean;
  conversationId: string | null;
  conversationUrl: string | null;
  error: string | null;
  personaId: string | null;
}

interface UseTavusInterviewOptions {
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
}

export function useTavusInterview(options: UseTavusInterviewOptions) {
  const [state, setState] = useState<TavusInterviewState>({
    isLoading: false,
    isConnected: false,
    conversationId: null,
    conversationUrl: null,
    error: null,
    personaId: null,
  });

  const tavusClient = useRef(createTavusClient(options.apiKey));

  // Create or get persona for the interview type
  const setupPersona = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // First, let's check available replicas
      const replicas = await tavusClient.current.listReplicas();
      console.log('Available replicas:', replicas);

      // Get the base persona template
      const personaTemplate = getPersonaForInterviewType(options.interviewType);
      
      // Customize the system prompt based on context
      let customizedPrompt = personaTemplate.system_prompt;

      if (options.interviewType === 'job' && options.jobDetails) {
        customizedPrompt += `\n\nCONTEXT FOR THIS INTERVIEW:
- Position: ${options.jobDetails.title}
- Company: ${options.jobDetails.company}
- Industry: ${options.jobDetails.industry}
${options.jobDetails.description ? `- Job Description: ${options.jobDetails.description}` : ''}

Please tailor your questions to this specific role and company. Ask about relevant experience, skills, and motivation for this particular position.

IMMEDIATE REJECTION CRITERIA - End interview immediately if candidate:
- Has no relevant experience for the role
- Cannot provide specific examples when asked
- Shows lack of basic knowledge about the company or industry
- Admits to lying on their resume
- Demonstrates unprofessional behavior
- Cannot explain basic concepts related to the job

When rejecting, clearly state: "I'm sorry, but based on your responses, you do not meet the minimum requirements for this position. This interview is now concluded."`;

        // Add resume context if available
        if (options.resumeData) {
          customizedPrompt += generateInterviewContext(options.resumeData, options.jobDetails);
        }
      }

      if (options.interviewType === 'visa' && options.visaType) {
        customizedPrompt += `\n\nCONTEXT FOR THIS INTERVIEW:
- VISA Type: ${options.visaType}

Please focus your questions specifically on this type of VISA and its requirements.

IMMEDIATE REJECTION CRITERIA - End interview immediately if candidate:
- Cannot provide adequate financial proof or support documentation
- Has no clear ties to home country (for tourist/student visas)
- Cannot explain the purpose of their visit clearly
- Provides contradictory information
- Has insufficient funds for their intended stay
- Cannot demonstrate genuine intent for visa type
- Has suspicious travel patterns or criminal background
- Cannot communicate effectively in English for the visa purpose

When rejecting, clearly state: "I'm sorry, but based on your responses, you do not qualify for this visa at this time. This interview is concluded. You may reapply when you meet the requirements."`;
      }

      // Create dynamic persona based on interview type
      const createPersonaTemplate = () => {
        if (options.interviewType === 'visa') {
          switch (options.visaType) {
            case 'Student Visa (F-1)':
            case 'F-1':
              return {
                "persona_name": "F1 Visa Officer",
                "default_replica_id": "r9d30b0e55ac",
                "system_prompt": "You are an experienced F1 Visa Officer conducting a student visa interview. You are professional, thorough, but decisive. Ask questions to assess the candidate's eligibility for an F1 student visa, including their academic intentions, financial capability, English proficiency, and ties to their home country. REJECT IMMEDIATELY (DON'T ASK AGAIN) if they cannot demonstrate: 1) Acceptance to a legitimate US educational institution, 2) Sufficient financial resources, 3) Strong ties to home country, 4) Genuine academic intent. Do not continue with follow-up questions if basic criteria are not met.",
                "context": customizedPrompt,
                "layers": {
                  "perception": {
                    "perception_model": "raven-0",
                    "ambient_awareness_queries": [
                      "Does the candidate appear to be looking at other screens, notes, or devices during the interview?",
                      "Is there another person in the scene?",
                      "Are there any visual indicators of extreme nervousness that might affect their performance?"
                    ]
                  }
                }
              };
              
            case 'Tourist Visa (B-2)':
            case 'B-2':
              return {
                "persona_name": "B2 Visa Officer",
                "default_replica_id": "r9d30b0e55ac",
                "system_prompt": "You are an experienced B2 Tourist Visa Officer conducting a tourist visa interview. You are professional, efficient, and decisive. Ask questions to assess the candidate's genuine intent to visit the US for tourism. REJECT IMMEDIATELY if they cannot demonstrate: 1) Clear travel itinerary and purpose, 2) Sufficient funds for the trip, 3) Strong ties to home country ensuring return, 4) No intent to immigrate or work illegally. End the interview if basic tourist intent cannot be established.",
                "context": customizedPrompt,
                "layers": {
                  "perception": {
                    "perception_model": "raven-0",
                    "ambient_awareness_queries": [
                      "Does the candidate appear to be looking at other screens, notes, or devices during the interview?",
                      "Is there another person in the scene?",
                      "Are there any visual indicators of extreme nervousness that might affect their performance?"
                    ]
                  }
                }
              };
              
            case 'Work Visa (H-1B)':
            case 'H-1B':
              return {
                "persona_name": "H1B Visa Officer",
                "default_replica_id": "r9d30b0e55ac",
                "system_prompt": "You are an experienced H1B Work Visa Officer conducting a work visa interview. You are professional, detail-oriented, and decisive. Ask questions to assess the candidate's qualifications for the specialty occupation. REJECT IMMEDIATELY if they cannot demonstrate: 1) Proper educational qualifications for the specialty occupation, 2) Legitimate job offer from approved employer, 3) Understanding of their role and responsibilities, 4) Intent to return home after visa expires. Do not continue if basic work authorization criteria are not met.",
                "context": customizedPrompt,
                "layers": {
                  "perception": {
                    "perception_model": "raven-0",
                    "ambient_awareness_queries": [
                      "Does the candidate appear to be looking at other screens, notes, or devices during the interview?",
                      "Is there another person in the scene?",
                      "Are there any visual indicators of extreme nervousness that might affect their performance?"
                    ]
                  }
                }
              };
              
            default:
              return {
                "persona_name": "Visa Officer",
                "default_replica_id": "r9d30b0e55ac",
                "system_prompt": "You are an experienced US Visa Officer conducting a visa interview. You are professional, fair, thorough, and decisive. Ask appropriate questions based on the visa type to assess the candidate's eligibility and intent. REJECT IMMEDIATELY if basic eligibility criteria are not met.",
                "context": customizedPrompt,
                "layers": {
                  "perception": {
                    "perception_model": "raven-0",
                    "ambient_awareness_queries": [
                      "Does the candidate appear to be looking at other screens, notes, or devices during the interview?",
                      "Is there another person in the scene?",
                      "Are there any visual indicators of extreme nervousness that might affect their performance?"
                    ]
                  }
                }
              };
          }
        } else if (options.interviewType === 'job' || options.interviewType === 'technical') {
          const isJobTechnical = options.interviewType === 'technical' || options.jobDetails?.industry === 'technology';
          
          return {
            "persona_name": isJobTechnical ? "Technical Interviewer" : "HR Interviewer",
            "default_replica_id": "r9d30b0e55ac",
            "system_prompt": isJobTechnical 
              ? "You are an experienced Technical Interviewer conducting a job interview. You are knowledgeable, analytical, fair, and decisive. Ask questions to assess the candidate's technical skills, problem-solving abilities, coding experience, and cultural fit for the technology role. REJECT IMMEDIATELY if they cannot demonstrate: 1) Basic technical knowledge for the role, 2) Relevant experience or education, 3) Problem-solving capabilities, 4) Professional communication skills. Do not waste time with follow-up questions if fundamental requirements are not met."
              : "You are an experienced HR Interviewer conducting a job interview. You are professional, empathetic, thorough, and decisive. Ask questions to assess the candidate's qualifications, experience, cultural fit, motivation, and suitability for the role. REJECT IMMEDIATELY if they cannot demonstrate: 1) Relevant experience for the position, 2) Basic qualifications and skills, 3) Professional attitude and communication, 4) Understanding of the role and company. End the interview quickly if basic requirements are not satisfied.",
            "context": customizedPrompt,
            "layers": {
              "perception": {
                "perception_model": "raven-0",
                "ambient_awareness_queries": [
                  "Does the candidate appear to be looking at other screens, notes, or devices during the interview?",
                  "Is there another person in the scene?",
                  "Are there any visual indicators of extreme nervousness that might affect their performance?"
                ]
              }
            }
          };
        }
        
        // Default fallback
        return {
          "persona_name": "Professional Interviewer",
          "default_replica_id": "r9d30b0e55ac",
          "system_prompt": "You are a professional interviewer conducting an interview. You are experienced, fair, thorough, and decisive in your assessment. REJECT IMMEDIATELY if basic requirements are not met.",
          "context": customizedPrompt,
          "layers": {
            "perception": {
              "perception_model": "raven-0",
              "ambient_awareness_queries": [
                "Does the candidate appear to be looking at other screens, notes, or devices during the interview?",
                "Is there another person in the scene?",
                "Are there any visual indicators of extreme nervousness that might affect their performance?"
              ]
            }
          }
        };
      };

      const updatedPersonaTemplate = createPersonaTemplate();
      
      console.log('Creating persona for:', {
        interviewType: options.interviewType,
        visaType: options.visaType,
        personaName: updatedPersonaTemplate.persona_name
      });

      // First, try to find an existing persona or create a new one
      const personas = await tavusClient.current.listPersonas();
      let persona = personas.find(p => 
        p.persona_name === updatedPersonaTemplate.persona_name
      );
      console.log('personas', personas);

      if (!persona) {
        // Create new persona if not found
        console.log('creating new persona');
        console.log('personaTemplate', updatedPersonaTemplate);
        persona = await tavusClient.current.createPersona(updatedPersonaTemplate);
      }

      setState(prev => ({ 
        ...prev, 
        personaId: persona!.persona_id,
        isLoading: false 
      }));

      return persona.persona_id;
    } catch (error) {
      console.error('Setup persona error:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to setup persona',
        isLoading: false 
      }));
      throw error;
    }
  }, [options]);

  // Start the interview conversation
  const startInterview = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Setup persona first if not already done
      let personaId = state.personaId;
      console.log('personaId', personaId);
      if (!personaId) {
        personaId = await setupPersona();
      }

      // Create conversation
      const conversation = await tavusClient.current.createConversation(
        personaId!,
        `${window.location.origin}/api/tavus/callback` // Callback URL for conversation events
      );

      console.log('conversation', conversation);

      setState(prev => ({
        ...prev,
        conversationId: conversation.conversation_id,
        conversationUrl: conversation.conversation_url,
        isConnected: true,
      }));

      return conversation;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to start interview',
        isLoading: false 
      }));
      throw error;
    }
  }, [state.personaId, setupPersona]);

  // End the interview
  const endInterview = useCallback(async () => {
    if (!state.conversationId) return;

    try {
      await tavusClient.current.endConversation(state.conversationId);
      setState(prev => ({
        ...prev,
        isConnected: false,
        conversationId: null,
        conversationUrl: null,
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to end interview'
      }));
    }
  }, [state.conversationId]);

  // Get conversation status
  const getConversationStatus = useCallback(async () => {
    if (!state.conversationId) return null;

    try {
      const conversation = await tavusClient.current.getConversation(state.conversationId);
      return conversation;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to get conversation status'
      }));
      return null;
    }
  }, [state.conversationId]);

  // Mark conversation as ready (call this when you get first data)
  const markConversationReady = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  // Reset the interview state
  const resetInterview = useCallback(() => {
    setState({
      isLoading: false,
      isConnected: false,
      conversationId: null,
      conversationUrl: null,
      error: null,
      personaId: null,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.conversationId) {
        tavusClient.current.endConversation(state.conversationId).catch(console.error);
      }
    };
  }, [state.conversationId]);

  return {
    ...state,
    startInterview,
    endInterview,
    resetInterview,
    getConversationStatus,
    setupPersona,
    markConversationReady,
  };
} 