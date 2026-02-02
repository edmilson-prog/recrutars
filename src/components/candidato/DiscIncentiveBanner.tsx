/**
 * Behavioral Test Incentive Banner Component
 * PRD-035: Banner de Incentivo ao Teste Comportamental
 *
 * Exibe banners contextuais para incentivar candidatos a completarem
 * o teste comportamental em múltiplos pontos da aplicação.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, X, Clock, Trophy, TrendingUp, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TEST_CONFIG } from '@/data/testConfig';
import { useDiscBannerDismiss, type DiscBannerContext } from '@/hooks/useDiscBannerDismiss';
import { getCandidateBehavioralProfile } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

// Configurações de texto por contexto
const bannerConfig: Record<
  DiscBannerContext,
  {
    title: string;
    description: string;
    cta: string;
    variant: 'default' | 'compact' | 'contextual';
  }
> = {
  dashboard: {
    title: 'Descubra seu Perfil Comportamental',
    description:
      `Complete o ${TEST_CONFIG.incentiveText} ${TEST_CONFIG.name} e aumente suas chances de ser encontrado pelas empresas. Perfis completos recebem 3x mais visualizações!`,
    cta: 'Aumentar Minhas Chances',
    variant: 'default',
  },
  job_low_match: {
    title: 'Seu match pode aumentar!',
    description:
      `Complete o ${TEST_CONFIG.incentiveText} para que possamos calcular sua compatibilidade real com esta vaga.`,
    cta: 'Completar Teste',
    variant: 'contextual',
  },
  after_application: {
    title: 'Quer se destacar?',
    description:
      'Candidatos com perfil comportamental completo têm mais chances de avançar no processo seletivo.',
    cta: 'Completar Meu Perfil',
    variant: 'compact',
  },
  invites_page: {
    title: 'Empresas valorizam perfis completos!',
    description:
      'Você tem convites pendentes. Complete seu perfil comportamental para mostrar todo seu potencial.',
    cta: 'Descobrir Meu Perfil',
    variant: 'default',
  },
};

interface DiscIncentiveBannerProps {
  context: DiscBannerContext;
  profileCompletion?: number;
  currentMatch?: number;
  potentialMatch?: number;
  onComplete?: () => void;
  className?: string;
}

export function DiscIncentiveBanner({
  context,
  profileCompletion = 70,
  currentMatch,
  potentialMatch,
  onComplete,
  className,
}: DiscIncentiveBannerProps) {
  const navigate = useNavigate();
  const { currentCandidate } = useAuth();
  const { isDismissed, dismiss } = useDiscBannerDismiss(context);

  // Verificar se o candidato já completou o teste
  const candidateId = currentCandidate?.id || 'candidate-1';
  const behavioralProfile = getCandidateBehavioralProfile(candidateId);
  const hasCompletedTest = !!behavioralProfile;

  // Não exibir se já completou o teste ou se já foi dispensado
  if (hasCompletedTest || isDismissed) {
    return null;
  }

  const config = bannerConfig[context];

  const handleCTA = () => {
    onComplete?.();
    navigate('/candidato/testes');
  };

  const handleDismiss = () => {
    dismiss();
  };

  // Variante compacta (para modal)
  if (config.variant === 'compact') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className={cn(
            'mt-4 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20',
            className
          )}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">{config.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleCTA}
            className="w-full mt-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
          >
            {config.cta}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Variante contextual (para job page com match baixo)
  if (config.variant === 'contextual' && currentMatch !== undefined) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className={cn(
            'relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 p-5',
            className
          )}
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/20 to-transparent rounded-bl-full" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  {config.title}
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">{config.description}</p>
              </div>
            </div>

            {/* Match comparison */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-muted-foreground">{currentMatch}%</div>
                  <div className="text-xs text-muted-foreground">Atual</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <div className="text-center">
                  <div className="text-lg font-bold text-amber-600">
                    {potentialMatch || `~${Math.min(currentMatch + 15, 95)}%`}
                  </div>
                  <div className="text-xs text-amber-600">Potencial</div>
                </div>
              </div>
              <Button
                onClick={handleCTA}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white whitespace-nowrap"
              >
                {config.cta}
              </Button>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-amber-500/20 transition-colors"
            aria-label="Fechar banner"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Variante padrão (dashboard e invites)
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className={cn(
          'relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 border border-cyan-500/20 p-6',
          className
        )}
      >
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-tr-full" />

        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Icon and content */}
            <div className="flex items-start gap-4 flex-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/25">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  {config.title}
                  <Badge
                    variant="secondary"
                    className="bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
                  >
                    Novo
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">{config.description}</p>

                {/* Progress bar */}
                <div className="mt-4 max-w-md">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Completude do perfil</span>
                    <span className="font-medium text-foreground">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                </div>
              </div>
            </div>

            {/* Stats and CTA */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4">
              {/* Stats badges */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 border text-xs">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-muted-foreground">85% preferem</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 border text-xs">
                  <Clock className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="text-muted-foreground">10 minutos</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 border text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-muted-foreground">+200 XP</span>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                size="lg"
                onClick={handleCTA}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25 whitespace-nowrap"
              >
                {config.cta}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-cyan-500/20 transition-colors"
          aria-label="Fechar banner"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
