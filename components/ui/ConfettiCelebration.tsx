"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Milestone } from "@/lib/milestones";

interface ConfettiCelebrationProps {
  milestone: Milestone | null;
  onDismiss: () => void;
}

// Confetti particle config
const PARTICLE_COUNT = 80;
const COLORS = [
  "#118C76", "#F59E0B", "#3B82F6", "#EC4899",
  "#8B5CF6", "#10B981", "#F97316", "#06B6D4",
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

function useConfetti(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  const spawnParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: -10,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 4 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      opacity: 1,
    }));
  }, []);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Size canvas to viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    spawnParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => p.opacity > 0.01);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.rotation += p.rotationSpeed;
        // Fade out as they fall below 60% of screen height
        if (p.y > canvas.height * 0.6) {
          p.opacity -= 0.02;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      if (particlesRef.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [active, spawnParticles]);

  return canvasRef;
}

export function ConfettiCelebration({ milestone, onDismiss }: ConfettiCelebrationProps) {
  const isActive = milestone !== null;
  const canvasRef = useConfetti(isActive);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [isActive, onDismiss]);

  return (
    <>
      {/* Canvas for falling confetti particles */}
      <AnimatePresence>
        {isActive && (
          <motion.canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Milestone toast overlay */}
      <AnimatePresence>
        {milestone && (
          <motion.div
            className="fixed bottom-8 left-1/2 z-[10000] -translate-x-1/2"
            initial={{ opacity: 0, y: 40, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
          >
            <button
              onClick={onDismiss}
              className="group flex items-center gap-4 rounded-2xl border border-emerald-100 bg-white px-6 py-4 shadow-2xl shadow-emerald-500/10 ring-1 ring-emerald-500/10 backdrop-blur-sm"
            >
              {/* Emoji pulse */}
              <motion.span
                className="text-4xl"
                animate={{ scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.6, delay: 0.15, repeat: 1 }}
              >
                {milestone.emoji}
              </motion.span>

              <div className="text-left">
                <p className="text-sm font-bold text-amortix-navy">{milestone.label}</p>
                <p className="text-xs text-amortix-slate mt-0.5">{milestone.message}</p>
              </div>

              {/* Progress glow ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-emerald-400/5"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
