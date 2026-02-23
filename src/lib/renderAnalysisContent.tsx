import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  Check, AlertTriangle, XCircle, MessageSquare,
  ThumbsUp, BarChart3, Lightbulb, FileText,
  ShieldAlert, Sparkles, User, Target,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';

// ─── Inline Markdown ─────────────────────────────────────────

/**
 * Converte **bold** inline em <strong> via regex + React fragments.
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

// ─── Block Types ─────────────────────────────────────────────

type BulletVariant = 'check' | 'warning' | 'danger' | 'neutral';

interface Block {
  type: 'header' | 'numbered-header' | 'bullet' | 'table-row' | 'bold-line' | 'separator' | 'empty' | 'paragraph';
  raw: string;
  title?: string;
  number?: string;
  headerTitle?: string;
  headerRest?: string;
  bulletVariant?: BulletVariant;
  bulletText?: string;
  cells?: string[];
}

type SectionType =
  | 'strengths' | 'attention' | 'danger' | 'questions'
  | 'scores' | 'recommendation' | 'summary' | 'fit' | 'neutral';

// ─── Theme Configs ───────────────────────────────────────────

interface SectionTheme {
  icon: React.ComponentType<LucideProps>;
  borderColor: string;
  bgColor: string;
  iconBg: string;
  iconColor: string;
}

const SECTION_THEMES: Record<SectionType, SectionTheme> = {
  strengths: {
    icon: ThumbsUp,
    borderColor: 'border-l-green-500',
    bgColor: 'bg-green-50/50 dark:bg-green-950/20',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  attention: {
    icon: AlertTriangle,
    borderColor: 'border-l-amber-500',
    bgColor: 'bg-amber-50/50 dark:bg-amber-950/20',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  danger: {
    icon: ShieldAlert,
    borderColor: 'border-l-red-500',
    bgColor: 'bg-red-50/50 dark:bg-red-950/20',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  questions: {
    icon: MessageSquare,
    borderColor: 'border-l-cyan-500',
    bgColor: 'bg-cyan-50/50 dark:bg-cyan-950/20',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  scores: {
    icon: BarChart3,
    borderColor: 'border-l-primary',
    bgColor: 'bg-primary/5 dark:bg-primary/10',
    iconBg: 'bg-primary/10 dark:bg-primary/20',
    iconColor: 'text-primary',
  },
  recommendation: {
    icon: Lightbulb,
    borderColor: 'border-l-primary',
    bgColor: 'bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10',
    iconBg: 'bg-primary/10 dark:bg-primary/20',
    iconColor: 'text-primary',
  },
  summary: {
    icon: User,
    borderColor: 'border-l-primary',
    bgColor: 'bg-primary/5 dark:bg-primary/10',
    iconBg: 'bg-primary/10 dark:bg-primary/20',
    iconColor: 'text-primary',
  },
  fit: {
    icon: Target,
    borderColor: 'border-l-cyan-500',
    bgColor: 'bg-cyan-50/50 dark:bg-cyan-950/20',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  neutral: {
    icon: FileText,
    borderColor: 'border-l-border',
    bgColor: 'bg-muted/30 dark:bg-muted/20',
    iconBg: 'bg-muted dark:bg-muted/50',
    iconColor: 'text-muted-foreground',
  },
};

const BULLET_CONFIG: Record<BulletVariant, {
  icon: React.ComponentType<LucideProps>;
  bgColor: string;
  iconColor: string;
  srLabel: string;
}> = {
  check: {
    icon: Check,
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    srLabel: 'Ponto forte',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    srLabel: 'Ponto de atenção',
  },
  danger: {
    icon: XCircle,
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    srLabel: 'Alerta',
  },
  neutral: {
    icon: Check,
    bgColor: 'bg-muted',
    iconColor: 'text-muted-foreground',
    srLabel: 'Item',
  },
};

// ─── Pass 1: Parse Lines ─────────────────────────────────────

function parseLine(line: string): Block {
  const trimmed = line.trim();

  if (!trimmed) return { type: 'empty', raw: line };
  if (/^-{3,}$/.test(trimmed)) return { type: 'separator', raw: line };

  // Headers (# / ## / ###)
  const headerMatch = trimmed.match(/^#{1,3}\s+(.*)/);
  if (headerMatch) {
    return { type: 'header', raw: line, title: headerMatch[1] };
  }

  // Numbered sections: 1. **Title** rest
  const numberedMatch = trimmed.match(/^(\d+)\.\s*\*\*(.*?)\*\*(.*)/);
  if (numberedMatch) {
    return {
      type: 'numbered-header',
      raw: line,
      number: numberedMatch[1],
      headerTitle: numberedMatch[2],
      headerRest: numberedMatch[3].trim(),
    };
  }

  // Emoji bullets (✅ / ⚠️ / 🔴)
  const emojiMatch = trimmed.match(/^(✅|⚠️|🔴)\s*(.*)/);
  if (emojiMatch) {
    const map: Record<string, BulletVariant> = { '✅': 'check', '⚠️': 'warning', '🔴': 'danger' };
    return { type: 'bullet', raw: line, bulletVariant: map[emojiMatch[1]] || 'neutral', bulletText: emojiMatch[2] };
  }

  // Standard bullets (- / *)
  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
    return { type: 'bullet', raw: line, bulletVariant: 'neutral', bulletText: trimmed.replace(/^[-*]\s*/, '') };
  }

  // Table rows
  if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
    const cells = trimmed.split('|').filter(Boolean).map((c) => c.trim());
    // Skip separator rows (|---|---|)
    if (cells.every((c) => /^[-:]+$/.test(c))) return { type: 'empty', raw: line };
    return { type: 'table-row', raw: line, cells };
  }

  // Bold-only line (**text**)
  if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
    const inner = trimmed.slice(2, -2);
    if (!inner.includes('**')) {
      return { type: 'bold-line', raw: line, title: inner };
    }
  }

  return { type: 'paragraph', raw: line };
}

