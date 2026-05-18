"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PageLoader } from "@/components/ui/page-loader";

export function RouteLoader() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Previous path ref — fires when the route changes
  const prevPath = useRef<string>("");

  useEffect(() => {
    const current = pathname + searchParams.toString();

    if (prevPath.current && prevPath.current !== current) {
      // New route started — show loader
      setLoading(true);

      // Hide after a short max — Next.js App Router transitions are fast
      timerRef.current = setTimeout(() => setLoading(false), 600);
    }

    prevPath.current = current;

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname, searchParams]);

  if (!loading) return null;

  return <PageLoader size="lg" />;
}