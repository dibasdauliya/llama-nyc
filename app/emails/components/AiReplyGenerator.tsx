'use client';

import { useState, useRef } from 'react';
import { Sparkles, Loader2, Send, Clipboard, ThumbsUp, X } from 'lucide-react';
import { generateEmailReply } from '@/app/lib/llama';
import ReactMarkdown from 'react-markdown';

interface AiReplyGeneratorProps {
  originalEmail: string;
  onInsertReply: (reply: string) => void;
}

// Common prompt suggestions
const PROMPT_SUGGESTIONS = [
  { label: "Accept", value: "Accept the proposal and express enthusiasm" },
  { label: "Decline", value: "Politely decline the request" },
  { label: "Need more info", value: "Ask for more information" },
  { label: "Schedule meeting", value: "Schedule a meeting to discuss" },
  { label: "Thank you", value: "Express gratitude for their email" },
  { label: "Follow up", value: "Follow up on previous conversation" },
];

export default function AiReplyGenerator({ originalEmail, onInsertReply }: AiReplyGeneratorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim() || isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Sending reply request with prompt:', prompt);
      const generatedReply = await generateEmailReply(originalEmail, prompt);
      
      // Debug response
      if (generatedReply) {
        console.log('Received reply with type:', typeof generatedReply);
        console.log('Reply begins with:', typeof generatedReply === 'string' 
          ? generatedReply.substring(0, 50) + '...' 
          : 'Not a string');
      } else {
        console.log('Received empty or null reply');
      }
      
      if (!generatedReply || typeof generatedReply !== 'string' || generatedReply.trim() === '') {
        throw new Error('Received empty or invalid response from the AI');
      }
      
      // Clean up the reply if needed
      let cleanedReply = generatedReply;
      
      // Remove any markdown fence blocks if present
      if (cleanedReply.startsWith('```') && cleanedReply.includes('```')) {
        cleanedReply = cleanedReply.replace(/```(?:email|markdown)?\n?/g, '').replace(/```\n?$/g, '');
      }
      
      setReply(cleanedReply);
    } catch (err) {
      console.error('Error generating reply:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate reply. Please try again.');
      setReply('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertReply = () => {
    onInsertReply(reply);
    setIsExpanded(false);
    setReply('');
    setPrompt('');
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const clearReply = () => {
    setReply('');
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {isExpanded ? 'Hide AI Reply' : 'AI Reply'}
      </button>

      {isExpanded && (
        <div className="mt-2 p-4 border border-gray-200 rounded-md bg-white shadow-sm">
          <h3 className="text-sm font-medium mb-2">Generate AI Reply</h3>
          
          {!reply ? (
            <>
              <p className="text-xs text-gray-500 mb-3">
                Enter a brief instruction for the AI to generate your reply
              </p>
              
              <form onSubmit={handlePromptSubmit} className="mb-3">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Politely decline the invitation"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || !prompt.trim()}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </form>
              
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {PROMPT_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion.label}
                      onClick={() => handleSuggestionClick(suggestion.value)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Generated Reply</h4>
                <div className="flex gap-2">
                  <button
                    onClick={clearReply}
                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Clear reply"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCopyToClipboard}
                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <ThumbsUp className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md text-sm markdown">
                <ReactMarkdown>
                  {typeof reply === 'string' ? reply : ''}
                </ReactMarkdown>
              </div>
              
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleInsertReply}
                  className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                >
                  Insert Reply
                </button>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-2 p-2 bg-red-50 text-red-600 text-xs rounded-md">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 