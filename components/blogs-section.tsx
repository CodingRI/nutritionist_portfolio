"use client"

import { motion } from "framer-motion"
import { CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, ArrowRight, Clock } from "lucide-react"
import { LivelyCard } from "@/components/ui/lively-card"
import { blogs } from "@/lib/blogs-data"
import Link from "next/link"
import { FloatingEmoji } from "@/components/floating-emoji"

export function BlogsSection() {
  const featured = blogs.slice(0, 3)

  return (
    <section id="blogs" className="relative py-12 overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Blog
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-balance">
              Latest Articles
            </h2>
          </div>
          <Link href="/blogs">
            <Button variant="outline" className="rounded-full">
              View All Posts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((blog, index) => (
            <Link key={blog.id} href={`/blogs/${blog.id}`} className="block h-full">
              <LivelyCard
                image={blog.image}
                imageAlt={blog.title}
                aspectRatio="aspect-[16/10]"
                index={index}
              >
                <CardContent className="p-4 pt-3 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span>{blog.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {blog.readTime}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
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
                  </div>
                </CardContent>
              </LivelyCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
