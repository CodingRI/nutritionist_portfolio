"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight } from "lucide-react"
import { BookingModal } from "./booking-modal"

export function CTASection() {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <>
      <section className="relative py-12 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative overflow-hidden rounded-3xl bg-primary p-8 md:p-16 cursor-default"
          >
            <div
              className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full
                -translate-y-1/2 translate-x-1/2
                transition-all duration-700 ease-out
                group-hover:w-80 group-hover:h-80"
            />
            <div
              className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full
                translate-y-1/2 -translate-x-1/2
                transition-all duration-700 ease-out
                group-hover:w-64 group-hover:h-64"
            />
            
            <div className="relative z-10 max-w-2xl mx-auto text-center">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium mb-6"
              >
                Start Your Journey
              </motion.span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-primary-foreground mb-6 text-balance">
                Ready to Transform Your Health?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 leading-relaxed">
                Take the first step towards a healthier, happier you. Book a free 
                consultation and let&apos;s create a personalized plan together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full group/btn"
                  onClick={() => setBookingOpen(true)}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Appointment
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 group/btn"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  )
}
