'use client';

import { useState, useEffect, useCallback } from 'react';

// Define Email interface
export interface Email {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  date: Date;
  starred: boolean;
  unread: boolean;
}

interface UseGmailEmailsResult {
  emails: Email[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch Gmail emails from the API
 */
export function useGmailEmails(type: 'inbox' | 'sent'): UseGmailEmailsResult {
  const [emails, setEmails] = useState<Email[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const fetchEmails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch emails from our API endpoint
      const response = await fetch(`/api/gmail/emails?type=${type}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch emails: ${response.status}`);
      }
      
      const data = await response.json();
      setEmails(data);
    } catch (err) {
      console.error('Error fetching emails:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch emails'));
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  // Function to manually refetch emails
  const refetch = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails, refreshKey]);

  return { emails, isLoading, error, refetch };
} 