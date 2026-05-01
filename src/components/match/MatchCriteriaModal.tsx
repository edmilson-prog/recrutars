import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useJobWeightHistory } from '@/hooks/useJobWeightHistoryQuery';
import { DEFAULT_MATCH_WEIGHTS, type MatchWeights } from '@/types/matchWeights';
import { matchTemplate } from '@/lib/matchWeightTemplates';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface MatchCriteriaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
  weights: MatchWeights;
}

export function MatchCriteriaModal({ open, onOpenChange, jobId, jobTitle, weights }: MatchCriteriaModalProps) {
  const { data: history } = useJobWeightHistory(jobId);
  const isPersonalized =
    weights.skillsTechnical !== DEFAULT_MATCH_WEIGHTS.skillsTechnical ||
    weights.skillsBehavioral !== DEFAULT_MATCH_WEIGHTS.skillsBehavioral ||
    weights.experience !== DEFAULT_MATCH_WEIGHTS.experience ||
    weights.gaugePro !== DEFAULT_MATCH_WEIGHTS.gaugePro ||
    weights.location !== DEFAULT_MATCH_WEIGHTS.location;

  const activeTemplate = matchTemplate(weights);

  const rows = [
    { name: 'Skills Técnicas', current: weights.skillsTechnical, defaultValue: DEFAULT_MATCH_WEIGHTS.skillsTechnical, color: 'bg-amber-500' },
    { name: 'Skills Comportamentais', current: weights.skillsBehavioral, defaultValue: DEFAULT_MATCH_WEIGHTS.skillsBehavioral, color: 'bg-red-500' },
    { name: 'Experiência', current: weights.experience, defaultValue: DEFAULT_MATCH_WEIGHTS.experience, color: 'bg-cyan-500' },
    { name: 'Perfil Comportamental', current: weights.gaugePro, defaultValue: DEFAULT_MATCH_WEIGHTS.gaugePro, color: 'bg-violet-400' },
    { name: 'Localização', current: weights.location, defaultValue: DEFAULT_MATCH_WEIGHTS.location, color: 'bg-emerald-400' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            Critérios desta vaga
            {isPersonalized && (
              <Badge variant="outline" className="text-violet-600 border-violet-400">
                PERSONALIZADO
              </Badge>
            )}
            {activeTemplate && <Badge variant="secondary">{activeTemplate.name}</Badge>}
          </DialogTitle>
          <DialogDescription>{jobTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Distribuição dos pesos
            </div>
            <div className="flex h-3 rounded overflow-hidden bg-muted">
              {rows.map((r) => (
                <span key={r.name} className={r.color} style={{ width: `${r.current}%` }} />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
              {rows.map((r) => (
                <div key={r.name} className="flex items-center gap-1.5">
                  <span className={`inline-block w-2 h-2 rounded-sm ${r.color}`} />
                  <span>{r.name} · {r.current}%</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Comparação com o padrão geral
            </div>
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="text-left py-1">Categoria</th>
                  <th className="text-right">Esta vaga</th>
                  <th className="text-right">Padrão</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const delta = r.current - r.defaultValue;
                  const deltaText = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '=';
                  const deltaClass =
                    delta === 0
                      ? 'text-muted-foreground'
                      : delta > 0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-cyan-600 dark:text-cyan-400';
                  return (
                    <tr key={r.name} className="border-t">
                      <td className="py-1">{r.name}</td>
                      <td className="text-right">{r.current}%</td>
                      <td className={`text-right ${deltaClass}`}>
                        {r.defaultValue}% <span className="ml-1">{deltaText}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Histórico de alterações
            </div>
            {history && history.length > 0 ? (
              <ul className="space-y-1.5 text-xs">
                {history.map((h) => (
                  <li key={h.id} className="flex gap-3 p-2 bg-muted rounded">
                    <span className="text-muted-foreground min-w-[90px]">
                      {format(new Date(h.changedAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                    <span>Empresa ajustou os critérios da vaga.</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground italic">Sem alterações após publicação.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
