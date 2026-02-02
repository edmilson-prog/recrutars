/**
 * Team KPI Cards
 * PRD-055: 6 cards de metricas do dashboard de Gestao de Equipes
 */

import { motion } from 'framer-motion';
import {
  Users,
  CheckCircle2,
  Clock,
  Building2,
  Star,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface TeamKPICardsProps {
  totalMembers: number;
  mappedMembers: number;
  pendingMembers: number;
  activeDepartments: number;
  predominantArchetype: string;
  retestPending: number;
}

const iconColorMap = {
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  green: 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
  cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400',
  red: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
} as const;

type CardColor = keyof typeof iconColorMap;

interface KPICardDef {
  label: string;
  icon: typeof Users;
  color: CardColor;
  getValue: (props: TeamKPICardsProps) => string | number;
  getSubtitle?: (props: TeamKPICardsProps) => string;
}

const cardDefinitions: KPICardDef[] = [
  {
    label: 'Total de Colaboradores',
    icon: Users,
    color: 'blue',
    getValue: (p) => p.totalMembers,
  },
  {
    label: 'Mapeados',
    icon: CheckCircle2,
    color: 'green',
    getValue: (p) =>
      p.totalMembers > 0
        ? `${Math.round((p.mappedMembers / p.totalMembers) * 100)}%`
        : '0%',
    getSubtitle: (p) => `${p.mappedMembers} de ${p.totalMembers}`,
  },
  {
    label: 'Pendentes',
    icon: Clock,
    color: 'amber',
    getValue: (p) => p.pendingMembers,
  },
  {
    label: 'Departamentos',
    icon: Building2,
    color: 'purple',
    getValue: (p) => p.activeDepartments,
  },
  {
    label: 'Arquetipo Predominante',
    icon: Star,
    color: 'cyan',
    getValue: (p) => p.predominantArchetype,
  },
  {
    label: 'Retestes Pendentes',
    icon: RefreshCw,
    color: 'red',
    getValue: (p) => p.retestPending,
  },
];

export function TeamKPICards(props: TeamKPICardsProps) {
  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {cardDefinitions.map((card) => {
        const Icon = card.icon;
        const value = card.getValue(props);
        const subtitle = card.getSubtitle?.(props);

        return (
          <motion.div key={card.label} variants={staggerItem}>
            <Card className="h-full">
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col items-start gap-3">
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full',
                      iconColorMap[card.color]
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold leading-tight">{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {card.label}
                    </p>
                    {subtitle && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
