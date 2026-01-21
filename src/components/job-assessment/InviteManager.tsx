/**
 * InviteManager Component
 * PRD-048: Teste por Vaga
 *
 * Gestão de convites enviados (internos e magic links)
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Check,
  AlertCircle,
  X,
  Mail,
  Link2,
  RefreshCw,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { JobAssessmentInvite } from '@/types/assessment';

interface InviteManagerProps {
  invites: JobAssessmentInvite[];
  onResend: (inviteId: string) => void;
  onCancel: (inviteId: string) => void;
  onViewResult: (inviteId: string) => void;
  className?: string;
}

type FilterStatus = 'all' | JobAssessmentInvite['status'];
type FilterType = 'all' | JobAssessmentInvite['type'];

const statusConfig: Record<
  JobAssessmentInvite['status'],
  { label: string; icon: typeof Clock; color: string }
> = {
  pending: {
    label: 'Aguardando',
    icon: Clock,
    color: 'text-amber-500 bg-amber-500/10',
  },
  started: {
    label: 'Em andamento',
    icon: AlertCircle,
    color: 'text-blue-500 bg-blue-500/10',
  },
  completed: {
    label: 'Concluído',
    icon: Check,
    color: 'text-success bg-success/10',
  },
  expired: {
    label: 'Expirado',
    icon: X,
    color: 'text-muted-foreground bg-muted',
  },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTimeRemaining(expiresAt: string): string {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();

  if (diff <= 0) return 'Expirado';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h restantes`;
  return `${hours}h restantes`;
}

export function InviteManager({
  invites,
  onResend,
  onCancel,
  onViewResult,
  className,
}: InviteManagerProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filtrar convites
  const filteredInvites = useMemo(() => {
    return invites.filter((inv) => {
      if (filterStatus !== 'all' && inv.status !== filterStatus) return false;
      if (filterType !== 'all' && inv.type !== filterType) return false;
      return true;
    });
  }, [invites, filterStatus, filterType]);

  // Estatísticas
  const stats = useMemo(() => {
    return {
      total: invites.length,
      pending: invites.filter((i) => i.status === 'pending').length,
      started: invites.filter((i) => i.status === 'started').length,
      completed: invites.filter((i) => i.status === 'completed').length,
      expired: invites.filter((i) => i.status === 'expired').length,
    };
  }, [invites]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="bg-card p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="bg-amber-500/10 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-amber-500">{stats.pending}</div>
          <div className="text-xs text-amber-500">Aguardando</div>
        </div>
        <div className="bg-blue-500/10 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-500">{stats.started}</div>
          <div className="text-xs text-blue-500">Em andamento</div>
        </div>
        <div className="bg-success/10 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-success">{stats.completed}</div>
          <div className="text-xs text-success">Concluídos</div>
        </div>
        <div className="bg-muted p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-muted-foreground">
            {stats.expired}
          </div>
          <div className="text-xs text-muted-foreground">Expirados</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v as FilterStatus)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Aguardando</SelectItem>
            <SelectItem value="started">Em andamento</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="expired">Expirado</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterType}
          onValueChange={(v) => setFilterType(v as FilterType)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="internal">Candidatos internos</SelectItem>
            <SelectItem value="magic_link">Links mágicos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {filteredInvites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum convite encontrado
          </div>
        ) : (
          filteredInvites.map((invite, index) => {
            const status = statusConfig[invite.status];
            const StatusIcon = status.icon;
            const isExpanded = expandedId === invite.id;

            return (
              <motion.div
                key={invite.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="bg-card rounded-lg border overflow-hidden"
              >
                {/* Main row */}
                <div className="p-3 flex items-center gap-3">
                  {/* Type icon */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      invite.type === 'internal' ? 'bg-primary/10' : 'bg-purple-500/10'
                    )}
                  >
                    {invite.type === 'internal' ? (
                      <Mail className="w-5 h-5 text-primary" />
                    ) : (
                      <Link2 className="w-5 h-5 text-purple-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate">
                        {invite.externalName ||
                          (invite.type === 'internal'
                            ? `Candidato ${invite.candidateId?.slice(0, 8)}`
                            : 'Link Mágico')}
                      </span>
                      <Badge className={status.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {invite.externalEmail || `Enviado em ${formatDate(invite.sentAt)}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {invite.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewResult(invite.id)}
                        className="h-8 w-8 p-0"
                        title="Ver resultado"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}

                    {(invite.status === 'pending' || invite.status === 'expired') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onResend(invite.id)}
                        className="h-8 w-8 p-0"
                        title="Reenviar"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    )}

                    {invite.status === 'pending' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                            title="Cancelar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancelar convite?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O candidato não
                              poderá mais acessar o teste com este convite.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Voltar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onCancel(invite.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Cancelar convite
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : invite.id)}
                      className="h-8 w-8 p-0"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-3 pb-3 border-t bg-muted/30"
                  >
                    <div className="grid grid-cols-2 gap-4 pt-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Enviado em</p>
                        <p className="font-medium">{formatDate(invite.sentAt)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expira em</p>
                        <p className="font-medium">
                          {getTimeRemaining(invite.expiresAt)}
                        </p>
                      </div>
                      {invite.startedAt && (
                        <div>
                          <p className="text-muted-foreground">Iniciado em</p>
                          <p className="font-medium">
                            {formatDate(invite.startedAt)}
                          </p>
                        </div>
                      )}
                      {invite.completedAt && (
                        <div>
                          <p className="text-muted-foreground">Completado em</p>
                          <p className="font-medium">
                            {formatDate(invite.completedAt)}
                          </p>
                        </div>
                      )}
                      {invite.type === 'magic_link' && invite.magicToken && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Token</p>
                          <p className="font-mono text-xs truncate">
                            {invite.magicToken}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
