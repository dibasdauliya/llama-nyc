# Gmail API Integration Setup Guide

This guide will help you set up Gmail API integration for the email client.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to the "APIs & Services" > "Library" section
4. Search for "Gmail API" and enable it

## Step 2: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" and select "OAuth client ID"
3. Select "Web application" as the application type
4. Add a name for your OAuth client (e.g., "Gmail Integration")
5. Add authorized JavaScript origins:
   - For development: `http://localhost:3000`
   - For production: Your production URL
6. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://your-domain.com/api/auth/callback/google`
7. Click "Create"
8. Note down the Client ID and Client Secret

## Step 3: Configure Environment Variables

Create or update your `.env.local` file with the following variables:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

For production, update these values accordingly.

## Step 4: Test the Integration

1. Run your application: `npm run dev`
2. Visit `http://localhost:3000/emails`
3. Sign in with your Google account
4. Grant the necessary permissions to access your Gmail data
5. You should now see your emails displayed in the interface

## Troubleshooting

If you encounter any issues:

1. **No emails displayed**: Check the browser console for errors. Make sure you've granted the necessary permissions during sign-in.

2. **Authentication errors**: Verify that your OAuth credentials are correctly set in the environment variables and that the redirect URI matches exactly what's configured in the Google Cloud Console.

3. **API quota limits**: The Gmail API has usage limits. If you're making many requests, you might hit these limits. Implement caching to reduce API calls.

4. **Refresh token errors**: If you're getting authentication errors after some time, your refresh token might have expired. Sign out and sign in again to get a new refresh token.

## API Scopes

The application uses the following OAuth scopes:

- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`
- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/gmail.send`

If you need to modify the scopes, update them in the `app/api/auth/[...nextauth]/route.ts` file. 