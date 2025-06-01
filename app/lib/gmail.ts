import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Interface for Email
export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
}

/**
 * Create an authenticated Gmail API client using NextAuth session
 */
export async function createGmailClient() {
  try {
    // Get the session to use the access token
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      throw new Error("No access token available. Please sign in with Google.");
    }

    // Create an OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    // Set credentials directly with the access token
    oauth2Client.setCredentials({
      access_token: session.accessToken
    });
    
    // Return the Gmail API client with the authenticated OAuth2 client
    return google.gmail({ 
      version: 'v1', 
      auth: oauth2Client 
    });
  } catch (error) {
    console.error('Error creating Gmail client:', error);
    throw error;
  }
}

/**
 * Fetch emails from Gmail API
 * @param type - 'inbox' or 'sent'
 * @param maxResults - maximum number of emails to fetch
 */
export async function fetchEmails(type: 'inbox' | 'sent', maxResults = 20): Promise<Email[]> {
  try {
    // Create an authenticated Gmail client
    const gmail = await createGmailClient();
    
    // List messages from Gmail
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: type === 'inbox' ? 'in:inbox' : 'in:sent'
    });
    
    // If no messages, return empty array
    if (!response.data.messages || response.data.messages.length === 0) {
      return [];
    }
    
    // Fetch full message details for each message
    const messages = response.data.messages;
    const emails = await Promise.all(
      messages.map(async (message) => {
        try {
          const msg = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
            format: 'full' // Get full message details including headers
          });
          
          return parseGmailMessage(msg.data);
        } catch (error) {
          console.error(`Error fetching message ${message.id}:`, error);
          // Return a placeholder for failed messages to maintain array length
          return {
            id: message.id!,
            from: 'Error fetching email',
            to: '',
            subject: 'Error fetching email details',
            snippet: 'There was an error fetching this email. Please try again later.',
            body: '',
            date: new Date().toISOString(),
            read: true,
            starred: false,
          };
        }
      })
    );
    
    return emails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}

/**
 * Send an email using Gmail API
 */
export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  try {
    const gmail = await createGmailClient();
    
    // Create the email content
    const emailLines = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body
    ];
    
    const email = emailLines.join('\r\n').trim();
    const encodedEmail = Buffer.from(email).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail
      }
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Parse a Gmail message into our Email format
 */
function parseGmailMessage(message: any): Email {
  // Extract headers
  const headers = message.payload.headers;
  const subject = headers.find((header: any) => header.name === 'Subject')?.value || '(No Subject)';
  const from = headers.find((header: any) => header.name === 'From')?.value || '';
  const to = headers.find((header: any) => header.name === 'To')?.value || '';
  const date = headers.find((header: any) => header.name === 'Date')?.value || new Date().toISOString();
  
  // Check if the email is read
  const read = !message.labelIds?.includes('UNREAD');
  
  // Check if the email is starred
  const starred = message.labelIds?.includes('STARRED') || false;
  
  // Extract the body
  let body = '';
  if (message.payload.body && message.payload.body.data) {
    body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
  } else if (message.payload.parts) {
    // Find the HTML part if available
    const htmlPart = message.payload.parts.find(
      (part: any) => part.mimeType === 'text/html'
    );
    
    // Otherwise use text part
    const textPart = message.payload.parts.find(
      (part: any) => part.mimeType === 'text/plain'
    );
    
    if (htmlPart && htmlPart.body && htmlPart.body.data) {
      body = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
    } else if (textPart && textPart.body && textPart.body.data) {
      const text = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      body = `<pre>${text}</pre>`;
    }
  }
  
  return {
    id: message.id,
    from,
    to,
    subject,
    snippet: message.snippet || '',
    body,
    date,
    read,
    starred,
  };
}