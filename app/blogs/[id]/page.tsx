"use client";

// app/blogs/[id]/page.tsx
// Fetches the blog from /api/blogs/[id] (Neon DB).
// Real comments (signed-in users only), real like toggle, view count increment.

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart, Share2, MessageCircle, ArrowLeft,
  User, Calendar, Clock, Send, ThumbsUp, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import type { BlogDetail, BlogComment } from "@/types/blog";

interface BlogDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id } = use(params);
  const { isSignedIn, user } = useUser();

  const [blog,          setBlog]          = useState<BlogDetail | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [notFound,      setNotFound]      = useState(false);

  // Like state
  const [liked,         setLiked]         = useState(false);
  const [likeCount,     setLikeCount]     = useState(0);
  const [liking,        setLiking]        = useState(false);

  // Comment state
  const [comments,      setComments]      = useState<BlogComment[]>([]);
  const [commentText,   setCommentText]   = useState("");
  const [submitting,    setSubmitting]    = useState(false);
  const [commentError,  setCommentError]  = useState("");

  // ── Fetch blog ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`/api/blogs/${id}`);
        const data = await res.json();

        if (!data.success) { setNotFound(true); return; }

        setBlog(data.blog);
        setLiked(data.blog.likedByMe ?? false);
        setLikeCount(data.blog._count.likes);
        setComments(data.blog.comments ?? []);

        // Increment view count (fire-and-forget)
        fetch(`/api/blogs/${id}`, { method: "PATCH" });

      } catch (e) {
        console.error(e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // ── Like toggle ─────────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (!isSignedIn) { alert("Please sign in to like posts."); return; }
    if (liking) return;
    setLiking(true);

    // Optimistic update
    setLiked((v) => !v);
    setLikeCount((v) => (liked ? v - 1 : v + 1));

    try {
      const res  = await fetch(`/api/blogs/${id}/like`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setLiked(data.liked);
        setLikeCount(data.count);
      }
    } catch (e) {
      // Revert on error
      setLiked((v) => !v);
      setLikeCount((v) => (liked ? v + 1 : v - 1));
      console.error(e);
    } finally {
      setLiking(false);
    }
  };

  // ── Submit comment ──────────────────────────────────────────────────────────
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) { setCommentError("Please sign in to comment."); return; }
    const content = commentText.trim();
    if (!content) return;
    setSubmitting(true);
    setCommentError("");

    try {
      const res  = await fetch(`/api/blogs/${id}/comments`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ content }),
      });
      const data = await res.json();

      if (data.success) {
        setComments((prev) => [data.comment, ...prev]);
        setCommentText("");
      } else {
        setCommentError(data.message ?? "Failed to post comment.");
      }
    } catch (e) {
      setCommentError("Something went wrong.");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Share ───────────────────────────────────────────────────────────────────
  const handleShare = () => {
    if (navigator.share && blog) {
      navigator.share({ title: blog.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function formatDate(iso: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });
  }

  function formatRelative(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 1)  return "Just now";
    if (mins  < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days  < 7)  return `${days} day${days > 1 ? "s" : ""} ago`;
    return formatDate(iso);
  }

  // Render markdown-ish content (same parser as your original)
  function renderContent(content: string) {
    return content.split("\n\n").map((block, i) => {
      const t = block.trim();
      if (t.startsWith("## ")) {
        return (
          <h2 key={i} className="text-xl font-serif font-bold text-foreground mt-8 mb-2">
            {t.replace("## ", "")}
          </h2>
        );
      }
      if (t.startsWith("- ")) {
        const items = t.split("\n").filter((l) => l.startsWith("- "));
        return (
          <ul key={i} className="space-y-1.5 ml-1">
            {items.map((item, j) => (
              <li key={j} className="text-foreground leading-relaxed flex gap-2"
                dangerouslySetInnerHTML={{
                  __html: `<span class="text-primary shrink-0">•</span><span>${item
                    .replace(/^- /, "")
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</span>`,
                }}
              />
            ))}
          </ul>
        );
      }
      if (/^\d+\. /.test(t)) {
        const items = t.split("\n").filter((l) => /^\d+\. /.test(l));
        return (
          <ol key={i} className="space-y-1.5 ml-1">
            {items.map((item, j) => (
              <li key={j} className="text-foreground leading-relaxed flex gap-2">
                <span className="text-primary font-semibold shrink-0">{j + 1}.</span>
                <span>{item.replace(/^\d+\.\s*/, "")}</span>
              </li>
            ))}
          </ol>
        );
      }
      return (
        <p key={i} className="text-foreground leading-relaxed">{t}</p>
      );
    });
  }

  // ── States ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Blog post not found</p>
        <Link href="/blogs">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blogs
          </Button>
        </Link>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen py-12">
      <div className="section-container max-w-3xl">

        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Blogs
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Hero image */}
          <div className="relative rounded-2xl overflow-hidden mb-8 aspect-[2/1]">
            <img
              src={blog.coverImage ?? "/placeholder-blog.jpg"}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              {blog.tags?.[0] && (
                <span className="inline-block px-3 py-1 rounded-full bg-primary/80 text-primary-foreground text-xs font-medium mb-3">
                  {blog.tags[0]}
                </span>
              )}
              <h1 className="text-2xl md:text-4xl font-serif font-bold text-white leading-tight">
                {blog.title}
              </h1>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 mb-10 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{blog.author.fullName}</p>
                <p className="text-xs text-muted-foreground">Author</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(blog.publishedAt ?? blog.createdAt)}
            </div>
            {blog.readTime && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {blog.readTime} min read
              </div>
            )}
          </div>

          {/* Content */}
          <div className="mb-12 space-y-4">
            {renderContent(blog.content)}
          </div>

          {/* Engagement bar */}
          <div className="flex items-center gap-3 py-6 border-t border-b border-border mb-10">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={handleLike}
              disabled={liking}
            >
              <Heart
                className={`mr-1.5 h-4 w-4 transition-colors ${liked ? "fill-red-500 text-red-500" : ""}`}
              />
              {likeCount}
            </Button>

            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <a href="#comments">
                <MessageCircle className="mr-1.5 h-4 w-4" />
                {comments.length} Comments
              </a>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="rounded-full ml-auto"
              onClick={handleShare}
            >
              <Share2 className="mr-1.5 h-4 w-4" /> Share
            </Button>
          </div>

          {/* Comments */}
          <section id="comments" className="space-y-8">
            <h3 className="text-xl font-serif font-bold text-foreground">
              Comments ({comments.length})
            </h3>

            {/* Comment form */}
            <div className="p-5 bg-card rounded-xl border border-border space-y-4">
              {isSignedIn ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="You" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {user?.firstName?.[0] ?? "U"}
                        </span>
                      </div>
                    )}
                    <p className="text-sm font-medium text-foreground">
                      Commenting as {user?.firstName ?? "you"}
                    </p>
                  </div>

                  <form onSubmit={handleComment} className="space-y-3">
                    <textarea
                      placeholder="Share your thoughts…"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                      rows={3}
                    />
                    {commentError && (
                      <p className="text-sm text-red-500">{commentError}</p>
                    )}
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        size="sm"
                        className="rounded-full"
                        disabled={submitting || !commentText.trim()}
                      >
                        {submitting ? (
                          <Loader2 size={14} className="mr-1.5 animate-spin" />
                        ) : (
                          <Send className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Post Comment
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  <Link href="/?authRequired=1" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>{" "}
                  to join the conversation
                </p>
              )}
            </div>

            {/* Comment list */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {comment.user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm text-foreground">{comment.user.fullName}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatRelative(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </motion.div>
              ))}

              {comments.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No comments yet. Be the first!
                </p>
              )}
            </div>
          </section>
        </motion.article>
      </div>
    </div>
  );
}