/**
 * RequesterEngagement Component
 * PRD-082: Admin Helpdesk Intelligence
 *
 * Engagement metrics (logins, jobs, applications, tests).
 */

import { BarChart3, Briefcase, ClipboardList, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RequesterContext } from '@/types/help';

interface RequesterEngagementProps {
  context: RequesterContext;
}

export function RequesterEngagement({ context }: RequesterEngagementProps) {
  const metrics = [
    context.totalJobs !== undefined && {
      icon: Briefcase,
      label: 'Vagas',
      value: context.totalJobs,
    },
    context.totalApplications !== undefined && {
      icon: ClipboardList,
      label: 'Candidaturas',
      value: context.totalApplications,
    },
    context.totalTests !== undefined && {
      icon: Brain,
      label: 'Testes',
      value: context.totalTests,
    },
    context.totalLogins !== undefined && {
      icon: BarChart3,
      label: 'Logins',
      value: context.totalLogins,
    },
  ].filter(Boolean) as { icon: typeof Briefcase; label: string; value: number }[];

  if (metrics.length === 0) return null;

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {metrics.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-2"
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
