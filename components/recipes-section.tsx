"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { recipes } from "@/lib/recipes-data"
import { RecipeCard } from "./recipe-card"
import Link from "next/link"

export function RecipesSection() {
  const featured = recipes.slice(0, 4)

  return (
    <section id="recipes" className="relative py-12 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Recipes
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-balance">
              Healthy &amp; Delicious
            </h2>
          </div>
          <Link href="/recipes">
            <Button variant="outline" className="rounded-full">
              View All Recipes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {featured.map((recipe, index) => (
            <RecipeCard key={recipe.id} recipe={recipe} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
