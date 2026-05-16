'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Type, FileText, Tag } from 'lucide-react';
import { RoleGuard } from '@/components/role-guard';

export default function WriteBlogPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Nutrition');
  const [excerpt, setExcerpt] = useState('');

  const handlePublish = () => {
    console.log('[v0] Publishing blog:', { title, content, category, excerpt });
  };

  return (
    <RoleGuard 
    allowedRoles={["ADMIN"]}
    fallback = {
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-500">
          You are not authorized to access this page.
        </p>
      </div>
    }>

    <div className="min-h-screen py-20">
      <div className="section-container max-w-4xl">
        {/* Back Button */}
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors mb-8"
          >
          <ArrowLeft size={20} />
          Back to Blogs
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          >
          <h1 className="text-4xl font-serif font-bold text-foreground mb-12">
            Write a New Blog Post
          </h1>

          <div className="space-y-8 bg-card rounded-xl p-8 border border-border">
            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-lg font-medium text-foreground mb-3">
                <Type size={20} />
                Blog Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your blog title..."
                className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-lg font-serif"
                />
              <p className="text-sm text-muted-foreground mt-2">
                Make it descriptive and engaging
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center gap-2 text-lg font-medium text-foreground mb-3">
                <Tag size={20} />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                <option value="Nutrition">Nutrition</option>
                <option value="Wellness">Wellness</option>
                <option value="Health">Health</option>
                <option value="Tips">Tips & Tricks</option>
              </select>
            </div>

            {/* Excerpt */}
            <div>
              <label className="flex items-center gap-2 text-lg font-medium text-foreground mb-3">
                <FileText size={20} />
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Write a brief excerpt that will appear in the blog list..."
                className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
                />
              <p className="text-sm text-muted-foreground mt-2">
                {excerpt.length}/200 characters
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="flex items-center gap-2 text-lg font-medium text-foreground mb-3">
                <FileText size={20} />
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog content here. Use markdown for formatting..."
                className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
                rows={12}
                />
              <p className="text-sm text-muted-foreground mt-2">
                Markdown formatting supported
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-border">
              <button
                onClick={handlePublish}
                disabled={!title || !content}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                >
                Publish Post
              </button>
              <Link href="/blogs" className="btn-secondary flex-1 text-center">
                Cancel
              </Link>
            </div>
          </div>

          {/* Tips */}
          <motion.div
            className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            >
            <h3 className="font-serif text-lg font-bold text-foreground mb-4">
              Tips for Great Blog Posts
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Use clear, engaging language that's easy to understand</li>
              <li>• Structure your content with headers and paragraphs</li>
              <li>• Include practical tips and actionable advice</li>
              <li>• Keep paragraphs short and scannable</li>
              <li>• Proofread before publishing</li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </RoleGuard>
  );
}
