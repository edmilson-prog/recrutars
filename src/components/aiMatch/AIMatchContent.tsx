/**
 * AIMatchContent — Renderiza o markdown estruturado do dossiê.
 * Reutiliza renderAnalysisContent existente em src/lib/renderAnalysisContent.tsx
 * (mesma lib usada pela análise comportamental).
 */

import { renderAnalysisContent } from '@/lib/renderAnalysisContent';
import type { AIMatchAnalysis } from '@/types/aiMatch';

interface AIMatchContentProps {
  analysis: AIMatchAnalysis;
}

export function AIMatchContent({ analysis }: AIMatchContentProps) {
  return (
    <article className="prose prose-sm max-w-none dark:prose-invert">
      {renderAnalysisContent(analysis.content)}
    </article>
  );
}
