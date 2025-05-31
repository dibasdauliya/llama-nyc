'use client';

import { useState, useEffect, useRef } from 'react';
import { ScanText, Loader2 } from 'lucide-react';
import { summarizeEmailStream } from '@/app/lib/llama';
import ApiKeyMissing from './ApiKeyMissing';
import ReactMarkdown from 'react-markdown';

interface EmailSummaryStreamingProps {
  emailContent: string;
}

export default function EmailSummaryStreaming({ emailContent }: EmailSummaryStreamingProps) {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState<boolean>(false);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const decoder = useRef<TextDecoder>(new TextDecoder());

  const getSummary = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setIsApiKeyMissing(false);
      setIsVisible(true);
      setSummary('');
      
      console.log('Starting summary request...');
      const stream = await summarizeEmailStream(emailContent);
      
      if (!stream) {
        throw new Error('No stream returned from API');
      }
      
      console.log('Stream received, creating reader...');
      const reader = stream.getReader();
      readerRef.current = reader;
      
      let done = false;
      let errorOccurred = false;
      let chunkCount = 0;
      
      while (!done) {
        try {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          
          if (done) {
            console.log('Stream reading complete');
            break;
          }
          
          chunkCount++;
          // Process the chunk of data
          const chunk = decoder.current.decode(value, { stream: true });
          
          // Log first few chunks for debugging
          if (chunkCount <= 3) {
            console.log(`Received chunk ${chunkCount}:`, chunk.substring(0, 200));
          }
          
          // Check for error messages in the stream
          if (chunk.includes('"error"') || chunk.includes('"detail"')) {
            try {
              // Try to parse error message
              const errorMatch = /data: (\{.*?\})/g.exec(chunk);
              if (errorMatch && errorMatch[1]) {
                const errorData = JSON.parse(errorMatch[1]);
                if (errorData.error) {
                  throw new Error(`API error: ${errorData.detail || errorData.error}`);
                }
              }
            } catch (parseError) {
              console.warn('Error parsing error message:', parseError);
            }
            
            // If we couldn't parse a specific error, throw a generic one
            if (!errorOccurred) {
              errorOccurred = true;
              throw new Error('Error in AI response stream');
            }
          }
          
          // Parse the SSE format
          const lines = chunk.split('\n');
          let newContent = '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              if (data === '[DONE]') {
                done = true;
                break;
              }
              
              // Check for error messages
              if (data.includes('"error"')) {
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.error) {
                    throw new Error(parsed.detail || parsed.error);
                  }
                } catch (parseError) {
                  console.warn('Error parsing error message:', parseError);
                }
              }
              
              try {
                const parsed = JSON.parse(data);
                
                // Log the parsed data to debug specific format
                if (chunkCount <= 3) {
                  console.log(`Parsed data in chunk ${chunkCount}:`, parsed);
                }
                
                // Extract content from different possible formats
                let extractedContent = '';
                
                // Llama API client specific format - this is the format we're actually seeing in logs
                if (parsed.event?.event_type === 'progress' && parsed.event?.delta?.text) {
                  extractedContent = parsed.event.delta.text;
                }
                // Other possible formats
                else if (parsed.event?.text) {
                  extractedContent = parsed.event.text;
                }
                else if (parsed.delta?.content) {
                  extractedContent = parsed.delta.content;
                }
                else if (parsed.choices && parsed.choices[0]?.delta?.content) {
                  extractedContent = parsed.choices[0].delta.content;
                }
                else if (parsed.content) {
                  extractedContent = parsed.content;
                }
                
                // Debug log extraction
                if (extractedContent && chunkCount <= 3) {
                  console.log(`Extracted content from chunk ${chunkCount}:`, extractedContent);
                }
                
                if (extractedContent) {
                  newContent += extractedContent;
                }
              } catch (e) {
                console.warn('Error parsing SSE data:', e, data);
              }
            }
          }
          
          if (newContent) {
            setSummary(prev => prev + newContent);
          }
        } catch (streamError) {
          console.error('Stream reading error:', streamError);
          setError(streamError instanceof Error ? streamError.message : 'Error reading from AI stream');
          done = true;
          errorOccurred = true;
        }
      }
      
      // If we finished without getting any content and no error occurred, show a message
      if (!errorOccurred && !summary) {
        setError('Received empty response from AI. Please try again.');
      }
    } catch (err) {
      console.error('Error getting summary:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate summary. Please try again.';
      
      // Check if this is an API key error
      if (errorMessage.toLowerCase().includes('api key') || 
          errorMessage.toLowerCase().includes('missing api') || 
          errorMessage.includes('403')) {
        setIsApiKeyMissing(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      if (readerRef.current) {
        try {
          readerRef.current.releaseLock();
        } catch (e) {
          // Ignore release lock errors
        }
        readerRef.current = null;
      }
    }
  };

  const toggleVisibility = () => {
    if (!summary && !isVisible) {
      getSummary();
    } else {
      setIsVisible(!isVisible);
    }
  };
  
  // Clean up the reader if component unmounts during streaming
  useEffect(() => {
    return () => {
      if (readerRef.current) {
        readerRef.current.cancel();
      }
    };
  }, []);

  // Add fallback timeout to check if we're getting content
  useEffect(() => {
    if (isLoading && !summary) {
      // If after 15 seconds we still have no content, show fallback option
      const timeoutId = setTimeout(() => {
        if (isLoading && !summary) {
          console.log('No content received after timeout, offering fallback');
          setError('No summary content received. The API may be experiencing issues.');
          setIsLoading(false);
        }
      }, 15000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, summary]);

  // Add function to use non-streaming fallback
  const useFallbackSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Import the non-streaming summarize function
      const { summarizeEmail } = await import('@/app/lib/llama');
      
      // Get summary using non-streaming method
      const result = await summarizeEmail(emailContent);
      setSummary(result);
      setIsLoading(false);
    } catch (err) {
      console.error('Error with fallback summary:', err);
      setError('Failed to generate summary with fallback method.');
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={toggleVisibility}
        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <ScanText className="h-4 w-4 mr-2" />
        )}
        {isVisible
          ? summary || isLoading 
            ? 'Hide AI Summary'
            : 'Generating Summary...'
          : 'AI Summarize'}
      </button>

      {isVisible && (
        <div className="mt-2">
          {isApiKeyMissing ? (
            <ApiKeyMissing />
          ) : isLoading && !summary ? (
            <div className="p-4 bg-blue-50 rounded-md border border-blue-100 flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
              <span className="ml-2 text-blue-600">Generating summary...</span>
            </div>
          ) : error && !summary ? (
            <div className="p-4 bg-red-50 rounded-md border border-red-100">
              <div className="text-red-500 mb-2">{error}</div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setError(null);
                    getSummary();
                  }}
                  className="text-sm px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                >
                  Retry Streaming
                </button>
                <button 
                  onClick={useFallbackSummary}
                  className="text-sm px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                >
                  Try Non-Streaming
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 rounded-md border border-blue-100 prose prose-sm max-w-none text-gray-700">
              <h3 className="text-md font-medium mb-2 text-blue-700">
                AI Summary {isLoading && <Loader2 className="h-4 w-4 inline-block ml-2 animate-spin" />}
              </h3>
              <div className="whitespace-pre-wrap">
                <ReactMarkdown >
                  {summary}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 