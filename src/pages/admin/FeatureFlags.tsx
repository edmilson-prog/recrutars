/**
 * FeatureFlags Page
 * PRD-062: Feature Flags "Switch" - Dashboard & Listing
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Search, Skull, Filter,
  Flag, Zap, ShieldOff, FlaskConical,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { FlagStatusBadge } from '@/components/admin/flags/FlagStatusBadge';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { toast } from 'sonner';
import type { FlagStatus, FeatureFlag } from '@/types';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

const scopeLabels: Record<string, string> = {
  candidate: 'Candidato',
  company: 'Empresa',
  all: 'Todos',
};

const categoryLabels: Record<string, string> = {
  candidate: 'Candidato',
  company: 'Empresa',
  beta: 'Beta',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function FeatureFlags() {
  const navigate = useNavigate();
  const {
    flags,
    stats,
    toggleFlag,
    killSwitch,
    unkillSwitch,
    filterFlags,
  } = useFeatureFlags();

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Kill switch dialog
  const [killDialogOpen, setKillDialogOpen] = useState(false);
  const [killTarget, setKillTarget] = useState<FeatureFlag | null>(null);
  const [killReason, setKillReason] = useState('');

  // Filtered flags
  const filteredFlags = useMemo(() => {
    return filterFlags({
      status: statusFilter !== 'all' ? (statusFilter as FlagStatus) : undefined,
      scope: scopeFilter !== 'all' ? scopeFilter : undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      search: search || undefined,
    });
  }, [filterFlags, statusFilter, scopeFilter, categoryFilter, search]);

  // KPI cards
  const kpiCards = [
    {
      label: 'Total de Flags',
      value: stats.total,
      icon: Flag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Ativas',
      value: stats.active,
      icon: Zap,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Kill Switched',
      value: stats.killed,
      icon: Skull,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Beta',
      value: stats.beta,
      icon: FlaskConical,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  const handleToggle = (flag: FeatureFlag) => {
    if (flag.isKillSwitched) {
      unkillSwitch(flag.id);
      toast.success(`Kill switch desativado para "${flag.name}"`);
    } else {
      toggleFlag(flag.id);
      toast.success(`Flag "${flag.name}" ${flag.status === 'active' ? 'desativada' : 'ativada'}`);
    }
  };

  const handleKillSwitchClick = (flag: FeatureFlag) => {
    setKillTarget(flag);
    setKillReason('');
    setKillDialogOpen(true);
  };

  const confirmKillSwitch = () => {
    if (!killTarget || !killReason.trim()) return;
    killSwitch(killTarget.id, killReason.trim());
    toast.error(`Kill switch ativado para "${killTarget.name}"`);
    setKillDialogOpen(false);
    setKillTarget(null);
    setKillReason('');
  };

  // Categories for filter
  const categories = useMemo(() => {
    const cats = new Set(flags.map((f) => f.category));
    return Array.from(cats);
  }, [flags]);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Feature Flags"
          description="Gerencie flags de funcionalidades, rollouts progressivos e kill switches da plataforma."
          actions={
            <Button
              onClick={() => navigate('/admin/feature-flags/new')}
              className="bg-cyan-600 hover:bg-cyan-700 shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Flag
            </Button>
          }
          howItWorks={[
            'Gerencie flags de funcionalidade da plataforma',
            'Ative ou desative features para todos ou grupos específicos',
            'Configure rollouts progressivos e kill switches',
          ]}
        />

        <AdminTabNav />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{kpi.label}</p>
                        <p className="text-3xl font-bold mt-1">{kpi.value}</p>
                      </div>
                      <div className={`p-3 rounded-xl ${kpi.bgColor}`}>
                        <Icon className={`w-6 h-6 ${kpi.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por key, nome ou descrição..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos status</SelectItem>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="inactive">Inativa</SelectItem>
                  <SelectItem value="killed">Kill Switch</SelectItem>
                </SelectContent>
              </Select>
              <Select value={scopeFilter} onValueChange={setScopeFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Escopo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos escopos</SelectItem>
                  <SelectItem value="candidate">Candidato</SelectItem>
                  <SelectItem value="company">Empresa</SelectItem>
                  <SelectItem value="all_scope">Todos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabels[cat] || cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Flags Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Key</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Escopo</TableHead>
                    <TableHead className="text-center">Padrão</TableHead>
                    <TableHead className="text-center">Rollout</TableHead>
                    <TableHead>Atualizado</TableHead>
                    <TableHead className="text-center">Toggle</TableHead>
                    <TableHead className="text-center">Kill Switch</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFlags.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Nenhuma flag encontrada com os filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFlags.map((flag) => (
                      <TableRow
                        key={flag.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/admin/feature-flags/${flag.id}`)}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {flag.key}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-sm">{flag.name}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <FlagStatusBadge status={flag.status} isKillSwitched={flag.isKillSwitched} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs">
                            {scopeLabels[flag.scope] || flag.scope}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              flag.defaultValue
                                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs'
                                : 'text-xs'
                            }
                          >
                            {flag.defaultValue ? 'true' : 'false'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {flag.rolloutPercentage !== undefined ? (
                            <span className="text-sm font-medium">{flag.rolloutPercentage}%</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(flag.updatedAt)}
                        </TableCell>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <Switch
                            checked={flag.status === 'active'}
                            onCheckedChange={() => handleToggle(flag)}
                            disabled={flag.isKillSwitched}
                          />
                        </TableCell>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          {flag.isKillSwitched ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggle(flag)}
                              className="h-7 text-xs text-green-600 hover:text-green-700"
                            >
                              <ShieldOff className="w-3 h-3 mr-1" />
                              Reativar
                            </Button>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleKillSwitchClick(flag)}
                              className="h-7 text-xs"
                            >
                              <Skull className="w-3 h-3 mr-1" />
                              Kill
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kill Switch Alert Dialog */}
      <AlertDialog open={killDialogOpen} onOpenChange={setKillDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Skull className="w-5 h-5" />
              Ativar Kill Switch
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Você está prestes a ativar o kill switch para a flag{' '}
                  <strong>"{killTarget?.name}"</strong> ({killTarget?.key}).
                  Isso desativará imediatamente a funcionalidade para todos os usuários.
                </p>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Motivo (obrigatório)
                  </label>
                  <Textarea
                    value={killReason}
                    onChange={(e) => setKillReason(e.target.value)}
                    placeholder="Descreva o motivo do kill switch..."
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmKillSwitch}
              disabled={!killReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Kill Switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
