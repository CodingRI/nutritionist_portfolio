// app/api/blogs/route.ts
// GET  — list all published blogs
// POST — create a blog (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/roles';

function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function calculateReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      include: {
        author: {
          select: { id: true, fullName: true, email: true },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
    });

    return NextResponse.json({ success: true, blogs });
  } catch (error) {
    console.error('GET_BLOGS_ERROR:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch blogs' }, { status: 500 });
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await req.json();

    const {
      title,
      content,
      excerpt,
      tags,           // string[] — sent from the write page
      coverImage,
      isPublished = true,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Unique slug
    const baseSlug = createSlug(title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.blog.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const blog = await prisma.blog.create({
      data: {
        authorId:    admin.id,
        title,
        slug,
        excerpt:     excerpt  || null,
        content,
        coverImage:  coverImage || null,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        tags:        Array.isArray(tags) ? tags : [],
        readTime:    calculateReadTime(content),
      },
    });

    return NextResponse.json({ success: true, message: 'Blog created', blog }, { status: 201 });

  } catch (error) {
    console.error('CREATE_BLOG_ERROR:', error);

    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, message: 'You must be signed in' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    return NextResponse.json({ success: false, message: 'Failed to create blog' }, { status: 500 });
  }
}