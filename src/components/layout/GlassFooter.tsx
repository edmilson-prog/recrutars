import { cn } from '@/lib/utils';
import { APP_VERSION, APP_NAME, APP_COMPANY } from '@/constants/app';
import { VersionTooltip } from './VersionTooltip';

const CURRENT_YEAR = new Date().getFullYear();

export function GlassFooter() {
  return (
    <footer
      className={cn(
        // Base
        "fixed bottom-0 left-0 right-0 z-40",
        // Glassmorphism
        "bg-white/10 dark:bg-black/20",
        "backdrop-blur-xl",
        "border-t border-white/20 dark:border-white/10",
        "shadow-[0_-4px_30px_rgba(0,0,0,0.1)]",
        // Layout
        "flex items-center justify-center gap-2",
        "h-10 md:h-12",
        "px-4 md:px-6",
        // Mobile: ajuste para BottomNav
        "mb-16 md:mb-0"
      )}
    >
      <span className="text-xs font-medium text-muted-foreground">
        {APP_NAME}
      </span>
      <span className="text-xs text-muted-foreground">·</span>
      <VersionTooltip>
        <span className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          v{APP_VERSION}
        </span>
      </VersionTooltip>
      <span className="text-xs text-muted-foreground">·</span>
      <span className="text-xs text-muted-foreground">
        © {CURRENT_YEAR}
      </span>
      <span className="text-xs text-muted-foreground">·</span>
      <span className="text-xs text-muted-foreground">
        {APP_COMPANY}
      </span>
    </footer>
  );
}
