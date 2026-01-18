import { cn } from '@/lib/utils';
import { APP_NAME } from '@/constants/app';

interface GlassFooterProps {
  className?: string;
}

export function GlassFooter({ className }: GlassFooterProps) {
  return (
    <footer
      className={cn(
        // Glassmorphism effect
        "glass",
        // Positioning - fixed at bottom of viewport
        "fixed bottom-0 left-0 right-0 z-50",
        // Dimensions
        "h-10",
        // Layout - centered content
        "flex items-center justify-center",
        // Typography
        "text-sm text-muted-foreground",
        className
      )}
    >
      <span className="font-medium">{APP_NAME}</span>
    </footer>
  );
}
