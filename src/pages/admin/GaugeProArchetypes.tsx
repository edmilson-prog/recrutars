/**
 * Gauge-Pro Archetypes Admin Page
 * CRUD interface for managing 16 behavioral archetype profiles with rich text content.
 */

import { useState, useMemo } from 'react';
import {
  Lock,
  UserCircle,
  Briefcase,
  Star,
  TrendingUp,
  MessageSquare,
  X,
  Plus,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useGaugeProAdminArchetypes,
  useUpdateArchetype,
} from '@/hooks/useGaugeProAdminQuery';
import type { ArchetypeProfile } from '@/types/gaugePro';

// ---------------------------------------------------------------------------
// Form data type (editable copy of ArchetypeProfile)
// ---------------------------------------------------------------------------

interface ArchetypeFormData {
  id: string;
  name: string;
  description: string;
  strengths: string[];
  developmentAreas: string[];
  idealRoles: string[];
  workStyle: string;
  communicationStyle: string;
  isActive: boolean;
}

function toFormData(archetype: ArchetypeProfile): ArchetypeFormData {
  return {
    id: archetype.id,
    name: archetype.name,
    description: archetype.description,
    strengths: [...archetype.strengths],
    developmentAreas: [...archetype.developmentAreas],
    idealRoles: [...archetype.idealRoles],
    workStyle: archetype.workStyle,
    communicationStyle: archetype.communicationStyle,
    isActive: archetype.isActive ?? true,
  };
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function ArchetypeGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-28" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dynamic List Editor (inline helper)
// ---------------------------------------------------------------------------

function DynamicListSection({
  label,
  icon: Icon,
  items,
  fieldKey,
  addLabel,
  placeholder,
  onUpdate,
}: {
  label: string;
  icon: React.ElementType;
  items: string[];
  fieldKey: string;
  addLabel: string;
  placeholder: string;
  onUpdate: (fieldKey: string, items: string[]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">{label}</Label>
        <Badge variant="outline" className="text-xs ml-auto">
          {items.length}
        </Badge>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={item}
              onChange={(e) => {
                const updated = [...items];
                updated[index] = e.target.value;
                onUpdate(fieldKey, updated);
              }}
              placeholder={placeholder}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => {
                onUpdate(
                  fieldKey,
                  items.filter((_, i) => i !== index)
                );
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onUpdate(fieldKey, [...items, ''])}
      >
        <Plus className="h-4 w-4 mr-2" />
        {addLabel}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function GaugeProArchetypes() {
  const { data: archetypes, isLoading, error } = useGaugeProAdminArchetypes();
  const updateArchetype = useUpdateArchetype();

  const [showInactive, setShowInactive] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeProfile | null>(null);
  const [formData, setFormData] = useState<ArchetypeFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Derived data
  const sortedArchetypes = useMemo(() => {
    if (!archetypes) return [];
    return [...archetypes].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [archetypes]);

  const filteredArchetypes = useMemo(() => {
    if (showInactive) return sortedArchetypes;
    return sortedArchetypes.filter((a) => a.isActive !== false);
  }, [sortedArchetypes, showInactive]);

  const stats = useMemo(() => {
    if (!archetypes) return { total: 0, active: 0, inactive: 0 };
    const active = archetypes.filter((a) => a.isActive !== false).length;
    return {
      total: archetypes.length,
      active,
      inactive: archetypes.length - active,
    };
  }, [archetypes]);

  // Open detail/edit sheet
  const handleOpenSheet = (archetype: ArchetypeProfile) => {
    setSelectedArchetype(archetype);
    setFormData(toFormData(archetype));
  };

  // Close sheet
  const handleCloseSheet = () => {
    setSelectedArchetype(null);
    setFormData(null);
  };

  // Update a dynamic list field
  const handleListUpdate = (fieldKey: string, items: string[]) => {
    setFormData((prev) => (prev ? { ...prev, [fieldKey]: items } : prev));
  };

  // Save changes
  const handleSave = async () => {
    if (!formData || !selectedArchetype) return;

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('O nome do arquétipo é obrigatório.');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('A descrição do arquétipo é obrigatória.');
      return;
    }

    // Clean empty strings from dynamic lists
    const cleanedStrengths = formData.strengths.filter((s) => s.trim() !== '');
    const cleanedDevelopmentAreas = formData.developmentAreas.filter((s) => s.trim() !== '');
    const cleanedIdealRoles = formData.idealRoles.filter((s) => s.trim() !== '');

    setIsSaving(true);
    try {
      await updateArchetype.mutateAsync({
        id: formData.id,
        data: {
          name: formData.name.trim(),
          description: formData.description.trim(),
          strengths: cleanedStrengths,
          developmentAreas: cleanedDevelopmentAreas,
          idealRoles: cleanedIdealRoles,
          workStyle: formData.workStyle.trim(),
          communicationStyle: formData.communicationStyle.trim(),
          isActive: formData.isActive,
        },
      });
      toast.success(`Arquétipo "${formData.name}" atualizado com sucesso.`);
      handleCloseSheet();
    } catch {
      toast.error('Erro ao salvar o arquétipo. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Arquétipos Comportamentais"
          description="Gerencie os 16 perfis de arquétipos comportamentais do sistema Gauge-Pro. Cada arquétipo define pontos fortes, áreas de desenvolvimento, papéis ideais e estilos de comunicação."
          howItWorks={[
            'Os arquétipos são atribuídos automaticamente aos candidatos após a avaliação Gauge-Pro',
            'Cada arquétipo possui pontos fortes, áreas de desenvolvimento e papéis ideais',
            'Você pode editar os textos e desativar arquétipos que não estão em uso',
            'Arquétipos inativos não serão atribuídos em novas avaliações',
          ]}
        />

        <AdminTabNav />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '—' : stats.total}</p>
                <p className="text-xs text-muted-foreground">Total de Arquétipos</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Star className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '—' : stats.active}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '—' : stats.inactive}</p>
                <p className="text-xs text-muted-foreground">Inativos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Show Inactive */}
        <div className="flex items-center gap-3">
          <Switch
            id="show-inactive"
            checked={showInactive}
            onCheckedChange={setShowInactive}
          />
          <Label htmlFor="show-inactive" className="text-sm cursor-pointer">
            Mostrar inativos
          </Label>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">
                Erro ao carregar arquétipos
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Verifique sua conexão e tente novamente.
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <ArchetypeGridSkeleton />}

        {/* Empty State */}
        {!isLoading && !error && filteredArchetypes.length === 0 && (
          <div className="text-center py-12">
            <UserCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">
              Nenhum arquétipo encontrado
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {!showInactive
                ? 'Todos os arquétipos estão inativos. Ative o filtro acima para visualizá-los.'
                : 'Nenhum arquétipo cadastrado no sistema.'}
            </p>
          </div>
        )}

        {/* Archetype Card Grid */}
        {!isLoading && !error && filteredArchetypes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArchetypes.map((archetype) => {
              const isInactive = archetype.isActive === false;
              const descPreview =
                archetype.description.length > 120
                  ? archetype.description.slice(0, 120) + '...'
                  : archetype.description;
              const workPreview =
                archetype.workStyle.length > 60
                  ? archetype.workStyle.slice(0, 60) + '...'
                  : archetype.workStyle;
              const visibleStrengths = archetype.strengths.slice(0, 3);
              const extraStrengths = archetype.strengths.length - 3;

              return (
                <Card
                  key={archetype.id}
                  className={cn(
                    'hover:border-primary/50 transition-colors cursor-pointer',
                    isInactive && 'opacity-60'
                  )}
                  onClick={() => handleOpenSheet(archetype)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{archetype.name}</CardTitle>
                      {isInactive && (
                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-400">
                          Inativo
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-3">
                    <CardDescription className="line-clamp-2">
                      {descPreview}
                    </CardDescription>

                    {/* Strength Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {visibleStrengths.map((strength, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {strength}
                        </Badge>
                      ))}
                      {extraStrengths > 0 && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          +{extraStrengths}
                        </Badge>
                      )}
                    </div>

                    {/* Work Style Preview */}
                    {archetype.workStyle && (
                      <p className="text-xs text-muted-foreground italic">
                        {workPreview}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSheet(archetype);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Detail/Edit Sheet */}
        <Sheet
          open={!!selectedArchetype}
          onOpenChange={(open) => {
            if (!open) handleCloseSheet();
          }}
        >
          <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
            <SheetHeader className="px-6 pt-6 pb-2">
              <SheetTitle>{formData?.name || 'Arquétipo'}</SheetTitle>
              <SheetDescription>
                Edite as informações do arquétipo comportamental.
              </SheetDescription>
            </SheetHeader>

            {formData && (
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-6 pb-6">
                  {/* Section 1: Identidade */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Identidade</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="archetype-id" className="text-xs text-muted-foreground">
                        ID
                      </Label>
                      <div className="relative">
                        <Input
                          id="archetype-id"
                          value={formData.id}
                          readOnly
                          className="bg-muted text-muted-foreground pr-10"
                        />
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="archetype-name">Nome</Label>
                      <Input
                        id="archetype-name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) =>
                            prev ? { ...prev, name: e.target.value } : prev
                          )
                        }
                        placeholder="Ex: O Comandante"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="archetype-description">Descrição</Label>
                      <Textarea
                        id="archetype-description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) =>
                            prev ? { ...prev, description: e.target.value } : prev
                          )
                        }
                        rows={4}
                        placeholder="Descrição detalhada do perfil comportamental..."
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Section 2: Comportamento */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Comportamento</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="archetype-work-style">Estilo de Trabalho</Label>
                      <Textarea
                        id="archetype-work-style"
                        value={formData.workStyle}
                        onChange={(e) =>
                          setFormData((prev) =>
                            prev ? { ...prev, workStyle: e.target.value } : prev
                          )
                        }
                        rows={3}
                        placeholder="Como esse perfil se comporta no ambiente de trabalho..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="archetype-communication-style">
                        Estilo de Comunicação
                      </Label>
                      <Textarea
                        id="archetype-communication-style"
                        value={formData.communicationStyle}
                        onChange={(e) =>
                          setFormData((prev) =>
                            prev
                              ? { ...prev, communicationStyle: e.target.value }
                              : prev
                          )
                        }
                        rows={3}
                        placeholder="Como esse perfil se comunica com a equipe..."
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Section 3: Pontos Fortes */}
                  <DynamicListSection
                    label="Pontos Fortes"
                    icon={Star}
                    items={formData.strengths}
                    fieldKey="strengths"
                    addLabel="Adicionar Ponto Forte"
                    placeholder="Ex: Liderança natural"
                    onUpdate={handleListUpdate}
                  />

                  <Separator />

                  {/* Section 4: Áreas de Desenvolvimento */}
                  <DynamicListSection
                    label="Áreas de Desenvolvimento"
                    icon={TrendingUp}
                    items={formData.developmentAreas}
                    fieldKey="developmentAreas"
                    addLabel="Adicionar Área"
                    placeholder="Ex: Paciência com processos lentos"
                    onUpdate={handleListUpdate}
                  />

                  <Separator />

                  {/* Section 5: Papéis Ideais */}
                  <DynamicListSection
                    label="Papéis Ideais"
                    icon={Briefcase}
                    items={formData.idealRoles}
                    fieldKey="idealRoles"
                    addLabel="Adicionar Papel"
                    placeholder="Ex: Gerente de Projetos"
                    onUpdate={handleListUpdate}
                  />

                  <Separator />

                  {/* Section 6: Status */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Status</Label>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">
                          {formData.isActive ? 'Ativo' : 'Inativo'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formData.isActive
                            ? 'Este arquétipo será atribuído em novas avaliações.'
                            : 'Este arquétipo não será atribuído em novas avaliações.'}
                        </p>
                      </div>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) =>
                          setFormData((prev) =>
                            prev ? { ...prev, isActive: checked } : prev
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}

            <SheetFooter className="px-6 py-4 border-t">
              <Button
                variant="outline"
                onClick={handleCloseSheet}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
}
