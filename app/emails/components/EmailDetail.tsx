'use client';

import { useState } from 'react';
import { ArrowLeft, Star, StarOff, Reply, Forward, Trash } from 'lucide-react';
import { formatDetailDate } from '../utils/formatDate';
import { Email } from '../hooks/useGmailEmails';
import EmailSummaryStreaming from './EmailSummaryStreaming';
import ComposeEmail from './ComposeEmail';

interface EmailDetailProps {
  email: Email;
  onBack: () => void;
}

export default function EmailDetail({ email, onBack }: EmailDetailProps) {
  const [isReplying, setIsReplying] = useState(false);
  
  if (!email) return null;
  
  // Extract plain text from HTML for summarization
  const getPlainText = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };
  
  const emailContent = `
Subject: ${email.subject}
From: ${email.from}
To: ${email.to}
Date: ${formatDetailDate(email.date)}

${getPlainText(email.body)}
`;

  const handleReply = () => {
    setIsReplying(true);
  };
  
  const handleCloseReply = () => {
    setIsReplying(false);
  };
  
  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="border-b border-gray-200 py-3 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-medium">{email.subject}</h1>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Trash className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100">
            {email.starred ? (
              <Star className="h-5 w-5 text-yellow-400" />
            ) : (
              <StarOff className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start mb-4">
          <div className="bg-gray-200 h-10 w-10 rounded-full flex items-center justify-center mr-3">
            <span className="text-gray-700 font-medium">
              {email.from.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                <h2 className="font-medium">{email.from}</h2>
                <p className="text-sm text-gray-500">
                  To: {email.to}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {formatDetailDate(email.date)}
              </div>
            </div>
          </div>
        </div>
        
        <EmailSummaryStreaming emailContent={emailContent} />
        
        <div className="py-4 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: email.body }} />
        
        <div className="border-t border-gray-200 pt-4 mt-4 flex space-x-2">
          <button 
            onClick={handleReply}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 flex items-center">
            <Forward className="h-4 w-4 mr-2" />
            Forward
          </button>
        </div>
      </div>
      
      {isReplying && (
        <ComposeEmail 
          onClose={handleCloseReply}
          initialTo={email.from}
          replyTo={email.from}
          replySubject={email.subject}
          replyBody={getPlainText(email.body)}
          isReply={true}
        />
      )}
    </div>
  );
} 