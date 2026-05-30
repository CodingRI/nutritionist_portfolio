# NourishWell — Nutritionist Platform

> A full-stack, production-ready nutritionist platform built with **Next.js 14**, **Clerk**, **Prisma + PostgreSQL**, and **Razorpay**. Patients can browse content, book consultations, and chat with their nutritionist — all behind a clean, role-gated subscription system.

---

## What Is This?

NourishWell is a professional nutritionist portfolio and patient management platform. Think of it as the complete digital practice for a nutritionist — patients land on a beautiful marketing site, sign up, fill in their health profile, and then upgrade their access (via payment) to unlock live chat or appointment booking. The nutritionist (admin) runs everything from a separate admin dashboard.

The interesting part isn't just the UI — it's the role-based access architecture that ties Clerk auth, Prisma, and Razorpay webhooks together into a seamless permission system. Roles live in two places at once (your DB *and* Clerk session metadata), so route protection is both fast at the edge and authoritative on the server.

---

## Tech Stack

| Layer | Tool | Why |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Full-stack with API routes and RSC |
| **Auth** | Clerk | Social login, session management, `publicMetadata` for roles |
| **Database** | PostgreSQL + Prisma ORM | Type-safe DB queries, migrations |
| **Payments** | Razorpay | Indian payment gateway for subscriptions |
| **Styling** | Vanilla CSS + Tailwind tokens | Custom design system |
| **UI Components** | shadcn/ui | Accessible, composable primitives |
| **Animations** | Framer Motion | Page transitions and micro-interactions |
| **Webhooks** | Svix | Clerk webhook signature verification |
| **Deployment** | Vercel (fe) + separate admin dashboard | Split frontend / admin surface |

---

## The Role System — Heart of the App

Every user in the system carries one of four roles, defined as a Prisma enum and always kept in sync with Clerk's `publicMetadata`:

```
FREE_USER  →  CHAT_USER  →  APPOINTMENT_USER  →  ADMIN
```

| Role | What They Can Access |
|---|---|
| `FREE_USER` | Home, Blogs, Recipes, Profile page, limited Chatbot |
| `CHAT_USER` | Everything above + live WhatsApp/chat with nutritionist |
| `APPOINTMENT_USER` | Everything above + appointment booking flow |
| `ADMIN` | Full platform access + admin dashboard (manage users, appointments, content) |

### Why roles live in two places

The role is stored in **Postgres** (authoritative source of truth) and also written into **Clerk's `publicMetadata`** (fast, edge-readable). This matters because:

- The **middleware** (`middleware.ts`) runs at the edge before a page even renders — it reads the role from Clerk session claims (`sessionClaims.publicMetadata.role`) with zero DB round-trips.
- **API routes** verify the role directly from the DB for security-critical operations (e.g., admin endpoints that mutate data).

Any time a role changes (on signup or post-payment), the system writes to Prisma first, then calls `clerkClient().users.updateUserMetadata()` to sync.

---

## Project Structure

```
nutritionist-fe/
├── app/
│   ├── page.tsx                   # Public landing page
│   ├── layout.tsx                 # Root layout (Clerk Provider, Theme)
│   ├── about-user/                # Onboarding health profile form
│   ├── profile/                   # User profile view + edit
│   ├── blogs/                     # Blog listing
│   ├── recipes/                   # Recipe listing
│   ├── sso-callback/              # Clerk SSO redirect handler
│   └── api/
│       ├── webhooks/
│       │   └── clerk/             # Handles user.created, user.updated
│       ├── user/
│       │   ├── profile/           # GET + PATCH user profile
│       │   └── promote/           # POST: upgrade role after payment
│       ├── appointments/          # POST: user submits appointment request
│       ├── admin/
│       │   ├── appointments/      # GET all appointments + [id]/status, [id]/schedule
│       │   ├── users/             # GET all users with profiles + subscriptions
│       │   └── notifications/     # GET admin notifications + unread count
│       ├── blogs/                 # Blog CRUD
│       └── recipes/               # Recipe CRUD
├── components/
│   ├── navbar.tsx                 # Role-aware nav with admin link
│   ├── auth-modal.tsx             # Clerk sign-in/up modal wrapper
│   ├── booking-modal.tsx          # Appointment booking form
│   ├── chat-widget.tsx            # Embedded chat interface
│   ├── hero-section.tsx           # Landing page hero
│   └── ...                        # Other marketing sections
├── hooks/
│   └── useUserRole.ts             # Client-side role helper
├── middleware.ts                  # Edge route protection
├── prisma/
│   └── schema.prisma              # Full DB schema
└── lib/
    ├── prisma.ts                  # Prisma client singleton
    └── cors.ts                    # CORS headers for cross-origin API calls
```

