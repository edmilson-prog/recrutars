import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { fadeInUp, reducedMotion } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  AlertCircle,
  AlertTriangle,
  WifiOff,
  ServerCrash,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  error: AlertCircle,
  warning: AlertTriangle,
  offline: WifiOff,
  server: ServerCrash,
};

interface ErrorStateProps {
  icon?: keyof typeof iconMap | LucideIcon;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  isRetrying?: boolean;
  className?: string;
  variant?: "error" | "warning" | "info";
  size?: "sm" | "md" | "lg";
}

export function ErrorState({
  icon = "error",
  title = "Algo deu errado",
  description = "Ocorreu um erro ao carregar os dados. Por favor, tente novamente.",
  onRetry,
  retryLabel = "Tentar novamente",
  isRetrying = false,
  className,
  variant = "error",
  size = "md",
}: ErrorStateProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? reducedMotion : fadeInUp;

  const IconComponent =
    typeof icon === "string" ? iconMap[icon] || AlertCircle : icon;

  const variantStyles = {
    error: {
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
    },
    warning: {
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
    },
    info: {
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
    },
  };

  const sizeClasses = {
    sm: {
      container: "py-8",
      icon: "h-8 w-8",
      iconWrapper: "h-14 w-14",
      title: "text-base",
      description: "text-sm",
    },
    md: {
      container: "py-12",
      icon: "h-10 w-10",
      iconWrapper: "h-18 w-18",
      title: "text-lg",
      description: "text-sm",
    },
    lg: {
      container: "py-16",
      icon: "h-12 w-12",
      iconWrapper: "h-20 w-20",
      title: "text-xl",
      description: "text-base",
    },
  };

  const styles = variantStyles[variant];
  const sizes = sizeClasses[size];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizes.container,
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full mb-4",
          styles.iconBg,
          sizes.iconWrapper
        )}
      >
        <IconComponent
          className={cn(styles.iconColor, sizes.icon)}
          strokeWidth={1.5}
        />
      </div>

      <h3 className={cn("font-semibold text-foreground mb-2", sizes.title)}>
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            "text-muted-foreground max-w-sm mx-auto mb-6",
            sizes.description
          )}
        >
          {description}
        </p>
      )}

      {onRetry && (
        <Button
          onClick={onRetry}
          disabled={isRetrying}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw
            className={cn("h-4 w-4", isRetrying && "animate-spin")}
          />
          {isRetrying ? "Carregando..." : retryLabel}
        </Button>
      )}
    </motion.div>
  );
}

export default ErrorState;
