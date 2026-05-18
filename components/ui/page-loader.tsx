"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  /** Renders inline (centered in parent) instead of full-screen fixed */
  inline?: boolean;
  /** "sm" = 24px icon only, "md" = default 48px, "lg" = 64px full-screen */
  size?: "sm" | "md" | "lg";
  /** Optional label shown below the icon */
  label?: string;
  className?: string;
}

export function PageLoader({
  inline = false,
  size = "md",
  label,
  className,
}: PageLoaderProps) {
  const iconSizes = { sm: 20, md: 40, lg: 56 } as const;
  const px = iconSizes[size];

  const icon = (
    <span
      className={cn(
        "page-loader-icon",
        size === "sm" && "page-loader-icon--sm",
        size === "lg" && "page-loader-icon--lg"
      )}
      style={{ width: px, height: px }}
      aria-hidden="true"
    >
      {/* Leaf SVG — same proportions as the Leaf from lucide used in Navbar */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        width={px}
        height={px}
      >
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    </span>
  );

  if (inline) {
    return (
      <div
        className={cn("page-loader-inline", className)}
        role="status"
        aria-label={label ?? "Loading"}
      >
        {icon}
        {label && <span className="page-loader-label">{label}</span>}
        <style>{loaderCSS}</style>
      </div>
    );
  }

  return (
    <div
      className={cn("page-loader-full", className)}
      role="status"
      aria-label={label ?? "Loading"}
    >
      <div className="page-loader-card">
        {icon}
        {label && <span className="page-loader-label">{label}</span>}
      </div>
      <style>{loaderCSS}</style>
    </div>
  );
}

// ── Skeleton for cards (blog/recipe list) ─────────────────────────────────────

export function BlogCardSkeleton() {
  return (
    <div className="blog-skeleton" aria-hidden="true">
      <div className="blog-skeleton__image" />
      <div className="blog-skeleton__body">
        <div className="blog-skeleton__pill" />
        <div className="blog-skeleton__line blog-skeleton__line--title" />
        <div className="blog-skeleton__line blog-skeleton__line--title blog-skeleton__line--short" />
        <div className="blog-skeleton__line" />
        <div className="blog-skeleton__line blog-skeleton__line--short" />
        <div className="blog-skeleton__footer" />
      </div>
      <style>{skeletonCSS}</style>
    </div>
  );
}

export function BlogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
      <style>{skeletonCSS}</style>
    </>
  );
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const loaderCSS = `
  .page-loader-full {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: hsl(var(--background) / 0.85);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .page-loader-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }

  .page-loader-inline {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 180px;
    width: 100%;
  }

  .page-loader-icon {
    color: hsl(var(--primary));
    display: flex;
    align-items: center;
    justify-content: center;
    animation: leafPulse 1.6s ease-in-out infinite;
    transform-origin: center bottom;
  }

  .page-loader-icon--sm {
    animation-duration: 1.2s;
  }

  .page-loader-icon--lg {
    animation-duration: 2s;
  }

  @keyframes leafPulse {
    0%   { transform: scale(1)    rotate(0deg);   opacity: 1;   }
    25%  { transform: scale(1.12) rotate(-6deg);  opacity: 0.9; }
    50%  { transform: scale(1.18) rotate(4deg);   opacity: 0.7; }
    75%  { transform: scale(1.1)  rotate(-3deg);  opacity: 0.9; }
    100% { transform: scale(1)    rotate(0deg);   opacity: 1;   }
  }

  .page-loader-label {
    font-size: 0.875rem;
    color: hsl(var(--muted-foreground));
    letter-spacing: 0.02em;
    animation: labelFade 1.6s ease-in-out infinite;
  }

  @keyframes labelFade {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1;   }
  }
`;

const skeletonCSS = `
  .blog-skeleton {
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid hsl(var(--border));
    background: hsl(var(--card));
    display: flex;
    flex-direction: column;
  }

  .blog-skeleton__image {
    width: 100%;
    aspect-ratio: 16 / 10;
    background: hsl(var(--muted));
    animation: shimmer 1.8s ease-in-out infinite;
  }

  .blog-skeleton__body {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .blog-skeleton__pill {
    width: 72px;
    height: 20px;
    border-radius: 999px;
    background: hsl(var(--muted));
    animation: shimmer 1.8s ease-in-out infinite;
  }

  .blog-skeleton__line {
    height: 14px;
    border-radius: 4px;
    background: hsl(var(--muted));
    animation: shimmer 1.8s ease-in-out infinite;
    width: 100%;
  }

  .blog-skeleton__line--title {
    height: 18px;
  }

  .blog-skeleton__line--short {
    width: 65%;
  }

  .blog-skeleton__footer {
    margin-top: 4px;
    height: 1px;
    background: hsl(var(--border));
  }

  @keyframes shimmer {
    0%   { opacity: 0.45; }
    50%  { opacity: 0.9;  }
    100% { opacity: 0.45; }
  }
`;