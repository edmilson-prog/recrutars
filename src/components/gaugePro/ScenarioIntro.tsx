import { MessageSquare, ArrowRight, BookOpen, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GAUGE_PRO_CONFIG } from '@/data/gaugeProConfig';

interface ScenarioIntroProps {
  onStart: () => void;
}

export function ScenarioIntro({ onStart }: ScenarioIntroProps) {
  const tips = [
    { icon: BookOpen, text: 'Leia a situação com atenção' },
    { icon: CheckCircle2, text: 'Escolha a opção mais próxima do que você realmente faria' },
    { icon: ShieldCheck, text: 'Não há respostas certas ou erradas' },
    { icon: RefreshCw, text: 'Você pode voltar e alterar respostas' },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
          <MessageSquare className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Parte 2 — Cenários Situacionais</h2>
          <p className="text-muted-foreground">
            Você verá {GAUGE_PRO_CONFIG.part2.totalScenarios} situações profissionais. Em cada uma, escolha a opção que melhor descreve como você agiria.
          </p>
        </div>
      </div>

      {/* Tips card */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dicas</p>
        <div className="space-y-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <tip.icon className="w-3.5 h-3.5 text-cyan-400" />
              </div>
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
