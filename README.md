# Gmail Interface with AI Summarization

A modern Gmail-like interface that connects to your Gmail account and provides AI-powered email summarization.

## Features

- **Gmail Integration**: View your inbox and sent emails directly in the app
- **AI Email Summarization**: Click to generate concise summaries of your emails using Llama AI
- **Modern UI**: Clean, responsive interface inspired by Gmail's design
- **Compose Emails**: Write and send new emails directly from the app
- **Authentication**: Secure OAuth2 authentication with Google

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Google account with Gmail
- A Llama API key (for AI summarization)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd llama-nyc
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env.local` file with the following:
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
LLAMA_API_KEY=your_llama_api_key
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000/emails](http://localhost:3000/emails) in your browser

## Setup Guide

For detailed setup instructions, see:
- [Gmail API Authentication Setup](app/emails/AUTH-SETUP.md)

## How to Use

1. **View Emails**: Navigate between Inbox and Sent emails using the sidebar
2. **Read Emails**: Click on an email to view its full content
3. **AI Summarization**: In the email detail view, click "AI Summarize" to generate a concise summary
4. **Compose Email**: Click the "Compose" button to write a new email
5. **Sign Out**: Click the sign-out icon in the header to log out

## Technologies Used

- Next.js
- React
- TypeScript
- NextAuth.js
- Gmail API
- Llama AI API (via llama-api-client)
- Tailwind CSS

## License

This project is licensed under the MIT License - see the LICENSE file for details.
