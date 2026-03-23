/**
 * TestCompletionSummary
 * Tela de conclusão do teste Gauge-Pro com estatísticas e timeline.
 * Usada em ambos os fluxos: unified (team member) e legacy (candidato).
 */

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Timer, Brain, Route, Radar, Users, Sparkles, Loader2, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GAUGE_PRO_CONFIG } from '@/data/gaugeProConfig';

interface TestCompletionSummaryProps {
  candidateName: string;
  candidateCpf?: string;
  candidatePhone?: string;
  companyName: string;
  elapsedSeconds: number;
  isAnalysisReady: boolean;
  onViewResult?: () => void;
  children?: React.ReactNode;
}

// --- Helpers ---

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${minutes}min ${secs.toString().padStart(2, '0')}s`;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits;
  if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  return phone;
}

// --- Animated Counter ---

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>();
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, prefersReducedMotion]);

  return value;
}

// --- Stats Data ---

const TOTAL_WORDS = GAUGE_PRO_CONFIG.part1.selectionsPerList * GAUGE_PRO_CONFIG.part1.totalSteps; // 50
const TOTAL_SCENARIOS = GAUGE_PRO_CONFIG.part2.totalScenarios; // 15
const TOTAL_DIMENSIONS = 5;
const TOTAL_PERSPECTIVES = 2;
const TOTAL_DATA_POINTS = TOTAL_WORDS + TOTAL_SCENARIOS; // 65

// --- Framer Motion Variants ---

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', damping: 12, stiffness: 200 },
  },
};

// --- Stat Card ---

interface StatCardProps {
  icon: React.ElementType;
  value: number;
  suffix?: string;
  label: string;
  sublabel?: string;
  delay?: number;
}

function StatCard({ icon: Icon, value, suffix, label, sublabel, delay = 0 }: StatCardProps) {
  const animatedValue = useCountUp(value, 800);

  return (
    <motion.div
      variants={itemVariants}
      className="bg-card border border-border/50 border-l-2 border-l-secondary rounded-lg p-4 space-y-2 transition-transform duration-200 hover:scale-[1.02]"
    >
      <div className="bg-secondary/10 rounded-lg p-2 w-fit">
        <Icon className="w-4 h-4 text-secondary" />
      </div>
      <p className="text-2xl font-bold tracking-tight">
        {suffix ? `${animatedValue}${suffix}` : animatedValue}
      </p>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sublabel && (
          <p className="text-[10px] text-muted-foreground/70">{sublabel}</p>
        )}
      </div>
    </motion.div>
  );
}

// --- Timeline Step ---

interface TimelineStepProps {
  label: string;
  status: 'done' | 'processing' | 'pending';
  isLast?: boolean;
}

function TimelineStep({ label, status, isLast }: TimelineStepProps) {
  return (
    <div className="flex gap-3">
      {/* Indicator column */}
      <div className="flex flex-col items-center">
        {status === 'done' && (
          <div className="w-7 h-7 rounded-full bg-test-complete-bg flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-test-complete-border" />
          </div>
        )}
        {status === 'processing' && (
          <div className="w-7 h-7 rounded-full border-2 border-secondary animate-pulse flex items-center justify-center shrink-0">
            <Loader2 className="w-3.5 h-3.5 text-secondary animate-spin" />
          </div>
        )}
        {status === 'pending' && (
          <div className="w-7 h-7 rounded-full border-2 border-border shrink-0" />
        )}
        {/* Connecting line */}
        {!isLast && (
          <div className={`w-0.5 flex-1 min-h-[20px] ${
            status === 'done' ? 'bg-test-complete-border/50' : 'border-l-2 border-dashed border-border'
          }`} />
        )}
      </div>
      {/* Label */}
      <div className="pb-4">
        <p className={`text-sm ${
          status === 'done' ? 'text-foreground' :
          status === 'processing' ? 'text-foreground font-medium' :
          'text-muted-foreground'
        }`}>
          {label}
        </p>
      </div>
    </div>
  );
}

// --- Main Component ---

export function TestCompletionSummary({
  candidateName,
  candidateCpf,
  candidatePhone,
  companyName,
  elapsedSeconds,
  isAnalysisReady,
  onViewResult,
  children,
}: TestCompletionSummaryProps) {
  const minutes = Math.floor(elapsedSeconds / 60);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-8 py-10"
    >
      {/* Zone A: Celebration Header */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <motion.div
          variants={iconVariants}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-test-complete-bg mx-auto shadow-[0_0_60px_rgba(16,185,129,0.15)] dark:shadow-[0_0_80px_rgba(16,185,129,0.2)]"
        >
          <CheckCircle2 className="w-12 h-12 text-test-complete-border" />
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Avaliação Concluída!
        </h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          {isAnalysisReady
            ? 'Sua análise comportamental está pronta.'
            : 'Obrigado por dedicar seu tempo. Suas respostas estão sendo processadas.'}
        </p>
      </motion.div>

      {/* Zone B: Identity Card */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-4 rounded-xl border bg-card p-4"
      >
        <div className="shrink-0 w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
          {getInitials(candidateName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">{candidateName}</p>
          {(candidateCpf || candidatePhone) && (
            <p className="text-xs text-muted-foreground truncate">
              {candidateCpf && (
                <span className="font-mono">CPF: {candidateCpf}</span>
              )}
              {candidateCpf && candidatePhone && (
                <span className="mx-1">·</span>
              )}
              {candidatePhone && (
                <span>{formatPhoneDisplay(candidatePhone)}</span>
              )}
            </p>
          )}
        </div>
        {companyName && (
          <span className="shrink-0 bg-secondary/10 text-secondary text-xs font-medium rounded-full px-3 py-1 hidden sm:inline">
            {companyName}
          </span>
        )}
      </motion.div>

      {/* Zone C: Statistics Grid */}
      <motion.div variants={itemVariants} className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium px-1">
          Sua Avaliação em Números
        </p>
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-3 gap-3"
        >
          <StatCard
            icon={Timer}
            value={minutes}
            suffix="min"
            label="Tempo de avaliação"
            sublabel={formatDuration(elapsedSeconds)}
          />
          <StatCard
            icon={Brain}
            value={TOTAL_WORDS}
            label="Palavras analisadas"
            sublabel="25 autopercepção + 25 externa"
          />
          <StatCard
            icon={Route}
            value={TOTAL_SCENARIOS}
            label="Cenários situacionais"
          />
          <StatCard
            icon={Radar}
            value={TOTAL_DIMENSIONS}
            label="Dimensões comportamentais"
            sublabel="Mapeadas pela avaliação"
          />
          <StatCard
            icon={Users}
            value={TOTAL_PERSPECTIVES}
            label="Perspectivas cruzadas"
            sublabel="Como você se vê × Como outros te veem"
          />
          <StatCard
            icon={Sparkles}
            value={TOTAL_DATA_POINTS}
            label="Respostas processadas"
            sublabel="Analisadas por inteligência artificial"
          />
        </motion.div>
      </motion.div>

      {/* Zone D: Timeline */}
      <motion.div variants={itemVariants} className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium px-1">
          Próximos Passos
        </p>
        <div className="rounded-xl border bg-card p-5">
          <TimelineStep label="Avaliação concluída" status="done" />
          <TimelineStep
            label="Análise por inteligência artificial"
            status={isAnalysisReady ? 'done' : 'processing'}
          />
          <TimelineStep
            label={`Resultado compartilhado com ${companyName || 'a empresa'}`}
            status={isAnalysisReady ? 'done' : 'pending'}
            isLast
          />
        </div>
      </motion.div>

      {/* Zone E: Actions */}
      <motion.div variants={itemVariants} className="space-y-4">
        {/* Slot para ativação de conta (legacy flow) */}
        {children}

        {/* Botão primário */}
        {onViewResult && (
          <Button
            onClick={onViewResult}
            disabled={!isAnalysisReady}
            size="lg"
            className="w-full gap-2"
          >
            {isAnalysisReady ? (
              <>Ver Meu Resultado <ArrowRight className="w-4 h-4" /></>
            ) : (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processando Análise...</>
            )}
          </Button>
        )}

        {/* Nota de confidencialidade */}
        <p className="text-xs text-muted-foreground text-center max-w-md mx-auto">
          Seus resultados detalhados são confidenciais e compartilhados apenas com{' '}
          <span className="font-medium text-foreground">{companyName || 'a empresa'}</span>.
        </p>
      </motion.div>
    </motion.div>
  );
}
