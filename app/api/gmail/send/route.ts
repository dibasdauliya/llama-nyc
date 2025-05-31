import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/app/lib/gmail';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body } = await request.json();
    
    // Validate inputs
    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      );
    }
    
    // Send email using Gmail API
    await sendEmail(to, subject, body);
    
    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email through Gmail API' },
      { status: 500 }
    );
  }
} 