# Gmail Integration

This directory contains a Gmail-like interface that can be connected to the real Gmail API.

## Setup for Real Gmail API Integration

To connect to the real Gmail API, follow these steps:

1. **Create a Google Cloud Project**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Gmail API for your project

2. **Create OAuth Credentials**:
   - In your Google Cloud project, go to "APIs & Services" > "Credentials"
   - Create an OAuth 2.0 Client ID (Web Application type)
   - Add authorized redirect URIs (e.g., `http://localhost:3000/api/auth/callback/google`)

3. **Configure Environment Variables**:
   Create or update your `.env.local` file with the following variables:
   ```
   GMAIL_CLIENT_ID=your_client_id
   GMAIL_CLIENT_SECRET=your_client_secret
   GMAIL_REDIRECT_URI=your_redirect_uri
   GMAIL_REFRESH_TOKEN=your_refresh_token
   ```

4. **Obtain a Refresh Token**:
   - To get a refresh token, you'll need to implement the OAuth flow
   - You can use the NextAuth.js Google provider to handle this
   - Store the refresh token securely in your environment variables

## Current Implementation

Currently, the application uses mock data to simulate Gmail functionality. To switch to the real Gmail API:

1. Update the `useGmailEmails` hook in `hooks/useGmailEmails.ts` to fetch from the API endpoint instead of using mock data
2. Uncomment the Gmail API code in `api/gmail/route.ts` and replace the mock data with actual API calls

## Features

- View inbox and sent emails
- Email detail view
- Responsive Gmail-like UI
- Starred and unread email indicators

## Limitations

The current implementation has some limitations:

- No authentication flow (would need to be implemented for production)
- Limited to inbox and sent emails (could be extended to other labels)
- No compose functionality (UI is in place but backend logic needs to be implemented)
- No attachments support 