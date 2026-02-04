/**
 * KPICard component
 * PRD-059: Relatorios "Radar"
 *
 * Reusable card for displaying a KPI value with trend indicator,
 * comparison to previous period, and a contextual icon.
 */

import { type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ComparisonIndicator } from './ComparisonIndicator';
import { formatBRL, formatNumber, formatPercent } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  format?: 'number' | 'currency' | 'percent';
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  invertColors?: boolean;
  index?: number;
}

export function KPICard({
  title,
  value,
  previousValue,
  format = 'number',
  icon: Icon,
  trend,
  invertColors = false,
  index = 0,
}: KPICardProps) {
  const formattedValue = typeof value === 'number'
    ? format === 'currency'
      ? formatBRL(value)
      : format === 'percent'
        ? formatPercent(value)
        : formatNumber(value)
    : value;

  const currentNumeric = typeof value === 'number' ? value : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            {Icon && (
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            )}
            {previousValue !== undefined && (
              <ComparisonIndicator
                current={currentNumeric}
                previous={previousValue}
                format={format}
                invertColors={invertColors}
              />
            )}
          </div>
          <div className="text-2xl font-bold text-foreground mb-1 truncate">
            {formattedValue}
          </div>
          <div className="text-sm text-muted-foreground">{title}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