---

## Full Flow — Step by Step

### 1. Visitor Lands on the Site

The root page (`/`) is completely public — no auth required. It renders the marketing landing page: Hero, About, Services, Blogs preview, Recipes preview, Testimonials, CTA, and Footer.

The Navbar shows **Sign In** and **Sign Up** buttons for unauthenticated visitors.

---

### 2. Sign Up / Sign In

Clicking **Sign Up** opens the `AuthModal` — a custom modal that wraps Clerk's hosted UI components. Clerk handles the full auth flow (email/password, Google OAuth, etc.) inside the modal.

```tsx
// components/auth-modal.tsx
// Wraps Clerk's <SignIn /> and <SignUp /> components in a custom overlay
```

After a successful signup, two things happen client-side:
- Clerk sets the session and reloads the user object
- The Navbar detects the fresh login and redirects the user to `/about-user` (onboarding)

---

### 3. Clerk Webhook → DB User Created

**File:** `app/api/webhooks/clerk/route.ts`

Behind the scenes, Clerk fires a `user.created` webhook event to your endpoint. This is the bridge between Clerk's auth world and your own database.

The handler:
1. **Verifies the webhook** using Svix signature headers (prevents spoofed requests)
2. Extracts `id`, `email_addresses`, `phone_numbers`, `first_name`, `last_name` from the event payload
3. **Upserts** a `User` record in PostgreSQL via Prisma:
   ```ts
   await prisma.user.upsert({
     where: { clerkId: id },
     create: {
       clerkId: id,
       email,
       fullName,
       phoneNumber,
       role: UserRole.FREE_USER,
       isVerified: true,
     },
     update: {},
   });
   ```
4. Calls `syncRoleToClerk(id, UserRole.FREE_USER)` — writes the role into Clerk's `publicMetadata` so the middleware can read it from session claims without hitting the DB on every request.

On `user.updated` events, the handler re-syncs the role from Prisma → Clerk to prevent drift.

---

### 4. Onboarding — Health Profile (`/about-user`)

First-time users are taken to the onboarding page where they fill in their full health profile. This creates a `Profile` record linked 1-to-1 to their `User`:

```prisma
model Profile {
  userId            String   @unique
  age               Int?
  gender            Gender?
  heightCm          Float?
  weightKg          Float?
  activityLevel     ActivityLevel?
  dietaryPreference DietaryPreference?
  allergies         String[]
  medicalConditions String[]
  goals             String[]
  sleepHours        Float?
  waterIntakeLitres Float?
  notes             String?
}
```

If a signed-in user navigates to `/profile` without a `Profile` row in the DB, they get redirected back to `/about-user` automatically.

---

### 5. Middleware — Route Protection at the Edge

**File:** `middleware.ts`

Every non-static request passes through Clerk's `clerkMiddleware`. The logic works like this:

```
Incoming request
      │
      ▼
Is it a public route? (/,  /sign-in, /sign-up, /api/webhooks/*, /__clerk/*)
      │ YES → pass through
      │ NO  ↓
      ▼
Is the user signed in? (userId exists in Clerk session)
      │ NO  → redirect to / with ?authRequired=1 (triggers auth modal)
      │ YES ↓
      ▼
Read role from sessionClaims.publicMetadata.role (defaults to FREE_USER)
      │
      ├─ /admin/* and role !== ADMIN         → redirect to /
      ├─ /chat, /whatsapp and role < CHAT    → redirect with ?paymentRequired=chat
      └─ /appointments and role < APPT       → redirect with ?paymentRequired=appointment
```

The `?paymentRequired=chat` or `?paymentRequired=appointment` query param is caught by the frontend to surface a payment/upgrade prompt to the user.

---

### 6. Upgrading a Role — Razorpay + Promote API

**File:** `app/api/user/promote/route.ts`

When a user pays via Razorpay:
1. Razorpay fires a **payment webhook** to your backend
2. The webhook verifies the payment and calls `/api/user/promote` with an internal secret header:

