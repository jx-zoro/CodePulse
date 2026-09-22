import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/test/:path*",
    "/collections/:path*",
    "/history/:path*",
    "/settings/:path*",
    "/analytics/:path*",
  ],
};
