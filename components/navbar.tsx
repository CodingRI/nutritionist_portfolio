"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, Leaf, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import AuthModal from "./auth-modal";

// ─── Nav links ────────────────────────────────────────────────────────────────

const navLinks = [
  { href: "/",        label: "Home"     },
  { href: "#about",   label: "About"    },
  { href: "#services",label: "Services" },
  { href: "/blogs",   label: "Blogs"    },
  { href: "/recipes", label: "Recipes"  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function Navbar() {

  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();

  // Clerk user state
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  // Mobile menu
  const [isOpen, setIsOpen] = useState(false);

  // Auth modal state
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    type: "login" | "signup";
  }>({ isOpen: false, type: "signup" });

  // ── Auto-open modal when ?authRequired=1 is in the URL ──────────────────────
  // The middleware redirects unauthenticated users to /?authRequired=1.
  // We detect that here and open the signup modal automatically.
  useEffect(() => {
    const authRequired    = searchParams.get("authRequired");
    const paymentRequired = searchParams.get("paymentRequired");

    if (authRequired === "1" && !isSignedIn && isLoaded) {
      setAuthModal({ isOpen: true, type: "signup" });
    }

    if (paymentRequired && isSignedIn && isLoaded) {
      // TODO: open your payment/upgrade modal here
      // For now just log it — you can wire up your payment modal similarly
      console.log("Payment required for:", paymentRequired);
    }
  }, [searchParams, isSignedIn, isLoaded]);

  // ── Clean the query param from the URL once the modal is open ───────────────
  useEffect(() => {
    if (authModal.isOpen && searchParams.get("authRequired")) {
      // Replace URL without the query param so it doesn't re-trigger on close
      router.replace(pathname, { scroll: false });
    }
  }, [authModal.isOpen]);

  // ── Handle modal close ───────────────────────────────────────────────────────
  const handleClose = () => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  };

  // ── After signup completes, redirect to /profile──────────────────────────
  // The AuthModal calls onClose() after setActive() succeeds.
  // We detect the transition from !signedIn → signedIn AND type was "signup".
  const [wasSignedIn, setWasSignedIn] = useState(false);
  const [modalTypeWasSignup, setModalTypeWasSignup] = useState(false);

  // Track whether we opened as signup
  const openAuthModal = (type: "login" | "signup") => {
    setModalTypeWasSignup(type === "signup");
    setAuthModal({ isOpen: true, type });
  };

  // When modal closes and user just signed up → go to /profile
  const handleAuthClose = () => {
    handleClose();

    if (modalTypeWasSignup && isSignedIn && !wasSignedIn) {
      router.push("/profile");
    }
  };

  // Track previous signed-in state so we know when it changes
  useEffect(() => {
    if (isLoaded) setWasSignedIn(!!isSignedIn);
  }, [isLoaded, isSignedIn]);

  // ── Sign out ──────────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border"
      >
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-serif text-xl font-semibold text-foreground">
              NourishWell
            </span>
          </Link>

          {/* Desktop nav links */}
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

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-4">

            {/* Theme toggle */}
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

            {/* Auth buttons — swap for user info once signed in */}
            {isLoaded && isSignedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {user.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.imageUrl}
                      alt={user.firstName ?? "User"}
                      className="w-8 h-8 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User size={14} className="text-primary" />
                    </div>
                  )}
                  <span>{user.firstName ?? "Account"}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="rounded-full text-muted-foreground hover:text-foreground gap-1.5"
                >
                  <LogOut size={14} />
                  Sign out
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => openAuthModal("login")}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => openAuthModal("signup")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
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
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </nav>

        {/* Mobile menu */}
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
                  {isLoaded && isSignedIn ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-full"
                      onClick={() => { handleSignOut(); setIsOpen(false); }}
                    >
                      <LogOut size={14} className="mr-1.5" /> Sign out
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-full"
                        onClick={() => { openAuthModal("login"); setIsOpen(false); }}
                      >
                        Sign In
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 rounded-full"
                        onClick={() => { openAuthModal("signup"); setIsOpen(false); }}
                      >
                        Sign Up
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Auth modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={handleAuthClose}
        type={authModal.type}
        onTypeChange={(t) => {
          setModalTypeWasSignup(t === "signup");
          setAuthModal({ isOpen: true, type: t });
        }}
      />
    </>
  );
}