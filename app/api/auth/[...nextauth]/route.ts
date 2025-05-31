import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
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
})

export { handler as GET, handler as POST } 