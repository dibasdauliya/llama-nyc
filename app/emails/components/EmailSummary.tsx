'use client';

import { useState, useEffect } from 'react';
import { ScanText, Loader2 } from 'lucide-react';
import { summarizeEmail } from '@/app/lib/llama';
import ReactMarkdown from 'react-markdown';

interface EmailSummaryProps {
  emailContent: string;
}

export default function EmailSummary({ emailContent }: EmailSummaryProps) {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const getSummary = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setIsVisible(true);
      
      const result = await summarizeEmail(emailContent);
      setSummary(result);
    } catch (err) {
      console.error('Error getting summary:', err);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = () => {
    if (!summary && !isVisible) {
      getSummary();
    } else {
      setIsVisible(!isVisible);
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
          ? summary
            ? 'Hide AI Summary'
            : 'Generating Summary...'
          : 'AI Summarize'}
      </button>

      {isVisible && (
        <div className="mt-2 p-4 bg-blue-50 rounded-md border border-blue-100">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
              <span className="ml-2 text-blue-600">Generating summary...</span>
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="prose prose-sm max-w-none text-gray-700">
              <h3 className="text-md font-medium mb-2 text-blue-700">AI Summary</h3>
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