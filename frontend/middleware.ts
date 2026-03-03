export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/invoice/new/:path*",
    "/admin/:path*",
  ],
};
