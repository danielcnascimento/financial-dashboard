import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    /**
     * This is a middleware, it validates when user goes out of the app, when checks if he is logged in.
     * the authored is called BEFORE the response, the `auth` has the user Session, the `request` has the INcoming request.
     */
    authorized({ auth, request: { nextUrl } }) {
      // gets the user's session and check if he is logged.
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        return isLoggedIn;
        // if he is not on dashboard, but logged, move him to the dashboard.
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with empty array, for now.
} satisfies NextAuthConfig;
