import { Sparkles, Lock, Bot, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface AIAnalysisPaywallCardProps {
  archetypeName?: string;
}

interface TeaserSectionProps {
  icon: typeof Sparkles;
  title: string;
  description: string;
  previewLines: string[];
}

function TeaserSection({ icon: Icon, title, description, previewLines }: TeaserSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <div
        className="relative rounded-md border border-border/60 bg-muted/30 p-4"
        aria-hidden="true"
      >
        <div className="space-y-2 select-none pointer-events-none blur-sm">
          {previewLines.map((line, index) => (
            <p key={index} className="text-xs leading-relaxed text-foreground/80">
              {line}
            </p>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Lock className="h-5 w-5 text-muted-foreground/40" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export function AIAnalysisPaywallCard({ archetypeName }: AIAnalysisPaywallCardProps) {
  const archetypeLabel = archetypeName ? `de perfil ${archetypeName}` : 'como o seu';

  const practicalPreview = [
    `Profissionais ${archetypeLabel} costumam se destacar em contextos que exigem articulação rápida entre pessoas e objetivos, mantendo o foco no resultado.`,
    'Esta análise traduz seu perfil em recomendações práticas de carreira, com pontos fortes acionáveis e oportunidades de desenvolvimento personalizadas.',
  ];

  const technicalPreview = [
    'A leitura técnica detalha intensidades em cada dimensão comportamental, evidenciando padrões de decisão, ritmo e preferência relacional sob pressão.',
    'Inclui interpretação cruzada entre fatores e cenários típicos onde sua combinação tende a gerar maior impacto.',
  ];

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-primary/20',
        'bg-gradient-to-br from-primary/5 via-card to-card',
        'animate-in fade-in duration-500',
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            Análise Inteligente com IA
          </CardTitle>
          <Badge
            variant="outline"
            className="gap-1 border-primary/40 bg-primary/5 text-xs font-medium text-primary"
          >
            <Lock className="h-3 w-3" aria-hidden="true" />
            Recurso Premium
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Insights gerados por IA a partir do seu resultado Gauge-Pro, disponíveis nos planos pagos.
        </p>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-6 pt-5">
        <TeaserSection
          icon={Sparkles}
          title="Análise Inteligente"
          description="Leitura prática do seu perfil com recomendações de carreira e pontos fortes."
          previewLines={practicalPreview}
        />

        <TeaserSection
          icon={Bot}
          title="Análise Técnica IA"
          description="Detalhamento aprofundado das dimensões comportamentais e padrões de decisão."
          previewLines={technicalPreview}
        />

        <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Desbloqueie a análise completa
              </p>
              <p className="text-xs text-muted-foreground">
                Veja as recomendações por extenso e a leitura técnica do seu perfil.
              </p>
            </div>

            <Button
              asChild
              size="lg"
              className="group shrink-0"
              aria-label="Desbloquear análise completa de IA fazendo upgrade do plano"
            >
              <Link to="/candidato/meu-plano">
                Desbloquear análise completa
                <ArrowRight
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </Button>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Disponível nos planos pagos.{' '}
            <Link
              to="/planos"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Veja recursos
            </Link>
            .
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
