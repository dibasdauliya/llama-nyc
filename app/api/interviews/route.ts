import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { prisma } from '@/lib/prisma';

// Get user's interviews
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
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
    const session = await getServerSession();
    
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