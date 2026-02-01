/**
 * Activity Feed
 * PRD-052: Feed de atividades recentes
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Send, Plus, Play, Star, Download } from 'lucide-react';
import type { ActivityItem } from '@/types/companyTest';

interface ActivityFeedProps {
  activities: ActivityItem[];
  limit?: number;
}

const typeConfig: Record<ActivityItem['type'], { icon: typeof CheckCircle2; color: string }> = {
  test_completed: { icon: CheckCircle2, color: 'text-green-500' },
  invite_sent: { icon: Send, color: 'text-blue-500' },
  test_created: { icon: Plus, color: 'text-purple-500' },
  test_activated: { icon: Play, color: 'text-cyan-500' },
  shortlist_added: { icon: Star, color: 'text-amber-500' },
  report_downloaded: { icon: Download, color: 'text-slate-500' },
};

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
          {sorted.map((activity) => {
            const config = typeConfig[activity.type];
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
