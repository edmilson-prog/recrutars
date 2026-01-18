/**
 * Tone Selector Component
 * PRD-041: Mensagens Personalizadas
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MessageTone } from '@/types/messageTemplates';
import { TONE_LABELS } from '@/types/messageTemplates';

interface ToneSelectorProps {
  selectedTone: MessageTone;
  onToneChange: (tone: MessageTone) => void;
  className?: string;
}

const TONES: MessageTone[] = ['formal', 'neutral', 'informal'];

const TONE_ICONS: Record<MessageTone, string> = {
  formal: '🎩',
  neutral: '💬',
  informal: '👋',
};

const TONE_DESCRIPTIONS: Record<MessageTone, string> = {
  formal: 'Linguagem profissional e respeitosa',
  neutral: 'Equilíbrio entre profissional e acessível',
  informal: 'Tom amigável e descontraído',
};

export function ToneSelector({
  selectedTone,
  onToneChange,
  className,
}: ToneSelectorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-foreground">
        Tom da mensagem
      </label>
      <div className="flex gap-2">
        {TONES.map((tone) => (
          <motion.button
            key={tone}
            type="button"
            onClick={() => onToneChange(tone)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'flex-1 px-4 py-3 rounded-xl border-2 transition-all',
              'flex flex-col items-center gap-1',
              selectedTone === tone
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-muted bg-card hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="text-xl">{TONE_ICONS[tone]}</span>
            <span className="font-medium text-sm">{TONE_LABELS[tone]}</span>
            <span className="text-xs opacity-75 text-center hidden sm:block">
              {TONE_DESCRIPTIONS[tone]}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
