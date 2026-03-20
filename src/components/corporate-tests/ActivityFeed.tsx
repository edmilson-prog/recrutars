/**
 * Activity Feed
 * PRD-052 + PRD-089: Feed de atividades recentes (expandido com novos eventos)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Send, Plus, Play, Star, Download, Eye, ShieldCheck, CreditCard, Undo2, Clock, type LucideIcon } from 'lucide-react';
import type { ActivityItem } from '@/types/companyTest';

interface ActivityFeedProps {
  activities: ActivityItem[];
  limit?: number;
}

type ActivityType = ActivityItem['type'] | 'invite_viewed' | 'cpf_verified' | 'test_started' | 'test_abandoned' | 'credit_consumed' | 'credit_refunded';

const typeConfig: Record<string, { icon: LucideIcon; color: string }> = {
  test_completed: { icon: CheckCircle2, color: 'text-green-500' },
  invite_sent: { icon: Send, color: 'text-blue-500' },
  test_created: { icon: Plus, color: 'text-purple-500' },
  test_activated: { icon: Play, color: 'text-cyan-500' },
  shortlist_added: { icon: Star, color: 'text-amber-500' },
  report_downloaded: { icon: Download, color: 'text-slate-500' },
  invite_viewed: { icon: Eye, color: 'text-cyan-600' },
  cpf_verified: { icon: ShieldCheck, color: 'text-green-600' },
  test_started: { icon: Play, color: 'text-amber-600' },
  test_abandoned: { icon: Clock, color: 'text-orange-500' },
  credit_consumed: { icon: CreditCard, color: 'text-purple-600' },
  credit_refunded: { icon: Undo2, color: 'text-emerald-600' },
};

const defaultConfig = { icon: CheckCircle2, color: 'text-gray-500' };

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d atrás`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function ActivityFeed({ activities, limit = 8 }: ActivityFeedProps) {
  const sorted = [...activities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sorted.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade recente</p>
          )}
          {sorted.map((activity) => {
            const config = typeConfig[activity.type] ?? defaultConfig;
            const Icon = config.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-tight">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(activity.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
