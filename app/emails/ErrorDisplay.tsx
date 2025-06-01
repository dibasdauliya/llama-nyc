'use client';

import { useSession, signIn } from 'next-auth/react';
import { ArrowRight, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  error: Error | null;
  onRetry: () => void;
}

export default function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const { data: session } = useSession();
  
  const isAuthError = error?.message?.toLowerCase().includes('auth') || 
                       error?.message?.toLowerCase().includes('permission') ||
                       error?.message?.toLowerCase().includes('credential');

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          {isAuthError ? 'Gmail Authentication Error' : 'Error Loading Emails'}
        </h2>
        
        <p className="text-gray-700 mb-6">{error?.message || 'Failed to load your emails. Please try again.'}</p>
        
        {isAuthError ? (
          <div>
            <p className="text-gray-600 mb-4">
              To fix this issue, you need to sign in again and grant permissions to access your Gmail account.
            </p>
            
            {session ? (
              <button
                onClick={() => signIn('google', { 
                  callbackUrl: '/emails',
                  prompt: 'consent'
                })}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center"
              >
                Re-authenticate <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => signIn('google', { callbackUrl: '/emails' })}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center"
              >
                Sign in with Google <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onRetry}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center"
          >
            Try Again <RefreshCw className="ml-2 h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
} 