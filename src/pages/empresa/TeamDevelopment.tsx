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
import {
  mockTeamMembers,
  mockDevelopmentPlans,
  mockRetestSchedules,
  mockDepartments,
  mockPositions,
} from '@/data/teamManagementData';
import type {
  DevelopmentPlan,
  DevelopmentObjective,
  ObjectiveStatus,
  RetestSchedule,
} from '@/types/teamManagement';

export default function TeamDevelopment() {
  const { id } = useParams();
  const { toast } = useToast();

  // Find member
  const member = useMemo(
    () => mockTeamMembers.find((m) => m.id === id),
    [id],
  );

  const department = useMemo(
    () => mockDepartments.find((d) => d.id === member?.departmentId),
    [member],
  );

  const position = useMemo(
    () => mockPositions.find((p) => p.id === member?.positionId),
    [member],
  );

  // Development plan state
  const [plan, setPlan] = useState<DevelopmentPlan | null>(() => {
    const found = mockDevelopmentPlans.find((p) => p.memberId === id);
    return found ? { ...found, objectives: [...found.objectives] } : null;
  });

  // Retest schedule state
  const [retestSchedule, setRetestSchedule] = useState<RetestSchedule | null>(
    () => mockRetestSchedules.find((s) => s.memberId === id) || null,
  );

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
    (objectiveId: string, status: ObjectiveStatus) => {
      if (!plan) return;
      setPlan((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          objectives: prev.objectives.map((obj) =>
            obj.id === objectiveId ? { ...obj, status } : obj,
          ),
          updatedAt: new Date().toISOString(),
        };
      });
      toast({
        title: 'Status atualizado',
        description: 'O status do objetivo foi alterado com sucesso.',
      });
    },
    [plan, toast],
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
    (data: Partial<DevelopmentObjective>) => {
      if (!plan) return;

      if (data.id) {
        // Edit existing
        setPlan((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            objectives: prev.objectives.map((obj) =>
              obj.id === data.id ? { ...obj, ...data } : obj,
            ),
            updatedAt: new Date().toISOString(),
          };
        });
        toast({ title: 'Objetivo atualizado', description: 'As alterações foram salvas.' });
      } else {
        // Add new
        const newObjective: DevelopmentObjective = {
          id: `obj-new-${Date.now()}`,
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
        setPlan((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            objectives: [...prev.objectives, newObjective],
            updatedAt: new Date().toISOString(),
          };
        });
        toast({ title: 'Objetivo adicionado', description: 'Novo objetivo criado com sucesso.' });
      }
    },
    [plan, toast],
  );

  const handleGeneratePDI = useCallback(
    (objectives: DevelopmentObjective[]) => {
      const now = new Date().toISOString();
      const newPlan: DevelopmentPlan = {
        id: `plan-auto-${Date.now()}`,
        memberId: id || '',
        objectives: objectives.map((obj) => ({
          ...obj,
          planId: `plan-auto-${Date.now()}`,
        })),
        createdAt: now,
        updatedAt: now,
      };
      setPlan(newPlan);
      toast({
        title: 'PDI gerado',
        description: `${objectives.length} objetivos criados automaticamente.`,
      });
    },
    [id, toast],
  );

  const handleSaveRetestSchedule = useCallback(
    (data: Partial<RetestSchedule>) => {
      if (retestSchedule) {
        setRetestSchedule((prev) =>
          prev ? { ...prev, ...data } : prev,
        );
      } else {
        const newSchedule: RetestSchedule = {
          id: `retest-new-${Date.now()}`,
          memberId: id || '',
          frequency: data.frequency || '6months',
          nextDate: data.nextDate || '',
          autoSend: data.autoSend ?? true,
          createdAt: new Date().toISOString(),
        };
        setRetestSchedule(newSchedule);
      }
      toast({
        title: 'Agendamento salvo',
        description: 'O agendamento de reteste foi atualizado.',
      });
    },
    [retestSchedule, id, toast],
  );

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