```ts
// Protected by x-internal-secret header — never called from the browser directly
POST /api/user/promote
Body: { clerkId: string, product: 'chat' | 'appointment' }
```

3. The handler maps the product to a role:
   ```ts
   const newRole = product === 'chat' ? UserRole.CHAT_USER : UserRole.APPOINTMENT_USER;
   ```
4. Updates Prisma: `prisma.user.update({ where: { clerkId }, data: { role: newRole } })`
5. Syncs to Clerk: `clerkClient().users.updateUserMetadata(clerkId, { publicMetadata: { role: newRole } })`

On the next page load, the middleware reads the updated role from the Clerk session — the user now has access to the upgraded routes instantly.

---

### 7. Booking an Appointment

**File:** `app/api/appointments/route.ts`

Users with `APPOINTMENT_USER` or `ADMIN` role can submit appointment requests:

```ts
POST /api/appointments
// Requires Clerk session
// Creates Appointment with status: PENDING
// Notifies all ADMIN users via Notification records
```

The form collects: first/last name, email, phone, age, height, reason for visit, and additional notes.

Under the hood it runs a **Prisma transaction** — creates the appointment and fan-outs `Notification` records to every admin user in a single atomic operation:

```ts
await prisma.$transaction(async (tx) => {
  const appointment = await tx.appointment.create({ data: { ... } });

  await tx.notification.createMany({
    data: adminUsers.map((admin) => ({
      userId: admin.id,
      type: 'APPOINTMENT_REQUEST',
      title: 'New appointment request',
      message: `${firstName} ${lastName} requested an appointment...`,
      relatedAppointmentId: appointment.id,
    })),
  });

  return appointment;
});
```

---

### 8. Appointment Lifecycle

The admin controls the full lifecycle of every appointment:

```
PENDING
   ├── APPROVED    → admin accepts, notifies user
   ├── REJECTED    → admin declines with optional reason
   └── PAYMENT_PENDING → if payment required before scheduling

APPROVED
   └── SCHEDULED   → admin sets scheduledStart, scheduledEnd, meetLink, googleEventId

SCHEDULED
   └── COMPLETED   → after the consultation

Any state
   └── CANCELLED   → with cancellationReason
```

The `Appointment` model stores everything: consultation type (ONLINE / PHONE_CALL), Google Meet link, Google Calendar event ID, admin notes, and cancellation reason.

---

### 9. The Admin Side

The **admin is the nutritionist** themselves. Their `ADMIN` role unlocks:

**In the main site's navbar:**
- A highlighted **"Admin"** nav link (only rendered when `isAdmin === true` via the `useUserRole` hook)
- An **"Admin Dashboard"** item in the profile dropdown

Both link to the **external admin dashboard** (configured via `NEXT_PUBLIC_ADMIN_DASHBOARD_URL`).

**API endpoints available only to ADMIN:**

| Endpoint | Method | What it does |
|---|---|---|
| `/api/admin/appointments` | GET | All appointments, ordered by newest, with user + payment info |
| `/api/admin/appointments/[id]/status` | GET/PATCH | Single appointment status management |
| `/api/admin/appointments/[id]/schedule` | POST | Set meeting time, link, Google Calendar event |
| `/api/admin/users` | GET | All users with full profiles, subscriptions, appointment counts |
| `/api/admin/notifications` | GET | Admin's notifications with unread count |

Every admin endpoint does a **double-check**: verifies Clerk session, then looks up the user in Prisma and confirms `role === 'ADMIN'`. Client-side role checks alone are never trusted.

---

### 10. Notifications System

The `Notification` model is used to ping both users and admins about important events:

| Type | When |
|---|---|
| `APPOINTMENT_REQUEST` | User submits a booking |
| `APPOINTMENT_APPROVED` | Admin approves |
| `APPOINTMENT_REMINDER` | Upcoming appointment |
| `APPOINTMENT_CANCELLED` | Either side cancels |
| `PAYMENT_REQUEST` | Payment needed |
| `PAYMENT_SUCCESS` | Payment confirmed |
| `PAYMENT_FAILED` | Payment failed |
| `CHAT_MESSAGE` | New message in chat |
| `CHAT_REQUEST` | User requests chat access |
| `SYSTEM` | System-level alerts |

Each notification carries `relatedChatId` or `relatedAppointmentId` for deep linking.

---

### 11. Content — Blogs & Recipes

The admin (nutritionist) authors and publishes blogs and recipes. Signed-in users of any role can view, like, and comment.

