import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'inbox';
    const maxResults = searchParams.get('maxResults') || '20';
    
    // Determine which label to fetch based on the type
    const label = type === 'sent' ? 'SENT' : 'INBOX';
    
    // Fetch email list from Gmail API
    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=${label}&maxResults=${maxResults}`;
    const listResponse = await fetch(listUrl, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    });
    
    if (!listResponse.ok) {
      const errorData = await listResponse.json();
      console.error('Gmail API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch emails', details: errorData },
        { status: listResponse.status }
      );
    }
    
    const listData = await listResponse.json();
    
    // If no messages, return empty array
    if (!listData.messages || listData.messages.length === 0) {
      return NextResponse.json([]);
    }
    
    // Fetch details for each email
    const emails = await Promise.all(
      listData.messages.map(async (message: { id: string }) => {
        try {
          const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`;
          const detailResponse = await fetch(detailUrl, {
            headers: {
              Authorization: `Bearer ${session.accessToken}`
            }
          });
          
          if (!detailResponse.ok) {
            throw new Error(`Failed to fetch email details: ${detailResponse.statusText}`);
          }
          
          const emailData = await detailResponse.json();
          
          // Parse email headers
          const headers: Record<string, string> = {};
          emailData.payload.headers.forEach((header: { name: string; value: string }) => {
            headers[header.name.toLowerCase()] = header.value;
          });
          
          // Extract email body
          let body = '';
          if (emailData.payload.parts) {
            // Multipart message
            const htmlPart = emailData.payload.parts.find(
              (part: any) => part.mimeType === 'text/html'
            );
            const textPart = emailData.payload.parts.find(
              (part: any) => part.mimeType === 'text/plain'
            );
            
            const part = htmlPart || textPart;
            if (part && part.body && part.body.data) {
              body = decodeBase64(part.body.data);
            }
          } else if (emailData.payload.body && emailData.payload.body.data) {
            // Single part message
            body = decodeBase64(emailData.payload.body.data);
          }
          
          // Extract relevant metadata
          return {
            id: emailData.id,
            threadId: emailData.threadId,
            from: headers.from || 'Unknown',
            to: headers.to || 'Unknown',
            subject: headers.subject || '(No Subject)',
            snippet: emailData.snippet || '',
            body: body || 'No content',
            date: new Date(parseInt(emailData.internalDate)),
            unread: emailData.labelIds?.includes('UNREAD') || false,
            starred: emailData.labelIds?.includes('STARRED') || false
          };
        } catch (error) {
          console.error(`Error fetching details for email ${message.id}:`, error);
          return null;
        }
      })
    );
    
    // Filter out failed fetches and return the result
    const validEmails = emails.filter(email => email !== null);
    return NextResponse.json(validEmails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to decode base64 URL-safe encoded strings
function decodeBase64(data: string): string {
  // Convert from URL-safe base64 to standard base64
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  // Decode the base64 string
  try {
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch (error) {
    console.error('Error decoding base64:', error);
    return '';
  }
} 