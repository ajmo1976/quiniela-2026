export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/matches/:path*",
    "/groups/:path*",
    "/leagues/:path*",
    "/leaderboard/:path*",
    "/admin/:path*",
    "/audit/:path*",
  ],
};
