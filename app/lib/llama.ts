/**
 * Client for the Llama API to summarize emails
 */

interface SummarizeOptions {
  temperature?: number;
  maxTokens?: number;
}

/**
 * Summarize an email using Llama API
 */
export async function summarizeEmail(emailContent: string, options: SummarizeOptions = {}) {
  const { temperature = 0.6, maxTokens = 2048 } = options;

  try {
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant that summarizes emails. Be concise and focus on key information. Extract action items, important dates, and main points."
      },
      {
        role: "user",
        content: `Please summarize this email: ${emailContent}`
      }
    ];

    const payload = {
      messages,
      model: "Llama-4-Maverick-17B-128E-Instruct-FP8",
      repetition_penalty: 1,
      temperature,
      top_p: 0.9,
      max_completion_tokens: maxTokens,
      stream: false
    };

    // Use our server-side proxy instead of calling Llama API directly
    const response = await fetch("/api/llama-proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        payload
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Llama API error: ${errorData.error?.detail || errorData.error || response.statusText}`);
    }

    const data = await response.json();
    
    // Check if we have completion content
    if (!data || !data.completion_message || !data.completion_message.content) {
      throw new Error("Empty response received from API. Please try again.");
    }
    
    return data.completion_message.content;
  } catch (error) {
    console.error("Error summarizing email:", error);
    throw error;
  }
}

/**
 * Summarize an email using streaming for progressive updates
 */
export async function summarizeEmailStream(emailContent: string, options: SummarizeOptions = {}) {
  const { temperature = 0.6, maxTokens = 2048 } = options;

  try {
    console.log('Preparing streaming summary request');
    
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant that summarizes emails. Be concise and focus on key information. Extract action items, important dates, and main points."
      },
      {
        role: "user",
        content: `Please summarize this email: ${emailContent}`
      }
    ];

    const payload = {
      messages,
      model: "Llama-4-Maverick-17B-128E-Instruct-FP8",
      repetition_penalty: 1,
      temperature,
      top_p: 0.9,
      max_completion_tokens: maxTokens,
      stream: true
    };

    console.log('Sending streaming request to proxy');
    
    // Use our server-side proxy with streaming enabled
    const response = await fetch("/api/llama-proxy", {
      method: "POST",
      headers: {
        "Accept": "text/event-stream",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        payload,
        stream: true
      })
    });

    console.log('Received response from proxy', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from proxy:', errorText);
      throw new Error(`Llama API error: ${errorText || response.statusText}`);
    }

    if (!response.body) {
      console.error('Response body is null');
      throw new Error('Response body is null');
    }

    return response.body;
  } catch (error) {
    console.error("Error with streaming summarization:", error);
    throw error;
  }
}

/**
 * Generate an email reply based on a simple prompt and the original email
 */
export async function generateEmailReply(originalEmail: string, prompt: string, options: SummarizeOptions = {}) {
  const { temperature = 0.7, maxTokens = 2048 } = options;

  try {
    console.log('Preparing email reply request');
    
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant that generates professional email replies. Create responses that are clear, concise, and maintain a professional tone while addressing the key points from the original email."
      },
      {
        role: "user",
        content: `Original email: ${originalEmail}\n\nCreate a reply using this prompt: ${prompt}`
      }
    ];

    const payload = {
      messages,
      model: "Llama-4-Maverick-17B-128E-Instruct-FP8",
      repetition_penalty: 1,
      temperature,
      top_p: 0.9,
      max_completion_tokens: maxTokens,
      stream: false
    };

    console.log('Sending reply generation request to proxy');
    
    // Use our server-side proxy
    const response = await fetch("/api/llama-proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        payload
      })
    });

    console.log('Received response from proxy', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Llama API error: ${errorData.error?.detail || errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('API response data structure:', JSON.stringify(data, null, 2).substring(0, 500));
    
    // Check if we have completion content and handle different response formats
    let content = '';
    
    // Check for completion_message format
    if (data?.completion_message?.content) {
      // Handle both string content and object content with text field
      if (typeof data.completion_message.content === 'string') {
        content = data.completion_message.content;
      } else if (typeof data.completion_message.content === 'object' && data.completion_message.content?.text) {
        content = data.completion_message.content.text;
      }
    } 
    // Check for choices array format
    else if (data?.choices && data.choices.length > 0 && data.choices[0]?.message?.content) {
      content = data.choices[0].message.content;
    }
    // Direct content property
    else if (data?.content) {
      content = data.content;
    }
    // Last resort - try to stringify if it's an object
    else if (typeof data === 'object' && data !== null) {
      console.log('Unexpected response format:', data);
      // If it's an object but not in expected format, try to extract any text content we can find
      const extractContent = (obj: any): string => {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        
        // Check common content fields
        if (obj.content) {
          if (typeof obj.content === 'string') return obj.content;
          // Handle nested content object with text field (common in Llama API)
          if (typeof obj.content === 'object' && obj.content.text) {
            return obj.content.text;
          }
        }
        if (obj.text && typeof obj.text === 'string') return obj.text;
        if (obj.message?.content) {
          if (typeof obj.message.content === 'string') return obj.message.content;
          // Handle nested content in message
          if (typeof obj.message.content === 'object' && obj.message.content.text) {
            return obj.message.content.text;
          }
        }
        
        // If we have an array of items, try each one
        if (Array.isArray(obj)) {
          for (const item of obj) {
            const result = extractContent(item);
            if (result) return result;
          }
        }
        
        // Try to extract from nested objects
        if (typeof obj === 'object') {
          for (const key in obj) {
            if (typeof obj[key] === 'object' || typeof obj[key] === 'string') {
              const result = extractContent(obj[key]);
              if (result) return result;
            }
          }
        }
        
        return '';
      };
      
      content = extractContent(data);
      
      // If still no content, just return a placeholder
      if (!content) {
        console.error('Failed to extract any text content from response');
        throw new Error("Couldn't parse response from AI. Please try again.");
      }
    }
    
    if (!content) {
      throw new Error("Empty response received from API. Please try again.");
    }
    
    // Ensure content is a string
    if (typeof content !== 'string') {
      console.error('Content is not a string:', content);
      throw new Error("Invalid response format from API. Please try again.");
    }
    
    console.log('Successfully extracted reply content:', content.substring(0, 100) + '...');
    return content;
  } catch (error) {
    console.error("Error generating email reply:", error);
    throw error;
  }
} 