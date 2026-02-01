/**
 * Alerts List
 * PRD-052: Alertas de pendências
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { HubAlert } from '@/types/companyTest';

interface AlertsListProps {
  alerts: HubAlert[];
}

const severityConfig = {
  error: { icon: AlertCircle, color: 'text-red-500', badge: 'destructive' as const },
  warning: { icon: AlertTriangle, color: 'text-amber-500', badge: 'secondary' as const },
  info: { icon: Info, color: 'text-blue-500', badge: 'outline' as const },
};

export function AlertsList({ alerts }: AlertsListProps) {
  const navigate = useNavigate();

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Alertas ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;
            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/empresa/testes/${alert.testId}`)}
              >
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{alert.message}</p>
                  <Badge variant={config.badge} className="mt-1 text-xs">
                    {alert.testName}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
