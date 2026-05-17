export interface RecipeAuthor {
    id:       string;
    fullName: string;
    email:    string;
  }
   
  export interface RecipeIngredient {
    item:   string;
    amount: string;
    unit:   string;
  }
   
  export interface RecipeListItem {
    id:             string;
    slug:           string;
    title:          string;
    description:    string | null;
    coverImage:     string | null;
    dietaryTags:    string[];
    preparationTime: number | null;
    cookingTime:    number | null;
    calories:       number | null;
    isPublished:    boolean;
    publishedAt:    string | null;
    createdAt:      string;
    author:         RecipeAuthor;
    _count: {
      comments: number;
      likes:    number;
    };
  }
   
  export interface RecipeComment {
    id:        string;
    content:   string;
    createdAt: string;
    user: {
      id:       string;
      fullName: string;
    };
  }
   
  export interface RecipeDetail extends RecipeListItem {
    // ingredients and instructions are stored as String[] in Prisma.
    // We store them as JSON strings so we can embed structured data.
    // Format: ingredients → JSON.stringify(RecipeIngredient[])
    //         instructions → plain string[]
    ingredients:  string[];   // each element is JSON: "{item,amount,unit}"
    instructions: string[];
    views:        number;
    comments:     RecipeComment[];
    likedByMe?:   boolean;
  }
   
  // Helper — parse a stored ingredient string safely
  export function parseIngredient(raw: string): RecipeIngredient {
    try {
      return JSON.parse(raw) as RecipeIngredient;
    } catch {
      return { item: raw, amount: '', unit: '' };
    }
  }
   