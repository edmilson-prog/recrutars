import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { hoverLift, pressScale } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface InteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  hoverActions?: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
}

const InteractiveCard = React.forwardRef<HTMLDivElement, InteractiveCardProps>(
  (
    {
      children,
      onClick,
      selected = false,
      disabled = false,
      hoverActions,
      variant = "default",
      className,
      ...props
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion();
    const isClickable = !!onClick && !disabled;

    const variantStyles = {
      default: "bg-card border",
      elevated: "bg-card shadow-soft",
      outlined: "bg-transparent border-2",
    };

    const baseClasses = cn(
      "relative rounded-lg p-4 transition-all duration-200",
      variantStyles[variant],
      isClickable && "cursor-pointer",
      selected && "ring-2 ring-primary border-primary",
      disabled && "opacity-50 cursor-not-allowed",
      className
    );

    const content = (
      <>
        {children}
        {hoverActions && (
          <div
            className={cn(
              "absolute top-3 right-3 flex gap-2 transition-opacity duration-200",
              "opacity-0 group-hover:opacity-100"
            )}
          >
            {hoverActions}
          </div>
        )}
      </>
    );

    if (prefersReducedMotion || !isClickable) {
      return (
        <div
          ref={ref}
          className={cn(baseClasses, hoverActions && "group")}
          onClick={!disabled ? onClick : undefined}
          role={isClickable ? "button" : undefined}
          tabIndex={isClickable ? 0 : undefined}
          onKeyDown={
            isClickable
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick?.();
                  }
                }
              : undefined
          }
          {...props}
        >
          {content}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={cn(baseClasses, hoverActions && "group")}
        onClick={!disabled ? onClick : undefined}
        whileHover={{
          ...hoverLift,
          boxShadow: "0 4px 16px -4px hsl(228 48% 33% / 0.15)",
        }}
        whileTap={pressScale}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        {...props}
      >
        {content}
      </motion.div>
    );
  }
);
InteractiveCard.displayName = "InteractiveCard";

interface CardActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const CardActionButton = React.forwardRef<
  HTMLButtonElement,
  CardActionButtonProps
>(({ children, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "h-8 w-8 flex items-center justify-center rounded-md",
        "bg-background/80 backdrop-blur-sm border",
        "text-muted-foreground hover:text-foreground",
        "hover:bg-background transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
CardActionButton.displayName = "CardActionButton";

export { InteractiveCard, CardActionButton };
