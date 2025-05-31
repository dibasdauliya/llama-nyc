import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the callback for debugging (in production, you'd want to store this properly)
    console.log('Tavus callback received:', {
      timestamp: new Date().toISOString(),
      data: body
    });

    // Handle different types of callbacks
    switch (body.event_type) {
      case 'conversation_started':
        console.log(`Conversation ${body.conversation_id} started`);
        break;
      
      case 'conversation_ended':
        console.log(`Conversation ${body.conversation_id} ended`);
        break;
      
      case 'participant_joined':
        console.log(`Participant joined conversation ${body.conversation_id}`);
        break;
      
      case 'participant_left':
        console.log(`Participant left conversation ${body.conversation_id}`);
        break;
      
      case 'error':
        console.error(`Error in conversation ${body.conversation_id}:`, body.error);
        break;
      
      default:
        console.log(`Unknown event type: ${body.event_type}`);
    }

    // In a real application, you might want to:
    // 1. Store conversation events in a database
    // 2. Send real-time updates to the client via WebSocket
    // 3. Trigger post-interview analysis or feedback generation
    // 4. Update user progress or interview history

    return NextResponse.json({ success: true });
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