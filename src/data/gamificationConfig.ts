/**
 * Gamification Configuration
 * PRD-001-dgn: Sistema de Gamificação - XP, Badges e Níveis
 */

import type { Level, Badge, XPAction } from "@/types/gamification";
import { TEST_CONFIG } from '@/data/testConfig';

// =============================================================================
// LEVELS CONFIGURATION
// =============================================================================

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "Iniciante",
    minXP: 0,
    maxXP: 99,
    icon: "Sprout",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
  },
  {
    id: 2,
    name: "Explorador",
    minXP: 100,
    maxXP: 499,
    icon: "Compass",
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
  {
    id: 3,
    name: "Candidato Ativo",
    minXP: 500,
    maxXP: 1499,
    icon: "Zap",
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  {
    id: 4,
    name: "Profissional",
    minXP: 1500,
    maxXP: 4999,
    icon: "Award",
    color: "text-purple-500",
    bgColor: "bg-purple-100",
  },
  {
    id: 5,
    name: "Expert",
    minXP: 5000,
    maxXP: Infinity,
    icon: "Crown",
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
  },
];

// =============================================================================
// XP ACTIONS CONFIGURATION
// =============================================================================

export const XP_ACTIONS: Record<string, XPAction> = {
  daily_login: {
    type: "daily_login",
    xp: 10,
    description: "Login diário",
    maxPerDay: 1,
  },
  profile_field: {
    type: "profile_field",
    xp: 5,
    description: "Completar campo do perfil",
  },
  profile_complete: {
    type: "profile_complete",
    xp: 100,
    description: "Perfil 100% completo",
  },
  test_complete: {
    type: "test_complete",
    xp: 200,
    description: "Completar teste Gauge-Pro",
  },
  application_sent: {
    type: "application_sent",
    xp: 50,
    description: "Enviar candidatura",
  },
  job_viewed: {
    type: "job_viewed",
    xp: 2,
    description: "Visualizar vaga",
  },
  profile_view_received: {
    type: "profile_view_received",
    xp: 20,
    description: "Receber visualização de empresa",
  },
  interview_received: {
    type: "interview_received",
    xp: 150,
    description: "Receber convite para entrevista",
  },
  proposal_received: {
    type: "proposal_received",
    xp: 300,
    description: "Receber proposta de emprego",
  },
};

// =============================================================================
// BADGES CONFIGURATION
// =============================================================================

export const BADGES: Badge[] = [
  // Profile Badges
  {
    id: "first_step",
    name: "Primeiro Passo",
    description: "Completou o cadastro na plataforma",
    icon: "Footprints",
    rarity: "common",
    category: "profile",
    criteria: { type: "first_login" },
    xpReward: 50,
  },
  {
    id: "profile_complete",
    name: "Perfil Completo",
    description: "Preencheu 100% do perfil",
    icon: "UserCheck",
    rarity: "uncommon",
    category: "profile",
    criteria: { type: "profile_complete", value: 100 },
    xpReward: 100,
  },

  // Test Badges
  {
    id: "self_knowledge",
    name: "Autoconhecimento",
    description: "Completou o teste comportamental Gauge-Pro",
    icon: "Brain",
    rarity: "rare",
    category: "tests",
    criteria: { type: "test_complete" },
    xpReward: 200,
  },

  {
    id: "gauge_pro_behavioral",
    name: TEST_CONFIG.badgeName,
    description: TEST_CONFIG.badgeDescription,
    icon: "Brain",
    rarity: "epic",
    category: "tests",
    criteria: { type: "gauge_pro_complete" },
    xpReward: 150,
  },

  // Activity Badges
  {
    id: "active_candidate",
    name: "Candidato Ativo",
    description: "Enviou 5 candidaturas",
    icon: "Send",
    rarity: "uncommon",
    category: "applications",
    criteria: { type: "applications_count", value: 5 },
    xpReward: 75,
  },
  {
    id: "persistent",
    name: "Persistente",
    description: "Enviou 20 candidaturas",
    icon: "Target",
    rarity: "rare",
    category: "applications",
    criteria: { type: "applications_count", value: 20 },
    xpReward: 150,
  },
  {
    id: "unstoppable",
    name: "Imparável",
    description: "Enviou 50 candidaturas",
    icon: "Rocket",
    rarity: "epic",
    category: "applications",
    criteria: { type: "applications_count", value: 50 },
    xpReward: 300,
  },

  // Visibility Badges
  {
    id: "trending",
    name: "Em Alta",
    description: "Recebeu 3 visualizações de empresas",
    icon: "TrendingUp",
    rarity: "uncommon",
    category: "activity",
    criteria: { type: "profile_views", value: 3 },
    xpReward: 50,
  },
  {
    id: "spotlight",
    name: "No Radar",
    description: "Recebeu 10 visualizações de empresas",
    icon: "Eye",
    rarity: "rare",
    category: "activity",
    criteria: { type: "profile_views", value: 10 },
    xpReward: 100,
  },

  // Streak Badges
  {
    id: "streak_7",
    name: "Streak Semanal",
    description: "Manteve streak de 7 dias consecutivos",
    icon: "Flame",
    rarity: "uncommon",
    category: "activity",
    criteria: { type: "streak_days", value: 7 },
    xpReward: 70,
  },
  {
    id: "streak_30",
    name: "Streak Mensal",
    description: "Manteve streak de 30 dias consecutivos",
    icon: "Flame",
    rarity: "rare",
    category: "activity",
    criteria: { type: "streak_days", value: 30 },
    xpReward: 200,
  },
  {
    id: "streak_100",
    name: "Streak Centenário",
    description: "Manteve streak de 100 dias consecutivos",
    icon: "Flame",
    rarity: "epic",
    category: "activity",
    criteria: { type: "streak_days", value: 100 },
    xpReward: 500,
  },

  // Career Progress Badges
  {
    id: "interviewed",
    name: "Entrevistado",
    description: "Recebeu convite para entrevista",
    icon: "Calendar",
    rarity: "rare",
    category: "applications",
    criteria: { type: "interview_received", value: 1 },
    xpReward: 150,
  },
  {
    id: "proposal",
    name: "Proposta Recebida",
    description: "Recebeu uma proposta de emprego",
    icon: "FileCheck",
    rarity: "epic",
    category: "applications",
    criteria: { type: "proposal_received", value: 1 },
    xpReward: 300,
  },
  {
    id: "hired",
    name: "Contratado!",
    description: "Foi contratado através da plataforma",
    icon: "Trophy",
    rarity: "legendary",
    category: "applications",
    criteria: { type: "hired" },
    xpReward: 1000,
  },

  // Special Time-based Badges
  {
    id: "early_bird",
    name: "Madrugador",
    description: "Acessou a plataforma antes das 7h",
    icon: "Sunrise",
    rarity: "common",
    category: "special",
    criteria: { type: "time_of_day", timeRange: { start: 5, end: 7 } },
    xpReward: 15,
  },
  {
    id: "night_owl",
    name: "Coruja",
    description: "Acessou a plataforma após as 23h",
    icon: "Moon",
    rarity: "common",
    category: "special",
    criteria: { type: "time_of_day", timeRange: { start: 23, end: 24 } },
    xpReward: 15,
  },

  // Explorer Badge
  {
    id: "explorer",
    name: "Explorador de Vagas",
    description: "Visualizou 50 vagas diferentes",
    icon: "Search",
    rarity: "uncommon",
    category: "activity",
    criteria: { type: "jobs_viewed", value: 50 },
    xpReward: 80,
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getLevelByXP(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export function getNextLevel(currentLevel: Level): Level | null {
  const nextIndex = LEVELS.findIndex((l) => l.id === currentLevel.id) + 1;
  return nextIndex < LEVELS.length ? LEVELS[nextIndex] : null;
}

export function getXPProgressToNextLevel(
  xp: number,
  currentLevel: Level
): { current: number; max: number; percentage: number } {
  const nextLevel = getNextLevel(currentLevel);

  if (!nextLevel) {
    return { current: xp - currentLevel.minXP, max: 1000, percentage: 100 };
  }

  const xpInLevel = xp - currentLevel.minXP;
  const xpNeeded = nextLevel.minXP - currentLevel.minXP;
  const percentage = Math.min((xpInLevel / xpNeeded) * 100, 100);

  return { current: xpInLevel, max: xpNeeded, percentage };
}

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}

export function getBadgesByCategory(category: string): Badge[] {
  return BADGES.filter((b) => b.category === category);
}

export function getRarityColor(rarity: string): {
  text: string;
  bg: string;
  border: string;
} {
  const colors: Record<string, { text: string; bg: string; border: string }> = {
    common: {
      text: "text-gray-600",
      bg: "bg-gray-100",
      border: "border-gray-300",
    },
    uncommon: {
      text: "text-green-600",
      bg: "bg-green-100",
      border: "border-green-300",
    },
    rare: {
      text: "text-blue-600",
      bg: "bg-blue-100",
      border: "border-blue-300",
    },
    epic: {
      text: "text-purple-600",
      bg: "bg-purple-100",
      border: "border-purple-300",
    },
    legendary: {
      text: "text-yellow-600",
      bg: "bg-yellow-100",
      border: "border-yellow-400",
    },
  };
  return colors[rarity] || colors.common;
}

export function getRarityLabel(rarity: string): string {
  const labels: Record<string, string> = {
    common: "Comum",
    uncommon: "Incomum",
    rare: "Raro",
    epic: "Épico",
    legendary: "Lendário",
  };
  return labels[rarity] || "Comum";
}

// =============================================================================
// INITIAL STATE
// =============================================================================

export const INITIAL_GAMIFICATION_STATE = {
  xp: 0,
  level: LEVELS[0],
  badges: [],
  streak: {
    current: 0,
    lastLoginDate: null,
    freezesAvailable: 1,
    freezeUsedThisWeek: false,
    weekStartDate: null,
  },
  stats: {
    totalApplications: 0,
    totalJobsViewed: 0,
    totalInterviews: 0,
    profileCompleteness: 0,
    testCompleted: false,
    profileViews: 0,
  },
  initialized: false,
};

export const STORAGE_KEY = "recrutars-gamification";
