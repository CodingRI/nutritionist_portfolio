'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Clock, Plus } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { LivelyCard } from '@/components/ui/lively-card';
import { RoleGuard } from '@/components/role-guard';
import { useUser } from '@clerk/nextjs';
import { useUserRole } from '@/hooks/useUserRole';
import { blogs } from '@/lib/blogs-data';

const PAGE_SIZE = 6;

export default function BlogsPage() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const userRole = useUserRole();
  const { user } = useUser();

console.log('USER ROLE:', userRole);
console.log('CLERK PUBLIC METADATA:', user?.publicMetadata);
console.log('CLERK USER ID:', user?.id);
console.log('CLERK EMAIL:', user?.primaryEmailAddress?.emailAddress);
  

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, blogs.length));
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const visible = blogs.slice(0, visibleCount);

  return (
    <div className="min-h-screen py-20">
      <div className="section-container">
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
          <RoleGuard allowedRoles={['ADMIN']}>

          <Link
            href="/blogs/write"
            className="btn-primary inline-flex items-center gap-2"
            >
            <Plus size={20} />
            Write a Blog Post
          </Link>
        </RoleGuard>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((blog, index) => (
            <Link key={blog.id} href={`/blogs/${blog.id}`} className="block h-full">
              <LivelyCard
                image={blog.image}
                imageAlt={blog.title}
                aspectRatio="aspect-[16/10]"
                index={index}
              >
                <CardContent className="p-4 pt-3 flex flex-col flex-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {blog.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {blog.readTime}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto pt-3 border-t border-border">
                    <span className="flex items-center gap-1.5">
                      <Heart className="h-4 w-4" />
                      {blog.likes}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="h-4 w-4" />
                      {blog.comments}
                    </span>
                    <span className="ml-auto text-xs">{blog.date}</span>
                  </div>
                </CardContent>
              </LivelyCard>
            </Link>
          ))}
        </div>

        {/* Infinite scroll sentinel */}
        {visibleCount < blogs.length && (
          <div ref={sentinelRef} className="flex justify-center py-12">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
