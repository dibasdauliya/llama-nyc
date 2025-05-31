import { NextRequest, NextResponse } from 'next/server';
import { fetchEmails } from '@/app/lib/gmail';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = (searchParams.get('type') || 'inbox') as 'inbox' | 'sent';
    
    // Fetch real emails from Gmail API
    const emails = await fetchEmails(type, 20);
    return NextResponse.json(emails);
  } catch (error) {
    console.error('Error in Gmail API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails from Gmail API. Please ensure you are signed in and have granted the necessary permissions.' }, 
      { status: 401 }
    );
  }
} 