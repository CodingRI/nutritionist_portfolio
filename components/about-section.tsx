"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import Image from "next/image"
import { Heart, Sparkles, Users, Award } from "lucide-react"
import { useRef } from "react"

const values = [
  {
    icon: Heart,
    title: "Holistic Approach",
    description: "I believe in treating the whole person, not just symptoms.",
    gradient: "from-rose-500/20 to-orange-500/20 dark:from-rose-500/10 dark:to-orange-500/10",
    iconColor: "text-rose-500",
  },
  {
    icon: Sparkles,
    title: "Science-Based",
    description: "All recommendations are grounded in the latest research.",
    gradient: "from-amber-500/20 to-yellow-500/20 dark:from-amber-500/10 dark:to-yellow-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: Users,
    title: "Personalized Care",
    description: "Every plan is tailored to your unique needs and goals.",
    gradient: "from-blue-500/20 to-cyan-500/20 dark:from-blue-500/10 dark:to-cyan-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Award,
    title: "Certified Expert",
    description: "Licensed nutritionist with years of clinical experience.",
    gradient: "from-emerald-500/20 to-green-500/20 dark:from-emerald-500/10 dark:to-green-500/10",
    iconColor: "text-emerald-500",
  },
]

function ValueCard({
  value,
  index,
}: {
  value: (typeof values)[number]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [5, -5]), {
    stiffness: 300,
    damping: 30,
  })
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-5, 5]), {
    stiffness: 300,
    damping: 30,
  })

  function handleMouseMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }

  function handleMouseLeave() {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      style={{ perspective: 600 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="group relative flex items-start gap-3 p-4 rounded-xl bg-card border border-border
          hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5
          dark:hover:shadow-primary/10 transition-all duration-300 cursor-default"
      >
        <div
          className={`absolute inset-0 rounded-xl bg-gradient-to-br ${value.gradient} opacity-0
            group-hover:opacity-100 transition-opacity duration-300 -z-10`}
        />

        <motion.div
          className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 ${value.iconColor}`}
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <value.icon className="h-5 w-5" />
        </motion.div>
        <div>
          <h3 className="font-medium text-sm mb-1">{value.title}</h3>
          <p className="text-xs text-muted-foreground">{value.description}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function AboutSection() {
  return (
    <section id="about" className="relative py-12 bg-secondary/30 overflow-hidden">

        
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="aspect-square max-w-lg mx-auto relative group">
              <motion.div
                className="absolute inset-8 bg-primary/10 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                style={{ borderRadius: "42% 58% 54% 46% / 48% 44% 56% 52%" }}
              />
              <motion.div
                className="absolute inset-4 bg-primary/5 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                style={{ borderRadius: "54% 46% 42% 58% / 56% 52% 48% 44%" }}
              />
              <div className="relative h-full rounded-full overflow-hidden border-4 border-card shadow-xl">
                <Image
                  src="/images/nutritionist.png"
                  alt="About the nutritionist"
                  fill
                  className="object-cover"
                />
              </div>

            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              About Me
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6 text-balance">
              Passionate About Helping You{" "}
              <span className="text-primary">Thrive</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
              <p>
                My journey into nutrition began with a simple belief: food is medicine. 
                After witnessing how proper nutrition transformed lives, I dedicated my 
                career to helping others discover the power of mindful eating.
              </p>
              <p>
                With over 8 years of experience, I&apos;ve helped hundreds of clients 
                achieve their health goals through personalized nutrition plans, 
                compassionate guidance, and sustainable lifestyle changes.
              </p>
              <p>
                Whether you&apos;re looking to manage a health condition, lose weight, 
                or simply feel more energized, I&apos;m here to support you every step 
                of the way.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {values.map((value, index) => (
                <ValueCard key={value.title} value={value} index={index} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
