/**
 * CSATPrompt Component
 * PRD-082: Admin Helpdesk Intelligence
 *
 * In-app modal for CSAT rating. Shows on next visit after ticket is resolved.
 */

import { useState } from 'react';
import { Star, MessageSquare, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CSATPromptProps {
  ticketSubject: string;
  onSubmit: (rating: number, comment?: string) => Promise<void>;
  onDismiss: () => void;
}

const ratingLabels: Record<number, string> = {
  1: 'Muito insatisfeito',
  2: 'Insatisfeito',
  3: 'Neutro',
  4: 'Satisfeito',
  5: 'Muito satisfeito',
};

export function CSATPrompt({ ticketSubject, onSubmit, onDismiss }: CSATPromptProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment.trim() || undefined);
      toast({
        title: 'Obrigado pelo feedback!',
        description: 'Sua avaliação nos ajuda a melhorar o suporte.',
      });
    } catch {
      toast({
        title: 'Erro ao enviar avaliação',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Como foi nosso atendimento?
          </DialogTitle>
          <DialogDescription>
            Seu ticket <span className="font-medium">"{ticketSubject}"</span> foi resolvido.
            Conte como foi sua experiência.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Star rating */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      value <= displayRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    )}
                  />
                </button>
              ))}
            </div>
            {displayRating > 0 && (
              <span className="text-sm text-muted-foreground">
                {ratingLabels[displayRating]}
              </span>
            )}
          </div>

          {/* Comment (optional) */}
          <div>
            <Textarea
              placeholder="Algum comentário? (opcional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onDismiss} disabled={isSubmitting}>
            Agora não
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
          >
            Enviar avaliação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
