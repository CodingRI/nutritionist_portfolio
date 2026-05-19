// app/api/user/profile/route.ts
// GET  — fetch current user's full profile (User + Profile joined)
// POST — upsert on signup (about-user page)
// PATCH — partial update from profile edit (profile page)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  UserRole,
  Gender,
  DietaryPreference,
  ActivityLevel,
} from "@prisma/client";

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      role: true,
      isVerified: true,
      createdAt: true,
      profile: {
        select: {
          age: true,
          gender: true,
          heightCm: true,
          weightKg: true,
          activityLevel: true,
          dietaryPreference: true,
          allergies: true,
          medicalConditions: true,
          goals: true,
          sleepHours: true,
          waterIntakeLitres: true,
          notes: true,
        },
      },
    },
  });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ success: true, user });
}

// ── POST (initial onboarding — called from about-user page) ───────────────────

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    fullName,
    email,
    phoneNumber,
    dob,
    gender,
    healthGoals,
    dietaryPref,
  } = body;

  // DOB → age in years
  let age: number | undefined;
  if (dob) {
    const birth = new Date(dob);
    const today = new Date();
    age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  }

  const user = await prisma.user.upsert({
    where: { clerkId },
    create: {
      clerkId,
      fullName: fullName ?? "User",
      email: email ?? `${clerkId}@placeholder.clerk`,
      phoneNumber: phoneNumber ?? null,
      role: UserRole.FREE_USER,
      isVerified: true,
    },
    update: {
      fullName: fullName ?? undefined,
      phoneNumber: phoneNumber ?? undefined,
    },
  });

  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      age: age ?? null,
      gender: gender ? (gender as Gender) : null,
      dietaryPreference: dietaryPref
        ? (dietaryPref as DietaryPreference)
        : null,
      goals: healthGoals ?? [],
    },
    update: {
      age: age ?? undefined,
      gender: gender ? (gender as Gender) : undefined,
      dietaryPreference: dietaryPref
        ? (dietaryPref as DietaryPreference)
        : undefined,
      goals: healthGoals ?? undefined,
    },
  });

  return NextResponse.json({ success: true, userId: user.id });
}

// ── PATCH (edit from profile page) ────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const {
    fullName,
    phoneNumber,
    dob,
    gender,
    healthGoals,
    dietaryPref,
    heightCm,
    weightKg,
    activityLevel,
    allergies,
    medicalConditions,
    sleepHours,
    waterIntakeLitres,
    notes,
  } = body;

  let age: number | undefined;
  if (dob) {
    const birth = new Date(dob);
    const today = new Date();
    age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  }

  // Update User row
  const user = await prisma.user.update({
    where: { clerkId },
    data: {
      ...(fullName && { fullName }),
      ...(phoneNumber !== undefined && { phoneNumber: phoneNumber || null }),
    },
  });

  // Upsert Profile row (create if somehow doesn't exist yet)
  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      age: age ?? null,
      gender: gender ? (gender as Gender) : null,
      dietaryPreference: dietaryPref
        ? (dietaryPref as DietaryPreference)
        : null,
      activityLevel: activityLevel ? (activityLevel as ActivityLevel) : null,
      goals: healthGoals ?? [],
      heightCm: heightCm ? Number(heightCm) : null,
      weightKg: weightKg ? Number(weightKg) : null,
      allergies: allergies ?? [],
      medicalConditions: medicalConditions ?? [],
      sleepHours: sleepHours ? Number(sleepHours) : null,
      waterIntakeLitres: waterIntakeLitres ? Number(waterIntakeLitres) : null,
      notes: notes ?? null,
    },
    update: {
      ...(age !== undefined && { age }),
      ...(gender && { gender: gender as Gender }),
      ...(dietaryPref && {
        dietaryPreference: dietaryPref as DietaryPreference,
      }),
      ...(activityLevel && { activityLevel: activityLevel as ActivityLevel }),
      ...(healthGoals && { goals: healthGoals }),
      ...(heightCm !== undefined && { heightCm: Number(heightCm) }),
      ...(weightKg !== undefined && { weightKg: Number(weightKg) }),
      ...(allergies && { allergies }),
      ...(medicalConditions && { medicalConditions }),
      ...(sleepHours !== undefined && { sleepHours: Number(sleepHours) }),
      ...(waterIntakeLitres !== undefined && {
        waterIntakeLitres: Number(waterIntakeLitres),
      }),
      ...(notes !== undefined && { notes: notes || null }),
    },
  });

  return NextResponse.json({ success: true });
}
