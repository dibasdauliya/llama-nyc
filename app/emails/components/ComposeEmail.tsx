'use client';

import { useState, useEffect } from 'react';
import { X, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import AiReplyGenerator from './AiReplyGenerator';

interface ComposeEmailProps {
  onClose: () => void;
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
  replyTo?: string;
  replySubject?: string;
  replyBody?: string;
  isReply?: boolean;
  threadId?: string;
  messageId?: string;
}

export default function ComposeEmail({
  onClose,
  initialTo = '',
  initialSubject = '',
  initialBody = '',
  replyTo = '',
  replySubject = '',
  replyBody = '',
  isReply = false,
  threadId = '',
  messageId = ''
}: ComposeEmailProps) {
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(isReply ? `Re: ${replySubject}` : initialSubject);
  const [body, setBody] = useState(initialBody);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isReply && replyBody) {
      setBody(`\n\n------ Original Message ------\nFrom: ${replyTo}\nSubject: ${replySubject}\n\n${replyBody}`);
    }
  }, [isReply, replyTo, replySubject, replyBody]);

  const handleSend = async () => {
    if (isSending) return;
    
    if (!to.trim() || !subject.trim() || !body.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setIsSending(true);
      setError(null);
      
      // Convert plain text to HTML for better email formatting
      const htmlBody = body.replace(/\n/g, '<br>');
      
      // Send the email through our API
      const response = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          body: htmlBody,
          threadId: isReply ? threadId : undefined,
          messageId: isReply ? messageId : undefined
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }
      
      // Show success message and close after delay
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Error sending email:', err);
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const handleInsertReply = (reply: string) => {
    setBody(reply + body);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-4 w-80 bg-white border border-gray-200 rounded-t-lg shadow-lg z-50">
        <div className="flex justify-between items-center p-3 bg-gray-100 border-b cursor-pointer" onClick={() => setIsMinimized(false)}>
          <h3 className="text-sm font-medium truncate">
            {subject || 'New Message'}
          </h3>
          <div className="flex items-center space-x-2">
            <button onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}>
              <Maximize2 className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            </button>
            <button onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}>
              <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-4 w-[600px] bg-white border border-gray-200 rounded-t-lg shadow-lg z-50">
      <div className="flex justify-between items-center p-3 bg-gray-100 border-b">
        <h3 className="text-sm font-medium">
          {isReply ? `Reply to: ${replySubject}` : 'New Message'}
        </h3>
        <div className="flex items-center space-x-2">
          <button onClick={() => setIsMinimized(true)}>
            <Minimize2 className="h-4 w-4 text-gray-500 hover:text-gray-700" />
          </button>
          <button onClick={onClose}>
            <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSending}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSending}
          />
        </div>

        {isReply && replyBody && (
          <AiReplyGenerator 
            originalEmail={replyBody} 
            onInsertReply={handleInsertReply} 
          />
        )}
        
        <div className="mb-4">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSending}
          />
        </div>
        
        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-2 bg-green-50 text-green-600 text-sm rounded-md">
            Email sent successfully!
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
} 