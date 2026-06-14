"use client";

import { useEffect, useState, useRef, type ReactNode } from "react";
import { SkeletonBlock } from "./Skeletons";
import { useInView } from "framer-motion";

interface ChartContainerProps {
  /** Chart content to render */
  children: ReactNode;
  /** Fixed height in pixels (default: 300) */
  height?: number;
  /** Minimum height fallback in pixels (default: 250) */
  minHeight?: number;
  /** Additional Tailwind classes */
  className?: string;
  /** Whether to show skeleton loader while mounting (default: true) */
  showSkeleton?: boolean;
}

/**
 * Production-safe chart container for Recharts.
 *
 * Fixes the common "width(-1) and height(-1) of chart should be greater than 0"
 * error that occurs in Next.js production builds.
 *
 * Root causes addressed:
 * 1. SSR/hydration: Recharts measures container before CSS layout is ready
 * 2. height: 100%: Fails when parent hasn't computed dimensions yet
 * 3. Flex/grid: Containers can collapse to 0px during initial render
 *
 * @example
 * <ChartContainer height={288}>
 *   <ResponsiveContainer width="100%" height="100%">
 *     <BarChart data={data}>...</BarChart>
 *   </ResponsiveContainer>
 * </ChartContainer>
 */
export function ChartContainer({
  children,
  height = 300,
  minHeight = 250,
  className = "",
  showSkeleton = true,
}: ChartContainerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    // Defer chart render to next tick to ensure layout is ready
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Compute style with explicit pixel height (never rely on %)
  const containerStyle: React.CSSProperties = {
    height: `${height}px`,
    minHeight: `${minHeight}px`,
  };

  if (!isMounted || !isInView) {
    return (
      <div
        ref={ref}
        className={`w-full min-w-0 ${className}`}
        style={containerStyle}
        aria-busy="true"
        aria-label="Loading chart"
      >
        {showSkeleton ? (
          <div className="flex h-full w-full items-center justify-center p-6">
            <SkeletonBlock className="h-full w-full max-w-3xl rounded-xl" />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`w-full min-w-0 ${className}`}
      style={containerStyle}
    >
      {children}
    </div>
  );
}
