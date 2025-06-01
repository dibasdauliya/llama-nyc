import NextAuth, { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "../../../../lib/db"
import { google } from "googleapis"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send',
          prompt: "consent",
          access_type: "offline",
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email public_repo repo',
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('JWT Callback called with:', {
        hasUser: !!user,
        hasAccount: !!account,
        provider: account?.provider,
        tokenEmail: token.email,
        tokenId: token.id,
        userObject: user ? { id: user.id, email: user.email } : null
      });

      // If this is a sign-in, save the access and refresh tokens
      if (account) {
        console.log('Saving tokens from account:', {
          provider: account.provider,
          hasAccessToken: !!account.access_token,
          accessTokenLength: account.access_token?.length,
          hasRefreshToken: !!account.refresh_token,
          expiresAt: account.expires_at
        });
        
        // Store tokens based on provider
        if (account.provider === 'google') {
          token.googleAccessToken = account.access_token;
          token.googleRefreshToken = account.refresh_token;
          token.googleAccessTokenExpires = account.expires_at! * 1000;
        } else if (account.provider === 'github') {
          token.githubAccessToken = account.access_token;
          token.githubRefreshToken = account.refresh_token;
          token.githubAccessTokenExpires = account.expires_at! * 1000;
        }
        
        // Keep backward compatibility
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at! * 1000;
      }

      // Handle Google token refresh
      const currentTime = Date.now();
      const googleExpires = token.googleAccessTokenExpires as number | undefined;
      if (googleExpires && currentTime > googleExpires && token.googleRefreshToken) {
        console.log('Google access token expired, attempting to refresh...');
        try {
          // Create a new OAuth2 client
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID!,
            process.env.GOOGLE_CLIENT_SECRET!,
            process.env.GOOGLE_REDIRECT_URI
          );
          
          // Set the refresh token
          oauth2Client.setCredentials({
            refresh_token: token.googleRefreshToken as string
          });
          
          // Get a new access token
          const response = await oauth2Client.refreshAccessToken();
          console.log('Google token refreshed successfully');
          
          // Update the token
          token.googleAccessToken = response.credentials.access_token as string;
          const expiryDate = response.credentials.expiry_date as number;
          token.googleAccessTokenExpires = Date.now() + (expiryDate - Date.now());
          
          // Update backward compatibility token
          token.accessToken = response.credentials.access_token as string;
          token.accessTokenExpires = token.googleAccessTokenExpires as number;
        } catch (error) {
          console.error('Error refreshing Google access token:', error);
          // Token refresh failed, clear the tokens to force a new sign-in
          token.googleAccessToken = undefined;
          token.googleRefreshToken = undefined;
          token.googleAccessTokenExpires = undefined;
        }
      }

      // If this is a new sign-in, user object will contain the user data
      if (user) {
        console.log('Setting token.id from user object:', user.id);
        token.id = user.id;
      } 
      // If we don't have the user ID in token but have email, look it up
      else if (!token.id && token.email) {
        console.log('Token missing ID, looking up user by email:', token.email);
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email }
          });
          if (dbUser) {
            console.log('Found user in DB, setting token.id:', dbUser.id);
            token.id = dbUser.id;
          } else {
            console.log('No user found in DB for email:', token.email);
          }
        } catch (error) {
          console.error('Error fetching user ID for token:', error);
        }
      }

      console.log('JWT callback returning token with ID:', token.id);
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback called with:', {
        sessionUserEmail: session.user?.email,
        tokenId: token.id,
        tokenEmail: token.email,
        hasGithubToken: !!token.githubAccessToken,
        hasGoogleToken: !!token.googleAccessToken
      });

      if (session.user && token.id) {
        session.user.id = token.id as string;
        console.log('Added ID to session:', session.user.id);
      } else {
        console.log('Could not add ID to session - missing token.id or session.user');
      }

      // Add access tokens to session so they can be used by client
      session.accessToken = token.accessToken as string;
      session.githubAccessToken = token.githubAccessToken as string;
      session.googleAccessToken = token.googleAccessToken as string;
      
      console.log('Session callback returning:', {
        hasId: !!session.user?.id,
        email: session.user?.email,
        hasAccessToken: !!session.accessToken,
        hasGithubToken: !!session.githubAccessToken,
        hasGoogleToken: !!session.googleAccessToken
      });
      return session;
    },
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      
      try {
        // Check if user exists in database
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        console.log('SignIn callback - user exists:', !!existingUser);
        
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return true; // Still allow sign in even if check fails
      }
    }
  },
  events: {
    async createUser({ user }) {
      // This event fires after a new user is created
      console.log('CreateUser event fired for:', user.email);
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST } 