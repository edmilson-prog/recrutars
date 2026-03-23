import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GAUGE_PRO_CONFIG } from '@/data/gaugeProConfig';

interface GaugeProIntroProps {
  onStart: () => void;
  hasExistingResult?: boolean;
}

export function GaugeProIntro({ onStart, hasExistingResult }: GaugeProIntroProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Part 1 Card */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
            1
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              PARTE 1 - Lista de Adjetivos (10 etapas)
            </h2>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                100 palavras divididas em 5 grupos (dimensões)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                Para cada grupo, escolha <strong>5 palavras que descrevem como VOCÊ se vê</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                Depois, escolha <strong>5 palavras que OUTROS usariam</strong> para descrever você
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-border" />

      {/* Part 2 Card */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
            2
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              PARTE 2 - Situações do Dia a Dia ({GAUGE_PRO_CONFIG.part2.totalScenarios} cenários)
            </h2>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                {GAUGE_PRO_CONFIG.part2.totalScenarios} situações práticas de trabalho
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                Escolha <strong>UMA</strong> das 4 alternativas (A, B, C ou D)
              </li>
            </ul>
          </div>
        </div>
      </div>

      {hasExistingResult && (
        <p className="text-sm text-amber-600 text-center">
          Você já completou esta avaliação. Ao iniciar novamente, os resultados anteriores serão substituídos.
        </p>
      )}

      <div className="flex justify-center">
        <Button onClick={onStart} size="lg" className="gap-2">
          Iniciar Avaliação <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
