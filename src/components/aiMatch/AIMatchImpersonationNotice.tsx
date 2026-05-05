/**
 * AIMatchImpersonationNotice — Aviso local quando admin esta impersonando.
 * Geracao de analise IA fica indisponivel (consumiria cota da empresa).
 */

import { Eye } from 'lucide-react';

export function AIMatchImpersonationNotice() {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
      <Eye className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
      <div className="text-amber-900 dark:text-amber-200">
        <strong>Modo visualização (admin).</strong> Geração e regeneração de análise IA estão indisponíveis durante a impersonação para não consumir a cota da empresa.
      </div>
    </div>
  );
}
