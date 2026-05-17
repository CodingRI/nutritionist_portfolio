"use client";

// app/recipes/[id]/page.tsx
// All data from /api/recipes/[id] — real likes, real comments, view counter.
// Ingredients stored as JSON strings in Prisma String[] — parsed with parseIngredient().

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart, Share2, Clock, Flame, ChefHat,
  ArrowLeft, List, Printer, Send, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { PageLoader } from "@/components/ui/page-loader";
import type { RecipeDetail, RecipeComment } from "@/types/recipe";
import { parseIngredient } from "@/types/recipe";

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { id } = use(params);
  const { isSignedIn, user } = useUser();

  const [recipe,        setRecipe]        = useState<RecipeDetail | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [notFound,      setNotFound]      = useState(false);

  const [liked,         setLiked]         = useState(false);
  const [likeCount,     setLikeCount]     = useState(0);
  const [liking,        setLiking]        = useState(false);

  const [comments,      setComments]      = useState<RecipeComment[]>([]);
  const [commentText,   setCommentText]   = useState("");
  const [submitting,    setSubmitting]    = useState(false);
  const [commentError,  setCommentError]  = useState("");

  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);

  // ── Fetch recipe ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`/api/recipes/${id}`);
        const data = await res.json();

        if (!data.success) { setNotFound(true); return; }

        setRecipe(data.recipe);
        setLiked(data.recipe.likedByMe ?? false);
        setLikeCount(data.recipe._count.likes);
        setComments(data.recipe.comments ?? []);

        // Increment view count silently
        fetch(`/api/recipes/${id}`, { method: "PATCH" });

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
    if (!isSignedIn) { alert("Please sign in to like recipes."); return; }
    if (liking) return;
    setLiking(true);

    const wasLiked = liked;
    setLiked((v) => !v);
    setLikeCount((v) => (wasLiked ? v - 1 : v + 1));

    try {
      const res  = await fetch(`/api/recipes/${id}/like`, { method: "POST" });
      const data = await res.json();
      if (data.success) { setLiked(data.liked); setLikeCount(data.count); }
    } catch {
      setLiked(wasLiked);
      setLikeCount((v) => (wasLiked ? v + 1 : v - 1));
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
      const res  = await fetch(`/api/recipes/${id}/comments`, {
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
    } catch {
      setCommentError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const toggleIngredient = (i: number) =>
    setCheckedIngredients((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );

  function formatRelative(iso: string) {
    const diff  = Date.now() - new Date(iso).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 1)  return "Just now";
    if (mins  < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days  < 7)  return `${days}d ago`;
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  function difficultyClass(d: string) {
    if (d === "Easy")   return "bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-400";
    if (d === "Medium") return "bg-amber-100  text-amber-800  dark:bg-amber-900/30  dark:text-amber-400";
    if (d === "Hard")   return "bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400";
    return "bg-muted text-muted-foreground";
  }

  // Extract difficulty from dietaryTags
  const difficultyTag = recipe?.dietaryTags.find((t) =>
    ["Easy", "Medium", "Hard"].includes(t)
  ) ?? "Easy";

  const totalTime =
    (recipe?.preparationTime ?? 0) + (recipe?.cookingTime ?? 0);

  // ── States ──────────────────────────────────────────────────────────────────
  if (loading) return <PageLoader inline label="Loading recipe…" />;

  if (notFound || !recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Recipe not found</p>
        <Link href="/recipes">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Recipes
          </Button>
        </Link>
      </div>
    );
  }

  const parsedIngredients = recipe.ingredients.map(parseIngredient);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-12">
      <div className="section-container max-w-4xl">

        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Recipes
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Hero */}
          <div className="relative rounded-2xl overflow-hidden mb-8 aspect-[2/1]">
            <img
              src={recipe.coverImage ?? "/placeholder.jpg"}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${difficultyClass(difficultyTag)}`}>
                {difficultyTag}
              </span>
              <h1 className="text-2xl md:text-4xl font-serif font-bold text-white mb-2">
                {recipe.title}
              </h1>
              {recipe.description && (
                <p className="text-white/80 text-sm md:text-base max-w-xl">
                  {recipe.description}
                </p>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Clock,   label: "Total Time", value: totalTime > 0 ? `${totalTime} min` : "—" },
              { icon: Flame,   label: "Calories",   value: recipe.calories  ? `${recipe.calories}` : "—" },
              { icon: ChefHat, label: "Prep",       value: recipe.preparationTime ? `${recipe.preparationTime} min` : "—" },
              { icon: ChefHat, label: "Cook",       value: recipe.cookingTime     ? `${recipe.cookingTime} min`     : "—" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 p-4 rounded-xl bg-card border border-border text-center"
              >
                <stat.icon className="h-5 w-5 text-primary mb-1" />
                <span className="text-lg font-semibold text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mb-10 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={handleLike}
              disabled={liking}
            >
              <Heart className={`mr-1.5 h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
              {likeCount}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => navigator.clipboard.writeText(window.location.href)}
            >
              <Share2 className="mr-1.5 h-4 w-4" /> Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => window.print()}
            >
              <Printer className="mr-1.5 h-4 w-4" /> Print
            </Button>
            <div className="flex gap-2 ml-auto flex-wrap">
              {recipe.dietaryTags
                .filter((t) => !["Easy", "Medium", "Hard"].includes(t))
                .map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {tag}
                  </span>
                ))}
            </div>
          </div>

          {/* Main grid: ingredients | instructions + nutrition */}
          <div className="grid md:grid-cols-3 gap-8">

            {/* Ingredients */}
            <motion.div
              className="md:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-card rounded-xl p-6 border border-border sticky top-24">
                <h2 className="flex items-center gap-2 text-lg font-serif font-bold text-foreground mb-5">
                  <List className="h-5 w-5 text-primary" />
                  Ingredients
                </h2>
                <ul className="space-y-3">
                  {parsedIngredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={checkedIngredients.includes(i)}
                        onChange={() => toggleIngredient(i)}
                        className="mt-1 h-4 w-4 rounded border-border accent-primary cursor-pointer"
                      />
                      <label
                        onClick={() => toggleIngredient(i)}
                        className={`cursor-pointer text-sm leading-snug select-none ${
                          checkedIngredients.includes(i)
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        <span className="font-medium">{ing.amount}</span>{" "}
                        {ing.unit && <span className="text-muted-foreground">{ing.unit} </span>}
                        {ing.item}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Instructions + nutrition + comments */}
            <motion.div
              className="md:col-span-2 space-y-10"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Instructions */}
              <div>
                <h2 className="flex items-center gap-2 text-xl font-serif font-bold text-foreground mb-6">
                  <ChefHat className="h-6 w-6 text-primary" />
                  Instructions
                </h2>
                <ol className="space-y-5">
                  {recipe.instructions.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                          {i + 1}
                        </div>
                      </div>
                      <p className="text-foreground pt-1 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Nutrition */}
              {recipe.calories != null && (
                <div>
                  <h3 className="text-lg font-serif font-bold text-foreground mb-4">Nutrition per Serving</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Calories",    value: `${recipe.calories} kcal` },
                      { label: "Prep time",   value: recipe.preparationTime ? `${recipe.preparationTime} min` : "—" },
                      { label: "Cook time",   value: recipe.cookingTime     ? `${recipe.cookingTime} min`     : "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-center">
                        <p className="text-2xl font-bold text-primary mb-0.5">{value}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              <section id="comments" className="space-y-6">
                <h3 className="text-xl font-serif font-bold text-foreground">
                  Comments ({comments.length})
                </h3>

                {/* Comment form */}
                <div className="p-5 bg-card rounded-xl border border-border space-y-4">
                  {isSignedIn ? (
                    <>
                      <div className="flex items-center gap-3 mb-1">
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
                          placeholder="Share your experience with this recipe…"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                          rows={3}
                        />
                        {commentError && <p className="text-sm text-red-500">{commentError}</p>}
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            size="sm"
                            className="rounded-full"
                            disabled={submitting || !commentText.trim()}
                          >
                            {submitting
                              ? <Loader2 size={14} className="mr-1.5 animate-spin" />
                              : <Send className="mr-1.5 h-3.5 w-3.5" />}
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
                      to share your thoughts
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
                          <span className="text-xs text-muted-foreground">{formatRelative(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      No comments yet. Be the first to try this recipe!
                    </p>
                  )}
                </div>
              </section>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}