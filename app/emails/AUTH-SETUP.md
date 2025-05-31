# Gmail API Authentication Setup Guide

This guide will help you properly set up OAuth2 authentication for Gmail API integration.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to the "APIs & Services" > "Library" section
4. Search for "Gmail API" and enable it

## Step 2: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace account)
3. Fill in the required information:
   - App name: Your application name
   - User support email: Your email
   - Developer contact information: Your email
4. Click "Save and Continue"
5. Add the following scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
6. Click "Save and Continue"
7. Add any test users (including your own email)
8. Click "Save and Continue" to complete the setup

## Step 3: Create OAuth Credentials

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

## Step 4: Configure Environment Variables

Create or update your `.env.local` file with the following variables:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

## Step 5: Test Authentication

1. Run your application: `npm run dev`
2. Visit `http://localhost:3000/emails`
3. Sign in with your Google account that was added as a test user in Step 2
4. When prompted, grant permissions to access Gmail data
5. You should now see your emails displayed in the interface

## Common Issues and Solutions

### 1. "Invalid Credentials" or "Access Token Expired"

This happens when:
- The access token has expired
- The OAuth consent wasn't completed correctly

**Solution**: 
- Sign out and sign back in
- Ensure you've granted all required permissions
- Check that your OAuth setup includes the proper scopes

### 2. "No access, refresh token, API key or refresh handler callback is set"

This happens when:
- NextAuth isn't storing the access token correctly
- The Google provider isn't configured properly

**Solution**:
- Ensure you've added the proper scopes to the Google provider in `[...nextauth]/route.ts`
- Make sure the token callbacks are saving and passing the access token

### 3. "Missing Required Parameters" or OAuth Errors

**Solution**:
- Double-check that your environment variables are set correctly
- Verify that your redirect URI exactly matches what's configured in Google Cloud Console
- Make sure you're using the correct Client ID and Client Secret

## Reviewing Permissions

If you need to review or revoke the permissions you've granted:
1. Go to [Google Account Permissions](https://myaccount.google.com/permissions)
2. Find your application and click on it
3. Review the permissions or click "Remove Access" to revoke them 