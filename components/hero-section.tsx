"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { BookingModal } from "./booking-modal";

export function HeroSection() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), {
    stiffness: 200,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), {
    stiffness: 200,
    damping: 25,
  });
  const imageScale = useSpring(1, { stiffness: 300, damping: 30 });
  const glowOpacity = useSpring(0, { stiffness: 300, damping: 30 });

  function handleImageMouseMove(e: React.MouseEvent) {
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  function handleImageEnter() {
    imageScale.set(1.03);
    glowOpacity.set(1);
  }

  function handleImageLeave() {
    mouseX.set(0.5);
    mouseY.set(0.5);
    imageScale.set(1);
    glowOpacity.set(0);
  }

  return (
    <>
      <section
        id="home"
        className="relative min-h-[calc(100vh-5rem)] pb-8 flex items-center overflow-hidden"
      >
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="order-2 lg:order-1"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
              >
                Your Wellness Partner
              </motion.span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight text-balance mb-6">
                Welcome to Your{" "}
                <span className="text-primary">Wellness Journey</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Hi, I&apos;m here to guide you towards a healthier, happier you.
                Together, we&apos;ll create personalized nutrition plans that
                fit your lifestyle and help you achieve your wellness goals
                naturally.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full group">
                  Explore Services
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setBookingOpen(true)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Consultation
                </Button>
              </div>

              <div className="flex items-center gap-8 mt-10 pt-6 border-t border-border">
                <div>
                  <p className="text-3xl font-serif font-semibold text-primary">
                    500+
                  </p>
                  <p className="text-sm text-muted-foreground">Happy Clients</p>
                </div>
                <div>
                  <p className="text-3xl font-serif font-semibold text-primary">
                    8+
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Years Experience
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-serif font-semibold text-primary">
                    50+
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Recipes Shared
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="order-1 lg:order-2 relative"
              style={{ perspective: 900 }}
            >
              <motion.div
                ref={imageRef}
                onMouseMove={handleImageMouseMove}
                onMouseEnter={handleImageEnter}
                onMouseLeave={handleImageLeave}
                style={{
                  rotateX,
                  rotateY,
                  scale: imageScale,
                  transformStyle: "preserve-3d",
                }}
                className="relative aspect-[4/5] max-w-md mx-auto cursor-pointer"
              >
                <motion.div
                  className="absolute inset-0 bg-primary/20 rounded-[2rem] rotate-3"
                  style={{ transform: "translateZ(-20px) rotate(3deg)" }}
                />
                <motion.div
                  className="absolute inset-0 bg-primary/10 rounded-[2rem] -rotate-3"
                  style={{ transform: "translateZ(-10px) rotate(-3deg)" }}
                />
                <div className="relative h-full rounded-[2rem] overflow-hidden shadow-2xl">
                  <Image
                    src="/images/nutritionist.png"
                    alt="Nutritionist portrait"
                    fill
                    className="object-cover"
                    priority
                  />
                  <motion.div
                    className="absolute inset-0 rounded-[2rem] pointer-events-none"
                    style={{
                      opacity: glowOpacity,
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(107,142,62,0.15) 0%, transparent 70%)",
                    }}
                  />
                </div>

                <motion.div
                  className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-primary/20 dark:bg-primary/10 blur-xl pointer-events-none"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute -top-2 -left-2 w-12 h-12 rounded-full bg-accent/20 dark:bg-accent/10 blur-xl pointer-events-none"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </>
  );
}
