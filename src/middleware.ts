import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAuthPage = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register";
    const isAuth = !!req.nextauth.token;

    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const isAuthPage = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register";
        if (isAuthPage) return true;
        return !!token;
      }
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/test/:path*",
    "/collections/:path*",
    "/history/:path*",
    "/settings/:path*",
    "/analytics/:path*",
    "/login",
    "/register"
  ],
};
