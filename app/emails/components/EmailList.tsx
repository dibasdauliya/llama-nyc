'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Star, StarOff, Clock, Trash, CornerDownRight } from 'lucide-react';
import { useGmailEmails, Email } from '../hooks/useGmailEmails';
import { formatDate } from '../utils/formatDate';
import ErrorDisplay from '../ErrorDisplay';

interface EmailListProps {
  type: 'inbox' | 'sent';
  onSelectEmail: (email: Email) => void;
}

export default function EmailList({ type, onSelectEmail }: EmailListProps) {
  const { emails, isLoading, error, refetch } = useGmailEmails(type);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  
  const toggleSelect = (id: string) => {
    setSelectedEmails(prev => 
      prev.includes(id) ? prev.filter(emailId => emailId !== id) : [...prev, id]
    );
  };
  
  const toggleSelectAll = () => {
    if (emails && emails.length > 0) {
      if (selectedEmails.length === emails.length) {
        setSelectedEmails([]);
      } else {
        setSelectedEmails(emails.map(email => email.id));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading emails...</div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="border-b border-gray-200 py-2 px-4 flex items-center bg-white">
        <div className="flex items-center">
          <input 
            type="checkbox" 
            className="h-4 w-4 text-blue-600 rounded mr-2"
            checked={Boolean(emails && emails.length > 0 && selectedEmails.length === emails.length)}
            onChange={toggleSelectAll}
          />
          <div className="flex space-x-4 ml-2">
            <button className="text-gray-500 hover:text-gray-700">
              <Trash className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {emails && emails.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="bg-white divide-y divide-gray-100">
              {emails.map((email) => (
                <tr 
                  key={email.id} 
                  className={`hover:bg-gray-50 cursor-pointer ${email.unread ? 'font-semibold' : ''}`}
                  onClick={() => onSelectEmail(email)}
                >
                  <td className="py-3 pl-4 pr-2 w-10">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 text-blue-600 rounded"
                      checked={selectedEmails.includes(email.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelect(email.id);
                      }}
                    />
                  </td>
                  <td className="py-3 px-2 w-10">
                    {email.starred ? 
                      <Star className="h-5 w-5 text-yellow-400" /> : 
                      <StarOff className="h-5 w-5 text-gray-300" />
                    }
                  </td>
                  <td className="py-3 px-2 w-48 truncate">
                    {type === 'inbox' ? email.from : email.to}
                  </td>
                  <td className="py-3 pr-4 pl-2 flex-1">
                    <div className="flex">
                      <span className="font-medium mr-2">{email.subject}</span>
                      <span className="text-gray-500 truncate">- {email.snippet}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 w-32 text-right text-gray-500 text-sm">
                    {formatDate(email.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-500">No emails found</div>
          </div>
        )}
      </div>
    </div>
  );
} 