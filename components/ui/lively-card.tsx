"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"

interface LivelyCardProps {
  image: string
  imageAlt: string
  aspectRatio?: string
  imageOverlay?: ReactNode
  children: ReactNode
  className?: string
  index?: number
}

export function LivelyCard({
  image,
  imageAlt,
  aspectRatio = "aspect-[16/10]",
  imageOverlay,
  children,
  className = "",
  index = 0,
}: LivelyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="h-full"
    >
      <div
        className={`group h-full flex flex-col cursor-pointer rounded-xl border border-border
          bg-card text-card-foreground overflow-hidden
          transition-shadow duration-300 hover:shadow-lg
          hover:shadow-black/5 dark:hover:shadow-white/5
          ${className}`}
      >
        <div className="p-4 pb-0">
          <div className={`${aspectRatio} overflow-hidden relative rounded-lg`}>
            <img
              src={image}
              alt={imageAlt}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
            {imageOverlay}
          </div>
        </div>
        <div className="flex flex-col flex-1">{children}</div>
      </div>
    </motion.div>
  )
}
