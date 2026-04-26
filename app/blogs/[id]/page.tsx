'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart,
  Share2,
  MessageCircle,
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Send,
  ThumbsUp,
} from 'lucide-react';
import { getBlogById } from '@/lib/blogs-data';
import { Button } from '@/components/ui/button';

interface BlogDetailPageProps {
  params: Promise<{ id: string }>;
}

interface Comment {
  id: number;
  name: string;
  avatar: string | null;
  date: string;
  text: string;
  likes: number;
}

const SAMPLE_COMMENTS: Comment[] = [
  {
    id: 1,
    name: 'Ananya Sharma',
    avatar: null,
    date: '2 days ago',
    text: 'This was super helpful! I\'ve been looking for clear, science-backed advice on this topic. Bookmarked for future reference.',
    likes: 8,
  },
  {
    id: 2,
    name: 'James Carter',
    avatar: null,
    date: '4 days ago',
    text: 'Great breakdown! I started implementing some of these tips last week and already feel a noticeable difference in my energy levels.',
    likes: 14,
  },
  {
    id: 3,
    name: 'Priya Menon',
    avatar: null,
    date: '1 week ago',
    text: 'I appreciate how practical this guide is — no gimmicks, just solid advice. Would love to see a follow-up article going deeper on the science.',
    likes: 5,
  },
];

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id } = use(params);
  const blog = getBlogById(Number(id));
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>(SAMPLE_COMMENTS);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [likedComments, setLikedComments] = useState<number[]>([]);

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Blog post not found</p>
        <Link href="/blogs">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Button>
        </Link>
      </div>
    );
  }

  const paragraphs = blog.content.split('\n\n');

  function handleAddComment() {
    const name = commentName.trim();
    const text = commentText.trim();
    if (!name || !text) return;
    setComments((prev) => [
      {
        id: Date.now(),
        name,
        avatar: null,
        date: 'Just now',
        text,
        likes: 0,
      },
      ...prev,
    ]);
    setCommentName('');
    setCommentText('');
  }

  function toggleCommentLike(commentId: number) {
    setLikedComments((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId]
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="section-container max-w-3xl">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Hero image */}
          <div className="relative rounded-2xl overflow-hidden mb-8 aspect-[2/1]">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/80 text-primary-foreground text-xs font-medium mb-3">
                {blog.category}
              </span>
              <h1 className="text-2xl md:text-4xl font-serif font-bold text-white leading-tight">
                {blog.title}
              </h1>
            </div>
          </div>

          {/* Meta bar */}
          <div className="flex flex-wrap items-center gap-6 mb-10 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {blog.author}
                </p>
                <p className="text-xs text-muted-foreground">Author</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {blog.date}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {blog.readTime}
            </div>
          </div>

          {/* Content */}
          <div className="mb-12 space-y-4">
            {paragraphs.map((paragraph, i) => {
              const trimmed = paragraph.trim();
              if (trimmed.startsWith('## ')) {
                return (
                  <h2
                    key={i}
                    className="text-xl font-serif font-bold text-foreground mt-8 mb-2"
                  >
                    {trimmed.replace('## ', '')}
                  </h2>
                );
              }
              if (trimmed.startsWith('- ')) {
                const items = trimmed
                  .split('\n')
                  .filter((l) => l.startsWith('- '));
                return (
                  <ul key={i} className="space-y-1.5 ml-1">
                    {items.map((item, j) => (
                      <li
                        key={j}
                        className="text-foreground leading-relaxed flex gap-2"
                        dangerouslySetInnerHTML={{
                          __html: `<span class="text-primary shrink-0">•</span><span>${item
                            .replace(/^- /, '')
                            .replace(
                              /\*\*(.*?)\*\*/g,
                              '<strong>$1</strong>'
                            )}</span>`,
                        }}
                      />
                    ))}
                  </ul>
                );
              }
              if (/^\d+\. /.test(trimmed)) {
                const items = trimmed
                  .split('\n')
                  .filter((l) => /^\d+\. /.test(l));
                return (
                  <ol key={i} className="space-y-1.5 ml-1">
                    {items.map((item, j) => (
                      <li
                        key={j}
                        className="text-foreground leading-relaxed flex gap-2"
                      >
                        <span className="text-primary font-semibold shrink-0">
                          {j + 1}.
                        </span>
                        <span>{item.replace(/^\d+\.\s*/, '')}</span>
                      </li>
                    ))}
                  </ol>
                );
              }
              return (
                <p key={i} className="text-foreground leading-relaxed">
                  {trimmed}
                </p>
              );
            })}
          </div>

          {/* Engagement bar — bottom */}
          <div className="flex items-center gap-3 py-6 border-t border-b border-border mb-10">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setLiked(!liked)}
            >
              <Heart
                className={`mr-1.5 h-4 w-4 transition-colors ${
                  liked ? 'fill-red-500 text-red-500' : ''
                }`}
              />
              {blog.likes + (liked ? 1 : 0)}
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <a href="#comments">
                <MessageCircle className="mr-1.5 h-4 w-4" />
                {comments.length} Comments
              </a>
            </Button>
            <Button variant="outline" size="sm" className="rounded-full ml-auto">
              <Share2 className="mr-1.5 h-4 w-4" />
              Share
            </Button>
          </div>

          {/* Comments */}
          <section id="comments" className="space-y-8">
            <h3 className="text-xl font-serif font-bold text-foreground">
              Comments ({comments.length})
            </h3>

            {/* Comment form */}
            <div className="p-5 bg-card rounded-xl border border-border space-y-4">
              <h4 className="font-medium text-foreground text-sm">
                Join the conversation
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="px-3 py-2.5 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  className="px-3 py-2.5 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <textarea
                placeholder="Share your thoughts..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                rows={4}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={handleAddComment}
                  disabled={!commentName.trim() || !commentText.trim()}
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Post Comment
                </Button>
              </div>
            </div>

            {/* Comment list */}
            <div className="space-y-6">
              {comments.map((comment) => {
                const isLiked = likedComments.includes(comment.id);
                return (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {comment.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm text-foreground">
                          {comment.name}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {comment.date}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                        {comment.text}
                      </p>
                      <button
                        onClick={() => toggleCommentLike(comment.id)}
                        className={`inline-flex items-center gap-1 text-xs transition-colors ${
                          isLiked
                            ? 'text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {comment.likes + (isLiked ? 1 : 0)}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </motion.article>
      </div>
    </div>
  );
}
