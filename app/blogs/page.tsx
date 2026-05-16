"use client";

// app/blogs/page.tsx
// Fetches blogs from /api/blogs (Neon DB via Prisma).
// Infinite scroll, admin write button, like + comment counts from DB.

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Clock, Plus, Loader2 } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { LivelyCard } from "@/components/ui/lively-card";
import { RoleGuard } from "@/components/role-guard";
import type { BlogListItem } from "@/types/blog";

const PAGE_SIZE = 6;

export default function BlogsPage() {
  const [blogs,   setBlogs]   = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ── Fetch all published blogs once on mount ───────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/blogs");
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        setBlogs(data.blogs);
      } catch (e) {
        setError("Failed to load blogs. Please try again.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Infinite scroll ───────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    setVisible((prev) => Math.min(prev + PAGE_SIZE, blogs.length));
  }, [blogs.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  function formatDate(iso: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  const visibleBlogs = blogs.slice(0, visible);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen py-20">
      <div className="section-container">

        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Nutrition Insights &amp; Wellness Tips
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Expert advice, research-backed tips, and inspiring stories to support your health journey
          </p>

          {/* Only admins see this button */}
          <RoleGuard allowedRoles={["ADMIN"]}>
            <Link
              href="/blogs/write"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Write a Blog Post
            </Link>
          </RoleGuard>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-red-500 py-10">{error}</p>
        )}

        {/* Empty */}
        {!loading && !error && blogs.length === 0 && (
          <p className="text-center text-muted-foreground py-20">
            No blog posts yet. Check back soon!
          </p>
        )}

        {/* Grid */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleBlogs.map((blog, index) => (
              <Link key={blog.id} href={`/blogs/${blog.id}`} className="block h-full">
                <LivelyCard
                  image={blog.coverImage ?? "/placeholder-blog.jpg"}
                  imageAlt={blog.title}
                  aspectRatio="aspect-[16/10]"
                  index={index}
                >
                  <CardContent className="p-4 pt-3 flex flex-col flex-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      {/* First tag as category badge */}
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {blog.tags?.[0] ?? "General"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {blog.readTime ? `${blog.readTime} min read` : "Quick read"}
                      </span>
                    </div>

                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {blog.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {blog.excerpt ?? ""}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto pt-3 border-t border-border">
                      <span className="flex items-center gap-1.5">
                        <Heart className="h-4 w-4" />
                        {blog._count.likes}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="h-4 w-4" />
                        {blog._count.comments}
                      </span>
                      <span className="ml-auto text-xs">
                        {formatDate(blog.publishedAt ?? blog.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </LivelyCard>
              </Link>
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {visible < blogs.length && (
          <div ref={sentinelRef} className="flex justify-center py-12">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}