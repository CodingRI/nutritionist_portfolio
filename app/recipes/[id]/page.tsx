'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart,
  Share2,
  Clock,
  Users,
  Flame,
  ArrowLeft,
  ChefHat,
  List,
  Printer,
} from 'lucide-react';
import { getRecipeById, getDifficultyColor } from '@/lib/recipes-data';
import { Button } from '@/components/ui/button';

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { id } = use(params);
  const recipe = getRecipeById(Number(id));
  const [liked, setLiked] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Recipe not found</p>
        <Link href="/recipes">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Button>
        </Link>
      </div>
    );
  }

  const totalTime = recipe.prepTime + recipe.cookTime;

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen py-12">
      <div className="section-container max-w-4xl">
        {/* Back */}
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Recipes
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Hero image */}
          <div className="relative rounded-2xl overflow-hidden mb-8 aspect-[2/1]">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${getDifficultyColor(recipe.difficulty)}`}
              >
                {recipe.difficulty}
              </span>
              <h1 className="text-2xl md:text-4xl font-serif font-bold text-white mb-2">
                {recipe.title}
              </h1>
              <p className="text-white/80 text-sm md:text-base max-w-xl">
                {recipe.description}
              </p>
            </div>
          </div>

          {/* Quick stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Clock, label: "Total Time", value: `${totalTime} min` },
              { icon: Users, label: "Servings", value: `${recipe.servings}` },
              { icon: Flame, label: "Calories", value: `${recipe.calories}` },
              { icon: ChefHat, label: "Prep", value: `${recipe.prepTime} min` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 p-4 rounded-xl bg-card border border-border text-center"
              >
                <stat.icon className="h-5 w-5 text-primary mb-1" />
                <span className="text-lg font-semibold text-foreground">
                  {stat.value}
                </span>
                <span className="text-xs text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mb-10">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setLiked(!liked)}
            >
              <Heart
                className={`mr-1.5 h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`}
              />
              {recipe.likes + (liked ? 1 : 0)}
            </Button>
            <Button variant="outline" size="sm" className="rounded-full">
              <Share2 className="mr-1.5 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="rounded-full">
              <Printer className="mr-1.5 h-4 w-4" />
              Print
            </Button>
            <div className="flex gap-2 ml-auto">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Ingredients sidebar */}
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
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={checkedIngredients.includes(i)}
                        onChange={() => toggleIngredient(i)}
                        className="mt-1 h-4 w-4 rounded border-border accent-primary cursor-pointer"
                      />
                      <label
                        onClick={() => toggleIngredient(i)}
                        className={`cursor-pointer text-sm leading-snug ${
                          checkedIngredients.includes(i)
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        <span className="font-medium">{ing.amount}</span>{" "}
                        {ing.unit && <span className="text-muted-foreground">{ing.unit}</span>}{" "}
                        {ing.item}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Instructions + Nutrition */}
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
                      <p className="text-foreground pt-1 leading-relaxed">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Nutrition */}
              <div>
                <h3 className="text-lg font-serif font-bold text-foreground mb-4">
                  Nutrition per Serving
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(recipe.nutrients).map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-center"
                    >
                      <p className="text-2xl font-bold text-primary mb-0.5">
                        {value as string}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {key}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              {recipe.tips.length > 0 && (
                <div className="rounded-xl bg-accent/5 border border-accent/15 p-6">
                  <h3 className="font-serif font-bold text-foreground mb-3">
                    Chef&apos;s Tips
                  </h3>
                  <ul className="space-y-2">
                    {recipe.tips.map((tip, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex gap-2"
                      >
                        <span className="text-primary shrink-0">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
