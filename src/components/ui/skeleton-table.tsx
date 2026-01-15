import { cn } from "@/lib/utils";

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
  showHeader?: boolean;
  showCheckbox?: boolean;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
  showHeader = true,
  showCheckbox = false,
}: SkeletonTableProps) {
  const totalColumns = showCheckbox ? columns + 1 : columns;

  return (
    <div className={cn("w-full rounded-lg border", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {showHeader && (
            <thead className="border-b bg-muted/50">
              <tr>
                {showCheckbox && (
                  <th className="w-12 p-4">
                    <div className="h-4 w-4 rounded animate-shimmer" />
                  </th>
                )}
                {Array.from({ length: columns }).map((_, index) => (
                  <th key={index} className="p-4 text-left">
                    <div
                      className={cn(
                        "h-4 rounded animate-shimmer",
                        index === 0 ? "w-32" : "w-24"
                      )}
                    />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {showCheckbox && (
                  <td className="w-12 p-4">
                    <div className="h-4 w-4 rounded animate-shimmer" />
                  </td>
                )}
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="p-4">
                    <div
                      className={cn(
                        "h-4 rounded animate-shimmer",
                        colIndex === 0 ? "w-40" : "w-20"
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface SkeletonTableRowProps {
  columns?: number;
  className?: string;
  showCheckbox?: boolean;
  showAvatar?: boolean;
}

export function SkeletonTableRow({
  columns = 4,
  className,
  showCheckbox = false,
  showAvatar = false,
}: SkeletonTableRowProps) {
  return (
    <tr className={cn("border-b", className)}>
      {showCheckbox && (
        <td className="w-12 p-4">
          <div className="h-4 w-4 rounded animate-shimmer" />
        </td>
      )}
      {showAvatar && (
        <td className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full animate-shimmer" />
            <div className="h-4 w-24 rounded animate-shimmer" />
          </div>
        </td>
      )}
      {Array.from({ length: showAvatar ? columns - 1 : columns }).map(
        (_, index) => (
          <td key={index} className="p-4">
            <div
              className={cn(
                "h-4 rounded animate-shimmer",
                index === 0 && !showAvatar ? "w-32" : "w-20"
              )}
            />
          </td>
        )
      )}
    </tr>
  );
}

export default SkeletonTable;
