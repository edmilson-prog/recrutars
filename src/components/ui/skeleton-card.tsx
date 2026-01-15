import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  variant?: "job" | "candidate" | "default";
  showImage?: boolean;
  showTags?: boolean;
  showAction?: boolean;
}

export function SkeletonCard({
  className,
  variant = "default",
  showImage = true,
  showTags = true,
  showAction = true,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 space-y-4",
        className
      )}
    >
      <div className="flex gap-4">
        {showImage && (
          <div className="h-12 w-12 rounded-lg animate-shimmer flex-shrink-0" />
        )}
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 rounded animate-shimmer" />
          <div className="h-4 w-1/2 rounded animate-shimmer" />
        </div>
      </div>

      {variant === "job" && (
        <div className="space-y-2">
          <div className="h-4 w-full rounded animate-shimmer" />
          <div className="h-4 w-2/3 rounded animate-shimmer" />
        </div>
      )}

      {showTags && (
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full animate-shimmer" />
          <div className="h-6 w-20 rounded-full animate-shimmer" />
          <div className="h-6 w-14 rounded-full animate-shimmer" />
        </div>
      )}

      {showAction && (
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 w-24 rounded animate-shimmer" />
          <div className="h-9 w-28 rounded-md animate-shimmer" />
        </div>
      )}
    </div>
  );
}

interface SkeletonJobCardProps {
  className?: string;
}

export function SkeletonJobCard({ className }: SkeletonJobCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-6 space-y-4",
        className
      )}
    >
      {/* Header: Logo + Title + Company */}
      <div className="flex gap-4">
        <div className="h-14 w-14 rounded-lg animate-shimmer flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 rounded animate-shimmer" />
          <div className="h-4 w-1/2 rounded animate-shimmer" />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded animate-shimmer" />
        <div className="h-4 w-5/6 rounded animate-shimmer" />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-20 rounded-full animate-shimmer" />
        <div className="h-6 w-16 rounded-full animate-shimmer" />
        <div className="h-6 w-24 rounded-full animate-shimmer" />
      </div>

      {/* Footer: Salary + Button */}
      <div className="flex justify-between items-center pt-2 border-t">
        <div className="h-5 w-28 rounded animate-shimmer" />
        <div className="h-10 w-32 rounded-md animate-shimmer" />
      </div>
    </div>
  );
}

interface SkeletonCandidateCardProps {
  className?: string;
}

export function SkeletonCandidateCard({ className }: SkeletonCandidateCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-6 space-y-4",
        className
      )}
    >
      {/* Header: Avatar + Name + Role */}
      <div className="flex gap-4">
        <div className="h-16 w-16 rounded-full animate-shimmer flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-1/2 rounded animate-shimmer" />
          <div className="h-4 w-1/3 rounded animate-shimmer" />
          <div className="h-3 w-2/3 rounded animate-shimmer" />
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-16 rounded-full animate-shimmer" />
        <div className="h-6 w-20 rounded-full animate-shimmer" />
        <div className="h-6 w-14 rounded-full animate-shimmer" />
        <div className="h-6 w-18 rounded-full animate-shimmer" />
      </div>

      {/* Match Score */}
      <div className="flex items-center gap-3">
        <div className="h-4 w-20 rounded animate-shimmer" />
        <div className="h-2 flex-1 rounded-full animate-shimmer" />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <div className="h-9 flex-1 rounded-md animate-shimmer" />
        <div className="h-9 w-9 rounded-md animate-shimmer" />
      </div>
    </div>
  );
}

export default SkeletonCard;
