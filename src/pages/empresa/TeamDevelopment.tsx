/**
 * TeamDevelopment Page
 * PRD-057: Pagina de Plano de Desenvolvimento Individual de um membro.
 */

import { useState, useMemo, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DevelopmentPlanView from '@/components/team-management/DevelopmentPlanView';
import RetestScheduleForm from '@/components/team-management/RetestScheduleForm';
import ObjectiveForm from '@/components/team-management/ObjectiveForm';
import { useAuth } from '@/contexts/AuthContext';
import {
  useTeamMember,
  useDepartments,
  usePositions,
  useDevelopmentPlan,
  useRetestSchedules,
  useSaveDevelopmentPlan,
  useSaveRetestSchedule,
} from '@/hooks/useTeamsQuery';
import { Loader2 } from 'lucide-react';
import type {
  DevelopmentPlan,
  DevelopmentObjective,
  ObjectiveStatus,
  RetestSchedule,
} from '@/types/teamManagement';

export default function TeamDevelopment() {
  const { id } = useParams();
  const { toast } = useToast();
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id ?? '';

  // Service layer hooks
  const { data: member, isLoading: memberLoading } = useTeamMember(id ?? '');
  const { data: departments = [] } = useDepartments(companyId);
  const { data: positions = [] } = usePositions('all', companyId);
  const { data: fetchedPlan, isLoading: planLoading } = useDevelopmentPlan(id ?? '');
  const { data: retestSchedules = [] } = useRetestSchedules(companyId);

  const savePlanMutation = useSaveDevelopmentPlan();
  const saveRetestMutation = useSaveRetestSchedule();

  const department = useMemo(
    () => departments.find((d) => d.id === member?.departmentId),
    [member, departments],
  );

  const position = useMemo(
    () => positions.find((p) => p.id === member?.positionId),
    [member, positions],
  );

  // Development plan state (initialized from service layer)
  const [plan, setPlan] = useState<DevelopmentPlan | null>(null);
  const [planInitialized, setPlanInitialized] = useState(false);
  if (!planInitialized && !planLoading) {
    setPlan(fetchedPlan ? { ...fetchedPlan, objectives: [...fetchedPlan.objectives] } : null);
    setPlanInitialized(true);
  }

  // Retest schedule state
  const [retestSchedule, setRetestSchedule] = useState<RetestSchedule | null>(null);
  const [retestInitialized, setRetestInitialized] = useState(false);
  if (!retestInitialized && retestSchedules.length > 0) {
    setRetestSchedule(retestSchedules.find((s) => s.memberId === id) || null);
    setRetestInitialized(true);
  } else if (!retestInitialized && !memberLoading) {
    setRetestInitialized(true);
  }

  const isLoading = memberLoading || planLoading;

  // Objective form dialog state
  const [objectiveFormOpen, setObjectiveFormOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<DevelopmentObjective | null>(null);

  // Initials for avatar
  const initials = member
    ? member.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  // Handlers
  const handleUpdateObjectiveStatus = useCallback(
    async (objectiveId: string, status: ObjectiveStatus) => {
      if (!plan) return;
      const updatedPlan: DevelopmentPlan = {
        ...plan,
        objectives: plan.objectives.map((obj) =>
          obj.id === objectiveId ? { ...obj, status } : obj,
        ),
        updatedAt: new Date().toISOString(),
      };
      setPlan(updatedPlan);
      try {
        await savePlanMutation.mutateAsync(updatedPlan);
        toast({
          title: 'Status atualizado',
          description: 'O status do objetivo foi alterado com sucesso.',
        });
      } catch {
        toast({ title: 'Erro ao salvar status', variant: 'destructive' });
      }
    },
    [plan, toast, savePlanMutation],
  );

  const handleEditObjective = useCallback((objective: DevelopmentObjective) => {
    setEditingObjective(objective);
    setObjectiveFormOpen(true);
  }, []);

  const handleAddObjective = useCallback(() => {
    setEditingObjective(null);
    setObjectiveFormOpen(true);
  }, []);

  const handleSaveObjective = useCallback(
    async (data: Partial<DevelopmentObjective>) => {
      if (!plan) return;

      let updatedPlan: DevelopmentPlan;

      if (data.id) {
        // Edit existing
        updatedPlan = {
          ...plan,
          objectives: plan.objectives.map((obj) =>
            obj.id === data.id ? { ...obj, ...data } : obj,
          ),
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Add new
        const newObjective: DevelopmentObjective = {
          id: crypto.randomUUID(),
          planId: plan.id,
          dimension: data.dimension || 'D1',
          title: data.title || '',
          description: data.description,
          status: 'pending',
          priority: data.priority || 'medium',
          dueDate: data.dueDate,
          notes: data.notes,
          createdAt: new Date().toISOString(),
        };
        updatedPlan = {
          ...plan,
          objectives: [...plan.objectives, newObjective],
          updatedAt: new Date().toISOString(),
        };
      }

      setPlan(updatedPlan);
      try {
        await savePlanMutation.mutateAsync(updatedPlan);
        toast({
          title: data.id ? 'Objetivo atualizado' : 'Objetivo adicionado',
          description: data.id
            ? 'As alterações foram salvas.'
            : 'Novo objetivo criado com sucesso.',
        });
      } catch {
        toast({ title: 'Erro ao salvar objetivo', variant: 'destructive' });
      }
    },
    [plan, toast, savePlanMutation],
  );

  const handleGeneratePDI = useCallback(
    async (objectives: DevelopmentObjective[]) => {
      const now = new Date().toISOString();
      const planId = crypto.randomUUID();
      const newPlan: DevelopmentPlan = {
        id: planId,
        memberId: id || '',
        objectives: objectives.map((obj) => ({
          ...obj,
          planId,
        })),
        createdAt: now,
        updatedAt: now,
      };
      setPlan(newPlan);
      try {
        const saved = await savePlanMutation.mutateAsync(newPlan);
        setPlan(saved);
        toast({
          title: 'PDI gerado e salvo',
          description: `${objectives.length} objetivos criados automaticamente.`,
        });
      } catch {
        toast({
          title: 'Erro ao salvar PDI',
          description: 'O plano foi gerado mas não pôde ser salvo. Tente novamente.',
          variant: 'destructive',
        });
      }
    },
    [id, toast, savePlanMutation],
  );

  const handleSaveRetestSchedule = useCallback(
    async (data: Partial<RetestSchedule>) => {
      if (!data.nextDate) {
        toast({ title: 'Informe a data do próximo reteste', variant: 'destructive' });
        return;
      }

      let updatedSchedule: RetestSchedule;

      if (retestSchedule) {
        updatedSchedule = { ...retestSchedule, ...data };
      } else {
        updatedSchedule = {
          id: crypto.randomUUID(),
          memberId: id || '',
          frequency: data.frequency || '6months',
          nextDate: data.nextDate,
          autoSend: data.autoSend ?? true,
          createdAt: new Date().toISOString(),
        };
      }

      setRetestSchedule(updatedSchedule);
      try {
        await saveRetestMutation.mutateAsync(updatedSchedule);
        toast({
          title: 'Agendamento salvo',
          description: 'O agendamento de reteste foi atualizado.',
        });
      } catch {
        toast({ title: 'Erro ao salvar agendamento', variant: 'destructive' });
      }
    },
    [retestSchedule, id, toast, saveRetestMutation],
  );

  if (isLoading) {
    return (
      <DashboardLayout userType="company">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!member) {
    return (
      <DashboardLayout userType="company">
        <motion.div {...pageTransition} className="space-y-6">
          <div className="flex items-center gap-4">
            <Link to="/empresa/equipes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Membro não encontrado</h1>
          </div>
          <p className="text-muted-foreground">
            O colaborador solicitado não foi encontrado no sistema.
          </p>
        </motion.div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="company">
      <motion.div {...pageTransition} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/empresa/equipes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Plano de Desenvolvimento</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-muted-foreground">{member.name}</span>
              {department && (
                <Badge variant="outline" className="text-xs">
                  {department.name}
                </Badge>
              )}
              {position && (
                <Badge variant="secondary" className="text-xs">
                  {position.title}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Main content: Plan (col-span-2) + Retest Schedule (col-span-1) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DevelopmentPlanView
              plan={plan}
              memberScores={member.gaugeScores}
              onUpdateObjective={handleUpdateObjectiveStatus}
              onEditObjective={handleEditObjective}
              onAddObjective={handleAddObjective}
              onGeneratePDI={handleGeneratePDI}
            />
          </div>
          <div className="lg:col-span-1">
            <RetestScheduleForm
              schedule={retestSchedule}
              onSave={handleSaveRetestSchedule}
            />
          </div>
        </div>

        {/* Objective form dialog */}
        <ObjectiveForm
          objective={editingObjective}
          open={objectiveFormOpen}
          onOpenChange={setObjectiveFormOpen}
          onSave={handleSaveObjective}
        />
      </motion.div>
    </DashboardLayout>
  );
}
