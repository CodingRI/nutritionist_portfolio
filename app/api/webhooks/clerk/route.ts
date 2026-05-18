// app/api/webhooks/clerk/route.ts
// Clerk webhook: seeds User in Prisma on first sign-up, syncs role to Clerk metadata.
// Events: user.created, user.updated
//
// Setup: Clerk Dashboard → Webhooks → Add endpoint
//   URL: https://yourdomain.com/api/webhooks/clerk
//   Events: user.created, user.updated
//   Copy Signing Secret → CLERK_WEBHOOK_SECRET in .env
//
// Install: npm install svix

import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';
import { UserRole } from '@/src/generated/prisma/client';

// ── Clerk webhook event shape (partial — only fields we use) ──────────────────

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkPhoneNumber {
  phone_number: string;
}

interface ClerkUserEventData {
  id: string;
  email_addresses: ClerkEmailAddress[];
  phone_numbers: ClerkPhoneNumber[];
  first_name: string | null;
  last_name: string | null;
}

interface ClerkWebhookEvent {
  type: 'user.created' | 'user.updated' | string;
  data: ClerkUserEventData;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  // Read and verify svix signature
  const svixId        = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const body = await req.text();

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // ── user.created: seed the user row ──────────────────────────────────────────

  if (event.type === 'user.created') {
    const { id, email_addresses, phone_numbers, first_name, last_name } = event.data;

    const email       = email_addresses[0]?.email_address ?? null;
    const phoneNumber = phone_numbers[0]?.phone_number ?? null;
    const fullName    = [first_name, last_name].filter(Boolean).join(' ') || 'User';

    // Only create if not already in DB (idempotency guard)
    await prisma.user.upsert({
      where: { clerkId: id },
      create: {
        clerkId:     id,
        fullName,
        email:       email ?? `${id}@placeholder.clerk`, // fallback for phone-only signup
        phoneNumber,
        role:        UserRole.FREE_USER,
        isVerified:  true,   // Clerk has already verified the address/number
      },
      update: {}, // don't overwrite manually set data on re-delivery
    });

    // Write role to Clerk publicMetadata so middleware can read it JWT-side
    await syncRoleToClerk(id, UserRole.FREE_USER);
  }

  // ── user.updated: re-sync role in case it changed in Prisma ──────────────────

  if (event.type === 'user.updated') {
    const { id } = event.data;
    const user = await prisma.user.findUnique({
      where: { clerkId: id },
      select: { role: true },
    });
    if (user) {
      await syncRoleToClerk(id, user.role);
    }
  }

  return NextResponse.json({ success: true });
}

// ── Helper ────────────────────────────────────────────────────────────────────

async function syncRoleToClerk(clerkId: string, role: UserRole) {
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkId, {
    publicMetadata: { role },
  });
}