import { cn } from "@/lib/utils";
import { SkeletonCard, SkeletonJobCard, SkeletonCandidateCard } from "./skeleton-card";

interface SkeletonListProps {
  count?: number;
  variant?: "job" | "candidate" | "default";
  className?: string;
  itemClassName?: string;
  layout?: "grid" | "list";
  columns?: 1 | 2 | 3 | 4;
}

export function SkeletonList({
  count = 3,
  variant = "default",
  className,
  itemClassName,
  layout = "list",
  columns = 1,
}: SkeletonListProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  const CardComponent = {
    job: SkeletonJobCard,
    candidate: SkeletonCandidateCard,
    default: SkeletonCard,
  }[variant];

  return (
    <div
      className={cn(
        layout === "grid" ? `grid ${gridCols[columns]} gap-4` : "space-y-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <CardComponent key={index} className={itemClassName} />
      ))}
    </div>
  );
}

interface SkeletonListItemProps {
  className?: string;
  showAvatar?: boolean;
  lines?: number;
}

export function SkeletonListItem({
  className,
  showAvatar = true,
  lines = 2,
}: SkeletonListItemProps) {
  return (
    <div className={cn("flex gap-4 p-4", className)}>
      {showAvatar && (
        <div className="h-10 w-10 rounded-full animate-shimmer flex-shrink-0" />
      )}
      <div className="flex-1 space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-4 rounded animate-shimmer",
              index === 0 ? "w-3/4" : "w-1/2"
            )}
          />
        ))}
      </div>
    </div>
  );
}

interface SkeletonSimpleListProps {
  count?: number;
  className?: string;
  showAvatar?: boolean;
  lines?: number;
}

export function SkeletonSimpleList({
  count = 5,
  className,
  showAvatar = true,
  lines = 2,
}: SkeletonSimpleListProps) {
  return (
    <div className={cn("divide-y", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonListItem key={index} showAvatar={showAvatar} lines={lines} />
      ))}
    </div>
  );
}

export default SkeletonList;
