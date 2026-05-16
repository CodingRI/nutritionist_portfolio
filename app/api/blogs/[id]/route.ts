// app/api/blogs/[id]/route.ts
// GET /api/blogs/[id]  — fetch one published blog with comments + like status
// PATCH /api/blogs/[id] — increment view count (called on page load)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, fullName: true, email: true },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, fullName: true } },
          },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
    });

    if (!blog || !blog.isPublished) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    // Check if the current signed-in user has liked this blog
    const { userId: clerkId } = await auth();
    let likedByMe = false;

    if (clerkId) {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true },
      });
      if (dbUser) {
        const like = await prisma.blogLike.findUnique({
          where: { blogId_userId: { blogId: id, userId: dbUser.id } },
        });
        likedByMe = !!like;
      }
    }

    return NextResponse.json({ success: true, blog: { ...blog, likedByMe } });
  } catch (error) {
    console.error('GET_BLOG_ERROR:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// ── PATCH (increment views) ───────────────────────────────────────────────────

export async function PATCH(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    await prisma.blog.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}