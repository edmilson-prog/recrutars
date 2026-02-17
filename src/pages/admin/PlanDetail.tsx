/**
 * PlanDetail Page
 * Full-page plan editor/creator — replaces PlanEditor dialog
 * Follows FeatureFlagEditor.tsx pattern: 2-column layout with Cards + sticky sidebar
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Save, ArrowLeft, CreditCard, Plus, Trash2,
  Cloud, CloudOff, RefreshCw, Loader2, Info,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { LaunchPriceEditor } from '@/components/admin/plans/LaunchPriceEditor';
import { usePlan, useUpdatePlan, useCreatePlan } from '@/hooks/usePlansQuery';
import { useSyncPlan } from '@/hooks/useStripeQuery';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Plan, PlanPeriod, StripeEnvironment } from '@/types';

const PERIOD_LABELS: Record<PlanPeriod, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

const BLANK_PLAN: Plan = {
  id: '',
  name: '',
  slug: '',
  type: 'candidate',
  description: '',
  descriptionShort: '',
  badge: undefined,
  prices: { monthly: 0, quarterly: 0, semiannual: 0, annual: 0 },
  isActive: true,
  isFree: false,
  order: 0,
  features: [],
  createdAt: '',
};

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const { data: plan, isLoading, refetch } = usePlan(id);
  const updatePlanMutation = useUpdatePlan();
  const createPlanMutation = useCreatePlan();
  const syncPlan = useSyncPlan();

  const [editState, setEditState] = useState<Plan>({ ...BLANK_PLAN, features: [] });
  const [formInitialized, setFormInitialized] = useState(isNew);
  const [newFeature, setNewFeature] = useState('');
  const [stripeEnv, setStripeEnv] = useState<StripeEnvironment>('test');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (plan && !formInitialized) {
      setEditState({ ...plan, features: [...plan.features] });
      setFormInitialized(true);
    }
  }, [plan, formInitialized]);

  const canSave = editState.name.trim() !== '' && editState.slug.trim() !== '';

  // --- Field handlers ---

  const handleFieldChange = <K extends keyof Plan>(field: K, value: Plan[K]) => {
    setEditState(prev => ({ ...prev, [field]: value }));
  };

  const handlePriceChange = (period: PlanPeriod, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditState(prev => ({ ...prev, prices: { ...prev.prices, [period]: numValue } }));
  };

  const handlePartialChange = (updates: Partial<Plan>) => {
    setEditState(prev => ({ ...prev, ...updates }));
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setEditState(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
    setNewFeature('');
  };

  const removeFeature = (idx: number) => {
    setEditState(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));
  };

  // --- Save ---

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);

    const payload: Record<string, unknown> = {
      name: editState.name,
      slug: editState.slug,
      type: editState.type,
      description: editState.description || null,
      description_short: editState.descriptionShort || null,
      features: editState.features,
      prices: editState.prices,
      badge: editState.badge || null,
      is_free: editState.isFree,
      is_active: editState.isActive,
      sort_order: editState.order || 0,
      trial_duration_days: editState.trialDurationDays ?? null,
      discount_percentage: editState.discountPercentage ?? null,
      discount_min_period: editState.discountMinPeriod ?? null,
      bonus_tests: editState.bonusTests ?? null,
    };
    if (editState.launchPrices) payload.launch_prices = editState.launchPrices;
    if (editState.launchPriceEndDate) payload.launch_price_end_date = editState.launchPriceEndDate;

    try {
      if (isNew) {
        await createPlanMutation.mutateAsync(payload);
        toast.success('Plano criado com sucesso!');
        navigate('/admin/planos');
      } else if (id) {
        await updatePlanMutation.mutateAsync({ id, updates: payload });
        toast.success('Plano atualizado com sucesso!');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar plano.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Stripe helpers ---

  const stripeProductId = stripeEnv === 'test'
    ? editState.stripeProductIdTest : editState.stripeProductIdLive;
  const stripePriceIds = (stripeEnv === 'test'
    ? editState.stripePriceIdsTest : editState.stripePriceIdsLive) as Record<string, string> | undefined;
  const stripeSyncedAt = stripeEnv === 'test'
    ? editState.stripeSyncedAtTest : editState.stripeSyncedAtLive;
  const isSynced = !!stripeProductId;

  // --- Loading / Not Found ---

  if (!isNew && isLoading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isNew && !isLoading && !plan) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <p className="text-lg text-muted-foreground">Plano nao encontrado.</p>
          <Button variant="outline" onClick={() => navigate('/admin/planos')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Planos
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // --- Render ---

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate('/admin/planos')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <CreditCard className="w-7 h-7 text-cyan-600" />
              {isNew ? 'Novo Plano' : `Editar: ${plan?.name}`}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isNew ? 'Preencha os dados do novo plano' : `Slug: ${plan?.slug}`}
            </p>
          </div>
        </div>

        <AdminTabNav />

        {/* 2-column grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card 1: Informacoes Basicas */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Informacoes Basicas</CardTitle>
                  <CardDescription>Identifique e configure o plano</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="plan-name">Nome *</Label>
                      <Input
                        id="plan-name"
                        value={editState.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        placeholder="Ex: Essencial"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="plan-slug">Slug *</Label>
                      <Input
                        id="plan-slug"
                        value={editState.slug}
                        onChange={(e) => handleFieldChange('slug', e.target.value)}
                        placeholder="Ex: essencial"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>

                  {isNew ? (
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label>Tipo</Label>
                        <Select
                          value={editState.type}
                          onValueChange={(v) => handleFieldChange('type', v as 'candidate' | 'company')}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="candidate">Candidato</SelectItem>
                            <SelectItem value="company">Empresa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Ordem</Label>
                        <Input
                          type="number"
                          min="0"
                          value={editState.order}
                          onChange={(e) => handleFieldChange('order', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Badge</Label>
                        <Input
                          value={editState.badge || ''}
                          onChange={(e) => handleFieldChange('badge', e.target.value || undefined)}
                          placeholder="Ex: Mais popular"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Ordem</Label>
                        <Input
                          type="number"
                          min="0"
                          value={editState.order}
                          onChange={(e) => handleFieldChange('order', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Badge</Label>
                        <Input
                          value={editState.badge || ''}
                          onChange={(e) => handleFieldChange('badge', e.target.value || undefined)}
                          placeholder="Ex: Mais popular"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="plan-desc-short">Descricao curta</Label>
                    <Input
                      id="plan-desc-short"
                      value={editState.descriptionShort}
                      onChange={(e) => handleFieldChange('descriptionShort', e.target.value)}
                      placeholder="Breve resumo do plano"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="plan-desc">Descricao completa</Label>
                    <Textarea
                      id="plan-desc"
                      value={editState.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      rows={4}
                      className="resize-none"
                      placeholder="Descricao detalhada do plano"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 2: Precos */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Precos</CardTitle>
                      <CardDescription>Configure precos regulares e de lancamento</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">Plano gratuito</Label>
                      <Switch
                        checked={editState.isFree}
                        onCheckedChange={(v) => handleFieldChange('isFree', v)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Precos Regulares</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(Object.keys(PERIOD_LABELS) as PlanPeriod[]).map((period) => (
                        <div key={period} className="space-y-1">
                          <Label className="text-xs text-muted-foreground">{PERIOD_LABELS[period]}</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editState.prices[period]}
                            onChange={(e) => handlePriceChange(period, e.target.value)}
                            className="h-9"
                            disabled={editState.isFree}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {!editState.isFree && (
                    <>
                      <Separator />
                      <LaunchPriceEditor plan={editState} onChange={handlePartialChange} />
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 3: Trial, Desconto e Bonus */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Trial, Desconto e Bonus</CardTitle>
                  <CardDescription>Configure periodo de trial, descontos e bonus de testes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Duracao trial (dias)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={editState.trialDurationDays ?? ''}
                        onChange={(e) => handleFieldChange('trialDurationDays', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Ex: 90"
                        disabled={!isNew && !!editState.trialDurationDays}
                      />
                      {!isNew && editState.trialDurationDays && (
                        <p className="text-xs text-muted-foreground">
                          Nao pode ser alterado apos definido
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Desconto (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={editState.discountPercentage ?? 0}
                        onChange={(e) => handleFieldChange('discountPercentage', parseFloat(e.target.value) || 0)}
                        disabled={editState.isFree}
                      />
                    </div>
                  </div>

                  {!editState.isFree && (editState.discountPercentage ?? 0) > 0 && (
                    <div className="space-y-1.5">
                      <Label>Periodo minimo para desconto</Label>
                      <Select
                        value={editState.discountMinPeriod ?? ''}
                        onValueChange={(v) => handleFieldChange('discountMinPeriod', (v || undefined) as PlanPeriod | undefined)}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {(Object.keys(PERIOD_LABELS) as PlanPeriod[]).map((p) => (
                            <SelectItem key={p} value={p}>{PERIOD_LABELS[p]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {!editState.isFree && (
                    <div className="space-y-1.5">
                      <Label>Bonus testes comportamentais</Label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Semestral</Label>
                          <Input
                            type="number"
                            min="0"
                            value={editState.bonusTests?.semiannual ?? 0}
                            onChange={(e) => handleFieldChange('bonusTests', {
                              ...editState.bonusTests,
                              semiannual: parseInt(e.target.value) || 0,
                            })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Anual</Label>
                          <Input
                            type="number"
                            min="0"
                            value={editState.bonusTests?.annual ?? 0}
                            onChange={(e) => handleFieldChange('bonusTests', {
                              ...editState.bonusTests,
                              annual: parseInt(e.target.value) || 0,
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 4: Recursos do Plano */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Recursos do Plano</CardTitle>
                  <CardDescription>Lista de recursos incluidos no plano</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {editState.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => {
                          const updated = [...editState.features];
                          updated[idx] = e.target.value;
                          handleFieldChange('features', updated);
                        }}
                        className="h-9 text-sm flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeFeature(idx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Novo recurso..."
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                      className="h-9 text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={addFeature} disabled={!newFeature.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* RIGHT COLUMN — sticky sidebar */}
          <div className="space-y-6">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Card: Acoes */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardContent className="pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Plano ativo</Label>
                      <Switch
                        checked={editState.isActive}
                        onCheckedChange={(v) => handleFieldChange('isActive', v)}
                      />
                    </div>
                    <Separator />
                    <Button
                      onClick={handleSave}
                      disabled={!canSave || isSaving}
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Salvando...' : (isNew ? 'Criar Plano' : 'Salvar Alteracoes')}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/admin/planos')}
                    >
                      Cancelar
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Card: Stripe (edit only, not free) */}
              {!isNew && !editState.isFree && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        {isSynced ? <Cloud className="w-4 h-4 text-blue-600" /> : <CloudOff className="w-4 h-4 text-muted-foreground" />}
                        Stripe
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Env toggle */}
                      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                        <button
                          className={cn(
                            'flex-1 px-2 py-1 rounded-md text-xs font-medium transition-colors',
                            stripeEnv === 'test' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                          )}
                          onClick={() => setStripeEnv('test')}
                        >
                          Teste
                        </button>
                        <button
                          className={cn(
                            'flex-1 px-2 py-1 rounded-md text-xs font-medium transition-colors',
                            stripeEnv === 'live' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                          )}
                          onClick={() => setStripeEnv('live')}
                        >
                          Producao
                        </button>
                      </div>

                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs w-full justify-center gap-1',
                          isSynced ? 'text-blue-600 border-blue-300' : 'text-muted-foreground'
                        )}
                      >
                        {isSynced ? <Cloud className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
                        {isSynced ? 'Sincronizado' : 'Nao sincronizado'}
                      </Badge>

                      {isSynced && (
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Product: </span>
                            <code className="bg-muted px-1 py-0.5 rounded text-[11px] break-all">{stripeProductId}</code>
                          </div>
                          {stripePriceIds && Object.keys(stripePriceIds).length > 0 && (
                            <div className="space-y-1">
                              <span className="text-muted-foreground">Prices:</span>
                              {(Object.keys(PERIOD_LABELS) as PlanPeriod[]).map(period => {
                                const pid = stripePriceIds[period];
                                if (!pid) return null;
                                return (
                                  <div key={period} className="pl-2 text-[11px]">
                                    <span className="text-muted-foreground">{PERIOD_LABELS[period]}: </span>
                                    <code className="bg-muted px-1 py-0.5 rounded break-all">{pid}</code>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {stripeSyncedAt && (
                            <div>
                              <span className="text-muted-foreground">Sync: </span>
                              <span>{new Date(stripeSyncedAt).toLocaleString('pt-BR')}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {!isSynced && (
                        <p className="text-xs text-muted-foreground">
                          Clique em sincronizar para criar produto e precos no Stripe.
                        </p>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        disabled={syncPlan.isPending}
                        onClick={() => {
                          if (!id) return;
                          syncPlan.mutate(
                            { planId: id, environment: stripeEnv },
                            {
                              onSuccess: () => {
                                toast.success('Plano sincronizado com Stripe!');
                                refetch();
                              },
                              onError: () => toast.error('Erro ao sincronizar com Stripe'),
                            }
                          );
                        }}
                      >
                        <RefreshCw className={cn('w-3 h-3 mr-1.5', syncPlan.isPending && 'animate-spin')} />
                        {syncPlan.isPending ? 'Sincronizando...' : 'Sincronizar'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Card: Informacoes (edit only) */}
              {!isNew && plan && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Informacoes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">ID: </span>
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs break-all">{plan.id}</code>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tipo: </span>
                        <Badge variant="outline" className="text-xs">
                          {plan.type === 'candidate' ? 'Candidato' : 'Empresa'}
                        </Badge>
                      </div>
                      {plan.createdAt && (
                        <div>
                          <span className="text-muted-foreground">Criado em: </span>
                          <span>{new Date(plan.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
