export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/invoice/:path*",
    "/admin/:path*",
  ],
};
