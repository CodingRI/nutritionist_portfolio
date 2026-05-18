// app/api/blogs/[id]/comments/route.ts
// POST /api/blogs/[id]/comments — add a comment (requires sign-in)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id: blogId } = await params;

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, message: 'Sign in to comment' }, { status: 401 });
  }

  const body = await req.json();
  const content = (body.content ?? '').trim();

  if (!content) {
    return NextResponse.json({ success: false, message: 'Comment cannot be empty' }, { status: 400 });
  }

  // Look up internal user id from clerkId
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, fullName: true },
  });

  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }

  const comment = await prisma.blogComment.create({
    data: { blogId, userId: user.id, content },
    include: {
      user: { select: { id: true, fullName: true } },
    },
  });

  return NextResponse.json({ success: true, comment }, { status: 201 });
}