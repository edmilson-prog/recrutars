import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassHeaderProps {
  children?: ReactNode;
  className?: string;
}

export function GlassHeader({ children, className }: GlassHeaderProps) {
  return (
    <header
      className={cn(
        // Glassmorphism (igual ao GlassFooter)
        "bg-white/10 dark:bg-black/20",
        "backdrop-blur-xl",
        "border-b border-white/20 dark:border-white/10",
        "shadow-[0_4px_30px_rgba(0,0,0,0.1)]",
        // Positioning - sticky at top of content area
        "sticky top-0 z-50",
        // Dimensions
        "w-full h-16",
        // Layout
        "flex items-center",
        "px-4 md:px-8",
        className
      )}
    >
      {children}
    </header>
  );
}
