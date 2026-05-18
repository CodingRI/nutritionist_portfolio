"use client"

import { motion } from "framer-motion"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"

const testimonials = [
  {
    quote: "Working with her changed my relationship with food completely. The personalized approach made all the difference. I finally feel in control of my health!",
    name: "Sarah Johnson",
    title: "Lost 30 lbs",
  },
  {
    quote: "My A1C levels dropped significantly within months. The meal plans were easy to follow and actually delicious. I couldn't be more grateful.",
    name: "Michael Chen",
    title: "Managed Diabetes",
  },
  {
    quote: "She guided me through my entire pregnancy with such care and expertise. Both my baby and I are healthy thanks to her wonderful support.",
    name: "Emily Rodriguez",
    title: "Prenatal Client",
  },
  {
    quote: "My performance improved dramatically after following the sports nutrition plan. Recovery is faster and I have more energy during training.",
    name: "David Kim",
    title: "Athlete",
  },
  {
    quote: "The nutrition coaching helped me manage my IBS symptoms naturally. I have more energy and feel so much better than before.",
    name: "Jessica Lee",
    title: "Gut Health Success",
  },
]

export function TestimonialsSection() {
  return (
    <section className="relative py-12 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4 text-balance">
            What My Clients Say
          </h2>
          <p className="text-muted-foreground">
            Real stories from real people who transformed their health with personalized nutrition guidance.
          </p>
        </motion.div>

        <InfiniteMovingCards
          items={testimonials}
          direction="right"
          speed="slow"
          className="max-w-full"
        />
      </div>
    </section>
  )
}
