# Interview Data Saving System

This guide explains how the interview saving system works in your AI Video Interview application.

## 🎯 Overview

When an interview starts and ends, the system automatically saves all relevant data to your PostgreSQL database on AWS RDS. This includes:

- Interview metadata (type, duration, status)
- Questions asked and answers given
- Conversation data and feedback
- User tracking and subscription management

## 📋 Database Schema

### Interview Table
- **Basic Info**: type, status, startedAt, endedAt, duration
- **Context**: jobTitle, company, industry, jobDescription, visaType
- **Tavus Integration**: conversationId, personaId
- **Relationships**: Links to User, Questions, and Feedback

### InterviewQuestion Table
- **Content**: question, answer, feedback
- **Timing**: askedAt, answeredAt, responseTime
- **Scoring**: score (for future AI analysis)

### InterviewFeedback Table
- **Scores**: overall, communication, technical, confidence
- **Analysis**: strengths, improvements, detailed feedback
- **AI Data**: aiAnalysis (JSON field for AI-generated insights)

## 🔄 Interview Lifecycle

### 1. Interview Start
```typescript
// When user clicks "Start Interview"
const interview = await startInterviewSession({
  type: 'VISA_F1' | 'JOB_HR' | 'JOB_TECHNICAL' | etc.,
  jobTitle: 'Software Engineer',
  company: 'Tech Corp',
  industry: 'technology',
  visaType: 'F-1',
  // ... other details
}, conversationId, personaId);
```

**What happens:**
1. Creates new Interview record with status "IN_PROGRESS"
2. Sets startedAt timestamp
3. Increments user's subscription usage
4. Returns interview ID for tracking

### 2. During Interview
```typescript
// Questions are tracked automatically
addQuestion({
  question: "Tell me about yourself",
  askedAt: new Date(),
});

// Answers can be updated
updateQuestion(index, {
  answer: "I am a software developer...",
  answeredAt: new Date(),
  responseTime: 15000, // milliseconds
});
```

### 3. Interview End
```typescript
// When interview ends
const completedInterview = await endInterviewSession('COMPLETED', {
  overallScore: 85,
  communicationScore: 90,
  technicalScore: 80,
  confidenceScore: 88,
  strengths: ['Clear communication', 'Technical knowledge'],
  improvements: ['Provide more examples', 'Speak slower'],
  detailedFeedback: 'Great interview overall...',
  aiAnalysis: { /* AI-generated insights */ }
});
```

**What happens:**
1. Sets endedAt timestamp and calculates duration
2. Updates status to "COMPLETED"
3. Saves all questions and answers
4. Creates feedback record with analysis
5. Returns complete interview data

## 🛠 API Endpoints

### POST /api/interviews
Creates a new interview session
```json
{
  "type": "VISA_F1",
  "jobTitle": "Software Engineer",
  "company": "Tech Corp",
  "conversationId": "tavus-conversation-id"
}
```

### PUT /api/interviews
Ends and saves interview data
```json
{
  "interviewId": "interview-id",
  "status": "COMPLETED",
  "questions": [...],
  "conversationData": {...}
}
```

### GET /api/interviews
Retrieves user's interview history

## 🎣 Hooks and Components

### useInterviewSession Hook
Manages interview lifecycle:
```typescript
const {
  interviewSession,
  startInterview,
  endInterview,
  addQuestion,
  updateQuestion,
  getSessionDuration
} = useInterviewSession();
```

### TavusVideoInterview Component
Enhanced with automatic saving:
```typescript
<TavusVideoInterview
  apiKey={apiKey}
  interviewType="job"
  jobDetails={jobDetails}
  onInterviewStart={(data) => console.log('Saved:', data)}
  onInterviewEnd={(data) => console.log('Completed:', data)}
/>
```

## 📊 Data Flow Example

1. **User starts interview** → Interview record created in DB
2. **AI asks question** → Question saved to InterviewQuestion table
3. **User answers** → Answer and timing data updated
4. **Interview ends** → Status updated, feedback created
5. **Dashboard loads** → All interview history displayed

## 🔧 Configuration

### Environment Variables Required
```env
DATABASE_URL=postgresql://...  # Your AWS RDS connection
NEXTAUTH_SECRET=...           # For session management
GOOGLE_CLIENT_ID=...          # For authentication
GOOGLE_CLIENT_SECRET=...      # For authentication
```

### Subscription Limits
- Free tier users: 3 interviews maximum
- Usage tracked automatically
- Limits enforced before interview creation

## 🎨 Interview Types Supported

### VISA Interviews
- `VISA_F1` - Student Visa
- `VISA_B2` - Tourist Visa  
- `VISA_H1B` - Work Visa

### Job Interviews
- `JOB_HR` - HR/Behavioral Interview
- `JOB_TECHNICAL` - Technical Interview

## 📈 Future Enhancements

1. **Real-time Analysis**: AI feedback during interview
2. **Video Recording**: Save video snippets for review
3. **Advanced Scoring**: ML-based performance scoring
4. **Interview Coaching**: Personalized improvement suggestions
5. **Interview Replay**: Review past interviews with AI insights

## 🔍 Debugging

### Check Interview Status
```sql
SELECT * FROM "Interview" WHERE "userId" = 'user-id' ORDER BY "createdAt" DESC;
```

### View Questions
```sql
SELECT * FROM "InterviewQuestion" WHERE "interviewId" = 'interview-id';
```

### Check Feedback
```sql
SELECT * FROM "InterviewFeedback" WHERE "interviewId" = 'interview-id';
```

## 🚨 Error Handling

The system handles various error scenarios:
- Network failures during save
- Tavus API issues
- Database connection problems
- User authentication issues

All errors are logged and gracefully handled to ensure the best user experience.

---

Your interview data saving system is now fully operational! 🎉 