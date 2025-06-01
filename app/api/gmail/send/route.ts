import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get request body
    const { to, subject, body, threadId, messageId } = await request.json();
    
    // Validate required fields
    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, or body' },
        { status: 400 }
      );
    }
    
    // Prepare email content
    const message = createEmailMessage({ to, subject, body, threadId, messageId });
    
    // Send the email via Gmail API
    const sendUrl = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
    const response = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: message
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gmail API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to send email', details: errorData },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json({ success: true, messageId: data.id });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

interface EmailParams {
  to: string;
  subject: string;
  body: string;
  threadId?: string;
  messageId?: string;
}

// Helper function to create a base64 encoded email message
function createEmailMessage({ to, subject, body, threadId, messageId }: EmailParams): string {
  // Create email headers
  let emailContent = `To: ${to}\r\n`;
  emailContent += `Subject: ${subject}\r\n`;
  
  // Add thread references if this is a reply
  if (threadId && messageId) {
    emailContent += `In-Reply-To: ${messageId}\r\n`;
    emailContent += `References: ${messageId}\r\n`;
    emailContent += `Thread-ID: ${threadId}\r\n`;
  }
  
  // Add content type header
  emailContent += 'Content-Type: text/html; charset=UTF-8\r\n\r\n';
  
  // Add email body
  emailContent += body;
  
  // Convert to base64 URL-safe format as required by Gmail API
  return Buffer.from(emailContent).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
} 