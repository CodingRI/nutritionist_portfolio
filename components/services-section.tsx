"use client"

import { useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Apple, Salad, Activity, Baby, Heart, Dumbbell, ArrowRight } from "lucide-react"

const services = [
  {
    icon: Apple,
    title: "Weight Management",
    description: "Sustainable weight loss or gain plans tailored to your body and lifestyle.",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
    glow: "group-hover:shadow-green-500/10 dark:group-hover:shadow-green-500/20",
    border: "group-hover:border-green-500/30",
  },
  {
    icon: Activity,
    title: "Metabolic Health",
    description: "Address diabetes, cholesterol, and other metabolic conditions naturally.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    glow: "group-hover:shadow-blue-500/10 dark:group-hover:shadow-blue-500/20",
    border: "group-hover:border-blue-500/30",
  },
  {
    icon: Salad,
    title: "Gut Health",
    description: "Improve digestion and heal your gut with targeted nutrition strategies.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    glow: "group-hover:shadow-amber-500/10 dark:group-hover:shadow-amber-500/20",
    border: "group-hover:border-amber-500/30",
  },
  {
    icon: Baby,
    title: "Prenatal Nutrition",
    description: "Comprehensive nutrition support for expecting and new mothers.",
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-500/10",
    glow: "group-hover:shadow-pink-500/10 dark:group-hover:shadow-pink-500/20",
    border: "group-hover:border-pink-500/30",
  },
  {
    icon: Heart,
    title: "Heart Health",
    description: "Heart-healthy eating plans to reduce risk and improve cardiovascular wellness.",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    glow: "group-hover:shadow-red-500/10 dark:group-hover:shadow-red-500/20",
    border: "group-hover:border-red-500/30",
  },
  {
    icon: Dumbbell,
    title: "Sports Nutrition",
    description: "Optimize performance and recovery with athlete-focused nutrition.",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
    glow: "group-hover:shadow-purple-500/10 dark:group-hover:shadow-purple-500/20",
    border: "group-hover:border-purple-500/30",
  },
]

function ServiceCard({
  service,
  index,
}: {
  service: (typeof services)[number]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [6, -6]), {
    stiffness: 300,
    damping: 30,
  })
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-6, 6]), {
    stiffness: 300,
    damping: 30,
  })
  const glareX = useTransform(mouseX, [0, 1], [0, 100])
  const glareY = useTransform(mouseY, [0, 1], [0, 100])
  const glareGradient = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.08) 0%, transparent 60%)`
  )

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      style={{ perspective: 700 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`group relative h-full rounded-xl bg-card border border-border overflow-hidden
          cursor-pointer transition-all duration-300
          hover:shadow-lg ${service.glow} ${service.border}`}
      >
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: glareGradient }}
        />

        <div className="p-6 flex flex-col h-full">
          <motion.div
            className={`w-14 h-14 rounded-2xl ${service.bg} ${service.color} flex items-center justify-center mb-4`}
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.4 }}
          >
            <service.icon className="h-7 w-7" />
          </motion.div>
          <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
          <p className="text-base text-muted-foreground mb-5">{service.description}</p>
          <a
            href="#"
            className="mt-auto inline-flex items-center text-sm text-primary font-medium group/link hover:underline"
          >
            Learn more
            <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function ServicesSection() {
  return (
    <section id="services" className="relative py-12 overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16 relative"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Services
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4 text-balance">
            How I Can Help You
          </h2>
          <p className="text-muted-foreground">
            From weight management to specialized care, I offer comprehensive nutrition 
            services tailored to your unique health journey.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
