// src/components/empresa/pdf/types.ts
import type { Curriculum } from '@/types';
import type { CandidateNote } from '@/types/notes';

export type PDFEmpresaTemplateType = 'classic' | 'modern' | 'minimal' | 'dossie';

export interface PDFEmpresaSectionConfig {
  // Base (do candidato)
  personalInfo: boolean;
  summary: boolean;
  technicalSkills: boolean;
  behavioralSkills: boolean;
  experience: boolean;
  education: boolean;
  courses: boolean;
  salary: boolean;
  // Empresa
  matchScore: boolean;
  gaugeProAnalysis: boolean;
  notesCandidate: boolean;
  notesApplication: boolean;
  applicationHistory: boolean;
  practicalAnalysis: boolean;
  interviews: boolean;
  highlights: boolean;
  favoriteEvaluation: boolean;
  languages: boolean;
  availability: boolean;
  activityLog: boolean;
}

export type SectionKey = keyof PDFEmpresaSectionConfig;

export interface PDFEmpresaData {
  curriculum: Curriculum | null | undefined;
  candidate: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string | null;
    city?: string;
    state?: string;
  };
  company: {
    id: string;
    name: string;
    logoUrl?: string | null;
  };
  application?: {
    id: string;
    jobTitle?: string;
    status?: string;
    createdAt?: string;
  } | null;
  matchResult?: {
    overallScore: number;
    jobTitle?: string;
    technicalScore?: number;
    experienceScore?: number;
    behavioralScore?: number;
    strengths?: string[];
    opportunities?: string[];
  } | null;
  gaugeProResult?: {
    archetype?: string;
    archetypeDescription?: string;
    dimensions?: { name: string; score: number }[];
  } | null;
  applicationNotes?: CandidateNote[];
  candidateNotes?: CandidateNote[];
  applicationHistory?: Array<{
    id: string;
    jobTitle: string;
    status: string;
    appliedAt: string;
  }>;
  practicalAnalysis?: {
    summary?: string;
    points?: string[];
  } | null;
  interviews?: Array<{
    id: string;
    scheduledAt: string;
    status: string;
    feedback?: string;
  }>;
  highlights?: Array<{ id: string; section: string; label: string }>;
  favoriteEvaluation?: { isFavorite: boolean; tags?: string[] };
  languages?: Array<{ name: string; level: string }>;
  availability?: {
    workModel?: string;
    availableForRelocation?: boolean;
    immediateStart?: boolean;
  };
  activityLog?: Array<{ id: string; action: string; createdAt: string; description?: string }>;
}
