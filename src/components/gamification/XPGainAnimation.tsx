/**
 * XPGainAnimation Component
 * PRD-001-dgn: Sistema de Gamificação - XP, Badges e Níveis
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface XPGain {
  id: string;
  amount: number;
  x: number;
  y: number;
}

interface XPGainAnimationProps {
  className?: string;
}

let xpGainIdCounter = 0;

// Global event emitter for XP gains
const xpGainListeners: ((gain: XPGain) => void)[] = [];

export function emitXPGain(amount: number, x?: number, y?: number) {
  const gain: XPGain = {
    id: `xp-${++xpGainIdCounter}`,
    amount,
    x: x ?? window.innerWidth / 2,
    y: y ?? window.innerHeight / 2,
  };
  xpGainListeners.forEach((listener) => listener(gain));
}

export function XPGainAnimation({ className }: XPGainAnimationProps) {
  const [gains, setGains] = useState<XPGain[]>([]);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const listener = (gain: XPGain) => {
      setGains((prev) => [...prev, gain]);

      // Remove after animation completes
      setTimeout(() => {
        setGains((prev) => prev.filter((g) => g.id !== gain.id));
      }, 1500);
    };

    xpGainListeners.push(listener);
    return () => {
      const index = xpGainListeners.indexOf(listener);
      if (index > -1) {
        xpGainListeners.splice(index, 1);
      }
    };
  }, []);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-50", className)}>
      <AnimatePresence>
        {gains.map((gain) => (
          <motion.div
            key={gain.id}
            initial={{ opacity: 0, scale: 0.5, x: gain.x, y: gain.y }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.2, 1, 0.8],
              y: gain.y - 100,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <span className="text-xl font-bold text-primary drop-shadow-lg">
              +{gain.amount} XP
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook version for more control
interface UseXPAnimationReturn {
  showXPGain: (amount: number, x?: number, y?: number) => void;
  XPAnimationContainer: React.FC;
}

export function useXPAnimation(): UseXPAnimationReturn {
  const [gains, setGains] = useState<XPGain[]>([]);
  const prefersReducedMotion = useReducedMotion();

  const showXPGain = useCallback((amount: number, x?: number, y?: number) => {
    const gain: XPGain = {
      id: `xp-${++xpGainIdCounter}`,
      amount,
      x: x ?? window.innerWidth / 2,
      y: y ?? 100,
    };

    setGains((prev) => [...prev, gain]);

    setTimeout(() => {
      setGains((prev) => prev.filter((g) => g.id !== gain.id));
    }, 1500);
  }, []);

  const XPAnimationContainer = useCallback(() => {
    if (prefersReducedMotion) return null;

    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        <AnimatePresence>
          {gains.map((gain) => (
            <motion.div
              key={gain.id}
              initial={{ opacity: 0, scale: 0.5, x: gain.x, y: gain.y }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1.2, 1, 0.8],
                y: gain.y - 100,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <span className="text-xl font-bold text-primary drop-shadow-lg">
                +{gain.amount} XP
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }, [gains, prefersReducedMotion]);

  return { showXPGain, XPAnimationContainer };
}

export default XPGainAnimation;
