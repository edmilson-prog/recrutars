/**
 * NotificationStatsCards
 * 4 KPI cards for notification management dashboard.
 * Displays total sent, scheduled, successful, and manual counts.
 */

import { motion } from 'framer-motion';
import { Send, Clock, CheckCircle2, PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotificationSendsStats } from '@/types/notificationSends';

interface NotificationStatsCardsProps {
  stats: NotificationSendsStats;
  activeFilter: string | null;
  onFilterClick: (filter: string | null) => void;
}

const kpiConfig = [
  {
    key: 'total',
    label: 'Total Enviadas',
    icon: Send,
    statKey: 'total' as keyof NotificationSendsStats,
    color: 'bg-primary/10 text-primary',
    activeRing: 'ring-2 ring-primary',
    hoverRing: 'hover:ring-2 hover:ring-primary/50',
  },
  {
    key: 'scheduled',
    label: 'Agendadas',
    icon: Clock,
    statKey: 'scheduled' as keyof NotificationSendsStats,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    activeRing: 'ring-2 ring-amber-400',
    hoverRing: 'hover:ring-2 hover:ring-amber-400/50',
  },
  {
    key: 'successful',
    label: 'Enviadas c/ Sucesso',
    icon: CheckCircle2,
    statKey: 'successful' as keyof NotificationSendsStats,
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    activeRing: 'ring-2 ring-emerald-400',
    hoverRing: 'hover:ring-2 hover:ring-emerald-400/50',
  },
  {
    key: 'manual',
    label: 'Manuais',
    icon: PenLine,
    statKey: 'manual' as keyof NotificationSendsStats,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    activeRing: 'ring-2 ring-purple-400',
    hoverRing: 'hover:ring-2 hover:ring-purple-400/50',
  },
] as const;

export function NotificationStatsCards({
  stats,
  activeFilter,
  onFilterClick,
}: NotificationStatsCardsProps) {
  const handleClick = (key: string) => {
    if (activeFilter === key || key === 'total') {
      onFilterClick(null);
    } else {
      onFilterClick(key);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {kpiConfig.map((kpi, index) => {
        const isActive = activeFilter === kpi.key;
        return (
          <motion.div
            key={kpi.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              type="button"
              onClick={() => handleClick(kpi.key)}
              aria-pressed={isActive}
              className={cn(
                'w-full text-left bg-card rounded-xl p-4 shadow-soft cursor-pointer transition-shadow',
                isActive ? kpi.activeRing : kpi.hoverRing,
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                  kpi.color,
                )}
              >
                <kpi.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {stats[kpi.statKey]}
              </div>
              <div className="text-xs text-muted-foreground">{kpi.label}</div>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
