import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { fadeInUp, reducedMotion } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  FileX,
  Search,
  Inbox,
  Users,
  Briefcase,
  MessageSquare,
  Calendar,
  Heart,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  file: FileX,
  search: Search,
  inbox: Inbox,
  users: Users,
  jobs: Briefcase,
  messages: MessageSquare,
  calendar: Calendar,
  favorites: Heart,
};

interface EmptyStateProps {
  icon?: keyof typeof iconMap | LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "secondary" | "outline";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "md",
}: EmptyStateProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? reducedMotion : fadeInUp;

  const IconComponent =
    typeof icon === "string" ? iconMap[icon] || Inbox : icon;

  const sizeClasses = {
    sm: {
      container: "py-8",
      icon: "h-10 w-10",
      iconWrapper: "h-16 w-16",
      title: "text-base",
      description: "text-sm",
    },
    md: {
      container: "py-12",
      icon: "h-12 w-12",
      iconWrapper: "h-20 w-20",
      title: "text-lg",
      description: "text-sm",
    },
    lg: {
      container: "py-16",
      icon: "h-16 w-16",
      iconWrapper: "h-24 w-24",
      title: "text-xl",
      description: "text-base",
    },
  };

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
          "flex items-center justify-center rounded-full bg-muted mb-4",
          sizes.iconWrapper
        )}
      >
        <IconComponent
          className={cn("text-muted-foreground", sizes.icon)}
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

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="ghost">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default EmptyState;
