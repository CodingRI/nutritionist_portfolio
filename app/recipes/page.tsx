"use client";

// app/recipes/page.tsx
// Fetches recipes from /api/recipes. Difficulty filter, skeleton loading.

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Clock, Flame, ChefHat, Plus, Loader2 } from "lucide-react";
import { RoleGuard } from "@/components/role-guard";
import { BlogGridSkeleton } from "@/components/ui/page-loader";
import type { RecipeListItem } from "@/types/recipe";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"] as const;

// Difficulty badge colour — matches your existing getDifficultyColor utility
function difficultyClass(d: string) {
  if (d === "Easy")   return "bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-400";
  if (d === "Medium") return "bg-amber-100  text-amber-800  dark:bg-amber-900/30  dark:text-amber-400";
  if (d === "Hard")   return "bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400";
  return "bg-muted text-muted-foreground";
}

export default function RecipesPage() {
  const [recipes,    setRecipes]    = useState<RecipeListItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [difficulty, setDifficulty] = useState<string>("All");

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch("/api/recipes");
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        setRecipes(data.recipes);
      } catch (e) {
        setError("Failed to load recipes. Please try again.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Difficulty filter runs client-side on the already-fetched list
  // "Easy" | "Medium" | "Hard" is stored in dietaryTags[0] per our create page convention.
  // Actually difficulty is NOT in the Prisma schema — we store it in dietaryTags.
  // Convention: first dietaryTag starting with "Easy"/"Medium"/"Hard" is the difficulty.
  function getDifficulty(recipe: RecipeListItem) {
    return recipe.dietaryTags.find((t) =>
      ["Easy", "Medium", "Hard"].includes(t)
    ) ?? "Easy";
  }

  const filtered =
    difficulty === "All"
      ? recipes
      : recipes.filter((r) => getDifficulty(r) === difficulty);

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
            Healthy Recipes
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Delicious, nutritious recipes designed to support your wellness goals
          </p>
          <RoleGuard allowedRoles={["ADMIN"]}>
            <Link
              href="/recipes/create"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={20} /> Share a Recipe
            </Link>
          </RoleGuard>
        </motion.div>

        {/* Difficulty filter */}
        <motion.div
          className="flex justify-center gap-3 mb-12 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                difficulty === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-primary/10"
              }`}
            >
              {d}
            </button>
          ))}
        </motion.div>

        {error && (
          <p className="text-center text-red-500 py-10">{error}</p>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="grid md:grid-cols-2 gap-6">
            <BlogGridSkeleton count={4} />
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/recipes/${recipe.id}`} className="block group">
                  <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300">

                    {/* Image */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={recipe.coverImage ?? "/placeholder.jpg"}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span
                        className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${difficultyClass(getDifficulty(recipe))}`}
                      >
                        {getDifficulty(recipe)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {recipe.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {recipe.description ?? ""}
                      </p>

                      {/* Stats row */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {recipe.preparationTime != null && recipe.cookingTime != null && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {recipe.preparationTime + recipe.cookingTime} min
                          </span>
                        )}
                        {recipe.calories != null && (
                          <span className="flex items-center gap-1">
                            <Flame className="h-3.5 w-3.5" />
                            {recipe.calories} kcal
                          </span>
                        )}
                        <span className="flex items-center gap-1 ml-auto">
                          <Heart className="h-3.5 w-3.5" />
                          {recipe._count.likes}
                        </span>
                      </div>

                      {/* Dietary tags (skip difficulty tag) */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {recipe.dietaryTags
                          .filter((t) => !["Easy", "Medium", "Hard"].includes(t))
                          .slice(0, 3)
                          .map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-lg text-muted-foreground">
              {recipes.length === 0
                ? "No recipes yet — check back soon!"
                : `No ${difficulty.toLowerCase()} recipes found.`}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}