/**
 * Extended Framer Motion animation presets.
 * Supplements lib/animations.ts with interactive micro-interaction variants.
 */
import type { Variants } from "framer-motion";

// ─── Press / Tap ────────────────────────────────────────────────
/** Subtle scale-down on button/card press. Use with whileTap. */
export const pressScale = {
  whileTap: { scale: 0.97, transition: { duration: 0.1, ease: "easeIn" } },
} as const;

/** Elevated lift on hover for interactive cards. Use with whileHover. */
export const hoverLift = {
  whileHover: {
    y: -3,
    boxShadow: "0 12px 40px -8px rgba(17, 140, 118, 0.18)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
} as const;

/** Glow ring on hover for CTA buttons. */
export const hoverGlow = {
  whileHover: {
    boxShadow: "0 0 0 4px rgba(17, 140, 118, 0.15)",
    transition: { duration: 0.2 },
  },
} as const;

// ─── Chart Reveal ───────────────────────────────────────────────
/** Staggered entrance for chart wrappers. Pair with staggerContainer. */
export const chartReveal: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Number Ticker ──────────────────────────────────────────────
/** Slide-in from bottom for animating number changes. */
export const numberTickUp: Variants = {
  initial: { y: 12, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { y: -12, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

// ─── Drawer / Modal ─────────────────────────────────────────────
export const slideDrawer: Variants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 340, damping: 32 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// ─── Success Flash ──────────────────────────────────────────────
/** Flash green on successful action completion. */
export const successFlash: Variants = {
  initial: { backgroundColor: "transparent" },
  animate: {
    backgroundColor: ["transparent", "rgba(16, 185, 129, 0.08)", "transparent"],
    transition: { duration: 0.8, times: [0, 0.3, 1] },
  },
};

// ─── Shake ──────────────────────────────────────────────────────
/** Horizontal shake for error states. */
export const errorShake: Variants = {
  animate: {
    x: [0, -8, 8, -5, 5, -2, 2, 0],
    transition: { duration: 0.45, ease: "easeInOut" },
  },
};

// ─── Stagger Grid ───────────────────────────────────────────────
/** Container variant for staggered card grids (faster than fadeUpStagger). */
export const staggerGrid: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerGridItem: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};
