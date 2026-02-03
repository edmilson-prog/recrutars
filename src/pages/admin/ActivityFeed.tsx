/**
 * ActivityFeed page
 * PRD-059: Relatorios "Radar" - Live Activity Feed
 *
 * Real-time-simulated activity feed with multi-select type filters,
 * daily summary, and click-to-navigate events.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Rss,
  Filter,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ActivityEventItem, EVENT_LABELS } from '@/components/admin/reports/ActivityEventItem';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import type { ActivityEventType } from '@/types';
import { cn } from '@/lib/utils';

const ALL_EVENT_TYPES: ActivityEventType[] = [
  'new_candidate',
  'new_company',
  'new_job',
  'application',
  'test_completed',
  'subscription',
  'cancellation',
  'hire',
  'interview_scheduled',
  'moderation_action',
];

function getNavigationPath(event: { eventType: ActivityEventType; resourceId?: string }): string | null {
  switch (event.eventType) {
    case 'new_candidate':
      return '/admin/candidatos';
    case 'new_company':
      return '/admin/empresas';
    case 'new_job':
    case 'moderation_action':
      return '/admin/vagas';
    case 'application':
      return '/admin/vagas';
    case 'hire':
      return '/admin/vagas/contratacoes';
    case 'interview_scheduled':
      return '/admin/vagas/entrevistas';
    case 'subscription':
    case 'cancellation':
      return '/admin/assinaturas';
    case 'test_completed':
      return '/admin/candidatos';
    default:
      return null;
  }
}

export default function ActivityFeed() {
  const navigate = useNavigate();
  const {
    events,
    filterTypes,
    setFilterTypes,
    todaySummary,
  } = useActivityFeed();

  const handleTypeToggle = (type: ActivityEventType) => {
    setFilterTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleEventClick = (event: { eventType: ActivityEventType; resourceId?: string }) => {
    const path = getNavigationPath(event);
    if (path) {
      navigate(path);
    }
  };

  // Yesterday's event count for comparison
  const yesterdayCount = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    // Use allEvents from the events array (which may be filtered, but todaySummary uses all)
    return 0; // Simulated
  }, []);

  return (
    <DashboardLayout userType="admin">
      <AdminTabNav />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Activity Feed</h1>
              <p className="text-muted-foreground">Eventos em tempo real da plataforma</p>
            </div>
          </div>

          {/* Polling indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            Atualizacao automatica ativa
          </div>
        </div>

        {/* Summary bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Rss className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Hoje: <strong>{todaySummary.total}</strong> eventos
                  </span>
                </div>
                <div className="h-4 w-px bg-border" />
                {Object.entries(todaySummary.byType).map(([type, count]) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {EVENT_LABELS[type as ActivityEventType] || type}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtrar por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ALL_EVENT_TYPES.map((type) => {
                    const isActive = filterTypes.length === 0 || filterTypes.includes(type);
                    return (
                      <div key={type} className="flex items-center gap-2">
                        <Checkbox
                          id={`filter-${type}`}
                          checked={filterTypes.length === 0 || filterTypes.includes(type)}
                          onCheckedChange={() => handleTypeToggle(type)}
                        />
                        <Label
                          htmlFor={`filter-${type}`}
                          className={cn(
                            'text-sm cursor-pointer',
                            isActive ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {EVENT_LABELS[type]}
                        </Label>
                      </div>
                    );
                  })}

                  {filterTypes.length > 0 && (
                    <button
                      onClick={() => setFilterTypes([])}
                      className="text-xs text-primary hover:underline mt-2"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Events list */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Eventos ({events.length})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto">
                    {events.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        Nenhum evento encontrado para os filtros selecionados
                      </div>
                    ) : (
                      events.slice(0, 50).map((event) => (
                        <ActivityEventItem
                          key={event.id}
                          event={event}
                          onClick={() => handleEventClick(event)}
                        />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
