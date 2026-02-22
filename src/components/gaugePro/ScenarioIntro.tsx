import { MessageSquare, ArrowRight, Clock, ListChecks, ShieldCheck, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GAUGE_PRO_CONFIG } from '@/data/gaugeProConfig';

interface ScenarioIntroProps {
  onStart: () => void;
}

const OPTION_COLORS = [
  { letter: 'A', bg: 'bg-blue-500/15', text: 'text-blue-600', border: 'border-blue-500/30' },
  { letter: 'B', bg: 'bg-purple-500/15', text: 'text-purple-600', border: 'border-purple-500/30' },
  { letter: 'C', bg: 'bg-amber-500/15', text: 'text-amber-600', border: 'border-amber-500/30' },
  { letter: 'D', bg: 'bg-emerald-500/15', text: 'text-emerald-600', border: 'border-emerald-500/30' },
];

export function ScenarioIntro({ onStart }: ScenarioIntroProps) {
  const totalScenarios = GAUGE_PRO_CONFIG.part2.totalScenarios;

  return (
    <div className="max-w-lg mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/10">
          <MessageSquare className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Parte 2 — Cenários Situacionais</h2>
          <p className="text-muted-foreground">
            Você verá <span className="font-semibold text-foreground">{totalScenarios} situações profissionais</span>. Em cada uma, escolha a opção que melhor descreve como você agiria.
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-4 text-center space-y-1">
          <ListChecks className="w-5 h-5 text-cyan-500 mx-auto" />
          <p className="text-2xl font-bold text-foreground">{totalScenarios}</p>
          <p className="text-xs text-muted-foreground">cenários</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center space-y-1">
          <Clock className="w-5 h-5 text-cyan-500 mx-auto" />
          <p className="text-2xl font-bold text-foreground">~5 min</p>
          <p className="text-xs text-muted-foreground">tempo estimado</p>
        </div>
      </div>

      {/* Format preview */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Formato das respostas</p>
        <div className="flex items-center justify-center gap-2">
          {OPTION_COLORS.map((opt) => (
            <div
              key={opt.letter}
              className={`w-10 h-10 rounded-lg border ${opt.bg} ${opt.border} flex items-center justify-center`}
            >
              <span className={`text-sm font-bold ${opt.text}`}>{opt.letter}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-center text-muted-foreground">
          Cada cenário terá 4 alternativas — escolha apenas uma.
        </p>
      </div>

      {/* Tips */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Dicas</p>
        <div className="space-y-2">
          {[
            { icon: ShieldCheck, text: 'Não há respostas certas ou erradas — seja autêntico' },
            { icon: RotateCcw, text: 'Você pode voltar e alterar respostas a qualquer momento' },
          ].map((tip, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-2.5">
              <tip.icon className="w-4 h-4 text-cyan-500 shrink-0" />
              <span className="text-sm text-foreground/80">{tip.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Button onClick={onStart} size="lg" className="w-full gap-2">
        Começar Cenários <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
