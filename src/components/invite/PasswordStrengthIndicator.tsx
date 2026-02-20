/**
 * PasswordStrengthIndicator
 * PRD-081: Visual indicator for password strength during account activation
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface StrengthResult {
  score: number; // 0-4
  label: string;
  color: string;
  bgColor: string;
}

function evaluateStrength(password: string): StrengthResult {
  if (!password) {
    return { score: 0, label: '', color: 'text-muted-foreground', bgColor: 'bg-muted' };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Normalize to 1-4 scale
  if (score <= 1) return { score: 1, label: 'Fraca', color: 'text-red-500', bgColor: 'bg-red-500' };
  if (score === 2) return { score: 2, label: 'Razoavel', color: 'text-orange-500', bgColor: 'bg-orange-500' };
  if (score === 3) return { score: 3, label: 'Boa', color: 'text-yellow-500', bgColor: 'bg-yellow-500' };
  return { score: 4, label: 'Forte', color: 'text-green-500', bgColor: 'bg-green-500' };
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => evaluateStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              level <= strength.score ? strength.bgColor : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs font-medium', strength.color)}>
        {strength.label}
      </p>
    </div>
  );
}
