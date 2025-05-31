import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Tavus callback received:', body);

    const { event_type, conversation_id, data } = body;

    switch (event_type) {
      case 'conversation_started':
        console.log('Conversation started:', conversation_id);
        break;

      case 'conversation_ended':
        console.log('Conversation ended:', conversation_id);
        // Find and update the interview if needed
        if (conversation_id) {
          try {
            await prisma.interview.updateMany({
              where: {
                conversationId: conversation_id,
                status: 'IN_PROGRESS'
              },
              data: {
                endedAt: new Date(),
                status: 'COMPLETED'
              }
            });
          } catch (error) {
            console.error('Error updating interview on callback:', error);
          }
        }
        break;

      case 'conversation_error':
        console.log('Conversation error:', conversation_id, data);
        // Mark interview as failed if needed
        if (conversation_id) {
          try {
            await prisma.interview.updateMany({
              where: {
                conversationId: conversation_id,
                status: 'IN_PROGRESS'
              },
              data: {
                endedAt: new Date(),
                status: 'FAILED'
              }
            });
          } catch (error) {
            console.error('Error updating interview on error callback:', error);
          }
        }
        break;

      default:
        console.log('Unknown event type:', event_type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Tavus callback:', error);
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification (if needed)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const challenge = searchParams.get('challenge');
  
  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  
  return NextResponse.json({ message: 'Tavus callback endpoint' });
} 