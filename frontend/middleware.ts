import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      // Admin routes require isAdmin flag
      if (req.nextUrl.pathname.startsWith("/admin")) {
        return token?.isAdmin === true;
      }
      // All other protected routes just need authentication
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    "/invoice/:path*",
    "/admin/:path*",
  ],
};
