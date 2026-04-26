"use client"

import { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ModalOverlayProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  maxWidth?: string
}

export function ModalOverlay({
  isOpen,
  onClose,
  children,
  maxWidth = "max-w-lg",
}: ModalOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] ${maxWidth} -translate-x-1/2 -translate-y-1/2`}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
