"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, Leaf } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import AuthModal from "./auth-modal";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "/blogs", label: "Blogs" },
  { href: "/recipes", label: "Recipes" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    type: "login" | "signup";
  }>({
    isOpen: false,
    type: "login",
  });
  const { theme, setTheme } = useTheme();

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border"
      >
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-serif text-xl font-semibold text-foreground">
              NourishWell
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setAuthModal({ isOpen: true, type: "login" })}
            >
              Sign In
            </Button>
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => setAuthModal({ isOpen: true, type: "signup" })}
            >
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-full"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-background border-b border-border"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-full"
                    onClick={() => {
                      setAuthModal({ isOpen: true, type: "login" });
                      setIsOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 rounded-full"
                    onClick={() => {
                      setAuthModal({ isOpen: true, type: "signup" });
                      setIsOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        type={authModal.type}
      />
    </>
  );
}
