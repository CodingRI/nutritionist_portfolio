"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Calendar, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModalOverlay } from "@/components/ui/modal-overlay"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      onClose()
    }, 2000)
  }

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold">Book Appointment</h2>
              <p className="text-sm text-muted-foreground">Fill in your details below</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Request Submitted!</h3>
              <p className="text-muted-foreground">
                I&apos;ll get back to you within 24 hours.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" placeholder="25" min="1" max="120" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input id="height" type="number" placeholder="170" min="50" max="300" required />
                </div>
              </div>

              <Button type="submit" className="w-full rounded-full" size="lg">
                Request Appointment
              </Button>
            </form>
          )}
        </div>
      </div>
    </ModalOverlay>
  )
}
