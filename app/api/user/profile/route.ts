// app/api/user/profile/route.ts
// POST — upsert User + Profile after onboarding
// GET  — fetch current user's profile
//
// Field names match your schema exactly:
//   User:    clerkId, fullName, email, phoneNumber, role (UserRole enum)
//   Profile: age, gender (Gender enum), dietaryPreference (DietaryPreference enum), goals

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { UserRole, Gender, DietaryPreference } from '@/src/generated/prisma/client';

// ── POST /api/user/profile ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const {
    fullName,
    email,
    phoneNumber,
    dob,            // ISO string e.g. "2000-04-15"
    gender,         // "MALE" | "FEMALE" | "OTHER"
    healthGoals,    // string[]
    dietaryPref,    // "VEG" | "VEGAN" | "NON_VEG" | "EGGETARIAN" | "KETO" | "OTHER"
  } = body;

  // Parse DOB → age in years (Profile stores age as Int, not date)
  let age: number | undefined;
  if (dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  }

  // Upsert User row
  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    create: {
      clerkId:     userId,
      fullName:    fullName ?? 'User',
      email:       email ?? '',
      phoneNumber: phoneNumber ?? null,
      role:        UserRole.FREE_USER,
      isVerified:  true,   // Clerk already verified email/phone
    },
    update: {
      fullName:    fullName ?? undefined,
      phoneNumber: phoneNumber ?? undefined,
    },
  });

  // Upsert Profile row
  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId:            user.id,
      age:               age ?? null,
      gender:            gender ? (gender as Gender) : null,
      dietaryPreference: dietaryPref ? (dietaryPref as DietaryPreference) : null,
      goals:             healthGoals ?? [],
    },
    update: {
      age:               age ?? undefined,
      gender:            gender ? (gender as Gender) : undefined,
      dietaryPreference: dietaryPref ? (dietaryPref as DietaryPreference) : undefined,
      goals:             healthGoals ?? undefined,
    },
  });

  return NextResponse.json({ success: true, userId: user.id });
}

// ── GET /api/user/profile ─────────────────────────────────────────────────────

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id:          true,
      fullName:    true,
      email:       true,
      phoneNumber: true,
      role:        true,
      isVerified:  true,
      profile: {
        select: {
          age:               true,
          gender:            true,
          dietaryPreference: true,
          goals:             true,
          activityLevel:     true,
          heightCm:          true,
          weightKg:          true,
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json(user);
}