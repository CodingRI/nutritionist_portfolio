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
    const recipe = await prisma.recipe.findUnique({
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
 
    if (!recipe || !recipe.isPublished) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
 
    // Check if signed-in user has liked this recipe
    const { userId: clerkId } = await auth();
    let likedByMe = false;
 
    if (clerkId) {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true },
      });
      if (dbUser) {
        const like = await prisma.recipeLike.findUnique({
          where: { recipeId_userId: { recipeId: id, userId: dbUser.id } },
        });
        likedByMe = !!like;
      }
    }
 
    return NextResponse.json({ success: true, recipe: { ...recipe, likedByMe } });
  } catch (error) {
    console.error('GET_RECIPE_ERROR:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
 
// ── PATCH (increment views) ───────────────────────────────────────────────────
 
export async function PATCH(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
 
  try {
    await prisma.recipe.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
 