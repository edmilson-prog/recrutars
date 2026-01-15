import { useCallback, useEffect } from "react";
import confetti from "canvas-confetti";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Brand colors in hex
const brandColors = [
  "#3C5A99", // Navy primary
  "#3498DB", // Cyan accent
  "#22C55E", // Success green
  "#FFFFFF", // White
];

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  duration?: number;
}

export function useConfetti() {
  const prefersReducedMotion = useReducedMotion();

  const fire = useCallback(
    (options: ConfettiOptions = {}) => {
      if (prefersReducedMotion) {
        return;
      }

      const {
        particleCount = 100,
        spread = 70,
        origin = { x: 0.5, y: 0.5 },
        colors = brandColors,
        duration = 3000,
      } = options;

      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: particleCount / 10,
          angle: 60,
          spread,
          origin: { x: 0, y: origin.y },
          colors,
          zIndex: 9999,
        });

        confetti({
          particleCount: particleCount / 10,
          angle: 120,
          spread,
          origin: { x: 1, y: origin.y },
          colors,
          zIndex: 9999,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    },
    [prefersReducedMotion]
  );

  const fireExplosion = useCallback(
    (options: ConfettiOptions = {}) => {
      if (prefersReducedMotion) {
        return;
      }

      const {
        particleCount = 100,
        spread = 100,
        origin = { x: 0.5, y: 0.5 },
        colors = brandColors,
      } = options;

      confetti({
        particleCount,
        spread,
        origin,
        colors,
        zIndex: 9999,
        gravity: 0.8,
        scalar: 1.2,
        drift: 0,
      });
    },
    [prefersReducedMotion]
  );

  const fireStars = useCallback(
    (options: ConfettiOptions = {}) => {
      if (prefersReducedMotion) {
        return;
      }

      const {
        particleCount = 50,
        spread = 360,
        origin = { x: 0.5, y: 0.5 },
        colors = brandColors,
      } = options;

      confetti({
        particleCount,
        spread,
        origin,
        colors,
        zIndex: 9999,
        shapes: ["star"],
        scalar: 1.5,
      });
    },
    [prefersReducedMotion]
  );

  const fireCanon = useCallback(
    (options: { angle?: number; origin?: { x: number; y: number } } = {}) => {
      if (prefersReducedMotion) {
        return;
      }

      const { angle = 90, origin = { x: 0.5, y: 1 } } = options;

      confetti({
        particleCount: 80,
        angle,
        spread: 55,
        origin,
        colors: brandColors,
        zIndex: 9999,
        gravity: 1,
        ticks: 200,
      });
    },
    [prefersReducedMotion]
  );

  return {
    fire,
    fireExplosion,
    fireStars,
    fireCanon,
  };
}

interface ConfettiTriggerProps {
  trigger: boolean;
  variant?: "default" | "explosion" | "stars" | "canon";
  options?: ConfettiOptions;
  onComplete?: () => void;
}

export function ConfettiTrigger({
  trigger,
  variant = "explosion",
  options,
  onComplete,
}: ConfettiTriggerProps) {
  const { fire, fireExplosion, fireStars, fireCanon } = useConfetti();

  useEffect(() => {
    if (trigger) {
      switch (variant) {
        case "default":
          fire(options);
          break;
        case "explosion":
          fireExplosion(options);
          break;
        case "stars":
          fireStars(options);
          break;
        case "canon":
          fireCanon(options);
          break;
      }

      if (onComplete) {
        const timeout = setTimeout(onComplete, options?.duration || 3000);
        return () => clearTimeout(timeout);
      }
    }
  }, [trigger, variant, options, onComplete, fire, fireExplosion, fireStars, fireCanon]);

  return null;
}

export default useConfetti;
