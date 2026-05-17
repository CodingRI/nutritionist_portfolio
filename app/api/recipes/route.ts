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
 
// ── GET ───────────────────────────────────────────────────────────────────────
 
export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
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
 
    return NextResponse.json({ success: true, recipes });
  } catch (error) {
    console.error('GET_RECIPES_ERROR:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch recipes' }, { status: 500 });
  }
}
 
// ── POST ──────────────────────────────────────────────────────────────────────
 
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
 
    const body = await req.json();
 
    const {
      title,
      description,
      // ingredients is RecipeIngredient[] from the form.
      // We JSON.stringify each element so structured data survives Prisma's String[] field.
      ingredients,      // { item, amount, unit }[]
      instructions,     // string[]
      dietaryTags,      // string[]
      preparationTime,  // number (minutes)
      cookingTime,      // number (minutes)
      calories,         // number
      coverImage,       // string | null
      isPublished = true,
    } = body;
 
    if (!title || !ingredients?.length || !instructions?.length) {
      return NextResponse.json(
        { success: false, message: 'Title, ingredients, and instructions are required' },
        { status: 400 }
      );
    }
 
    // Unique slug
    const baseSlug = createSlug(title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.recipe.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }
 
    // Serialise each ingredient object as a JSON string so it fits String[]
    const serialisedIngredients = (ingredients as { item: string; amount: string; unit: string }[])
      .filter((i) => i.item?.trim())
      .map((i) => JSON.stringify(i));
 
    const filteredInstructions = (instructions as string[]).filter((s) => s.trim());
 
    const recipe = await prisma.recipe.create({
      data: {
        authorId:        admin.id,
        title,
        slug,
        description:     description || null,
        ingredients:     serialisedIngredients,
        instructions:    filteredInstructions,
        dietaryTags:     Array.isArray(dietaryTags) ? dietaryTags : [],
        preparationTime: preparationTime ? Number(preparationTime) : null,
        cookingTime:     cookingTime     ? Number(cookingTime)     : null,
        calories:        calories        ? Number(calories)        : null,
        coverImage:      coverImage      || null,
        isPublished,
        publishedAt:     isPublished ? new Date() : null,
      },
    });
 
    return NextResponse.json({ success: true, message: 'Recipe created', recipe }, { status: 201 });
 
  } catch (error) {
    console.error('CREATE_RECIPE_ERROR:', error);
 
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, message: 'Sign in required' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }
 
    return NextResponse.json({ success: false, message: 'Failed to create recipe' }, { status: 500 });
  }
}
 