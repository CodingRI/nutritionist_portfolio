// app/api/blogs/[id]/like/route.ts
// POST /api/blogs/[id]/like — toggle like (requires sign-in)
// Returns { liked: boolean, count: number }

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const { id: blogId } = await params;

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

  const existing = await prisma.blogLike.findUnique({
    where: { blogId_userId: { blogId, userId: user.id } },
  });

  if (existing) {
    // Unlike
    await prisma.blogLike.delete({
      where: { blogId_userId: { blogId, userId: user.id } },
    });
  } else {
    // Like
    await prisma.blogLike.create({
      data: { blogId, userId: user.id },
    });
  }

  const count = await prisma.blogLike.count({ where: { blogId } });

  return NextResponse.json({ success: true, liked: !existing, count });
}