"use client";

// components/navbar.tsx
// Profile dropdown with: Profile, Contact, View Appointments, Sign Out.
// Admin link visible only to ADMIN role (guarded client-side + RoleGuard).

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Sun, Moon, Leaf, LogOut, User,
  ChevronDown, Calendar, Phone, Shield,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import AuthModal from "./auth-modal";
import { useUserRole } from "@/hooks/useUserRole";

// ─── Nav links ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/",         label: "Home"     },
  { href: "#about",    label: "About"    },
  { href: "#services", label: "Services" },
  { href: "/blogs",    label: "Blogs"    },
  { href: "/recipes",  label: "Recipes"  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function Navbar() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();

  const { isLoaded, isSignedIn, user }  = useUser();
  const { signOut }                     = useClerk();
  const { isAdmin }                     = useUserRole();

  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auth modal
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; type: "login" | "signup" }>({
    isOpen: false, type: "signup",
  });
  const [wasSignedIn,        setWasSignedIn]        = useState(false);
  const [modalTypeWasSignup, setModalTypeWasSignup] = useState(false);

  const adminDashboardUrl = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL ?? ''

  // ── Click-outside closes dropdown ──────────────────────────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Auto-open auth modal on ?authRequired=1 ────────────────────────────────
  useEffect(() => {
    if (searchParams.get("authRequired") === "1" && !isSignedIn && isLoaded) {
      setAuthModal({ isOpen: true, type: "signup" });
    }
  }, [searchParams, isSignedIn, isLoaded]);

  useEffect(() => {
    if (authModal.isOpen && searchParams.get("authRequired")) {
      router.replace(pathname, { scroll: false });
    }
  }, [authModal.isOpen]);

  useEffect(() => {
    if (isLoaded) setWasSignedIn(!!isSignedIn);
  }, [isLoaded, isSignedIn]);

  // ── Open auth modal helpers ────────────────────────────────────────────────
  const openAuth = (type: "login" | "signup") => {
    setModalTypeWasSignup(type === "signup");
    setAuthModal({ isOpen: true, type });
  };

  const handleAuthClose = () => {
    setAuthModal((p) => ({ ...p, isOpen: false }));
    if (modalTypeWasSignup && isSignedIn && !wasSignedIn) {
      router.push("/about-user");
    }
  };

  // ── Sign out ───────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    router.push("/");
  };

  // ─── Render ────────────────────────────────────────────────────────────────

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
            <span className="font-serif text-xl font-semibold text-foreground">NourishWell</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}

            {/* Admin link — only visible to admins */}
            {isAdmin && (
              <Link
                href="http://localhost:3001/dashboard"
                className="relative text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <Shield size={14} /> Admin
              </Link>
            )}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-4">

            {/* Theme toggle */}
            <Button
              variant="ghost" size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {isLoaded && isSignedIn ? (

              /* ── Profile dropdown ── */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors"
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
                  <span className="text-sm font-medium text-foreground max-w-[100px] truncate">
                    {user.firstName ?? "Account"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-muted-foreground transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0,  scale: 1    }}
                      exit={{    opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-card border border-border shadow-xl overflow-hidden z-50"
                    >
                      {/* User mini-header */}
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold text-foreground truncate">{user.fullName ?? user.firstName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.primaryEmailAddress?.emailAddress}</p>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <DropdownItem
                          href="/profile"
                          icon={<User size={14} />}
                          label="Profile"
                          onClick={() => setDropdownOpen(false)}
                        />
                        <DropdownItem
                          href="/#contact"
                          icon={<Phone size={14} />}
                          label="Contact"
                          onClick={() => setDropdownOpen(false)}
                        />
                        <DropdownItem
                          href="/appointments"
                          icon={<Calendar size={14} />}
                          label="View Appointments"
                          onClick={() => setDropdownOpen(false)}
                        />

                        {isAdmin && (
                          <>
                            <div className="my-1 h-px bg-border mx-3" />
                            <DropdownItem
                              href={adminDashboardUrl}
                              icon={<Shield size={14} className="text-primary" />}
                              label="Admin Dashboard"
                              onClick={() => setDropdownOpen(false)}
                              className="text-primary"
                            />
                          </>
                        )}

                        <div className="my-1 h-px bg-border mx-3" />

                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            ) : (
              /* ── Sign in / up buttons ── */
              <>
                <Button
                  variant="outline" size="sm" className="rounded-full"
                  onClick={() => openAuth("login")}
                >
                  Sign In
                </Button>
                <Button
                  size="sm" className="rounded-full"
                  onClick={() => openAuth("signup")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost" size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button
              variant="ghost" size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-full"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{    opacity: 0, height: 0    }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-background border-b border-border"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-1">

                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0  }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {isAdmin && (
                  <Link
                    href={adminDashboardUrl}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-1.5 py-2.5 text-sm text-primary font-medium"
                  >
                    <Shield size={13} /> Admin Dashboard
                  </Link>
                )}

                <div className="border-t border-border pt-3 mt-1 space-y-1">
                  {isLoaded && isSignedIn ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 py-2.5 text-sm text-foreground hover:text-primary transition-colors"
                      >
                        <User size={14} /> Profile
                      </Link>
                      <Link
                        href="/appointments"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 py-2.5 text-sm text-foreground hover:text-primary transition-colors"
                      >
                        <Calendar size={14} /> View Appointments
                      </Link>
                      <Link
                        href="/#contact"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 py-2.5 text-sm text-foreground hover:text-primary transition-colors"
                      >
                        <Phone size={14} /> Contact
                      </Link>
                      <button
                        onClick={() => { handleSignOut(); setMobileOpen(false); }}
                        className="flex items-center gap-2 py-2.5 text-sm text-red-500 w-full"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline" size="sm" className="flex-1 rounded-full"
                        onClick={() => { openAuth("login"); setMobileOpen(false); }}
                      >
                        Sign In
                      </Button>
                      <Button
                        size="sm" className="flex-1 rounded-full"
                        onClick={() => { openAuth("signup"); setMobileOpen(false); }}
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

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

// ─── Dropdown item helper ────────────────────────────────────────────────────

function DropdownItem({
  href, icon, label, onClick, className = "",
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors ${className}`}
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </Link>
  );
}