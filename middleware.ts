// import { clerkMiddleware } from '@clerk/nextjs/server'

// export default clerkMiddleware()

// export const config = {
//   matcher: [
//     '/((?!_next|.*\\..*).*)',
//   ],
// }


/// middleware.ts (root of your project)
// Role-based access control using Clerk v7 + your UserRole enum.
//
// Roles (from your schema):
//   FREE_USER        → blogs, recipes, services, chatbot (limited)
//   CHAT_USER        → + WhatsApp/chat with nutritionist
//   APPOINTMENT_USER → + appointment booking
//   ADMIN            → everything

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// ── Route matchers ────────────────────────────────────────────────────────────

// Anyone can access these (signed out or in)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/api/webhooks(.*)',   // Clerk + Razorpay webhooks must be public
]);

// Requires any Clerk session (FREE_USER and above)
const isSignedInRoute = createRouteMatcher([
  '/blogs(.*)',
  '/recipes(.*)',
  '/services(.*)',
  '/chatbot(.*)',
  '/about-user(.*)',
  '/profile(.*)',
]);

// Requires CHAT_USER or ADMIN
const isChatRoute = createRouteMatcher([
  '/chat(.*)',
  '/whatsapp(.*)',
]);

// Requires APPOINTMENT_USER or ADMIN
const isAppointmentRoute = createRouteMatcher([
  '/appointments(.*)',
  '/booking(.*)',
]);

// Requires ADMIN
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

// ── Middleware ────────────────────────────────────────────────────────────────

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname

  if (req.method === "OPTIONS") {
    return NextResponse.next()
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.next()
  }


  const { userId, sessionClaims } = await auth();

  // 1. Public — always allow
  if (isPublicRoute(req)) return NextResponse.next();

  const isApiRoute = req.nextUrl.pathname.startsWith("/api")

if (isApiRoute) {
  return NextResponse.next()
}

  // 2. Any non-public route requires sign-in
  if (!userId) {
    // Redirect to home; your root layout reads ?authRequired=1 and opens the modal
    const url = new URL('/', req.url);
    url.searchParams.set('authRequired', '1');
    return NextResponse.redirect(url);
  }

  // 3. Read role from Clerk session (written by webhook via publicMetadata)
  // Falls back to FREE_USER if metadata hasn't synced yet.
  const role =
    (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role ?? 'FREE_USER';

  // 4. Admin-only
  if (isAdminRoute(req) && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 5. Chat (paid)
  if (isChatRoute(req) && role !== 'CHAT_USER' && role !== 'ADMIN') {
    const url = new URL('/', req.url);
    url.searchParams.set('paymentRequired', 'chat');
    return NextResponse.redirect(url);
  }

  // 6. Appointments (paid)
  if (isAppointmentRoute(req) && role !== 'APPOINTMENT_USER' && role !== 'ADMIN') {
    const url = new URL('/', req.url);
    url.searchParams.set('paymentRequired', 'appointment');
    return NextResponse.redirect(url);
  }

  // 7. Free signed-in routes — allow
  if (isSignedInRoute(req)) return NextResponse.next();

  // 8. Default — allow (add more matchers above as your app grows)
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)',
  ],
};