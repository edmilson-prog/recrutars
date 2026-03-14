/**
 * WebhookLog Page
 * PRD-075: Admin page to view Stripe webhook events
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Webhook,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

interface WebhookEvent {
  id: string;
  event_id: string;
  event_type: string;
  environment: 'test' | 'live';
  status: 'pending' | 'processed' | 'failed' | 'skipped';
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
  payload: Record<string, unknown> | null;
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; label: string; className: string }> = {
  processed: { icon: CheckCircle, label: 'Processado', className: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' },
  failed: { icon: XCircle, label: 'Falhou', className: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800' },
  pending: { icon: Clock, label: 'Pendente', className: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800' },
  skipped: { icon: AlertTriangle, label: 'Ignorado', className: 'text-muted-foreground bg-muted/50 border-border' },
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  'checkout.session.completed': 'Checkout Completo',
  'customer.subscription.updated': 'Assinatura Atualizada',
  'customer.subscription.deleted': 'Assinatura Cancelada',
  'invoice.payment_succeeded': 'Pagamento Sucesso',
  'invoice.payment_failed': 'Pagamento Falhou',
  'customer.subscription.trial_will_end': 'Trial Expirando',
};

export default function WebhookLog() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEnv, setFilterEnv] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('stripe_webhook_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (filterStatus !== 'all') query = query.eq('status', filterStatus);
    if (filterEnv !== 'all') query = query.eq('environment', filterEnv);
    if (filterType !== 'all') query = query.eq('event_type', filterType);

    const { data } = await query;
    setEvents((data as WebhookEvent[]) ?? []);
    setLoading(false);
  }, [filterStatus, filterEnv, filterType]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const counts = {
    total: events.length,
    processed: events.filter(e => e.status === 'processed').length,
    failed: events.filter(e => e.status === 'failed').length,
    pending: events.filter(e => e.status === 'pending').length,
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Webhook Log"
          description="Eventos recebidos do Stripe via webhook. Monitore processamento, falhas e reenvios."
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEvents}
              disabled={loading}
              className="shrink-0"
            >
              <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
              Atualizar
            </Button>
          }
          howItWorks={[
            'Histórico de eventos de webhook (Stripe, integrações)',
            'Monitore entregas bem-sucedidas e falhas',
            'Use "Atualizar" para recarregar os eventos mais recentes',
          ]}
        />

        <AdminTabNav />

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: counts.total, color: 'text-foreground' },
            { label: 'Processados', value: counts.processed, color: 'text-green-600' },
            { label: 'Falhas', value: counts.failed, color: 'text-red-600' },
            { label: 'Pendentes', value: counts.pending, color: 'text-yellow-600' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-card rounded-xl p-4 shadow-soft">
              <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
              <p className={cn('text-2xl font-bold mt-1', kpi.color)}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="processed">Processado</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="skipped">Ignorado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterEnv} onValueChange={setFilterEnv}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <SelectValue placeholder="Ambiente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Ambientes</SelectItem>
              <SelectItem value="test">Teste</SelectItem>
              <SelectItem value="live">Produção</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px] h-9 text-xs">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Tipos</SelectItem>
              {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
                <SelectItem key={type} value={type}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Events list */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              Carregando eventos...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Webhook className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Nenhum evento encontrado
            </div>
          ) : (
            events.map((event, idx) => {
              const statusCfg = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.pending;
              const StatusIcon = statusCfg.icon;
              const isExpanded = expandedId === event.id;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="bg-card rounded-lg border border-border overflow-hidden"
                >
                  <button
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : event.id)}
                  >
                    <StatusIcon className={cn('w-4 h-4 flex-shrink-0', statusCfg.className.split(' ')[0])} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {EVENT_TYPE_LABELS[event.event_type] ?? event.event_type}
                        </span>
                        <Badge variant="outline" className={cn('text-[10px]', event.environment === 'live' ? 'text-red-600 border-red-300' : 'text-blue-600 border-blue-300')}>
                          {event.environment}
                        </Badge>
                        <Badge variant="outline" className={cn('text-[10px]', statusCfg.className)}>
                          {statusCfg.label}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {event.event_id} — {new Date(event.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>

                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border p-3 space-y-2 bg-muted/20">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Event ID: </span>
                          <code className="text-[11px]">{event.event_id}</code>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tipo: </span>
                          <code className="text-[11px]">{event.event_type}</code>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Criado: </span>
                          <span>{new Date(event.created_at).toLocaleString('pt-BR')}</span>
                        </div>
                        {event.processed_at && (
                          <div>
                            <span className="text-muted-foreground">Processado: </span>
                            <span>{new Date(event.processed_at).toLocaleString('pt-BR')}</span>
                          </div>
                        )}
                      </div>

                      {event.error_message && (
                        <div className="text-xs p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                          <span className="text-red-600 font-medium">Erro: </span>
                          <span className="text-red-700 dark:text-red-400">{event.error_message}</span>
                        </div>
                      )}

                      {event.payload && (
                        <details className="text-xs">
                          <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
                            Ver payload (JSON)
                          </summary>
                          <pre className="mt-1 p-2 bg-muted rounded text-[11px] overflow-auto max-h-60">
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
