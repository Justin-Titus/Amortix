"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { chartReveal } from "@/lib/animations-extended";
import { SkeletonBlock } from "./Skeletons";

interface ChartContainerProps {
  /** Chart content to render */
  children: React.ReactNode;
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
 * Production-safe chart container for Recharts with entrance animation.
 *
 * Fixes the common "width(-1) and height(-1) of chart should be greater than 0"
 * error that occurs in Next.js production builds.
 */
export function ChartContainer({
  children,
  height = 300,
  minHeight = 250,
  className = "",
  showSkeleton = true,
}: ChartContainerProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  React.useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

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
    <motion.div
      ref={ref}
      className={`w-full min-w-0 ${className}`}
      style={containerStyle}
      variants={chartReveal}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}
