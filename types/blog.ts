// types/blog.ts
// Single source of truth for blog shapes coming from the DB.
// Matches your Prisma Blog model + the includes used in API routes.

export interface BlogAuthor {
    id:       string;
    fullName: string;
    email:    string;
  }
  
  export interface BlogListItem {
    id:          string;
    slug:        string;
    title:       string;
    excerpt:     string | null;
    coverImage:  string | null;
    tags:        string[];
    readTime:    number | null;
    views:       number;
    publishedAt: string | null;   // ISO string from JSON
    createdAt:   string;
    author:      BlogAuthor;
    _count: {
      comments: number;
      likes:    number;
    };
  }
  
  export interface BlogComment {
    id:        string;
    content:   string;
    createdAt: string;
    user: {
      id:       string;
      fullName: string;
    };
  }
  
  export interface BlogDetail extends BlogListItem {
    content:  string;
    comments: BlogComment[];
    // whether the current signed-in user has liked this post
    // (injected by the GET /api/blogs/[id] route)
    likedByMe?: boolean;
  }