```prisma
model Blog {
  title       String
  slug        String   @unique
  content     String
  excerpt     String?
  coverImage  String?
  tags        String[]
  readTime    Int?
  views       Int      @default(0)
  isPublished Boolean  @default(false)
  comments    BlogComment[]
  likes       BlogLike[]
}
```

Recipes similarly track ingredients, instructions, preparation/cooking time, calories, dietary tags, and view count.

---

## Database Schema Overview

```
User
 ├── Profile            (1:1 — health data)
 ├── Subscription[]     (chat subscriptions with status + expiry)
 ├── Payment[]          (Razorpay payment records)
 ├── Appointment[]      (booking requests)
 ├── ChatSession[]      (live chat with unread counters)
 ├── Message[]          (sent + received, with WhatsApp message ID support)
 ├── Blog[]             (authored content)
 ├── Recipe[]           (authored content)
 ├── BlogComment[]      (comments on blogs)
 ├── RecipeComment[]    (comments on recipes)
 ├── BlogLike[]         (unique per user+blog)
 ├── RecipeLike[]       (unique per user+recipe)
 └── Notification[]     (in-app alerts)
```

Enums in use: `UserRole`, `Gender`, `ActivityLevel`, `DietaryPreference`, `SubscriptionType`, `SubscriptionStatus`, `PaymentProvider`, `PaymentStatus`, `ChatSessionStatus`, `MessageType`, `MessageStatus`, `AppointmentStatus`, `ConsultationType`, `NotificationType`, `PaymentPurpose`.

---

## Environment Variables

```bash
# Database
DATABASE_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=          # Svix signing secret for webhook verification

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Internal API protection
INTERNAL_API_SECRET=           # Used to protect /api/user/promote from external calls

# Admin Dashboard
NEXT_PUBLIC_ADMIN_DASHBOARD_URL=   # URL of the separate admin dashboard app
```

---

## Running Locally

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Clerk, DB, and Razorpay keys

# Push the Prisma schema to your DB
pnpm prisma db push

# Generate Prisma client
pnpm prisma generate

# Start dev server
pnpm dev
```

The app runs at `http://localhost:3000`.

For webhooks in local dev, use [ngrok](https://ngrok.com) or [Clerk's local webhook proxy](https://clerk.com/docs/webhooks/overview) to tunnel your `/api/webhooks/clerk` endpoint.

---

## Key Design Decisions

**1. Dual role storage (Prisma + Clerk metadata)**
Roles live in two places intentionally. Clerk session claims let middleware enforce access at the edge without a DB query on every request. Prisma is the authoritative source — always written first, Clerk synced after.

**2. Prisma transactions for side effects**
Anywhere that creates a primary record and needs to fire notifications (appointments, payments), Prisma transactions are used so that partial writes never happen — if notification creation fails, the whole operation rolls back.

**3. Internal API secret for role promotion**
The `/api/user/promote` endpoint is not callable from the browser (guarded by `x-internal-secret`). This is intentional — role upgrades should only happen from your trusted backend webhook handler after a verified payment, never from a client-side call.

**4. Clerk webhook upsert, not create**
The Clerk `user.created` handler uses `upsert` instead of `create`. This handles edge cases where the webhook fires twice (Clerk guarantees at-least-once delivery) without throwing a duplicate record error.

---

## Deployment

- **Frontend**: Deploy to Vercel. Set all env vars in the Vercel dashboard.
- **Clerk Webhooks**: In Clerk Dashboard → Webhooks → add your production URL: `https://yourdomain.com/api/webhooks/clerk`. Subscribe to `user.created` and `user.updated` events. Copy the Signing Secret into `CLERK_WEBHOOK_SECRET`.
- **Database**: Any hosted Postgres (Neon, Supabase, Railway, etc.). Run `pnpm prisma migrate deploy` in your CI/CD pipeline.
- **Razorpay**: Configure your payment webhook to call `/api/user/promote` (via your server-to-server handler) after successful payments.

---

## Authorized Parties

The middleware is configured to only accept Clerk sessions from specific origins:

```ts
authorizedParties: [
  "https://nourishwell.in",
  "https://dashboard.nourishwell.in"
]
```

Update these to match your actual domain(s) in `middleware.ts`.

---

*Built with ❤️ for nutritionists who want their patients to have a seamless, professional digital experience.*
