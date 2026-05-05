/**
 * AIMatchContent — Renderiza o markdown estruturado do dossiê em seções colapsáveis.
 * Cada bloco "## " vira um Collapsible (default fechado), com o restante do conteúdo
 * de cada seção renderizado via renderAnalysisContent existente.
 */

import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { renderAnalysisContent } from '@/lib/renderAnalysisContent';
import { cn } from '@/lib/utils';
import type { AIMatchAnalysis } from '@/types/aiMatch';

interface ParsedSection {
  /** Heading line text after "## " (may include emoji and section name). */
  title: string;
  /** Body markdown for this section (excluding the heading). */
  body: string;
}

function parseSections(markdown: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = markdown.split(/\r?\n/);
  let current: ParsedSection | null = null;
  for (const line of lines) {
    const headingMatch = /^##\s+(.+)$/.exec(line);
    if (headingMatch) {
      if (current) sections.push(current);
      current = { title: headingMatch[1].trim(), body: '' };
    } else if (current) {
      current.body += (current.body ? '\n' : '') + line;
    }
  }
  if (current) sections.push(current);
  // Drop sections with empty bodies
  return sections.filter((s) => s.body.trim().length > 0);
}

interface AIMatchContentProps {
  analysis: AIMatchAnalysis;
}

export function AIMatchContent({ analysis }: AIMatchContentProps) {
  const sections = parseSections(analysis.content);

  // If no sections parsed (e.g., AI didn't follow structure), fallback to flat render
  if (sections.length === 0) {
    return (
      <article className="prose prose-sm max-w-none dark:prose-invert">
        {renderAnalysisContent(analysis.content)}
      </article>
    );
  }

  return (
    <div className="space-y-2">
      {sections.map((section, idx) => (
        <SectionCollapsible key={idx} title={section.title} body={section.body} />
      ))}
    </div>
  );
}

function SectionCollapsible({ title, body }: ParsedSection) {
  const [open, setOpen] = useState(false); // collapsed by default
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border bg-card">
      <CollapsibleTrigger
        className="flex w-full items-center justify-between gap-2 rounded-lg px-4 py-3 text-left hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${open ? 'Recolher' : 'Expandir'} seção: ${title}`}
      >
        <h3 className="text-base font-semibold flex-1 leading-tight">{title}</h3>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform shrink-0',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4">
        <article className="prose prose-sm max-w-none dark:prose-invert">
          {renderAnalysisContent(body)}
        </article>
      </CollapsibleContent>
    </Collapsible>
  );
}
