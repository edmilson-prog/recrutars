/**
 * RecruiterDecision Component
 * PRD-048: Teste por Vaga
 *
 * Botões de decisão do recrutador (aprovar/aguardar/reprovar)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ThumbsUp,
  Clock,
  ThumbsDown,
  Check,
  MessageSquare,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Decision = 'approved' | 'pending' | 'rejected';
type AIRecommendation = 'approve' | 'evaluate' | 'reject';

interface RecruiterDecisionProps {
  currentDecision?: Decision;
  aiRecommendation: AIRecommendation;
  overallScore: number;
  recruiterNotes?: string;
  onDecision: (decision: Decision, notes?: string) => void;
  isSubmitting?: boolean;
  className?: string;
}

const decisionConfig: Record<
  Decision,
  { label: string; icon: typeof ThumbsUp; color: string; bgColor: string }
> = {
  approved: {
    label: 'Aprovado',
    icon: ThumbsUp,
    color: 'text-success',
    bgColor: 'bg-success/10 border-success/30',
  },
  pending: {
    label: 'Avaliar depois',
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
  },
  rejected: {
    label: 'Reprovado',
    icon: ThumbsDown,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10 border-destructive/30',
  },
};

const aiRecommendationConfig: Record<
  AIRecommendation,
  { label: string; color: string }
> = {
  approve: { label: 'Aprovar', color: 'text-success' },
  evaluate: { label: 'Avaliar', color: 'text-amber-500' },
  reject: { label: 'Reprovar', color: 'text-destructive' },
};

export function RecruiterDecision({
  currentDecision,
  aiRecommendation,
  overallScore,
  recruiterNotes,
  onDecision,
  isSubmitting,
  className,
}: RecruiterDecisionProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<Decision | null>(null);
  const [notes, setNotes] = useState(recruiterNotes || '');
  const [showNotesInput, setShowNotesInput] = useState(!!recruiterNotes);

  const handleDecisionClick = (decision: Decision) => {
    if (decision === 'rejected') {
      setPendingDecision(decision);
      setShowConfirmDialog(true);
    } else {
      confirmDecision(decision);
    }
  };

  const confirmDecision = (decision: Decision) => {
    onDecision(decision, notes || undefined);
    setShowConfirmDialog(false);
    setPendingDecision(null);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Current decision (if exists) */}
      {currentDecision && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'p-4 rounded-xl border',
            decisionConfig[currentDecision].bgColor
          )}
        >
          <div className="flex items-center gap-3">
            {(() => {
              const Icon = decisionConfig[currentDecision].icon;
              return (
                <Icon
                  className={cn('w-6 h-6', decisionConfig[currentDecision].color)}
                />
              );
            })()}
            <div>
              <h4
                className={cn(
                  'font-semibold',
                  decisionConfig[currentDecision].color
                )}
              >
                {decisionConfig[currentDecision].label}
              </h4>
              {recruiterNotes && (
                <p className="text-sm text-muted-foreground mt-1">
                  {recruiterNotes}
                </p>
              )}
            </div>
            <Check className={cn('w-5 h-5 ml-auto', decisionConfig[currentDecision].color)} />
          </div>
        </motion.div>
      )}

      {/* AI Recommendation */}
      <div className="bg-card rounded-xl p-4 border">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h4 className="font-medium text-foreground">Recomendação da IA</h4>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Com base no score geral de{' '}
              <span className="font-bold text-foreground">{overallScore}%</span>
              , a IA recomenda:
            </p>
            <Badge
              variant="outline"
              className={cn('mt-2', aiRecommendationConfig[aiRecommendation].color)}
            >
              {aiRecommendationConfig[aiRecommendation].label}
            </Badge>
          </div>

          {/* Score indicator */}
          <div className="text-center">
            <div
              className={cn(
                'text-3xl font-bold',
                overallScore >= 70
                  ? 'text-success'
                  : overallScore >= 50
                  ? 'text-amber-500'
                  : 'text-destructive'
              )}
            >
              {overallScore}%
            </div>
            <p className="text-xs text-muted-foreground">Score geral</p>
          </div>
        </div>
      </div>

      {/* Decision buttons */}
      {!currentDecision && (
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Sua decisão</h4>

          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => handleDecisionClick('approved')}
              disabled={isSubmitting}
              className="flex-col h-auto py-4 border-success/30 hover:bg-success/10 hover:text-success hover:border-success"
            >
              <ThumbsUp className="w-6 h-6 mb-2" />
              <span>Aprovar</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleDecisionClick('pending')}
              disabled={isSubmitting}
              className="flex-col h-auto py-4 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500"
            >
              <Clock className="w-6 h-6 mb-2" />
              <span>Avaliar depois</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleDecisionClick('rejected')}
              disabled={isSubmitting}
              className="flex-col h-auto py-4 border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            >
              <ThumbsDown className="w-6 h-6 mb-2" />
              <span>Reprovar</span>
            </Button>
          </div>

          {/* Notes */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotesInput(!showNotesInput)}
            className="w-full justify-start text-muted-foreground"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {showNotesInput ? 'Ocultar observações' : 'Adicionar observações'}
          </Button>

          {showNotesInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
            >
              <Textarea
                placeholder="Observações sobre o candidato..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </motion.div>
          )}
        </div>
      )}

      {/* Change decision button */}
      {currentDecision && (
        <Button
          variant="outline"
          onClick={() => onDecision(currentDecision, undefined)}
          className="w-full"
        >
          Alterar decisão
        </Button>
      )}

      {/* Rejection confirmation dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Confirmar reprovação
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a reprovar este candidato. Esta ação pode ser
              alterada posteriormente, mas o candidato será notificado.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-2">
            <Textarea
              placeholder="Motivo da reprovação (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDecision && confirmDecision(pendingDecision)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar reprovação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
