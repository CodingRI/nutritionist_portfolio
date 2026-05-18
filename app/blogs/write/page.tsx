"use client";

// app/blogs/write/page.tsx
// Admin-only blog creation page.
// Synced with /api/blogs POST — sends: title, content, excerpt, tags[], coverImage, isPublished

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Type, FileText, Tag, Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { RoleGuard } from "@/components/role-guard";
import { useRouter } from "next/navigation";

const CATEGORY_OPTIONS = ["Nutrition", "Wellness", "Health", "Tips & Tricks", "Recipes", "Lifestyle"];

export default function WriteBlogPage() {
  const router = useRouter();

  const [title,       setTitle]       = useState("");
  const [content,     setContent]     = useState("");
  const [excerpt,     setExcerpt]     = useState("");
  const [tags,        setTags]        = useState<string[]>(["Nutrition"]);
  const [tagInput,    setTagInput]    = useState("");

  // Cover image — either a URL typed in or a file uploaded
  const [coverUrl,    setCoverUrl]    = useState("");   // URL mode
  const [coverFile,   setCoverFile]   = useState<File | null>(null);
  const [coverPreview,setCoverPreview]= useState("");
  const [imageMode,   setImageMode]   = useState<"url" | "upload">("url");

  const [isPublished, setIsPublished] = useState(true);
  const [isSubmitting,setIsSubmitting]= useState(false);
  const [error,       setError]       = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  // ── Cover image helpers ───────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setCoverFile(null);
    setCoverPreview("");
    setCoverUrl("");
    if (fileRef.current) fileRef.current.value = "";
  };

  // Effective preview
  const previewSrc = imageMode === "upload" ? coverPreview : coverUrl;

  // ── Tag helpers ───────────────────────────────────────────────────────────

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  // ── Publish ───────────────────────────────────────────────────────────────

  const handlePublish = async () => {
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      // If image is a file upload, convert to base64 data URL.
      // In production you'd upload to S3/Cloudinary and send the URL back.
      // For now we send the data URL directly — swap for a real upload if needed.
      let finalCoverImage: string | null = null;

      if (imageMode === "upload" && coverFile) {
        finalCoverImage = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload  = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(coverFile);
        });
      } else if (imageMode === "url" && coverUrl.trim()) {
        finalCoverImage = coverUrl.trim();
      }

      const res = await fetch("/api/blogs", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          title,
          content,
          excerpt,
          tags,
          coverImage:  finalCoverImage,
          isPublished,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to publish blog.");
        return;
      }

      router.push(`/blogs/${data.blog.id}`);
      router.refresh();

    } catch (err) {
      console.error("PUBLISH_BLOG_ERROR:", err);
      setError("Something went wrong while publishing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <RoleGuard
      allowedRoles={["ADMIN"]}
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-lg text-red-500">You are not authorised to access this page.</p>
        </div>
      }
    >
      <div className="min-h-screen py-20">
        <div className="section-container max-w-4xl">

          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
          >
            <ArrowLeft size={20} /> Back to Blogs
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
                  <Type size={20} /> Blog Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your blog title…"
                  className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-lg font-serif"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="flex items-center gap-2 text-lg font-medium text-foreground mb-3">
                  <ImageIcon size={20} /> Cover Image
                </label>

                {/* Mode toggle */}
                <div className="flex gap-1 p-1 bg-muted rounded-xl mb-4 w-fit">
                  {(["url", "upload"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setImageMode(m); clearImage(); }}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                        imageMode === m
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m === "url" ? "Paste URL" : "Upload File"}
                    </button>
                  ))}
                </div>

                {imageMode === "url" ? (
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg border border-dashed border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary transition-colors text-sm"
                    >
                      <Upload size={16} /> Choose image file
                    </button>
                  </div>
                )}

                {/* Preview */}
                {previewSrc && (
                  <div className="relative mt-3 rounded-xl overflow-hidden aspect-[2/1] max-w-sm">
                    <img
                      src={previewSrc}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={() => setCoverUrl("")}
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="flex items-center gap-2 text-lg font-medium text-foreground mb-3">
                  <Tag size={20} /> Tags / Category
                </label>

                {/* Quick-add from presets */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => addTag(cat)}
                      disabled={tags.includes(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        tags.includes(cat)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Custom tag input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); } }}
                    placeholder="Custom tag (press Enter)"
                    className="flex-1 px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>

                {/* Selected tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                      >
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="flex items-center gap-2 text-lg font-medium text-foreground mb-3">
                  <FileText size={20} /> Excerpt
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  maxLength={200}
                  placeholder="Write a brief summary shown in the blog list…"
                  className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">{excerpt.length}/200 characters</p>
              </div>

              {/* Content */}
              <div>
                <label className="flex items-center gap-2 text-lg font-medium text-foreground mb-3">
                  <FileText size={20} /> Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Write your blog content here.\n\nMarkdown supported:\n## Heading\n**bold**, _italic_\n- bullet item\n1. numbered item`}
                  className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
                  rows={16}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Markdown formatting supported — ## headings, **bold**, - bullets, 1. numbered
                </p>
              </div>

              {/* Publish toggle */}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isPublished}
                  onClick={() => setIsPublished((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    isPublished ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      isPublished ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isPublished ? "Publish immediately" : "Save as draft"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isPublished
                      ? "Post will be live right away"
                      : "Only you can see this until you publish"}
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-lg">
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={!title.trim() || !content.trim() || isSubmitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-1 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Publishing…</>
                  ) : (
                    isPublished ? "Publish Post" : "Save Draft"
                  )}
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
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use clear, engaging language that's easy to understand</li>
                <li>• Structure your content with ## headings and paragraphs</li>
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