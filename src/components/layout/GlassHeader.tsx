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
        // Glassmorphism effect
        "glass",
        // Positioning - sticky at top of content area
        "sticky top-0 z-50",
        // Dimensions
        "w-full h-16",
        // Layout
        "flex items-center",
        "px-4 md:px-8",
        // Border
        "border-b border-white/10",
        className
      )}
    >
      {children}
    </header>
  );
}
