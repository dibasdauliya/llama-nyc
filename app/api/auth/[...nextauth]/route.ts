import NextAuth, { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
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
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('JWT Callback called with:', {
        hasUser: !!user,
        hasAccount: !!account,
        tokenEmail: token.email,
        tokenId: token.id,
        userObject: user ? { id: user.id, email: user.email } : null
      });

      // If this is a sign-in, save the access and refresh tokens
      if (account) {
        console.log('Saving tokens from account:', {
          hasAccessToken: !!account.access_token,
          accessTokenLength: account.access_token?.length,
          hasRefreshToken: !!account.refresh_token,
          expiresAt: account.expires_at
        });
        
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at! * 1000; // Convert to ms
      }

      // If we have a token but it's expired, try to refresh it
      const currentTime = Date.now();
      if (token.accessTokenExpires && currentTime > token.accessTokenExpires && token.refreshToken) {
        console.log('Access token expired, attempting to refresh...');
        try {
          // Create a new OAuth2 client
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID!,
            process.env.GOOGLE_CLIENT_SECRET!,
            process.env.GOOGLE_REDIRECT_URI
          );
          
          // Set the refresh token
          oauth2Client.setCredentials({
            refresh_token: token.refreshToken
          });
          
          // Get a new access token
          const response = await oauth2Client.refreshAccessToken();
          console.log('Token refreshed successfully');
          
          // Update the token
          // @ts-ignore: The type definition doesn't match the actual response
          token.accessToken = response.credentials.access_token;
          token.accessTokenExpires = Date.now() + (response.credentials.expiry_date! - Date.now());
        } catch (error) {
          console.error('Error refreshing access token:', error);
          // Token refresh failed, clear the tokens to force a new sign-in
          token.accessToken = undefined;
          token.refreshToken = undefined;
          token.accessTokenExpires = undefined;
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
        tokenEmail: token.email
      });

      if (session.user && token.id) {
        session.user.id = token.id as string;
        console.log('Added ID to session:', session.user.id);
      } else {
        console.log('Could not add ID to session - missing token.id or session.user');
      }

      // Add access token to session so it can be used by client
      session.accessToken = token.accessToken;
      
      console.log('Session callback returning:', {
        hasId: !!session.user?.id,
        email: session.user?.email,
        hasAccessToken: !!session.accessToken
      });
      return session;
    },
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      
      try {
        // Check if user exists and has a subscription
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { subscriptions: true }
        });

        // If user exists but has no subscription, create one
        if (existingUser && existingUser.subscriptions.length === 0) {
          await prisma.subscription.create({
            data: {
              userId: existingUser.id,
              type: 'FREE',
              status: 'ACTIVE',
              interviewsLimit: 3,
            }
          });
        }
        // Note: If user doesn't exist, PrismaAdapter will create them
        // We'll handle subscription creation in the events callback
        
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return true; // Still allow sign in even if subscription fails
      }
    }
  },
  events: {
    async createUser({ user }) {
      // This event fires after a new user is created
      try {
        await prisma.subscription.create({
          data: {
            userId: user.id,
            type: 'FREE',
            status: 'ACTIVE',
            interviewsLimit: 3,
          }
        });
      } catch (error) {
        console.error('Error creating subscription for new user:', error);
      }
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