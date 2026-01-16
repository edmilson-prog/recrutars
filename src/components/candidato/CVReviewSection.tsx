/**
 * CVReviewSection Component - PRD-038
 * Componente genérico para seção de revisão de dados extraídos
 */

import { ReactNode } from 'react';
import { CheckCircle2, HelpCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfidenceLevel, getConfidenceLevel } from '@/types/cvParser';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CVReviewSectionProps {
  title: string;
  description?: string;
  confidence?: number;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function CVReviewSection({
  title,
  description,
  confidence,
  children,
  className,
  icon,
}: CVReviewSectionProps) {
  const confidenceLevel = confidence !== undefined ? getConfidenceLevel(confidence) : undefined;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {confidenceLevel && (
            <ConfidenceIndicator level={confidenceLevel} value={confidence!} />
          )}
        </div>
        {description && (
          <CardDescription className="text-sm">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface ConfidenceIndicatorProps {
  level: ConfidenceLevel;
  value: number;
}

export function ConfidenceIndicator({ level, value }: ConfidenceIndicatorProps) {
  const config = {
    high: {
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-50',
      label: 'Alta confiança',
      description: 'Os dados extraídos parecem corretos',
    },
    medium: {
      icon: HelpCircle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50',
      label: 'Verificar',
      description: 'Recomendamos revisar estes dados',
    },
    low: {
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-50',
      label: 'Baixa confiança',
      description: 'Estes dados precisam de revisão',
    },
  };

  const { icon: Icon, color, bg, label, description } = config[level];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-help',
              bg,
              color
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{Math.round(value * 100)}%</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p className="font-medium">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface CVReviewFieldProps {
  label: string;
  value: string | null | undefined;
  onChange?: (value: string) => void;
  editable?: boolean;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'textarea';
  className?: string;
}

export function CVReviewField({
  label,
  value,
  onChange,
  editable = true,
  placeholder = 'Não detectado',
  type = 'text',
  className,
}: CVReviewFieldProps) {
  const isEmpty = !value || value.trim() === '';

  if (type === 'textarea') {
    return (
      <div className={cn('space-y-1', className)}>
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <textarea
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={!editable}
          placeholder={placeholder}
          rows={3}
          className={cn(
            'w-full px-3 py-2 rounded-md border text-sm resize-none',
            'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500',
            'disabled:bg-gray-50 disabled:text-gray-500',
            isEmpty && 'text-gray-400 italic'
          )}
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={!editable}
        placeholder={placeholder}
        className={cn(
          'w-full px-3 py-2 rounded-md border text-sm',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500',
          'disabled:bg-gray-50 disabled:text-gray-500',
          isEmpty && 'text-gray-400 italic'
        )}
      />
    </div>
  );
}
