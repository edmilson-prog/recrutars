import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeIn, reducedMotion } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "pulse";
}

export function LoadingState({
  message,
  className,
  size = "md",
  variant = "spinner",
}: LoadingStateProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? reducedMotion : fadeIn;

  const sizeClasses = {
    sm: {
      container: "py-8",
      spinner: "h-6 w-6",
      text: "text-sm",
      dots: "h-2 w-2",
    },
    md: {
      container: "py-12",
      spinner: "h-8 w-8",
      text: "text-base",
      dots: "h-3 w-3",
    },
    lg: {
      container: "py-16",
      spinner: "h-10 w-10",
      text: "text-lg",
      dots: "h-4 w-4",
    },
  };

  const sizes = sizeClasses[size];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      className={cn(
        "flex flex-col items-center justify-center",
        sizes.container,
        className
      )}
    >
      {variant === "spinner" && (
        <Loader2
          className={cn(
            "text-primary animate-spin mb-4",
            sizes.spinner
          )}
        />
      )}

      {variant === "dots" && (
        <div className="flex gap-2 mb-4">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className={cn(
                "rounded-full bg-primary",
                sizes.dots
              )}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {variant === "pulse" && (
        <div className="relative mb-4">
          <div
            className={cn(
              "rounded-full bg-primary/20",
              sizes.spinner
            )}
          />
          <motion.div
            className={cn(
              "absolute inset-0 rounded-full bg-primary/40",
              sizes.spinner
            )}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        </div>
      )}

      {message && (
        <p className={cn("text-muted-foreground", sizes.text)}>
          {message}
        </p>
      )}
    </motion.div>
  );
}

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export function LoadingOverlay({ message, className }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50",
        className
      )}
    >
      <LoadingState message={message} />
    </div>
  );
}

export default LoadingState;
