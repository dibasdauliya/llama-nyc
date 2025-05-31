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