import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Get user's interviews
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('session', session);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const interviews = await prisma.interview.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        feedback: true,
        _count: {
          select: { questions: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(interviews);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}

// Create a new interview session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      type,
      jobTitle,
      company,
      industry,
      jobDescription,
      visaType,
      resumeUrl,
      conversationId,
      personaId
    } = body;

    // Check user's subscription limits
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE'
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 403 }
      );
    }

    if (subscription.interviewsUsed >= subscription.interviewsLimit) {
      return NextResponse.json(
        { error: 'Interview limit reached. Please upgrade your subscription.' },
        { status: 403 }
      );
    }

    // Create the interview
    const interview = await prisma.interview.create({
      data: {
        userId: session.user.id,
        type,
        status: 'IN_PROGRESS',
        jobTitle,
        company,
        industry,
        jobDescription,
        visaType,
        resumeUrl,
        conversationId,
        personaId,
        startedAt: new Date()
      }
    });

    // Increment interviews used
    await prisma.subscription.update({
      where: {
        id: subscription.id
      },
      data: {
        interviewsUsed: subscription.interviewsUsed + 1
      }
    });

    return NextResponse.json(interview);
  } catch (error) {
    console.error('Error creating interview:', error);
    return NextResponse.json(
      { error: 'Failed to create interview' },
      { status: 500 }
    );
  }
}

// Update interview (end interview and save data)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      interviewId,
      conversationId,
      status = 'COMPLETED',
      questions = [],
      conversationData = null
    } = body;

    // Find the interview
    const existingInterview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        userId: session.user.id
      }
    });

    if (!existingInterview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Calculate duration if startedAt exists
    const endedAt = new Date();
    const duration = existingInterview.startedAt 
      ? Math.floor((endedAt.getTime() - existingInterview.startedAt.getTime()) / 1000) 
      : null;

    // Update the interview
    const updatedInterview = await prisma.interview.update({
      where: {
        id: interviewId
      },
      data: {
        status,
        endedAt,
        duration
      }
    });

    // Save questions if provided
    if (questions.length > 0) {
      const questionData = questions.map((q: any) => ({
        interviewId: interviewId,
        question: q.question || '',
        answer: q.answer || null,
        askedAt: q.askedAt ? new Date(q.askedAt) : new Date(),
        answeredAt: q.answeredAt ? new Date(q.answeredAt) : null,
        responseTime: q.responseTime || null,
        score: q.score || null,
        feedback: q.feedback || null
      }));

      await prisma.interviewQuestion.createMany({
        data: questionData
      });
    }

    // If conversation data is provided, you can process it for feedback
    if (conversationData) {
      // This is where you'd analyze the conversation and generate feedback
      // For now, we'll create a placeholder feedback
      await prisma.interviewFeedback.create({
        data: {
          interviewId: interviewId,
          overallScore: conversationData.overallScore || null,
          communicationScore: conversationData.communicationScore || null,
          technicalScore: conversationData.technicalScore || null,
          confidenceScore: conversationData.confidenceScore || null,
          strengths: conversationData.strengths || [],
          improvements: conversationData.improvements || [],
          detailedFeedback: conversationData.detailedFeedback || null,
          aiAnalysis: conversationData.aiAnalysis || null
        }
      });
    }

    // Fetch the complete updated interview with related data
    const finalInterview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        feedback: true,
        questions: true,
        _count: {
          select: { questions: true }
        }
      }
    });

    return NextResponse.json(finalInterview);
  } catch (error) {
    console.error('Error updating interview:', error);
    return NextResponse.json(
      { error: 'Failed to update interview' },
      { status: 500 }
    );
  }
} 