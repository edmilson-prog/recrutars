import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SuccessStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
  showConfetti?: boolean;
}

export function SuccessState({
  title = "Sucesso!",
  description,
  action,
  secondaryAction,
  className,
  size = "md",
}: SuccessStateProps) {
  const prefersReducedMotion = useReducedMotion();

  const sizeClasses = {
    sm: {
      container: "py-8",
      checkmark: 48,
      title: "text-base",
      description: "text-sm",
    },
    md: {
      container: "py-12",
      checkmark: 64,
      title: "text-lg",
      description: "text-sm",
    },
    lg: {
      container: "py-16",
      checkmark: 80,
      title: "text-xl",
      description: "text-base",
    },
  };

  const sizes = sizeClasses[size];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizes.container,
        className
      )}
    >
      <AnimatedCheckmark
        size={sizes.checkmark}
        className="mb-4"
        animate={!prefersReducedMotion}
      />

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.3,
          delay: prefersReducedMotion ? 0 : 0.4,
        }}
        className={cn("font-semibold text-foreground mb-2", sizes.title)}
      >
        {title}
      </motion.h3>

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.3,
            delay: prefersReducedMotion ? 0 : 0.5,
          }}
          className={cn(
            "text-muted-foreground max-w-sm mx-auto mb-6",
            sizes.description
          )}
        >
          {description}
        </motion.p>
      )}

      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.3,
            delay: prefersReducedMotion ? 0 : 0.6,
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {action && (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="ghost">
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

interface AnimatedCheckmarkProps {
  size?: number;
  className?: string;
  animate?: boolean;
  color?: string;
}

export function AnimatedCheckmark({
  size = 64,
  className,
  animate = true,
  color,
}: AnimatedCheckmarkProps) {
  const circleLength = 2 * Math.PI * (size / 2 - 4);
  const checkmarkLength = size * 0.5;

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 4}
          className={color || "stroke-success/20"}
          strokeWidth={4}
        />

        {/* Animated circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 4}
          className={color || "stroke-success"}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          initial={animate ? { pathLength: 0 } : { pathLength: 1 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: animate ? 0.4 : 0,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            strokeDasharray: circleLength,
            rotate: -90,
            transformOrigin: "center",
          }}
        />

        {/* Checkmark */}
        <motion.path
          d={`M${size * 0.28} ${size * 0.5} L${size * 0.45} ${size * 0.65} L${size * 0.72} ${size * 0.35}`}
          className={color || "stroke-success"}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={animate ? { pathLength: 0 } : { pathLength: 1 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: animate ? 0.3 : 0,
            delay: animate ? 0.3 : 0,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            strokeDasharray: checkmarkLength,
          }}
        />
      </svg>
    </div>
  );
}

export default SuccessState;
