/**
 * PackageDetail Page
 * Full-page test package editor/creator.
 * Follows PlanDetail.tsx pattern: 2-column layout with Cards + sticky sidebar.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Save, ArrowLeft, Package, Plus, Trash2,
  Cloud, CloudOff, RefreshCw, Loader2, Info, HelpCircle,
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  useTestPackage,
  useCreateTestPackage,
  useUpdateTestPackage,
} from '@/hooks/useTestPackagesQuery';
import { getStripeService } from '@/services/stripe/stripeService';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/formatters';
import { toast } from 'sonner';
import type { TestPackage } from '@/types/testPackages';
import type { StripeEnvironment } from '@/types/plans';

const BLANK_PACKAGE: TestPackage = {
  id: '',
  name: '',
  slug: '',
  description: null,
  descriptionShort: null,
  type: 'gauge_pro',
  credits: 1,
  price: 0,
  originalPrice: null,
  features: [],
  badge: null,
  stripeProductIdTest: null,
  stripeProductIdLive: null,
  stripePriceIdTest: null,
  stripePriceIdLive: null,
  stripeSyncedAtTest: null,
  stripeSyncedAtLive: null,
  isActive: true,
  sortOrder: 0,
  createdAt: '',
  updatedAt: '',
};

/** Generate a URL-safe slug from a name. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function PackageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew = !id;
  const cloneId = searchParams.get('clone');

  const { data: pkg, isLoading, refetch } = useTestPackage(id);
  const { data: clonePkg } = useTestPackage(isNew ? (cloneId || undefined) : undefined);
  const updatePackageMutation = useUpdateTestPackage();
  const createPackageMutation = useCreateTestPackage();

  const [editState, setEditState] = useState<TestPackage>({ ...BLANK_PACKAGE, features: [] });
  const [formInitialized, setFormInitialized] = useState(isNew && !cloneId);
  const [newFeature, setNewFeature] = useState('');
  const [stripeEnv, setStripeEnv] = useState<StripeEnvironment>('test');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingStripe, setIsSyncingStripe] = useState(false);
  const [autoSlug, setAutoSlug] = useState(isNew && !cloneId);

  // Initialize form with existing package data
  useEffect(() => {
    if (pkg && !formInitialized) {
      setEditState({ ...pkg, features: [...(pkg.features ?? [])] });
      setFormInitialized(true);
    }
  }, [pkg, formInitialized]);

  // Clone mode: pre-fill form with source package data
  useEffect(() => {
    if (isNew && cloneId && clonePkg && !formInitialized) {
      setEditState({
        ...clonePkg,
        id: '',
        createdAt: '',
        updatedAt: '',
        name: `Copia de ${clonePkg.name}`,
        slug: `${clonePkg.slug}-copia`,
        features: [...(clonePkg.features ?? [])],
        stripeProductIdTest: null,
        stripeProductIdLive: null,
        stripePriceIdTest: null,
        stripePriceIdLive: null,
        stripeSyncedAtTest: null,
        stripeSyncedAtLive: null,
      });
      setFormInitialized(true);
      setAutoSlug(false);
    }
  }, [isNew, cloneId, clonePkg, formInitialized]);

  const canSave = editState.name.trim() !== '' && editState.slug.trim() !== '' && editState.credits > 0;

  // --- Field handlers ---

  const handleFieldChange = <K extends keyof TestPackage>(field: K, value: TestPackage[K]) => {
    setEditState(prev => {
      const next = { ...prev, [field]: value };
      // Auto-generate slug when name changes (only on new packages without manual slug edit)
      if (field === 'name' && autoSlug) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  };

  const handleSlugChange = (value: string) => {
    setAutoSlug(false);
    setEditState(prev => ({ ...prev, slug: value }));
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
      credits: editState.credits,
      price: editState.price,
      original_price: editState.originalPrice || null,
      features: editState.features,
      badge: editState.badge || null,
      is_active: editState.isActive,
      sort_order: editState.sortOrder || 0,
    };

    try {
      if (isNew) {
        await createPackageMutation.mutateAsync(payload);
        toast.success('Pacote criado com sucesso!');
        navigate('/admin/pacotes');
      } else if (id) {
        const updated = await updatePackageMutation.mutateAsync({ id, updates: payload });
        if (updated) {
          setEditState({ ...updated, features: [...(updated.features ?? [])] });
        }
        toast.success('Pacote atualizado com sucesso!');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar pacote.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Stripe helpers ---

  const stripeProductId = stripeEnv === 'test'
    ? editState.stripeProductIdTest : editState.stripeProductIdLive;
  const stripePriceId = stripeEnv === 'test'
    ? editState.stripePriceIdTest : editState.stripePriceIdLive;
  const stripeSyncedAt = stripeEnv === 'test'
    ? editState.stripeSyncedAtTest : editState.stripeSyncedAtLive;
  const isSynced = !!stripeProductId;

  const handleSyncStripe = async () => {
    if (!id) return;
    setIsSyncingStripe(true);
    try {
      const svc = await getStripeService();
      const result = await svc.syncPackage(id, stripeEnv);
      if (result.success) {
        toast.success('Pacote sincronizado com Stripe!');
        const { data: freshPkg } = await refetch();
        if (freshPkg) {
          setEditState(prev => ({
            ...prev,
            stripeProductIdTest: freshPkg.stripeProductIdTest,
            stripeProductIdLive: freshPkg.stripeProductIdLive,
            stripePriceIdTest: freshPkg.stripePriceIdTest,
            stripePriceIdLive: freshPkg.stripePriceIdLive,
            stripeSyncedAtTest: freshPkg.stripeSyncedAtTest,
            stripeSyncedAtLive: freshPkg.stripeSyncedAtLive,
          }));
        }
      } else {
        toast.error(result.error ?? 'Erro ao sincronizar com Stripe.');
      }
    } catch {
      toast.error('Erro ao sincronizar com Stripe.');
    } finally {
      setIsSyncingStripe(false);
    }
  };

  // --- Discount calculation for preview ---

  const discountPercentage = editState.originalPrice && editState.originalPrice > editState.price
    ? Math.round(((editState.originalPrice - editState.price) / editState.originalPrice) * 100)
    : null;

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

  if (!isNew && !isLoading && !pkg) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <p className="text-lg text-muted-foreground">Pacote nao encontrado.</p>
          <Button variant="outline" onClick={() => navigate('/admin/pacotes')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Pacotes
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
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate('/admin/pacotes')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <Package className="w-7 h-7 text-cyan-600" />
              {isNew ? (cloneId ? 'Duplicar Pacote' : 'Novo Pacote') : `Editar: ${pkg?.name}`}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isNew
                ? (cloneId ? `Duplicando a partir de: ${clonePkg?.name ?? '...'}` : 'Preencha os dados do novo pacote')
                : `Slug: ${pkg?.slug}`}
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
                  <CardDescription>Identifique e configure o pacote</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="pkg-name">Nome *</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p>Nome do pacote exibido para os usuarios na pagina de pacotes</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="pkg-name"
                        value={editState.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        placeholder="Ex: Pacote Essencial"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="pkg-slug">Slug *</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p>Identificador unico usado na URL e integracoes. Use letras minusculas e hifens</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="pkg-slug"
                        value={editState.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="Ex: pacote-essencial"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="pkg-desc-short">Descricao curta</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>Resumo exibido no card do pacote na pagina de pacotes</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="pkg-desc-short"
                      value={editState.descriptionShort ?? ''}
                      onChange={(e) => handleFieldChange('descriptionShort', e.target.value || null)}
                      placeholder="Breve resumo do pacote"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="pkg-desc">Descricao completa</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>Texto detalhado exibido na pagina de detalhes do pacote</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Textarea
                      id="pkg-desc"
                      value={editState.description ?? ''}
                      onChange={(e) => handleFieldChange('description', e.target.value || null)}
                      rows={4}
                      className="resize-none"
                      placeholder="Descricao detalhada do pacote"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 2: Configuracao */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Configuracao</CardTitle>
                  <CardDescription>Tipo de teste, creditos e destaque</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1">
                        <Label>Tipo</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p>Tipo de teste incluido neste pacote</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={editState.type}
                        onValueChange={(v) => handleFieldChange('type', v as 'gauge_pro')}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gauge_pro">Gauge-Pro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1">
                        <Label>Creditos *</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p>Quantidade de testes incluidos neste pacote</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        type="number"
                        min="1"
                        value={editState.credits}
                        onChange={(e) => handleFieldChange('credits', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1">
                        <Label>Badge</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p>Texto destacado no card do pacote, como 'Mais Popular' ou 'Melhor Custo-Beneficio'</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        value={editState.badge ?? ''}
                        onChange={(e) => handleFieldChange('badge', e.target.value || null)}
                        placeholder="Ex: Mais Popular"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 3: Precos */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Precos</CardTitle>
                  <CardDescription>Configure o preco do pacote e o preco original para exibir desconto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1">
                        <Label>Preco (BRL) *</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p>Valor cobrado pelo pacote</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editState.price || ''}
                        placeholder="0,00"
                        onChange={(e) => handleFieldChange('price', parseFloat(e.target.value) || 0)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1">
                        <Label>Preco original (BRL)</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p>Preco original exibido riscado para mostrar desconto. Deixe vazio se nao houver desconto</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editState.originalPrice ?? ''}
                        placeholder="Opcional"
                        onChange={(e) => handleFieldChange('originalPrice', e.target.value ? (parseFloat(e.target.value) || null) : null)}
                        className="h-9"
                      />
                    </div>
                  </div>
                  {discountPercentage && (
                    <p className="text-sm text-green-600 font-medium">
                      Desconto de {discountPercentage}% ({formatBRL(editState.originalPrice!)} → {formatBRL(editState.price)})
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 4: Recursos do Pacote */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-1">
                    <CardTitle>Recursos do Pacote</CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground/50 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p>Lista de funcionalidades incluidas neste pacote, exibidas como bullets no card</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <CardDescription>Lista de recursos incluidos no pacote</CardDescription>
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

            {/* Card 5: Configuracoes */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Configuracoes</CardTitle>
                  <CardDescription>Status e ordenacao do pacote</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Pacote ativo</Label>
                        <p className="text-xs text-muted-foreground">
                          Pacotes inativos nao aparecem para empresas
                        </p>
                      </div>
                      <Switch
                        checked={editState.isActive}
                        onCheckedChange={(v) => handleFieldChange('isActive', v)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1">
                        <Label>Ordem de exibicao</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p>Define a posicao do pacote na listagem. Menor numero = aparece primeiro</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        value={editState.sortOrder}
                        onChange={(e) => handleFieldChange('sortOrder', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* RIGHT COLUMN -- sticky sidebar */}
          <div className="space-y-6">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Card: Acoes */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardContent className="pt-5 space-y-4">
                    <Button
                      onClick={handleSave}
                      disabled={!canSave || isSaving}
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Salvando...' : (isNew ? 'Criar Pacote' : 'Salvar Alteracoes')}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/admin/pacotes')}
                    >
                      Cancelar
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Card: Preview */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="w-4 h-4 text-cyan-600" />
                      Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground">{editState.name || 'Nome do pacote'}</h4>
                        {editState.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {editState.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {editState.credits} {editState.credits === 1 ? 'credito' : 'creditos'} Gauge-Pro
                      </p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-foreground">
                        {formatBRL(editState.price)}
                      </span>
                      {editState.originalPrice && editState.originalPrice > editState.price && (
                        <>
                          <span className="text-sm text-muted-foreground line-through">
                            {formatBRL(editState.originalPrice)}
                          </span>
                          {discountPercentage && (
                            <Badge variant="secondary" className="text-xs text-green-600">
                              -{discountPercentage}%
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                    {editState.descriptionShort && (
                      <p className="text-xs text-muted-foreground">{editState.descriptionShort}</p>
                    )}
                    {editState.features.length > 0 && (
                      <ul className="space-y-1">
                        {editState.features.slice(0, 5).map((f, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="w-1 h-1 rounded-full bg-cyan-500 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                        {editState.features.length > 5 && (
                          <li className="text-xs text-muted-foreground pl-2.5">
                            +{editState.features.length - 5} mais
                          </li>
                        )}
                      </ul>
                    )}
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        editState.isActive
                          ? 'text-success border-success/30'
                          : 'text-destructive border-destructive/30'
                      )}
                    >
                      {editState.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Card: Stripe (edit only) */}
              {!isNew && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
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
                          {stripePriceId && (
                            <div>
                              <span className="text-muted-foreground">Price: </span>
                              <code className="bg-muted px-1 py-0.5 rounded text-[11px] break-all">{stripePriceId}</code>
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
                          Clique em sincronizar para criar produto e preco no Stripe.
                        </p>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        disabled={isSyncingStripe}
                        onClick={handleSyncStripe}
                      >
                        <RefreshCw className={cn('w-3 h-3 mr-1.5', isSyncingStripe && 'animate-spin')} />
                        {isSyncingStripe ? 'Sincronizando...' : 'Sincronizar'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Card: Informacoes (edit only) */}
              {!isNew && pkg && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
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
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs break-all">{pkg.id}</code>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tipo: </span>
                        <Badge variant="outline" className="text-xs">
                          Gauge-Pro
                        </Badge>
                      </div>
                      {pkg.createdAt && (
                        <div>
                          <span className="text-muted-foreground">Criado em: </span>
                          <span>{new Date(pkg.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                      {pkg.updatedAt && (
                        <div>
                          <span className="text-muted-foreground">Atualizado em: </span>
                          <span>{new Date(pkg.updatedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}

                      {/* Stripe IDs */}
                      {stripeProductId && (
                        <>
                          <Separator className="my-2" />
                          <div>
                            <span className="text-muted-foreground">Stripe Product: </span>
                            <code className="bg-muted px-1 py-0.5 rounded text-[11px] break-all">{stripeProductId}</code>
                          </div>
                          {stripePriceId && (
                            <div>
                              <span className="text-muted-foreground">Stripe Price: </span>
                              <code className="bg-muted px-1 py-0.5 rounded text-[11px] break-all">{stripePriceId}</code>
                            </div>
                          )}
                          {stripeSyncedAt && (
                            <div>
                              <span className="text-muted-foreground">Ultima sync: </span>
                              <span className="text-xs">{new Date(stripeSyncedAt).toLocaleString('pt-BR')}</span>
                            </div>
                          )}
                        </>
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
