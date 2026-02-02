/**
 * Types for Candidates
 * PRD-004: Tipos e Interfaces TypeScript
 * PRD-005: Experience e Education adicionadas
 * PRD-026: Visibilidade do Perfil
 */

import type { BehavioralTest } from './test';
import type { SalaryRange } from './job';

// Tipo de plano do candidato
export type CandidatePlanType = 'Gratuito' | 'Pro' | 'Premium';

// PRD-026: Modos de visibilidade do perfil
export type VisibilityMode = 'public' | 'partial' | 'private';

// PRD-026: Configurações de visibilidade
export interface VisibilitySettings {
  mode: VisibilityMode;
  anonymousId: string; // Ex: "4721" - gerado uma vez ao criar conta
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear?: string;
}

// PRD-021: Status do candidato (admin view)
export type CandidateStatus = 'active' | 'inactive';

// PRD-021: Histórico de ações administrativas em candidatos
export interface CandidateAdminAction {
  id: string;
  candidateId: string;
  candidateName: string;
  action: 'activated' | 'deactivated' | 'test_reset' | 'notification_sent';
  performedBy: string;
  performedAt: string;
  details?: string;
}

export interface Candidate {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  title: string;
  location: string;
  experience: number;
  education: string;
  skills: string[];
  salary: SalaryRange;
  availability: string;
  profileCompletion: number;
  hasTest: boolean;
  testResult?: BehavioralTest;

  // PRD-021: Campos administrativos
  status: CandidateStatus;
  createdAt: string;
  deactivatedAt?: string;
  phone?: string;
  linkedin?: string;
  about?: string;
  plan?: CandidatePlanType; // Plano de assinatura
  dateOfBirth?: string; // formato ISO: "1995-03-15"

  // PRD-026: Visibilidade do perfil (opcional para compatibilidade com dados existentes)
  visibility?: VisibilitySettings;
}

// PRD-026: Perfil anônimo para empresas (modo partial)
export interface AnonymousProfile {
  displayName: string; // "Perfil Anônimo #4721"
  title: string;
  location: string; // apenas cidade/estado
  skills: string[];
  experienceYears: number;
  experienceAreas: string[]; // sem nomes de empresas
  education: string;
  behavioralProfile?: string;
  hasTest: boolean;
  // NÃO inclui: name, avatar, email, phone, currentCompany, linkedin
}
