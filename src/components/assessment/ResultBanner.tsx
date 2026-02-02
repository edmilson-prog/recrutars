/**
 * ResultBanner Component
 * PRD-047: Teste Geral do Candidato
 *
 * Banner de parabéns com score, XP e badge conquistado
 */

import { motion } from 'framer-motion';
import { CheckCircle2, Trophy, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultBannerProps {
  overallScore: number;
  xpAwarded: number;
  badgeName: string;
  className?: string;
}

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excelente', color: 'text-green-500' };
  if (score >= 60) return { label: 'Muito Bom', color: 'text-blue-500' };
  if (score >= 40) return { label: 'Bom', color: 'text-amber-500' };
  return { label: 'Em Desenvolvimento', color: 'text-orange-500' };
}

export function ResultBanner({
  overallScore,
  xpAwarded,
  badgeName,
  className,
}: ResultBannerProps) {
  const scoreInfo = getScoreLabel(overallScore);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'bg-gradient-to-br from-primary/20 via-primary/10 to-transparent',
        'rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden',
        className
      )}
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -10, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 10, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
          className="absolute -bottom-10 -left-10 w-40 h-40 bg-success/10 rounded-full blur-3xl"
        />
      </div>

      {/* Success icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="relative"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        {/* Confetti effect */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0.5],
              y: [-20, -60],
              x: (i % 2 === 0 ? 1 : -1) * (20 + i * 10),
            }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
            className="absolute top-10 left-1/2"
          >
            <Star className="w-4 h-4 text-warning fill-warning" />
          </motion.div>
        ))}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl sm:text-3xl font-bold text-foreground mb-2"
      >
        Teste Concluído!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mb-6"
      >
        Parabéns! Seu perfil comportamental foi gerado com sucesso.
      </motion.p>

      {/* Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-6"
      >
        <div className="text-6xl font-bold text-foreground">
          {overallScore}
          <span className="text-2xl text-muted-foreground">%</span>
        </div>
        <div className={cn('text-lg font-medium mt-1', scoreInfo.color)}>
          {scoreInfo.label}
        </div>
      </motion.div>

      {/* Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center gap-4"
      >
        {/* XP */}
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span className="font-bold text-amber-600">+{xpAwarded} XP</span>
        </div>

        {/* Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full">
          <Trophy className="w-5 h-5 text-purple-500" />
          <span className="font-bold text-purple-600">{badgeName}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Versão compacta para cards
 */
export function ResultBannerCompact({
  overallScore,
  className,
}: {
  overallScore: number;
  className?: string;
}) {
  const scoreInfo = getScoreLabel(overallScore);

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 bg-success/10 rounded-xl',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
        <CheckCircle2 className="w-6 h-6 text-success" />
      </div>
      <div>
        <div className="font-bold text-foreground">
          Score: {overallScore}%
        </div>
        <div className={cn('text-sm', scoreInfo.color)}>{scoreInfo.label}</div>
      </div>
    </div>
  );
}
