import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if token exists and is valid
        return !!token;
      }
    },
    pages: {
      signIn: "/auth/signin",
    }
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/interviews/:path*",
    "/api/user/:path*",
  ]
}; 