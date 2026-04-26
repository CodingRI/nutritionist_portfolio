"use client"

import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { ServicesSection } from "@/components/services-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { BlogsSection } from "@/components/blogs-section"
import { RecipesSection } from "@/components/recipes-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { ChatWidget } from "@/components/chat-widget"

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <TestimonialsSection />
      <BlogsSection />
      <RecipesSection />
      <CTASection />
      <Footer />
      <ChatWidget />
    </>
  )
}
