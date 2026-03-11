/**
 * Team Management Hub - Main Page
 * PRD-055: Core & Mapa Comportamental
 * PRD-056: Compatibilidade & Team Builder
 * PRD-057: Desenvolvimento & Evolucao
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  GitCompareArrows,
  Puzzle,
  Target,
  Award,
  Heart,
  FileText,
  Users,
  Building2,
  Brain,
  LayoutDashboard,
  Loader2,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useDepartments, useTeamMembers, usePositions, useCreateDepartment, useUpdateDepartment, useCreatePosition, useUpdatePosition, useCreateTeamMember, useUpdateTeamMember } from '@/hooks/useTeamsQuery';
import { mockTeamAlerts } from '@/data/teamManagementData';
import TeamDashboard from '@/components/team-management/TeamDashboard';
import TeamMemberList from '@/components/team-management/TeamMemberList';
import DepartmentList from '@/components/team-management/DepartmentList';
import DepartmentForm from '@/components/team-management/DepartmentForm';
import PositionList from '@/components/team-management/PositionList';
import PositionForm from '@/components/team-management/PositionForm';
import TeamMemberForm from '@/components/team-management/TeamMemberForm';
import CandidateImportModal from '@/components/team-management/CandidateImportModal';
import SpreadsheetImport from '@/components/team-management/SpreadsheetImport';
import CollectiveRadarChart from '@/components/team-management/CollectiveRadarChart';
import DimensionHeatmap from '@/components/team-management/DimensionHeatmap';
import DepartmentArchetypeChart from '@/components/team-management/DepartmentArchetypeChart';
import type { Department, Position, TeamMember } from '@/types/teamManagement';

const quickActions = [
  { label: 'Compatibilidade', to: '/empresa/equipes/compatibilidade', icon: GitCompareArrows },
  { label: 'Team Builder', to: '/empresa/equipes/team-builder', icon: Puzzle },
  { label: 'Gap Analysis', to: '/empresa/equipes/gap-analysis', icon: Target },
  { label: 'Talentos', to: '/empresa/equipes/talentos', icon: Award },
  { label: 'Cultura', to: '/empresa/equipes/cultura', icon: Heart },
  { label: 'Relatórios', to: '/empresa/equipes/relatorios', icon: FileText },
] as const;

export default function TeamManagement() {
  const navigate = useNavigate();
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id ?? '';

  const { data: fetchedDepartments = [], isLoading: deptsLoading } = useDepartments(companyId);
  const { data: fetchedMembers = [], isLoading: membersLoading } = useTeamMembers({ companyId });
  // Fetch all positions (using 'all' as departmentId to load all)
  const { data: fetchedPositions = [], isLoading: positionsLoading } = usePositions('all');

  const [activeTab, setActiveTab] = useState('overview');

  // React Query data — departments and positions come directly from Supabase
  const departments = fetchedDepartments;
  const positions = fetchedPositions;

  // Members still use local state (out of scope for this fix)
  const [members, setMembers] = useState<TeamMember[]>([]);

  // Dialog states
  const [deptFormOpen, setDeptFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [posFormOpen, setPosFormOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);
  const [memberFormOpen, setMemberFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [spreadsheetImportOpen, setSpreadsheetImportOpen] = useState(false);

  // Behavioral map filter
  const [mapDeptFilter, setMapDeptFilter] = useState<string | null>(null);

  // Sync members from React Query
  useEffect(() => {
    setMembers(fetchedMembers);
  }, [fetchedMembers]);

  // Mutations for departments and positions
  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const createPos = useCreatePosition();
  const updatePos = useUpdatePosition();
  const createMember = useCreateTeamMember();
  const updateMember = useUpdateTeamMember();

  const isLoading = deptsLoading || membersLoading || positionsLoading;

  if (isLoading && departments.length === 0 && members.length === 0) {
    return (
      <DashboardLayout userType="company">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // Department handlers — persisted to Supabase via React Query mutations
  const handleSaveDept = async (data: Omit<Department, 'id' | 'createdAt'>) => {
    try {
      if (editingDept) {
        await updateDept.mutateAsync({ id: editingDept.id, updates: data });
      } else {
        await createDept.mutateAsync({ companyId, ...data });
      }
    } catch {
      // React Query will handle error state; toast could be added later
    }
    setEditingDept(null);
    setDeptFormOpen(false);
  };

  const handleToggleDept = async (deptId: string) => {
    const dept = departments.find(d => d.id === deptId);
    if (dept) {
      try {
        await updateDept.mutateAsync({ id: deptId, updates: { isActive: !dept.isActive } });
      } catch {
        // silent — React Query handles error state
      }
    }
  };

  // Position handlers — persisted to Supabase via React Query mutations
  const handleSavePos = async (data: Omit<Position, 'id'>) => {
    try {
      if (editingPos) {
        await updatePos.mutateAsync({ id: editingPos.id, updates: data });
      } else {
        await createPos.mutateAsync(data);
      }
    } catch {
      // React Query will handle error state
    }
    setEditingPos(null);
    setPosFormOpen(false);
  };

  const handleTogglePos = async (posId: string) => {
    const pos = positions.find(p => p.id === posId);
    if (pos) {
      try {
        await updatePos.mutateAsync({ id: posId, updates: { isActive: !pos.isActive } });
      } catch {
        // silent — React Query handles error state
      }
    }
  };

  // Member handlers — persisted to Supabase via React Query mutations
  const handleSaveMember = async (data: Partial<TeamMember>) => {
    try {
      if (editingMember) {
        await updateMember.mutateAsync({ id: editingMember.id, updates: data });
      } else {
        await createMember.mutateAsync({
          companyId,
          name: data.name || '',
          email: data.email || '',
          departmentId: data.departmentId || '',
          positionId: data.positionId || '',
          hireDate: data.hireDate || new Date().toISOString().split('T')[0],
          gaugeStatus: 'unmapped' as const,
          isActive: data.isActive ?? true,
        } as Omit<TeamMember, 'id'>);
      }
    } catch {
      toast.error(editingMember
        ? 'Erro ao atualizar colaborador.'
        : 'Erro ao criar colaborador.'
      );
    }
    setEditingMember(null);
    setMemberFormOpen(false);
  };

  const handleImportCandidate = async (data: Partial<TeamMember>) => {
    await handleSaveMember({ ...data, gaugeStatus: data.gaugeScores ? 'mapped' : 'unmapped' });
    setImportModalOpen(false);
  };

  return (
    <DashboardLayout userType="company">
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-l-[3px] border-l-primary p-6"
        >
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 shrink-0">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground">Gestão de Equipes</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Mapeie perfis comportamentais, analise compatibilidade e desenvolva talentos com insights baseados em dados comportamentais.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.to} to={action.to}>
                <Button variant="outline" size="sm">
                  <Icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              Minha Equipe
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Building2 className="h-4 w-4 mr-2" />
              Departamentos
            </TabsTrigger>
            <TabsTrigger value="behavioral-map">
              <Brain className="h-4 w-4 mr-2" />
              Mapa Comportamental
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <TeamDashboard
              members={members}
              departments={departments}
              alerts={mockTeamAlerts}
            />
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="mt-6 space-y-4">
            <TeamMemberList
              members={members}
              departments={departments}
              positions={positions}
              onViewProfile={(memberId) => navigate(`/empresa/equipes/membro/${memberId}`)}
              onEdit={(member) => { setEditingMember(member); setMemberFormOpen(true); }}
              onCreate={() => { setEditingMember(null); setMemberFormOpen(true); }}
            />
            <TeamMemberForm
              member={editingMember}
              departments={departments}
              positions={positions}
              open={memberFormOpen}
              onOpenChange={setMemberFormOpen}
              onSave={handleSaveMember}
            />
            <CandidateImportModal
              open={importModalOpen}
              onOpenChange={setImportModalOpen}
              onImport={handleImportCandidate}
            />
            <SpreadsheetImport
              open={spreadsheetImportOpen}
              onOpenChange={setSpreadsheetImportOpen}
              onImport={async (imported) => { for (const m of imported) { await handleSaveMember(m); } }}
              departments={departments}
              positions={positions}
            />
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="mt-6 space-y-6">
            <DepartmentList
              departments={departments}
              positions={positions}
              onEdit={(dept) => { setEditingDept(dept); setDeptFormOpen(true); }}
              onToggleActive={handleToggleDept}
              onCreate={() => { setEditingDept(null); setDeptFormOpen(true); }}
            />
            <PositionList
              positions={positions}
              departments={departments}
              onEdit={(pos) => { setEditingPos(pos); setPosFormOpen(true); }}
              onToggleActive={handleTogglePos}
              onCreate={() => { setEditingPos(null); setPosFormOpen(true); }}
            />
            <DepartmentForm
              department={editingDept}
              open={deptFormOpen}
              onOpenChange={setDeptFormOpen}
              onSave={handleSaveDept}
            />
            <PositionForm
              position={editingPos}
              departments={departments}
              open={posFormOpen}
              onOpenChange={setPosFormOpen}
              onSave={handleSavePos}
            />
          </TabsContent>

          {/* Behavioral Map Tab */}
          <TabsContent value="behavioral-map" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Mapa Comportamental</h2>
              <Select
                value={mapDeptFilter || 'all'}
                onValueChange={(v) => setMapDeptFilter(v === 'all' ? null : v)}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Filtrar por departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os departamentos</SelectItem>
                  {departments.filter(d => d.isActive).map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CollectiveRadarChart
                members={members}
                departments={departments}
                selectedDepartmentId={mapDeptFilter}
              />
              <DimensionHeatmap
                members={members}
                departments={departments}
              />
            </div>
            <DepartmentArchetypeChart
              members={members}
              departments={departments}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
