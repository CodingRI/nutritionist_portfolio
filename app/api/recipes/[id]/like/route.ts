

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
 
interface RouteParams {
  params: Promise<{ id: string }>;
}
 
export async function POST(_req: NextRequest, { params }: RouteParams) {
  const { id: recipeId } = await params;
 
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, message: 'Sign in to like' }, { status: 401 });
  }
 
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
 
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }
 
  const existing = await prisma.recipeLike.findUnique({
    where: { recipeId_userId: { recipeId, userId: user.id } },
  });
 
  if (existing) {
    await prisma.recipeLike.delete({
      where: { recipeId_userId: { recipeId, userId: user.id } },
    });
  } else {
    await prisma.recipeLike.create({
      data: { recipeId, userId: user.id },
    });
  }
 
  const count = await prisma.recipeLike.count({ where: { recipeId } });
 
  return NextResponse.json({ success: true, liked: !existing, count });
}
 
 