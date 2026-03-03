export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/invoice/new/:path*",
    "/invoice/:id(\\d+)",
    "/admin/:path*",
    "/ai-replicator",
  ],
};
