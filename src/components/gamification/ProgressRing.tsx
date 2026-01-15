/**
 * ProgressRing Component
 * PRD-001-dgn: Sistema de Gamificação - XP, Badges e Níveis
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  label?: string;
  className?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  showPercentage = true,
  label,
  className,
}: ProgressRingProps) {
  const prefersReducedMotion = useReducedMotion();
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  // Color gradient based on progress
  const getGradientColors = () => {
    if (normalizedProgress >= 100) {
      return { start: "#22c55e", end: "#16a34a" }; // Green
    }
    if (normalizedProgress >= 75) {
      return { start: "#3b82f6", end: "#2563eb" }; // Blue
    }
    if (normalizedProgress >= 50) {
      return { start: "#8b5cf6", end: "#7c3aed" }; // Purple
    }
    if (normalizedProgress >= 25) {
      return { start: "#f59e0b", end: "#d97706" }; // Amber
    }
    return { start: "#6b7280", end: "#4b5563" }; // Gray
  };

  const colors = getGradientColors();
  const gradientId = `progress-gradient-${size}-${normalizedProgress}`;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={
            prefersReducedMotion
              ? { strokeDashoffset }
              : { strokeDashoffset: circumference }
          }
          animate={{ strokeDashoffset }}
          transition={{
            duration: prefersReducedMotion ? 0 : 1,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <motion.span
            initial={prefersReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold"
          >
            {Math.round(normalizedProgress)}%
          </motion.span>
        )}
        {label && (
          <span className="text-xs text-muted-foreground mt-1">{label}</span>
        )}
      </div>
    </div>
  );
}

interface ProgressRingCompactProps {
  progress: number;
  size?: number;
  className?: string;
}

export function ProgressRingCompact({
  progress,
  size = 40,
  className,
}: ProgressRingCompactProps) {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-primary transition-all duration-500"
        />
      </svg>
      <span className="absolute text-[10px] font-medium">
        {Math.round(normalizedProgress)}%
      </span>
    </div>
  );
}

export default ProgressRing;
