import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    githubAccessToken?: string;
    googleAccessToken?: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    githubAccessToken?: string;
    githubRefreshToken?: string;
    githubAccessTokenExpires?: number;
    googleAccessToken?: string;
    googleRefreshToken?: string;
    googleAccessTokenExpires?: number;
  }
} 