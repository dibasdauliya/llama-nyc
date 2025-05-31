const TAVUS_API_BASE = 'https://tavusapi.com/v2';

interface TavusPersona {
  persona_id: string;
  persona_name: string;
  system_prompt: string;
  pipeline_mode?: string;
  context?: string;
  default_replica_id: string;
  layers?: {
    llm?: {
      model?: string;
      temperature?: number;
      base_url?: string;
      api_key?: string;
      tools?: any[];
      headers?: Record<string, string>;
      extra_body?: Record<string, any>;
    };
    tts?: {
      api_key?: string;
      tts_engine?: string;
      external_voice_id?: string;
      voice_settings?: {
        speed?: string;
        emotion?: string[];
      };
      playht_user_id?: string;
      tts_emotion_control?: string;
      tts_model_name?: string;
    };
    perception?: {
      perception_model?: string;
      ambient_awareness_queries?: string[];
      perception_tool_prompt?: string;
      perception_tools?: any[];
    };
    stt?: {
      stt_engine?: string;
      participant_pause_sensitivity?: string;
      participant_interrupt_sensitivity?: string;
      hotwords?: string;
      smart_turn_detection?: boolean;
    };
  };
}

interface TavusConversation {
  conversation_id: string;
  conversation_url: string;
  status: string;
  callback_url?: string;
  participant_count?: number;
}

class TavusClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${TAVUS_API_BASE}${endpoint}`;
    console.log('Making request to:', url, 'with options:', options);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const responseText = await response.text();
    console.log('Response status:', response.status, 'Response text:', responseText);

    if (!response.ok) {
      let errorMessage = `Tavus API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage += ` - ${JSON.stringify(errorData)}`;
      } catch (e) {
        errorMessage += ` - ${responseText}`;
      }
      throw new Error(errorMessage);
    }

    try {
      return JSON.parse(responseText);
    } catch (e) {
      return { data: responseText };
    }
  }

  // Create a persona for different interview types
  async createPersona(personaData: Partial<TavusPersona>): Promise<TavusPersona> {
    console.log('createPersona', personaData);
    
    // Ensure required fields are present
    const requestBody = {
      persona_name: personaData.persona_name || "AI Interviewer",
      system_prompt: personaData.system_prompt || "",
      pipeline_mode: personaData.pipeline_mode || "full",
      default_replica_id: personaData.default_replica_id || "r79e1c033f",
      context: personaData.context || "",
      layers: personaData.layers || {}
    };
    
    console.log('createPersona requestBody', JSON.stringify(requestBody, null, 2));
    
    const response = await this.makeRequest('/personas', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
    console.log('createPersona response', response);
    
    // Handle the response structure properly
    return response.persona || response.data || response;
  }

  // Get an existing persona
  async getPersona(personaId: string): Promise<TavusPersona> {
    const response = await this.makeRequest(`/personas/${personaId}`, {
      method: 'GET',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
    return response.data[0];
  }

  // List all personas
  async listPersonas(): Promise<TavusPersona[]> {
    const response = await this.makeRequest('/personas');
    console.log('listPersonas', response);
    return response.data;
  }

  // Create a conversation with a persona
  async createConversation(personaId: string, callbackUrl?: string): Promise<TavusConversation> {
    const response = await this.makeRequest('/conversations', {
      method: 'POST',
      body: JSON.stringify({
        persona_id: personaId,
        callback_url: callbackUrl,
        properties: {
          max_call_duration: 60*6, // 6 minutes
          participant_left_timeout: 60,
          participant_absent_timeout: 300,
          enable_recording: false,
        }
      }),
    });
    console.log('createConversationBOOM', response);
    return response;
  }

  // Get conversation status
  async getConversation(conversationId: string): Promise<TavusConversation> {
    const response = await this.makeRequest(`/conversations/${conversationId}`);
    return response.data;
  }

  // List available replicas
  async listReplicas(): Promise<any[]> {
    try {
      const response = await this.makeRequest('/replicas');
      console.log('listReplicas', response);
      return response.data || [];
    } catch (error) {
      console.error('Error listing replicas:', error);
      return [];
    }
  }

  // End a conversation
  async endConversation(conversationId: string): Promise<void> {
    await this.makeRequest(`/conversations/${conversationId}/end`, {
      method: 'POST',
    });
  }

  // Delete a conversation
  async deleteConversation(conversationId: string): Promise<void> {
    await this.makeRequest(`/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }
}

// Pre-defined personas for different interview types
export const INTERVIEW_PERSONAS = {
  VISA_OFFICER: {
    persona_name: "US VISA Officer",
    pipeline_mode: "full",
    default_replica_id: "r79e1c033f", // You'll need to replace this with an actual replica ID
    system_prompt: `You are a professional US VISA officer conducting interviews at a US embassy or consulate. Your role is to:

1. Ask relevant questions based on the visa type (F-1 Student, B-2 Tourist, H-1B Work)
2. Assess the applicant's eligibility and intent
3. Maintain a professional, authoritative but fair demeanor
4. Ask follow-up questions based on responses
5. Look for consistency in answers
6. Evaluate ties to home country and intent to return
7. Assess financial capability and genuine purpose

Guidelines:
- Be direct and concise in your questions
- Show appropriate authority while remaining professional
- Ask one question at a time
- Listen carefully to responses and ask relevant follow-ups
- Conclude the interview when you have enough information

Remember: You are determining visa eligibility based on US immigration law and policy.`,
    context: "You have conducted thousands of visa interviews and are experienced in identifying genuine applicants versus those who may pose immigration risks.",
    layers: {
      llm: {
        model: "gpt-4",
        temperature: 0.3,
      },
      tts: {
        tts_engine: "cartesia",
        voice_settings: {
          speed: "normal",
          emotion: ["authority:medium", "professionalism:high"]
        },
        tts_model_name: "sonic"
      },
      stt: {
        stt_engine: "tavus-turbo",
        participant_pause_sensitivity: "medium",
        participant_interrupt_sensitivity: "medium",
        smart_turn_detection: true
      }
    }
  },

  HR_INTERVIEWER: {
    persona_name: "Professional HR Interviewer",
    pipeline_mode: "full",
    default_replica_id: "r79e1c033f", // You'll need to replace this with an actual replica ID
    system_prompt: `You are an experienced HR interviewer conducting job interviews. Your role is to:

1. Assess candidates' qualifications and fit for the role
2. Ask behavioral, situational, and competency-based questions
3. Evaluate soft skills, communication, and cultural fit
4. Provide a welcoming yet professional interview experience
5. Ask follow-up questions to get detailed examples
6. Help candidates feel comfortable while maintaining interview structure

Guidelines:
- Start with a warm welcome and introduction
- Ask open-ended questions that require detailed responses
- Use the STAR method to evaluate behavioral responses
- Ask about specific experiences and achievements
- Inquire about motivation and career goals
- Allow time for candidate questions
- Maintain professional enthusiasm

Remember: You want to find the best candidate while giving everyone a fair opportunity to showcase their abilities.`,
    context: "You have interviewed hundreds of candidates across various roles and industries, and you understand what makes a great hire.",
    layers: {
      llm: {
        model: "gpt-4",
        temperature: 0.4,
      },
      tts: {
        tts_engine: "cartesia",
        voice_settings: {
          speed: "normal",
          emotion: ["warmth:medium", "professionalism:high", "encouragement:low"]
        },
        tts_model_name: "sonic"
      },
      stt: {
        stt_engine: "tavus-turbo",
        participant_pause_sensitivity: "medium",
        participant_interrupt_sensitivity: "low",
        smart_turn_detection: true
      }
    }
  },

  TECHNICAL_INTERVIEWER: {
    persona_name: "Technical Interviewer",
    pipeline_mode: "full",
    default_replica_id: "r79e1c033f", // You'll need to replace this with an actual replica ID
    system_prompt: `You are a senior technical interviewer evaluating candidates for technical roles. Your role is to:

1. Assess technical competency and problem-solving skills
2. Ask about specific technologies, frameworks, and methodologies
3. Present technical challenges and coding scenarios
4. Evaluate architecture and system design thinking
5. Understand candidate's technical experience depth
6. Assess learning ability and technical curiosity

Guidelines:
- Ask specific technical questions relevant to the role
- Request detailed explanations of past projects
- Present hypothetical technical scenarios
- Evaluate problem-solving approach, not just answers
- Ask about best practices and code quality
- Understand their technical decision-making process
- Be encouraging while maintaining technical rigor

Remember: You're looking for technical competence, problem-solving ability, and potential for growth.`,
    context: "You are a senior engineer with extensive experience in technical interviews and understanding what technical skills are needed for success.",
    layers: {
      llm: {
        model: "gpt-4",
        temperature: 0.3,
      },
      tts: {
        tts_engine: "cartesia",
        voice_settings: {
          speed: "normal",
          emotion: ["analytical:high", "professionalism:high"]
        },
        tts_model_name: "sonic"
      },
      stt: {
        stt_engine: "tavus-turbo",
        participant_pause_sensitivity: "high",
        participant_interrupt_sensitivity: "medium",
        smart_turn_detection: true
      }
    }
  }
};

// Initialize Tavus client
export function createTavusClient(apiKey: string): TavusClient {
  return new TavusClient(apiKey);
}

// Helper function to get the appropriate persona for interview type
export function getPersonaForInterviewType(type: 'visa' | 'job' | 'technical'): Partial<TavusPersona> {
  switch (type) {
    case 'visa':
      return INTERVIEW_PERSONAS.VISA_OFFICER;
    case 'job':
      return INTERVIEW_PERSONAS.HR_INTERVIEWER;
    case 'technical':
      return INTERVIEW_PERSONAS.TECHNICAL_INTERVIEWER;
    default:
      return INTERVIEW_PERSONAS.HR_INTERVIEWER;
  }
} 