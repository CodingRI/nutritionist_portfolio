"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, Clock, Users, Flame, ArrowRight } from "lucide-react"
import { type Recipe, getDifficultyColor } from "@/lib/recipes-data"
import { useState } from "react"

interface RecipeCardProps {
  recipe: Recipe
  index?: number
}

export function RecipeCard({ recipe, index = 0 }: RecipeCardProps) {
  const [liked, setLiked] = useState(false)
  const totalTime = recipe.prepTime + recipe.cookTime

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Link href={`/recipes/${recipe.id}`} className="block group">
        <div
          className="flex flex-col sm:flex-row sm:h-56 bg-card rounded-xl border border-border overflow-hidden
            transition-shadow duration-300 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5"
        >
          {/* Image — fixed height, fills card on desktop */}
          <div className="h-48 sm:h-full sm:w-56 md:w-64 flex-shrink-0 overflow-hidden">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 flex-1 flex flex-col min-w-0">
            <div className="flex items-start gap-2 mb-1.5">
              <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1">
                {recipe.title}
              </h3>
              <span
                className={`shrink-0 mt-0.5 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase ${getDifficultyColor(recipe.difficulty)}`}
              >
                {recipe.difficulty}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {recipe.description}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {totalTime} min
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {recipe.servings} servings
              </span>
              <span className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5" />
                {recipe.calories} cal
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-border">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setLiked((l) => !l)
                }}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Heart
                  className={`h-4 w-4 transition-transform hover:scale-125 ${
                    liked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                <span className="text-xs">
                  {recipe.likes + (liked ? 1 : 0)}
                </span>
              </button>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