// ─── Section Type Detection ──────────────────────────────────

function detectSectionType(text: string): SectionType {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (/pontos?\s+fortes?|forcas|strengths|qualidades/.test(normalized)) return 'strengths';
  if (/atencao|cuidado|areas?\s+de\s+desenvolvimento|pontos?\s+de\s+atencao|observac/.test(normalized)) return 'attention';
  if (/red\s*flag|bandeira|risco|inconsistencia|investigac|alerta/.test(normalized)) return 'danger';
  if (/perguntas?|entrevista|questoes/.test(normalized)) return 'questions';
  if (/sintese|psicometric|dimensional|consistencia|padroes?|fundamentac|teoric/.test(normalized)) return 'scores';
  if (/recomendac|sugest|orientac/.test(normalized)) return 'recommendation';
  if (/resumo|perfil|sumario/.test(normalized)) return 'summary';
  if (/fit|adequac|aderencia/.test(normalized)) return 'fit';

  return 'neutral';
}

// ─── Pass 2: Group Into Sections ─────────────────────────────

interface Section {
  type: SectionType;
  headerBlock: Block | null;
  blocks: Block[];
}

function groupIntoSections(blocks: Block[]): Section[] {
  const sections: Section[] = [];
  let current: Section = { type: 'neutral', headerBlock: null, blocks: [] };

  for (const block of blocks) {
    if (block.type === 'header' || block.type === 'numbered-header') {
      if (current.headerBlock || current.blocks.length > 0) {
        sections.push(current);
      }
      const headerText = block.title || block.headerTitle || '';
      current = { type: detectSectionType(headerText), headerBlock: block, blocks: [] };
    } else if (block.type === 'separator') {
      if (current.headerBlock || current.blocks.length > 0) {
        sections.push(current);
      }
      current = { type: 'neutral', headerBlock: null, blocks: [] };
    } else {
      current.blocks.push(block);
    }
  }

  if (current.headerBlock || current.blocks.length > 0) {
    sections.push(current);
  }

  return sections;
}

// ─── Score Helpers ────────────────────────────────────────────

function isScoreTable(rows: Block[]): boolean {
  return rows.some((r) => r.cells?.some((c) => /D[1-5]\s*[–—-]/.test(c)) ?? false);
}

function getScoreColor(score: number): string {
  if (score >= 67) return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
  if (score >= 34) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
  return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
}

function getClassificationColor(text: string): string {
  const clean = text.toLowerCase().replace(/\*/g, '');
  if (clean.includes('alto')) return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
  if (/m[eé]dio/.test(clean)) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
  if (clean.includes('baixo')) return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
  return 'bg-muted text-muted-foreground';
}

function getProgressBarColor(score: number): string {
  if (score >= 67) return 'bg-green-500';
  if (score >= 34) return 'bg-amber-500';
  return 'bg-red-500';
}

// ─── Element Renderers ───────────────────────────────────────

function renderSectionHeader(block: Block, theme: SectionTheme, key: string): ReactNode {
  const Icon = theme.icon;
  const title =
    block.type === 'numbered-header'
      ? `${block.number}. ${block.headerTitle}`
      : block.title || '';

  return (
    <div key={key} className="flex items-center gap-2.5 mb-3">
      <div className={cn('flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0', theme.iconBg)}>
        <Icon className={cn('w-4 h-4', theme.iconColor)} />
      </div>
      <h4 className="font-semibold text-sm text-foreground tracking-tight">
        {parseInlineMarkdown(title)}
        {block.type === 'numbered-header' && block.headerRest && (
          <span className="font-normal text-muted-foreground ml-1">
            {parseInlineMarkdown(block.headerRest)}
          </span>
        )}
      </h4>
    </div>
  );
}

