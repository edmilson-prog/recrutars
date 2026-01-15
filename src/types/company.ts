/**
 * Types for Companies
 * PRD-004: Tipos e Interfaces TypeScript
 * PRD-018: Tipos para configurações da empresa
 * PRD-020: Campos administrativos para gestão de empresas
 */

// PRD-020: Status da empresa (admin view)
export type CompanyStatus = 'active' | 'pending' | 'inactive';

// PRD-020: Tipo de plano
export type CompanyPlanType = 'Básico' | 'Profissional' | 'Enterprise';

export interface Company {
  id: string;
  userId: string;
  name: string;
  cnpj: string;              // PRD-020: formato XX.XXX.XXX/XXXX-XX
  logo?: string;
  industry: string;
  size: string;
  location: string;
  description: string;
  website?: string;
  linkedin?: string;
  phone?: string;            // PRD-020: formato (XX) XXXXX-XXXX
  city: string;
  state: string;
  address?: string;
  activeJobs: number;
  totalCandidates: number;
  status: CompanyStatus;     // PRD-020: status administrativo
  plan: CompanyPlanType;     // PRD-020: plano da empresa
  createdAt: string;         // PRD-020: formato ISO date
  paymentStatus?: 'ok' | 'pending' | 'overdue';  // PRD-020: status de pagamento
  deactivatedAt?: string;    // PRD-020: data de desativação (se aplicável)
}

// PRD-018: Tipos auxiliares para configurações
export type TeamMemberRole = 'admin' | 'member';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  lastAccess?: string;
  isCurrentUser?: boolean;
}

export interface PendingInvite {
  id: string;
  email: string;
  sentAt: string;
}

export interface CompanyPlan {
  name: string;
  maxJobs: number;
  maxUsers: number;
  currentJobs: number;
  currentUsers: number;
  nextBillingDate: string;
  price: number;
  features: string[];
}

export interface CompanyNotificationPreferences {
  newApplications: boolean;
  messages: boolean;
  testsCompleted: boolean;
  weeklyDigest: boolean;
}

// PRD-020: Histórico de ações administrativas
export interface AdminAction {
  id: string;
  companyId: string;
  companyName: string;
  action: 'activated' | 'deactivated' | 'plan_changed' | 'notification_sent';
  performedBy: string;
  performedAt: string;
  details?: string;
  previousValue?: string;
  newValue?: string;
}
