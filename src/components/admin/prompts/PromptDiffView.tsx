/**
 * PromptDiffView — diff inline simples linha-a-linha entre dois textos.
 *
 * Não usa libs externas (myers diff seria overkill aqui). Implementação:
 * - Quebra ambos os textos em linhas
 * - LCS clássico (DP) → operações add/remove/equal
 * - Renderiza em monospace, linhas removidas em vermelho com prefix "-",
 *   linhas adicionadas em verde com prefix "+", linhas iguais cinza com " ".
 *
 * Para prompts (~50-200 linhas) é instantâneo e suficientemente legível.
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PromptDiffViewProps {
  before: string;
  after: string;
  className?: string;
  /** Se true, omite linhas iguais consecutivas após N de contexto. */
  collapseUnchanged?: boolean;
  contextLines?: number;
}

type DiffOp =
  | { type: 'equal'; line: string }
  | { type: 'add'; line: string }
  | { type: 'remove'; line: string };

function diffLines(before: string, after: string): DiffOp[] {
  const a = before.split('\n');
  const b = after.split('\n');
  const m = a.length;
  const n = b.length;

  // LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Walk back
  const ops: DiffOp[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      ops.push({ type: 'equal', line: a[i - 1] });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      ops.push({ type: 'remove', line: a[i - 1] });
      i--;
    } else {
      ops.push({ type: 'add', line: b[j - 1] });
      j--;
    }
  }
  while (i > 0) {
    ops.push({ type: 'remove', line: a[i - 1] });
    i--;
  }
  while (j > 0) {
    ops.push({ type: 'add', line: b[j - 1] });
    j--;
  }

  return ops.reverse();
}

interface DisplayLine {
  type: 'equal' | 'add' | 'remove' | 'gap';
  line: string;
  count?: number;
}

function collapse(ops: DiffOp[], context: number): DisplayLine[] {
  const result: DisplayLine[] = [];
  for (let idx = 0; idx < ops.length; idx++) {
    const op = ops[idx];
    if (op.type !== 'equal') {
      result.push(op);
      continue;
    }

    // Find run of consecutive equals
    let runEnd = idx;
    while (runEnd < ops.length && ops[runEnd].type === 'equal') runEnd++;
    const runLength = runEnd - idx;

    const isFirst = idx === 0;
    const isLast = runEnd === ops.length;
    const headKeep = isFirst ? 0 : context;
    const tailKeep = isLast ? 0 : context;

    if (runLength <= headKeep + tailKeep) {
      // Don't collapse — short run
      for (let k = idx; k < runEnd; k++) result.push(ops[k]);
    } else {
      // Keep head + gap + tail
      for (let k = idx; k < idx + headKeep; k++) result.push(ops[k]);
      result.push({ type: 'gap', line: '', count: runLength - headKeep - tailKeep });
      for (let k = runEnd - tailKeep; k < runEnd; k++) result.push(ops[k]);
    }

    idx = runEnd - 1;
  }
  return result;
}

export function PromptDiffView({
  before,
  after,
  className,
  collapseUnchanged = true,
  contextLines = 2,
}: PromptDiffViewProps) {
  const display = useMemo(() => {
    const ops = diffLines(before ?? '', after ?? '');
    return collapseUnchanged
      ? collapse(ops, contextLines)
      : ops.map((op) => ({ ...op } as DisplayLine));
  }, [before, after, collapseUnchanged, contextLines]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const op of display) {
      if (op.type === 'add') added++;
      else if (op.type === 'remove') removed++;
    }
    return { added, removed };
  }, [display]);

  if (before === after) {
    return (
      <div className={cn('rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground', className)}>
        Nenhuma alteração detectada — o texto novo é idêntico ao anterior.
      </div>
    );
  }

  return (
    <div className={cn('rounded-md border bg-muted/30 overflow-hidden', className)}>
      <div className="flex items-center justify-between border-b bg-muted/60 px-3 py-2 text-xs font-medium">
        <span className="text-muted-foreground">Diff de alterações</span>
        <div className="flex gap-3">
          <span className="text-emerald-700 dark:text-emerald-400">+{stats.added}</span>
          <span className="text-red-700 dark:text-red-400">-{stats.removed}</span>
        </div>
      </div>
      <pre className="max-h-[50vh] overflow-auto px-3 py-2 text-xs leading-5 font-mono">
        {display.map((op, idx) => {
          if (op.type === 'gap') {
            return (
              <div key={idx} className="text-muted-foreground/60 italic select-none">
                {`    … ${op.count} linha${op.count === 1 ? '' : 's'} sem alteração …`}
              </div>
            );
          }
          const prefix = op.type === 'add' ? '+ ' : op.type === 'remove' ? '- ' : '  ';
          const cls =
            op.type === 'add'
              ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
              : op.type === 'remove'
                ? 'bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100'
                : 'text-muted-foreground';
          return (
            <div key={idx} className={cn('whitespace-pre-wrap break-words', cls)}>
              <span className="select-none opacity-60">{prefix}</span>
              {op.line || ' '}
            </div>
          );
        })}
      </pre>
    </div>
  );
}
