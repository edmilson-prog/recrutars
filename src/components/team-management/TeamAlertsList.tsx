import { AlertTriangle, Building2, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { motion } from "framer-motion";

import type { TeamAlert, TeamAlertType } from "@/types/teamManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fadeInUp } from "@/lib/animations";

interface TeamAlertsListProps {
  alerts: TeamAlert[];
  maxItems?: number;
}

const alertConfig: Record<
  TeamAlertType,
  {
    icon: React.ElementType;
    iconColor: string;
    bgColor: string;
  }
> = {
  no_test: {
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  old_test: {
    icon: Clock,
    iconColor: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  dept_unmapped: {
    icon: Building2,
    iconColor: "text-red-600",
    bgColor: "bg-red-100",
  },
  retest_due: {
    icon: RefreshCw,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-100",
  },
};

const severityConfig: Record<
  TeamAlert["severity"],
  { label: string; className: string }
> = {
  warning: {
    label: "Atenção",
    className: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
  },
  info: {
    label: "Info",
    className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
  },
  critical: {
    label: "Crítico",
    className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
  },
};

export function TeamAlertsList({ alerts, maxItems = 5 }: TeamAlertsListProps) {
  const visibleAlerts = alerts.slice(0, maxItems);

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" exit="exit">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alertas de Mapeamento</CardTitle>
        </CardHeader>
        <CardContent>
          {visibleAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <CheckCircle className="h-10 w-10 text-green-500 mb-3" />
              <p className="text-sm font-medium">Nenhum alerta pendente</p>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
              {visibleAlerts.map((alert) => {
                const config = alertConfig[alert.type];
                const severity = severityConfig[alert.severity];
                const Icon = config.icon;

                return (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        config.bgColor
                      )}
                    >
                      <Icon className={cn("h-4 w-4", config.iconColor)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm leading-snug">{alert.message}</p>
                        <Badge className={cn("shrink-0", severity.className)}>
                          {severity.label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(alert.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