function renderBullet(block: Block, key: string): ReactNode {
  const variant = block.bulletVariant || 'neutral';
  const config = BULLET_CONFIG[variant];
  const BulletIcon = config.icon;

  if (variant === 'neutral') {
    return (
      <li key={key} className="flex items-start gap-2.5 text-sm mb-2">
        <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
        <span className="text-foreground/80 leading-relaxed">
          {parseInlineMarkdown(block.bulletText || '')}
        </span>
      </li>
    );
  }

  return (
    <li key={key} className="flex items-start gap-2.5 text-sm mb-2.5">
      <span className={cn('flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center', config.bgColor)}>
        <BulletIcon className={cn('w-3 h-3', config.iconColor)} />
        <span className="sr-only">{config.srLabel}</span>
      </span>
      <span className="text-foreground/80 leading-relaxed">
        {parseInlineMarkdown(block.bulletText || '')}
      </span>
    </li>
  );
}

function cleanCellText(cell: string): string {
  return cell.replace(/\*+/g, '').trim();
}

function renderScoreTable(rows: Block[], key: string): ReactNode {
  // Guard: single-row table — render all as data without header
  if (rows.length < 2) {
    return renderGenericTable(rows, key);
  }

  const headerRow = rows[0];
  const dataRows = rows.slice(1);

  return (
    <div key={key} className="my-3 rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {headerRow.cells?.map((cell, j) => (
              <TableHead key={j} scope="col" className="text-xs font-medium h-9 px-3">
                {cleanCellText(cell)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {dataRows.map((row, i) => (
            <TableRow key={i} className="border-b last:border-0">
              {row.cells?.map((cell, j) => {
                const clean = cleanCellText(cell);
                const numVal = parseInt(clean, 10);

                // First column — dimension name
                if (j === 0) {
                  return (
                    <TableCell key={j} className="text-xs font-medium px-3 py-2.5 whitespace-nowrap">
                      {clean}
                    </TableCell>
                  );
                }

                // Score column (numeric 0-100 in column 1)
                if (j === 1 && !isNaN(numVal) && numVal >= 0 && numVal <= 100) {
                  return (
                    <TableCell key={j} className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full min-w-[32px] text-center', getScoreColor(numVal))}>
                          {numVal}
                        </span>
                        <div
                          className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[60px]"
                          role="progressbar"
                          aria-valuenow={numVal}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Score ${numVal} de 100`}
                        >
                          <div
                            className={cn('h-full rounded-full transition-all', getProgressBarColor(numVal))}
                            style={{ width: `${numVal}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  );
                }

                // Classification column (Alto/Médio/Baixo)
                if (/alto|m[eé]dio|baixo/i.test(clean)) {
                  return (
                    <TableCell key={j} className="px-3 py-2.5">
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', getClassificationColor(clean))}>
                        {clean}
                      </span>
                    </TableCell>
                  );
                }

                // Delta column (+35, -2, etc.)
                if (/^[+-]\d+/.test(clean)) {
                  const deltaVal = parseInt(clean, 10);
                  const deltaColor =
                    deltaVal > 0
                      ? 'text-green-600 dark:text-green-400'
                      : deltaVal < 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-muted-foreground';
                  return (
                    <TableCell key={j} className={cn('text-xs font-medium px-3 py-2.5', deltaColor)}>
                      {clean}
                    </TableCell>
                  );
                }

                // Numeric values in other columns (Parte 1, Parte 2)
                if (!isNaN(numVal) && numVal >= 0 && numVal <= 100) {
                  return (
                    <TableCell key={j} className="text-xs px-3 py-2.5 text-foreground/70 tabular-nums">
                      {numVal}
                    </TableCell>
                  );
                }

                // Regular cell
                return (
                  <TableCell key={j} className="text-xs px-3 py-2.5 text-muted-foreground">
                    {parseInlineMarkdown(cell)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function renderGenericTable(rows: Block[], key: string): ReactNode {
  const headerRow = rows[0];
  const dataRows = rows.slice(1);

  // Single-row table — render all as data
  if (dataRows.length === 0) {
    return (
      <div key={key} className="my-3 rounded-lg border overflow-hidden">
        <Table>
          <TableBody>
            <TableRow>
              {headerRow.cells?.map((cell, j) => (
                <TableCell key={j} className="text-xs px-3 py-2.5 text-foreground/80">
                  {parseInlineMarkdown(cell)}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div key={key} className="my-3 rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {headerRow.cells?.map((cell, j) => (
              <TableHead key={j} scope="col" className="text-xs font-medium h-9 px-3">
                {cleanCellText(cell)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {dataRows.map((row, i) => (
            <TableRow key={i} className={cn('border-b last:border-0', i % 2 === 1 && 'bg-muted/20')}>
              {row.cells?.map((cell, j) => (
                <TableCell key={j} className="text-xs px-3 py-2.5 text-foreground/80">
                  {parseInlineMarkdown(cell)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function renderCallout(block: Block, key: string): ReactNode {
  return (
    <div key={key} className="flex items-start gap-3 rounded-lg bg-primary/5 border border-primary/10 px-4 py-3 my-3">
      <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
      <p className="text-sm font-medium text-foreground leading-relaxed">{block.title}</p>
    </div>
  );
}

// ─── Section Block Renderer ──────────────────────────────────

function renderSectionBlocks(blocks: Block[], keyPrefix: string): ReactNode[] {
  const elements: ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (block.type === 'empty') {
      i++;
      continue;
    }

    // Group consecutive table rows
    if (block.type === 'table-row') {
      const tableRows: Block[] = [];
      while (i < blocks.length && blocks[i].type === 'table-row') {
        tableRows.push(blocks[i]);
        i++;
      }
      if (tableRows.length > 0) {
        elements.push(
          isScoreTable(tableRows)
            ? renderScoreTable(tableRows, `${keyPrefix}-tbl-${i}`)
            : renderGenericTable(tableRows, `${keyPrefix}-tbl-${i}`),
        );
      }
      continue;
    }

    // Group consecutive bullets
    if (block.type === 'bullet') {
      const bullets: ReactNode[] = [];
      while (i < blocks.length && blocks[i].type === 'bullet') {
        bullets.push(renderBullet(blocks[i], `${keyPrefix}-li-${i}`));
        i++;
      }
      elements.push(
        <ul key={`${keyPrefix}-ul-${i}`} className="space-y-0.5 my-2">
          {bullets}
        </ul>,
      );
      continue;
    }

    // Callout (bold-only line)
    if (block.type === 'bold-line') {
      elements.push(renderCallout(block, `${keyPrefix}-co-${i}`));
      i++;
      continue;
    }

    // Regular paragraph
    if (block.type === 'paragraph') {
      elements.push(
        <p key={`${keyPrefix}-p-${i}`} className="text-sm text-foreground/80 leading-relaxed mb-2">
          {parseInlineMarkdown(block.raw.trim())}
        </p>,
      );
      i++;
      continue;
    }

    // Sub-header inside content (shouldn't happen often after grouping)
    if (block.type === 'header' || block.type === 'numbered-header') {
      const subType = detectSectionType(block.title || block.headerTitle || '');
      elements.push(renderSectionHeader(block, SECTION_THEMES[subType], `${keyPrefix}-sh-${i}`));
      i++;
      continue;
    }

    i++;
  }

  return elements;
}

// ─── Section Renderer ────────────────────────────────────────

function renderSection(section: Section, index: number): ReactNode {
  const theme = SECTION_THEMES[section.type];
  const hasContent = section.blocks.some((b) => b.type !== 'empty');

  // Preamble section (no header, loose blocks before first header)
  if (!section.headerBlock) {
    if (!hasContent) return null;
    return (
      <div key={`sec-${index}`} className="mb-3">
        {renderSectionBlocks(section.blocks, `s${index}`)}
      </div>
    );
  }

  // Section with header → semantic container
  return (
    <div
      key={`sec-${index}`}
      className={cn('rounded-lg border-l-4 p-4 mt-2 mb-4', theme.borderColor, theme.bgColor)}
      role="region"
      aria-label={section.headerBlock.title || section.headerBlock.headerTitle || undefined}
    >
      {renderSectionHeader(section.headerBlock, theme, `s${index}-hd`)}
      {hasContent && renderSectionBlocks(section.blocks, `s${index}`)}
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────

/**
 * Renderiza conteúdo markdown de análises IA com formatação semântica rica.
 *
 * Arquitetura de 2 passagens:
 * 1. Parse: linhas → blocos tipados (header, bullet, table, paragraph, callout)
 * 2. Agrupamento: blocos → seções semânticas com temas visuais por keyword detection
 */
export function renderAnalysisContent(content: string): ReactNode[] {
  const lines = content.split('\n');
  const blocks = lines.map(parseLine);
  const sections = groupIntoSections(blocks);
  return sections.map((section, i) => renderSection(section, i)).filter(Boolean);
}
