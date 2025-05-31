'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ComposeEmailProps {
  onClose: () => void;
}

export default function ComposeEmail({ onClose }: ComposeEmailProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSending(true);
      setError(null);
      
      const response = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, body }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }
      
      setSuccess(true);
      
      // Close the compose window after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
      console.error('Error sending email:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-0 right-10 w-[500px] bg-white shadow-xl rounded-t-lg flex flex-col">
      <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center rounded-t-lg">
        <h2 className="font-medium">New Message</h2>
        <button 
          onClick={onClose}
          className="text-gray-300 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4">
        <div className="mb-3">
          <input
            type="email"
            placeholder="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-2 py-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        
        <div className="mb-3">
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-2 py-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        
        <div className="flex-1 mb-4">
          <textarea
            placeholder="Compose email..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full h-64 px-2 py-1 focus:outline-none resize-none"
            required
          />
        </div>
        
        {error && (
          <div className="mb-3 text-red-500 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-3 text-green-500 text-sm">
            Email sent successfully!
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <button
            type="submit"
            disabled={isSending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
} 