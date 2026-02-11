/**
 * Highlight Badge Component
 * PRD-073: Destaques de candidatura customizável
 *
 * Subtle badge indicating that a candidate highlighted this item
 * in their application.
 */

import { Star } from 'lucide-react';

export function HighlightBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
      <Star className="w-3 h-3 fill-current" />
      Destaque
    </span>
  );
}
