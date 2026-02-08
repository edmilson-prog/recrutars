import type { ReactNode } from 'react';

/**
 * Converte **bold** inline em <strong> via regex + React fragments.
 * Retorna a string original se não houver marcadores de bold.
 */
export function parseInlineMarkdown(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={match.index}>{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 1 ? parts : text;
}

/**
 * Renderiza conteúdo markdown simplificado de análises IA.
 * Suporta: headers (##/###), numbered sections, bullet points, tabelas, bold inline.
 */
export function renderAnalysisContent(content: string): ReactNode[] {
  const lines = content.split('\n');

  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;

    // Headers (## or ###)
    if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      const text = trimmed.replace(/^#+\s*/, '');
      return (
        <h4 key={i} className="font-semibold text-sm mt-4 mb-1">
          {parseInlineMarkdown(text)}
        </h4>
      );
    }

    // Numbered sections (1. **Title** rest)
    const numberedMatch = trimmed.match(/^(\d+)\.\s*\*\*(.*?)\*\*(.*)/);
    if (numberedMatch) {
      return (
        <h4 key={i} className="font-semibold text-sm mt-4 mb-1">
          {numberedMatch[1]}. {numberedMatch[2]}
          {numberedMatch[3] && (
            <span className="font-normal text-muted-foreground">
              {parseInlineMarkdown(numberedMatch[3])}
            </span>
          )}
        </h4>
      );
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('✅') || trimmed.startsWith('⚠️') || trimmed.startsWith('🔴')) {
      const text = trimmed.replace(/^[-*]\s*/, '');
      return (
        <li key={i} className="text-sm text-muted-foreground ml-4 mb-1 list-none">
          {parseInlineMarkdown(text)}
        </li>
      );
    }

    // Table rows (| col1 | col2 |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').filter(Boolean).map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) return null;
      return (
        <div key={i} className="flex gap-4 text-xs text-muted-foreground py-0.5">
          {cells.map((cell, j) => (
            <span key={j} className="flex-1">
              {parseInlineMarkdown(cell)}
            </span>
          ))}
        </div>
      );
    }

    // Bold-only line
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      return (
        <p key={i} className="text-sm font-medium mt-2">
          {trimmed.replace(/\*\*/g, '')}
        </p>
      );
    }

    // Regular paragraph
    return (
      <p key={i} className="text-sm text-muted-foreground mb-1">
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  });
}
