'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { recipes } from '@/lib/recipes-data';
import { RecipeCard } from '@/components/recipe-card';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'] as const;

export default function RecipesPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const filtered =
    selectedDifficulty === 'All'
      ? recipes
      : recipes.filter((r) => r.difficulty === selectedDifficulty);

  return (
    <div className="min-h-screen py-20">
      <div className="section-container">
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
          <Link
            href="/recipes/create"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Share Your Recipe
          </Link>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="flex justify-center gap-3 mb-12 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDifficulty(d)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedDifficulty === d
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-primary/10'
              }`}
            >
              {d}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((recipe, index) => (
            <RecipeCard key={recipe.id} recipe={recipe} index={index} />
          ))}
        </div>

        {filtered.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-lg text-muted-foreground">
              No recipes found for the selected difficulty level.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
