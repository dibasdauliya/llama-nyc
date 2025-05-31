import { NextRequest, NextResponse } from 'next/server';
import { LlamaAPIClient } from 'llama-api-client';

/**
 * Server-side proxy for Llama API requests to keep the API key secure
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Llama proxy request received');
    
    // Get the API key from server-side environment variable
    const apiKey = process.env.LLAMA_API_KEY;
    
    if (!apiKey) {
      console.error('LLAMA_API_KEY environment variable is not set');
      return NextResponse.json(
        { 
          error: 'Missing API key',
          detail: 'Llama API key is not configured on the server. Please add LLAMA_API_KEY to your .env.local file.'
        },
        { status: 403 }
      );
    }
    
    // Get the request payload from the client
    const requestData = await request.json();
    console.log('Request payload:', JSON.stringify({
      ...requestData.payload,
      messages: '[REDACTED]' // Don't log potentially sensitive message content
    }));
    
    // Initialize the Llama client with the API key
    const llama = new LlamaAPIClient({ apiKey });
    
    // Extract payload from the request
    const { messages, model, temperature, top_p, max_completion_tokens, stream } = requestData.payload;
    
    // Define fallback models in case the requested one isn't available
    const modelToUse = model || 'Llama-4-Maverick-17B-128E-Instruct-FP8';
    const fallbackModels = [
      'Llama-4-Maverick-17B-128E-Instruct-FP8',
      'Llama-3-70b-Instruct-FP4', 
      'Llama-3-8b-Instruct-FP4'
    ];
    
    // Validate that we have required fields
    if (!messages || !messages.length) {
      return NextResponse.json(
        { 
          error: 'Invalid request', 
          detail: 'Missing required field: messages'
        },
        { status: 400 }
      );
    }
    
    // If streaming is requested, handle streaming response
    if (stream) {
      console.log('Processing streaming request');
      try {
        // Try each model in sequence until one works
        let response = null;
        let lastError = null;
        
        // Start with the requested model, then try fallbacks if needed
        const modelsToTry = [modelToUse, ...fallbackModels.filter(m => m !== modelToUse)];
        
        for (const currentModel of modelsToTry) {
          try {
            console.log(`Attempting to use model for streaming: ${currentModel}`);
            response = await llama.chat.completions.create({
              messages,
              model: currentModel,
              temperature,
              top_p,
              max_completion_tokens,
              stream: true
            });
            
            // If we got here, the request succeeded
            console.log(`Successfully using model for streaming: ${currentModel}`);
            break;
          } catch (modelError) {
            console.warn(`Error with streaming model ${currentModel}:`, modelError);
            lastError = modelError;
            // Continue to next model
          }
        }
        
        // If we've tried all models and still have no response, throw the last error
        if (!response) {
          if (lastError) {
            throw lastError;
          }
          throw new Error('Failed to initialize stream with any available model');
        }
        
        console.log('Stream response initiated');
        
        // Create a readable stream to forward the streaming response
        const streamData = new ReadableStream({
          async start(controller) {
            let hasEmittedContent = false;
            
            try {
              for await (const chunk of response) {
                const encoder = new TextEncoder();
                
                // Log first few chunks to debug
                if (!hasEmittedContent) {
                  console.log('Stream chunk received:', JSON.stringify(chunk));
                }
                
                // Process chunk to extract content - treat as any to handle different formats
                const anyChunk = chunk as any;
                let contentExtracted = false;
                
                // Check various possible formats for content
                if (anyChunk.event?.delta?.text) {
                  // Text content found in this format
                  contentExtracted = true;
                  hasEmittedContent = true;
                  console.log('Content found in event.delta.text format');
                }
                else if (anyChunk.event?.event_type === 'progress') {
                  // Progress event with text
                  if (anyChunk.event?.delta?.text) {
                    contentExtracted = true;
                    hasEmittedContent = true;
                    console.log('Content found in progress event');
                  }
                }
                else if (anyChunk.event?.event_type === 'text') {
                  // Event is a text type
                  console.log('Text event received but no content in delta');
                  contentExtracted = true;
                }
                else if (anyChunk.event?.event_type === 'start') {
                  // Just a start event, no content expected
                  console.log('Stream start event received');
                  contentExtracted = true;
                }
                else if (anyChunk.delta?.content) {
                  // Alternative format
                  hasEmittedContent = true;
                  contentExtracted = true;
                  console.log('Content found in delta.content format');
                }
                else if (anyChunk.choices && anyChunk.choices[0]?.delta?.content) {
                  // Old OpenAI-style format
                  hasEmittedContent = true;
                  contentExtracted = true;
                  console.log('Content found in choices[0].delta.content format');
                }
                
                // Log if we still don't understand the chunk format
                if (!contentExtracted) {
                  console.log('Unknown chunk format:', 
                    JSON.stringify(anyChunk).substring(0, 200));
                }
                
                // Send the raw chunk to the client to handle parsing there
                const encodedChunk = encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`);
                controller.enqueue(encodedChunk);
              }
              
              // If we completed the stream but no content was emitted, send an error
              if (!hasEmittedContent) {
                console.error('Stream completed but no content was received');
                const encoder = new TextEncoder();
                const errorMessage = encoder.encode(`data: ${JSON.stringify({ 
                  error: 'Empty response', 
                  detail: 'The API returned an empty response. This might be due to content filtering or an issue with the request.'
                })}\n\n`);
                controller.enqueue(errorMessage);
              }
              
              // Send the [DONE] message to signal completion
              const encoder = new TextEncoder();
              const doneMessage = encoder.encode('data: [DONE]\n\n');
              controller.enqueue(doneMessage);
            } catch (error) {
              console.error('Error processing stream:', error);
              // Try to send error information to the client
              try {
                const encoder = new TextEncoder();
                const errorObj = {
                  error: 'Stream processing error',
                  detail: error instanceof Error ? error.message : 'Unknown error during stream processing',
                  code: error instanceof Error && 'code' in error ? (error as any).code : undefined
                };
                console.error('Sending error to client:', errorObj);
                const errorMessage = encoder.encode(`data: ${JSON.stringify(errorObj)}\n\n`);
                controller.enqueue(errorMessage);
              } catch (e) {
                console.error('Failed to send error to client:', e);
              }
            } finally {
              controller.close();
            }
          }
        });
        
        return new NextResponse(streamData, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        });
      } catch (error) {
        console.error('Error setting up stream:', error);
        return NextResponse.json(
          { 
            error: 'Stream setup error', 
            detail: error instanceof Error ? error.message : 'Failed to set up streaming response'
          },
          { status: 500 }
        );
      }
    }
    
    // For non-streaming requests, get the full response
    console.log('Processing non-streaming request');
    try {
      // Try each model in sequence until one works
      let completion = null;
      let lastError = null;
      
      // Start with the requested model, then try fallbacks if needed
      const modelsToTry = [modelToUse, ...fallbackModels.filter(m => m !== modelToUse)];
      
      for (const currentModel of modelsToTry) {
        try {
          console.log(`Attempting to use model: ${currentModel}`);
          completion = await llama.chat.completions.create({
            messages,
            model: currentModel,
            temperature,
            top_p,
            max_completion_tokens,
          });
          
          // If we got here, the request succeeded
          console.log(`Successfully used model: ${currentModel}`);
          break;
        } catch (modelError) {
          console.warn(`Error with model ${currentModel}:`, modelError);
          lastError = modelError;
          // Continue to next model
        }
      }
      
      // If we've tried all models and still have no completion, throw the last error
      if (!completion && lastError) {
        throw lastError;
      }
      
      console.log('Completion received:', 
        completion?.completion_message ? 'Content available' : 'No content available');
      
      if (!completion || !completion.completion_message || !completion.completion_message.content) {
        console.error('Received empty completion from API:', JSON.stringify(completion));
        return NextResponse.json(
          { 
            error: 'Empty response', 
            detail: 'The API returned an empty response. This might be due to content filtering or an issue with the request.'
          },
          { status: 422 }
        );
      }
      
      return NextResponse.json(completion);
    } catch (error) {
      console.error('Error with Llama API:', error);
      return NextResponse.json(
        { 
          error: 'Llama API Error', 
          detail: error instanceof Error ? error.message : 'Unknown error from Llama API',
          code: error instanceof Error && 'code' in error ? (error as any).code : undefined
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in Llama API proxy:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        detail: error instanceof Error ? error.message : 'Unknown error in proxy processing'
      },
      { status: 500 }
    );
  }
} 