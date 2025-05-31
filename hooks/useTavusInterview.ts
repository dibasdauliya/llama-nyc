import { useState, useCallback, useRef, useEffect } from 'react';
import { createTavusClient, getPersonaForInterviewType } from '../lib/tavus';

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

Please tailor your questions to this specific role and company. Ask about relevant experience, skills, and motivation for this particular position.`;
      }

      if (options.interviewType === 'visa' && options.visaType) {
        customizedPrompt += `\n\nCONTEXT FOR THIS INTERVIEW:
- VISA Type: ${options.visaType}

Please focus your questions specifically on this type of VISA and its requirements.`;
      }

      // Update the persona template with customized prompt and use the first available replica
      const updatedPersonaTemplateOld = {
        ...personaTemplate,
        system_prompt: customizedPrompt,
        default_replica_id: replicas.length > 0 ? replicas[0].replica_id : "r79e1c033f"
      };

      const updatedPersonaTemplate = {
        "persona_name": "F1 Visa Interview",
        "default_replica_id": "r9d30b0e55ac",
        "system_prompt": "You are F1 Visa Officer. You are interviewing a candidate for a F1 Visa. You are asking questions to the candidate to assess their eligibility for a F1 Visa. You are also assessing their English proficiency and their ability to speak English fluently. You are also assessing their financial stability and their ability to support themselves during their studies in the United States. You are also assessing their academic background and their ability to succeed in their studies in the United States. You are also assessing their personal background and their ability to succeed in their studies in the United States. You are also assessing their family background and their ability to succeed in their studies in the United States. You are also assessing their personal background and their ability to succeed in their studies in the United States. You are also assessing their family background and their ability to succeed in their studies in the United States. You are also assessing their personal background and their ability to succeed in their studies in the United States. You are also assessing their family background and their ability to succeed in their studies in the United States.",
        "context": customizedPrompt,
        "layers": {
            "perception": {
                "perception_model": "raven-0",
                "ambient_awareness_queries": [
                    "Does the candidate appear to be looking at other screens, notes, or devices during the interview?",
                    "Is there another person in the scene?",
                    "Are there any visual indicators of extreme nervousness (excessive fidgeting, rigid posture, or unusual facial expressions) that might affect performance?"
                ]
            }
        }
      }

      // First, try to find an existing persona or create a new one
      const personas = await tavusClient.current.listPersonas();
      let persona = personas.find(p => 
        p.persona_name === personaTemplate.persona_name
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
        isLoading: false,
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
  };
} 