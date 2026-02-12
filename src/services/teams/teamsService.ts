/**
 * Teams Service — Interface + Factory
 * PRD-066: Service Layer Pattern
 *
 * Manages departments, positions, team members, development plans,
 * retest schedules, and evolution annotations.
 */

import type {
  Department,
  Position,
  TeamMember,
  DevelopmentPlan,
  RetestSchedule,
  EvolutionAnnotation,
} from '@/types/teamManagement';
export interface TeamsFilters {
  companyId?: string;
  departmentId?: string;
  isActive?: boolean;
  gaugeStatus?: string;
  search?: string;
}

export interface ITeamsService {
  // Departments
  getDepartments(companyId: string): Promise<Department[]>;
  createDepartment(companyId: string, data: Omit<Department, 'id' | 'createdAt'>): Promise<Department>;
  updateDepartment(id: string, updates: Partial<Department>): Promise<Department>;

  // Positions
  getPositions(departmentId: string): Promise<Position[]>;
  createPosition(data: Omit<Position, 'id'>): Promise<Position>;
  updatePosition(id: string, updates: Partial<Position>): Promise<Position>;

  // Team Members
  getTeamMembers(filters?: TeamsFilters): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | null>;
  createTeamMember(data: Omit<TeamMember, 'id'>): Promise<TeamMember>;
  updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember>;

  // Development
  getDevelopmentPlan(memberId: string): Promise<DevelopmentPlan | null>;
  saveDevelopmentPlan(plan: DevelopmentPlan): Promise<DevelopmentPlan>;

  // Retest
  getRetestSchedules(companyId: string): Promise<RetestSchedule[]>;
  saveRetestSchedule(schedule: RetestSchedule): Promise<RetestSchedule>;

  // Annotations
  getAnnotations(memberId: string): Promise<EvolutionAnnotation[]>;
  createAnnotation(data: Omit<EvolutionAnnotation, 'id' | 'createdAt'>): Promise<EvolutionAnnotation>;
}

// ---------------------------------------------------------------------------
// Factory (singleton + lazy-load)
// ---------------------------------------------------------------------------

let _instance: ITeamsService | null = null;

export async function getTeamsService(): Promise<ITeamsService> {
  if (_instance) return _instance;

  const { TeamsServiceSupabase } = await import('./teamsService.supabase');
  _instance = new TeamsServiceSupabase();
  return _instance;
}

export function resetTeamsService(): void {
  _instance = null;
}
