// app/api/user/promote/route.ts
// Called by your Razorpay payment webhook after a successful payment.
// Upgrades UserRole in Prisma AND syncs to Clerk publicMetadata.
//
// POST body: { clerkId: string, product: 'chat' | 'appointment' }
// Protected by x-internal-secret header → set INTERNAL_API_SECRET in .env

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';
import { UserRole } from '@/src/generated/prisma/client';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('x-internal-secret');
  if (authHeader !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { clerkId, product } = await req.json();

  if (!clerkId || !['chat', 'appointment'].includes(product)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Map product → your UserRole enum value
  const newRole: UserRole =
    product === 'chat' ? UserRole.CHAT_USER : UserRole.APPOINTMENT_USER;

  // Update Prisma
  await prisma.user.update({
    where: { clerkId },
    data: { role: newRole },
  });

  // Sync to Clerk publicMetadata so middleware can read it without a DB hit
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkId, {
    publicMetadata: { role: newRole },
  });

  return NextResponse.json({ success: true, role: newRole });
}