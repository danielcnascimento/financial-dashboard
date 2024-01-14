import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/** Here you're initializing NextAuth.js with the authConfig object and exporting the auth property. */
export default NextAuth(authConfig).auth;

/**
 * matcher option from Middleware to specify that it should run on specific paths.
 *The advantage of employing Middleware for this task is that the protected routes
 * will not even start rendering until the Middleware verifies the authentication, enhancing both the security and performance of your application.
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
