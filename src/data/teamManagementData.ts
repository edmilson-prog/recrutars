/**
 * Mock Data — Team Management Module
 *
 * PRD-055: Core e Mapa Comportamental
 * PRD-056: Compatibilidade e Team Builder
 * PRD-057: Desenvolvimento e Evolução
 *
 * Contains:
 *   6 Departments, 18 Positions, 32 Team Members (24 mapped + 8 unmapped),
 *   48 Test History Entries, 10 Compatibility Pairs, 3 Team Builder Scenarios,
 *   5 Development Plans, 8 Retest Schedules, 6 Evolution Annotations,
 *   4 Culture Snapshots, and auto-generated Team Alerts.
 */

import type {
  Department,
  Position,
  TeamMember,
  TestHistoryEntry,
  CompatibilityResult,
  TeamBuilderScenario,
  DevelopmentPlan,
  RetestSchedule,
  EvolutionAnnotation,
  CompanyCultureSnapshot,
  TeamAlert,
} from '@/types/teamManagement';

import type { DimensionScores } from '@/types/gaugePro';

// ═══════════════════════════════════════════════════════════════════════════
// Helper — shorthand to build DimensionScores
// ═══════════════════════════════════════════════════════════════════════════
const ds = (d1: number, d2: number, d3: number, d4: number, d5: number): DimensionScores => ({
  D1: d1,
  D2: d2,
  D3: d3,
  D4: d4,
  D5: d5,
});

// ═══════════════════════════════════════════════════════════════════════════
// 1. DEPARTMENTS (6)
// ═══════════════════════════════════════════════════════════════════════════
export const mockDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'Tecnologia',
    description: 'Desenvolvimento de software, infraestrutura e inovação tecnológica.',
    managerId: 'member-3',
    isActive: true,
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'dept-2',
    name: 'Comercial',
    description: 'Vendas, prospecção de clientes e gestão de contas.',
    managerId: 'member-8',
    isActive: true,
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'dept-3',
    name: 'Recursos Humanos',
    description: 'Gestão de pessoas, recrutamento e desenvolvimento organizacional.',
    managerId: 'member-11',
    isActive: true,
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'dept-4',
    name: 'Marketing',
    description: 'Comunicação, branding, campanhas digitais e geração de leads.',
    managerId: 'member-16',
    isActive: true,
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'dept-5',
    name: 'Financeiro',
    description: 'Controladoria, finanças corporativas, compliance e planejamento fiscal.',
    managerId: 'member-21',
    isActive: true,
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'dept-6',
    name: 'Operações',
    description: 'Logística, processos operacionais e melhoria contínua.',
    managerId: 'member-24',
    isActive: true,
    createdAt: '2024-03-01T10:00:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 2. POSITIONS (18 — 3 per department)
// ═══════════════════════════════════════════════════════════════════════════
export const mockPositions: Position[] = [
  // Tecnologia
  { id: 'pos-1', departmentId: 'dept-1', title: 'Desenvolvedor Jr', level: 'operational', isActive: true },
  { id: 'pos-2', departmentId: 'dept-1', title: 'Desenvolvedor Sr', level: 'tactical', isActive: true },
  { id: 'pos-3', departmentId: 'dept-1', title: 'Tech Lead', level: 'strategic', isActive: true },

  // Comercial
  { id: 'pos-4', departmentId: 'dept-2', title: 'Vendedor', level: 'operational', isActive: true },
  { id: 'pos-5', departmentId: 'dept-2', title: 'Coord. Comercial', level: 'tactical', isActive: true },
  { id: 'pos-6', departmentId: 'dept-2', title: 'Dir. Comercial', level: 'strategic', isActive: true },

  // Recursos Humanos
  { id: 'pos-7', departmentId: 'dept-3', title: 'Analista de RH', level: 'operational', isActive: true },
  { id: 'pos-8', departmentId: 'dept-3', title: 'Coord. de RH', level: 'tactical', isActive: true },
  { id: 'pos-9', departmentId: 'dept-3', title: 'Ger. de Pessoas', level: 'strategic', isActive: true },

  // Marketing
  { id: 'pos-10', departmentId: 'dept-4', title: 'Analista de Marketing', level: 'operational', isActive: true },
  { id: 'pos-11', departmentId: 'dept-4', title: 'Coord. de Marketing', level: 'tactical', isActive: true },
  { id: 'pos-12', departmentId: 'dept-4', title: 'Head de Marketing', level: 'strategic', isActive: true },

  // Financeiro
  { id: 'pos-13', departmentId: 'dept-5', title: 'Analista Financeiro', level: 'operational', isActive: true },
  { id: 'pos-14', departmentId: 'dept-5', title: 'Coord. Financeiro', level: 'tactical', isActive: true },
  { id: 'pos-15', departmentId: 'dept-5', title: 'CFO', level: 'strategic', isActive: true },

  // Operações
  { id: 'pos-16', departmentId: 'dept-6', title: 'Assistente de Operações', level: 'operational', isActive: true },
  { id: 'pos-17', departmentId: 'dept-6', title: 'Coord. de Operações', level: 'tactical', isActive: true },
  { id: 'pos-18', departmentId: 'dept-6', title: 'Dir. de Operações', level: 'strategic', isActive: true },
];

// ═══════════════════════════════════════════════════════════════════════════
// 3. TEAM MEMBERS (32 — 24 mapped, 8 other statuses)
// ═══════════════════════════════════════════════════════════════════════════
export const mockTeamMembers: TeamMember[] = [
  // ── Tecnologia (dept-1) — 7 members ──────────────────────────────────
  {
    id: 'member-1',
    name: 'Lucas Ferreira da Silva',
    email: 'lucas.ferreira@empresa.com',
    avatar: undefined,
    departmentId: 'dept-1',
    positionId: 'pos-1',
    hireDate: '2024-06-15',
    gaugeStatus: 'mapped',
    gaugeScores: ds(42, 55, 78, 82, 38),
    archetype: 'Executor Analítico',
    isActive: true,
    lastTestDate: '2025-09-10T14:00:00Z',
  },
  {
    id: 'member-2',
    name: 'Mariana Costa Oliveira',
    email: 'mariana.costa@empresa.com',
    avatar: undefined,
    departmentId: 'dept-1',
    positionId: 'pos-2',
    hireDate: '2023-02-10',
    gaugeStatus: 'mapped',
    gaugeScores: ds(58, 45, 85, 90, 40),
    archetype: 'Especialista Técnico',
    isActive: true,
    lastTestDate: '2025-08-22T10:30:00Z',
  },
  {
    id: 'member-3',
    name: 'Rafael Almeida Santos',
    email: 'rafael.almeida@empresa.com',
    avatar: undefined,
    departmentId: 'dept-1',
    positionId: 'pos-3',
    hireDate: '2022-01-05',
    gaugeStatus: 'mapped',
    gaugeScores: ds(82, 65, 70, 75, 68),
    archetype: 'Líder Inspirador',
    isActive: true,
    lastTestDate: '2025-07-15T09:00:00Z',
  },
  {
    id: 'member-4',
    name: 'Camila Rodrigues Souza',
    email: 'camila.rodrigues@empresa.com',
    avatar: undefined,
    departmentId: 'dept-1',
    positionId: 'pos-1',
    hireDate: '2024-09-01',
    gaugeStatus: 'mapped',
    gaugeScores: ds(35, 72, 60, 68, 80),
    archetype: 'Mediador Relacional',
    isActive: true,
    lastTestDate: '2025-10-05T16:00:00Z',
  },
  {
    id: 'member-25',
    name: 'Thiago Barbosa Lima',
    email: 'thiago.barbosa@empresa.com',
    avatar: undefined,
    departmentId: 'dept-1',
    positionId: 'pos-2',
    hireDate: '2025-01-10',
    gaugeStatus: 'unmapped',
    isActive: true,
  },
  {
    id: 'member-26',
    name: 'Juliana Mendes Pereira',
    email: 'juliana.mendes@empresa.com',
    avatar: undefined,
    departmentId: 'dept-1',
    positionId: 'pos-1',
    hireDate: '2025-03-20',
    gaugeStatus: 'invited',
    isActive: true,
  },
  {
    id: 'member-27',
    name: 'Diego Nascimento Rocha',
    email: 'diego.nascimento@empresa.com',
    avatar: undefined,
    departmentId: 'dept-1',
    positionId: 'pos-1',
    hireDate: '2025-05-12',
    gaugeStatus: 'in_progress',
    isActive: true,
  },

  // ── Comercial (dept-2) — 6 members ───────────────────────────────────
  {
    id: 'member-5',
    name: 'Bruno Martins Ribeiro',
    email: 'bruno.martins@empresa.com',
    avatar: undefined,
    departmentId: 'dept-2',
    positionId: 'pos-4',
    hireDate: '2023-08-20',
    gaugeStatus: 'mapped',
    gaugeScores: ds(88, 90, 72, 35, 65),
    archetype: 'Motor de Resultados',
    isActive: true,
    lastTestDate: '2025-06-20T11:00:00Z',
  },
  {
    id: 'member-6',
    name: 'Fernanda Lima Carvalho',
    email: 'fernanda.lima@empresa.com',
    avatar: undefined,
    departmentId: 'dept-2',
    positionId: 'pos-4',
    hireDate: '2024-01-15',
    gaugeStatus: 'mapped',
    gaugeScores: ds(75, 85, 60, 42, 78),
    archetype: 'Comunicador Nato',
    isActive: true,
    lastTestDate: '2025-07-10T14:30:00Z',
  },
  {
    id: 'member-7',
    name: 'Gustavo Pereira Nunes',
    email: 'gustavo.pereira@empresa.com',
    avatar: undefined,
    departmentId: 'dept-2',
    positionId: 'pos-5',
    hireDate: '2022-05-10',
    gaugeStatus: 'mapped',
    gaugeScores: ds(70, 78, 65, 55, 72),
    archetype: 'Líder Inspirador',
    isActive: true,
    lastTestDate: '2025-05-28T09:45:00Z',
  },
  {
    id: 'member-8',
    name: 'Patrícia Souza Mendes',
    email: 'patricia.souza@empresa.com',
    avatar: undefined,
    departmentId: 'dept-2',
    positionId: 'pos-6',
    hireDate: '2021-03-01',
    gaugeStatus: 'mapped',
    gaugeScores: ds(92, 80, 68, 50, 70),
    archetype: 'Motor de Resultados',
    isActive: true,
    lastTestDate: '2025-04-15T10:00:00Z',
  },
  {
    id: 'member-28',
    name: 'Felipe Cardoso Teixeira',
    email: 'felipe.cardoso@empresa.com',
    avatar: undefined,
    departmentId: 'dept-2',
    positionId: 'pos-4',
    hireDate: '2025-06-01',
    gaugeStatus: 'unmapped',
    isActive: true,
  },
  {
    id: 'member-29',
    name: 'Amanda Vieira Castro',
    email: 'amanda.vieira@empresa.com',
    avatar: undefined,
    departmentId: 'dept-2',
    positionId: 'pos-4',
    hireDate: '2025-07-15',
    gaugeStatus: 'invited',
    isActive: true,
  },

  // ── Recursos Humanos (dept-3) — 5 members ────────────────────────────
  {
    id: 'member-9',
    name: 'Ana Clara Moreira',
    email: 'ana.moreira@empresa.com',
    avatar: undefined,
    departmentId: 'dept-3',
    positionId: 'pos-7',
    hireDate: '2023-11-01',
    gaugeStatus: 'mapped',
    gaugeScores: ds(40, 68, 55, 72, 90),
    archetype: 'Mediador Relacional',
    isActive: true,
    lastTestDate: '2025-08-05T15:00:00Z',
  },
  {
    id: 'member-10',
    name: 'Pedro Henrique Dias',
    email: 'pedro.dias@empresa.com',
    avatar: undefined,
    departmentId: 'dept-3',
    positionId: 'pos-8',
    hireDate: '2022-07-20',
    gaugeStatus: 'mapped',
    gaugeScores: ds(55, 75, 62, 68, 85),
    archetype: 'Mentor Estratégico',
    isActive: true,
    lastTestDate: '2025-09-18T11:00:00Z',
  },
  {
    id: 'member-11',
    name: 'Isabela Araújo Fernandes',
    email: 'isabela.araujo@empresa.com',
    avatar: undefined,
    departmentId: 'dept-3',
    positionId: 'pos-9',
    hireDate: '2021-01-10',
    gaugeStatus: 'mapped',
    gaugeScores: ds(72, 82, 58, 65, 92),
    archetype: 'Líder Inspirador',
    isActive: true,
    lastTestDate: '2025-06-30T08:30:00Z',
  },
  {
    id: 'member-12',
    name: 'Vinícius Gomes Correia',
    email: 'vinicius.gomes@empresa.com',
    avatar: undefined,
    departmentId: 'dept-3',
    positionId: 'pos-7',
    hireDate: '2024-04-10',
    gaugeStatus: 'mapped',
    gaugeScores: ds(38, 60, 70, 80, 75),
    archetype: 'Executor Analítico',
    isActive: true,
    lastTestDate: '2025-10-12T13:00:00Z',
  },
  {
    id: 'member-30',
    name: 'Larissa Pinto de Souza',
    email: 'larissa.pinto@empresa.com',
    avatar: undefined,
    departmentId: 'dept-3',
    positionId: 'pos-7',
    hireDate: '2025-08-01',
    gaugeStatus: 'in_progress',
    isActive: true,
  },

  // ── Marketing (dept-4) — 5 members ───────────────────────────────────
  {
    id: 'member-13',
    name: 'Gabriela Santos Prado',
    email: 'gabriela.santos@empresa.com',
    avatar: undefined,
    departmentId: 'dept-4',
    positionId: 'pos-10',
    hireDate: '2024-02-01',
    gaugeStatus: 'mapped',
    gaugeScores: ds(60, 92, 55, 38, 78),
    archetype: 'Inovador Criativo',
    isActive: true,
    lastTestDate: '2025-07-25T10:00:00Z',
  },
  {
    id: 'member-14',
    name: 'Matheus Oliveira Lopes',
    email: 'matheus.oliveira@empresa.com',
    avatar: undefined,
    departmentId: 'dept-4',
    positionId: 'pos-10',
    hireDate: '2024-05-15',
    gaugeStatus: 'mapped',
    gaugeScores: ds(55, 88, 48, 45, 70),
    archetype: 'Comunicador Nato',
    isActive: true,
    lastTestDate: '2025-08-18T14:00:00Z',
  },
  {
    id: 'member-15',
    name: 'Carolina Freitas Barros',
    email: 'carolina.freitas@empresa.com',
    avatar: undefined,
    departmentId: 'dept-4',
    positionId: 'pos-11',
    hireDate: '2023-04-20',
    gaugeStatus: 'mapped',
    gaugeScores: ds(68, 80, 62, 52, 75),
    archetype: 'Comunicador Nato',
    isActive: true,
    lastTestDate: '2025-09-02T09:00:00Z',
  },
  {
    id: 'member-16',
    name: 'Leonardo Duarte Machado',
    email: 'leonardo.duarte@empresa.com',
    avatar: undefined,
    departmentId: 'dept-4',
    positionId: 'pos-12',
    hireDate: '2021-09-01',
    gaugeStatus: 'mapped',
    gaugeScores: ds(78, 85, 60, 48, 72),
    archetype: 'Inovador Criativo',
    isActive: true,
    lastTestDate: '2025-05-10T16:00:00Z',
  },
  {
    id: 'member-31',
    name: 'Renata Campos da Silva',
    email: 'renata.campos@empresa.com',
    avatar: undefined,
    departmentId: 'dept-4',
    positionId: 'pos-10',
    hireDate: '2025-04-01',
    gaugeStatus: 'unmapped',
    isActive: true,
  },

  // ── Financeiro (dept-5) — 5 members ──────────────────────────────────
  {
    id: 'member-17',
    name: 'Amanda Rocha Teixeira',
    email: 'amanda.rocha@empresa.com',
    avatar: undefined,
    departmentId: 'dept-5',
    positionId: 'pos-13',
    hireDate: '2024-03-10',
    gaugeStatus: 'mapped',
    gaugeScores: ds(35, 40, 65, 92, 50),
    archetype: 'Executor Analítico',
    isActive: true,
    lastTestDate: '2025-07-05T11:00:00Z',
  },
  {
    id: 'member-18',
    name: 'Ricardo Nogueira Braga',
    email: 'ricardo.nogueira@empresa.com',
    avatar: undefined,
    departmentId: 'dept-5',
    positionId: 'pos-13',
    hireDate: '2023-09-15',
    gaugeStatus: 'mapped',
    gaugeScores: ds(45, 38, 58, 88, 42),
    archetype: 'Especialista Técnico',
    isActive: true,
    lastTestDate: '2025-08-12T10:00:00Z',
  },
  {
    id: 'member-19',
    name: 'Beatriz Fonseca Amaral',
    email: 'beatriz.fonseca@empresa.com',
    avatar: undefined,
    departmentId: 'dept-5',
    positionId: 'pos-14',
    hireDate: '2022-11-01',
    gaugeStatus: 'mapped',
    gaugeScores: ds(52, 48, 70, 85, 55),
    archetype: 'Executor Analítico',
    isActive: true,
    lastTestDate: '2025-06-22T14:00:00Z',
  },
  {
    id: 'member-20',
    name: 'Eduardo Pinheiro Monteiro',
    email: 'eduardo.pinheiro@empresa.com',
    avatar: undefined,
    departmentId: 'dept-5',
    positionId: 'pos-14',
    hireDate: '2023-06-01',
    gaugeStatus: 'mapped',
    gaugeScores: ds(60, 55, 62, 78, 58),
    archetype: 'Mentor Estratégico',
    isActive: true,
    lastTestDate: '2025-09-28T09:00:00Z',
  },
  {
    id: 'member-21',
    name: 'Daniela Magalhães Vieira',
    email: 'daniela.magalhaes@empresa.com',
    avatar: undefined,
    departmentId: 'dept-5',
    positionId: 'pos-15',
    hireDate: '2020-06-01',
    gaugeStatus: 'mapped',
    gaugeScores: ds(75, 60, 68, 90, 62),
    archetype: 'Mentor Estratégico',
    isActive: true,
    lastTestDate: '2025-04-08T10:30:00Z',
  },

  // ── Operações (dept-6) — 4 members ───────────────────────────────────
  {
    id: 'member-22',
    name: 'Felipe Azevedo Cruz',
    email: 'felipe.azevedo@empresa.com',
    avatar: undefined,
    departmentId: 'dept-6',
    positionId: 'pos-16',
    hireDate: '2024-07-01',
    gaugeStatus: 'mapped',
    gaugeScores: ds(48, 52, 88, 72, 45),
    archetype: 'Executor Analítico',
    isActive: true,
    lastTestDate: '2025-10-01T08:00:00Z',
  },
  {
    id: 'member-23',
    name: 'Natália Rezende Borges',
    email: 'natalia.rezende@empresa.com',
    avatar: undefined,
    departmentId: 'dept-6',
    positionId: 'pos-17',
    hireDate: '2023-03-15',
    gaugeStatus: 'mapped',
    gaugeScores: ds(62, 58, 82, 78, 55),
    archetype: 'Especialista Técnico',
    isActive: true,
    lastTestDate: '2025-08-30T13:00:00Z',
  },
  {
    id: 'member-24',
    name: 'Carlos Eduardo Tavares',
    email: 'carlos.tavares@empresa.com',
    avatar: undefined,
    departmentId: 'dept-6',
    positionId: 'pos-18',
    hireDate: '2021-05-01',
    gaugeStatus: 'mapped',
    gaugeScores: ds(85, 62, 75, 70, 60),
    archetype: 'Motor de Resultados',
    isActive: true,
    lastTestDate: '2025-05-20T15:00:00Z',
  },
  {
    id: 'member-32',
    name: 'Roberta Farias Melo',
    email: 'roberta.farias@empresa.com',
    avatar: undefined,
    departmentId: 'dept-6',
    positionId: 'pos-16',
    hireDate: '2024-11-01',
    gaugeStatus: 'retest_pending',
    gaugeScores: ds(50, 48, 72, 65, 52),
    archetype: 'Executor Analítico',
    isActive: true,
    lastTestDate: '2024-11-20T10:00:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 4. TEST HISTORY (48 entries — 2 per mapped member)
// ═══════════════════════════════════════════════════════════════════════════
export const mockTestHistory: TestHistoryEntry[] = [
  // ── member-1: Lucas Ferreira ──────────────────────────────────────────
  {
    id: 'th-1a',
    memberId: 'member-1',
    scores: ds(38, 50, 72, 78, 35),
    archetype: 'Executor Analítico',
    completedAt: '2025-03-15T10:00:00Z',
  },
  {
    id: 'th-1b',
    memberId: 'member-1',
    scores: ds(42, 55, 78, 82, 38),
    archetype: 'Executor Analítico',
    completedAt: '2025-09-10T14:00:00Z',
  },

  // ── member-2: Mariana Costa ───────────────────────────────────────────
  {
    id: 'th-2a',
    memberId: 'member-2',
    scores: ds(52, 42, 80, 85, 36),
    archetype: 'Especialista Técnico',
    completedAt: '2025-02-20T09:00:00Z',
  },
  {
    id: 'th-2b',
    memberId: 'member-2',
    scores: ds(58, 45, 85, 90, 40),
    archetype: 'Especialista Técnico',
    completedAt: '2025-08-22T10:30:00Z',
  },

  // ── member-3: Rafael Almeida ──────────────────────────────────────────
  {
    id: 'th-3a',
    memberId: 'member-3',
    scores: ds(78, 58, 65, 72, 62),
    archetype: 'Motor de Resultados',
    completedAt: '2025-01-10T14:00:00Z',
  },
  {
    id: 'th-3b',
    memberId: 'member-3',
    scores: ds(82, 65, 70, 75, 68),
    archetype: 'Líder Inspirador',
    completedAt: '2025-07-15T09:00:00Z',
  },

  // ── member-4: Camila Rodrigues ────────────────────────────────────────
  {
    id: 'th-4a',
    memberId: 'member-4',
    scores: ds(30, 65, 55, 62, 74),
    archetype: 'Mediador Relacional',
    completedAt: '2025-04-18T11:00:00Z',
  },
  {
    id: 'th-4b',
    memberId: 'member-4',
    scores: ds(35, 72, 60, 68, 80),
    archetype: 'Mediador Relacional',
    completedAt: '2025-10-05T16:00:00Z',
  },

  // ── member-5: Bruno Martins ───────────────────────────────────────────
  {
    id: 'th-5a',
    memberId: 'member-5',
    scores: ds(82, 85, 68, 32, 58),
    archetype: 'Motor de Resultados',
    completedAt: '2025-01-25T10:00:00Z',
  },
  {
    id: 'th-5b',
    memberId: 'member-5',
    scores: ds(88, 90, 72, 35, 65),
    archetype: 'Motor de Resultados',
    completedAt: '2025-06-20T11:00:00Z',
  },

  // ── member-6: Fernanda Lima ───────────────────────────────────────────
  {
    id: 'th-6a',
    memberId: 'member-6',
    scores: ds(70, 80, 55, 38, 72),
    archetype: 'Comunicador Nato',
    completedAt: '2025-02-10T14:00:00Z',
  },
  {
    id: 'th-6b',
    memberId: 'member-6',
    scores: ds(75, 85, 60, 42, 78),
    archetype: 'Comunicador Nato',
    completedAt: '2025-07-10T14:30:00Z',
  },

  // ── member-7: Gustavo Pereira ─────────────────────────────────────────
  {
    id: 'th-7a',
    memberId: 'member-7',
    scores: ds(65, 72, 60, 50, 68),
    archetype: 'Comunicador Nato',
    completedAt: '2025-01-05T09:00:00Z',
  },
  {
    id: 'th-7b',
    memberId: 'member-7',
    scores: ds(70, 78, 65, 55, 72),
    archetype: 'Líder Inspirador',
    completedAt: '2025-05-28T09:45:00Z',
  },

  // ── member-8: Patrícia Souza ──────────────────────────────────────────
  {
    id: 'th-8a',
    memberId: 'member-8',
    scores: ds(88, 75, 62, 45, 65),
    archetype: 'Motor de Resultados',
    completedAt: '2024-10-20T10:00:00Z',
  },
  {
    id: 'th-8b',
    memberId: 'member-8',
    scores: ds(92, 80, 68, 50, 70),
    archetype: 'Motor de Resultados',
    completedAt: '2025-04-15T10:00:00Z',
  },

  // ── member-9: Ana Clara Moreira ───────────────────────────────────────
  {
    id: 'th-9a',
    memberId: 'member-9',
    scores: ds(35, 62, 50, 68, 85),
    archetype: 'Mediador Relacional',
    completedAt: '2025-03-08T15:00:00Z',
  },
  {
    id: 'th-9b',
    memberId: 'member-9',
    scores: ds(40, 68, 55, 72, 90),
    archetype: 'Mediador Relacional',
    completedAt: '2025-08-05T15:00:00Z',
  },

  // ── member-10: Pedro Henrique ─────────────────────────────────────────
  {
    id: 'th-10a',
    memberId: 'member-10',
    scores: ds(50, 70, 58, 62, 80),
    archetype: 'Mentor Estratégico',
    completedAt: '2025-04-02T11:00:00Z',
  },
  {
    id: 'th-10b',
    memberId: 'member-10',
    scores: ds(55, 75, 62, 68, 85),
    archetype: 'Mentor Estratégico',
    completedAt: '2025-09-18T11:00:00Z',
  },

  // ── member-11: Isabela Araújo ─────────────────────────────────────────
  {
    id: 'th-11a',
    memberId: 'member-11',
    scores: ds(68, 78, 52, 60, 88),
    archetype: 'Comunicador Nato',
    completedAt: '2025-01-22T08:30:00Z',
  },
  {
    id: 'th-11b',
    memberId: 'member-11',
    scores: ds(72, 82, 58, 65, 92),
    archetype: 'Líder Inspirador',
    completedAt: '2025-06-30T08:30:00Z',
  },

  // ── member-12: Vinícius Gomes ─────────────────────────────────────────
  {
    id: 'th-12a',
    memberId: 'member-12',
    scores: ds(34, 55, 65, 75, 70),
    archetype: 'Executor Analítico',
    completedAt: '2025-05-15T13:00:00Z',
  },
  {
    id: 'th-12b',
    memberId: 'member-12',
    scores: ds(38, 60, 70, 80, 75),
    archetype: 'Executor Analítico',
    completedAt: '2025-10-12T13:00:00Z',
  },

  // ── member-13: Gabriela Santos ────────────────────────────────────────
  {
    id: 'th-13a',
    memberId: 'member-13',
    scores: ds(55, 88, 50, 34, 72),
    archetype: 'Inovador Criativo',
    completedAt: '2025-02-28T10:00:00Z',
  },
  {
    id: 'th-13b',
    memberId: 'member-13',
    scores: ds(60, 92, 55, 38, 78),
    archetype: 'Inovador Criativo',
    completedAt: '2025-07-25T10:00:00Z',
  },

  // ── member-14: Matheus Oliveira ───────────────────────────────────────
  {
    id: 'th-14a',
    memberId: 'member-14',
    scores: ds(50, 82, 44, 40, 65),
    archetype: 'Comunicador Nato',
    completedAt: '2025-03-22T14:00:00Z',
  },
  {
    id: 'th-14b',
    memberId: 'member-14',
    scores: ds(55, 88, 48, 45, 70),
    archetype: 'Comunicador Nato',
    completedAt: '2025-08-18T14:00:00Z',
  },

  // ── member-15: Carolina Freitas ───────────────────────────────────────
  {
    id: 'th-15a',
    memberId: 'member-15',
    scores: ds(62, 75, 58, 48, 70),
    archetype: 'Comunicador Nato',
    completedAt: '2025-04-10T09:00:00Z',
  },
  {
    id: 'th-15b',
    memberId: 'member-15',
    scores: ds(68, 80, 62, 52, 75),
    archetype: 'Comunicador Nato',
    completedAt: '2025-09-02T09:00:00Z',
  },

  // ── member-16: Leonardo Duarte ────────────────────────────────────────
  {
    id: 'th-16a',
    memberId: 'member-16',
    scores: ds(72, 80, 55, 44, 68),
    archetype: 'Motor de Resultados',
    completedAt: '2024-11-15T16:00:00Z',
  },
  {
    id: 'th-16b',
    memberId: 'member-16',
    scores: ds(78, 85, 60, 48, 72),
    archetype: 'Inovador Criativo',
    completedAt: '2025-05-10T16:00:00Z',
  },

  // ── member-17: Amanda Rocha ───────────────────────────────────────────
  {
    id: 'th-17a',
    memberId: 'member-17',
    scores: ds(30, 35, 60, 88, 45),
    archetype: 'Especialista Técnico',
    completedAt: '2025-02-05T11:00:00Z',
  },
  {
    id: 'th-17b',
    memberId: 'member-17',
    scores: ds(35, 40, 65, 92, 50),
    archetype: 'Executor Analítico',
    completedAt: '2025-07-05T11:00:00Z',
  },

  // ── member-18: Ricardo Nogueira ───────────────────────────────────────
  {
    id: 'th-18a',
    memberId: 'member-18',
    scores: ds(40, 34, 52, 82, 38),
    archetype: 'Especialista Técnico',
    completedAt: '2025-03-12T10:00:00Z',
  },
  {
    id: 'th-18b',
    memberId: 'member-18',
    scores: ds(45, 38, 58, 88, 42),
    archetype: 'Especialista Técnico',
    completedAt: '2025-08-12T10:00:00Z',
  },

  // ── member-19: Beatriz Fonseca ────────────────────────────────────────
  {
    id: 'th-19a',
    memberId: 'member-19',
    scores: ds(48, 42, 65, 80, 50),
    archetype: 'Executor Analítico',
    completedAt: '2025-01-18T14:00:00Z',
  },
  {
    id: 'th-19b',
    memberId: 'member-19',
    scores: ds(52, 48, 70, 85, 55),
    archetype: 'Executor Analítico',
    completedAt: '2025-06-22T14:00:00Z',
  },

  // ── member-20: Eduardo Pinheiro ───────────────────────────────────────
  {
    id: 'th-20a',
    memberId: 'member-20',
    scores: ds(55, 50, 58, 72, 52),
    archetype: 'Executor Analítico',
    completedAt: '2025-04-28T09:00:00Z',
  },
  {
    id: 'th-20b',
    memberId: 'member-20',
    scores: ds(60, 55, 62, 78, 58),
    archetype: 'Mentor Estratégico',
    completedAt: '2025-09-28T09:00:00Z',
  },

  // ── member-21: Daniela Magalhães ──────────────────────────────────────
  {
    id: 'th-21a',
    memberId: 'member-21',
    scores: ds(70, 55, 62, 85, 58),
    archetype: 'Motor de Resultados',
    completedAt: '2024-10-08T10:30:00Z',
  },
  {
    id: 'th-21b',
    memberId: 'member-21',
    scores: ds(75, 60, 68, 90, 62),
    archetype: 'Mentor Estratégico',
    completedAt: '2025-04-08T10:30:00Z',
  },

  // ── member-22: Felipe Azevedo ─────────────────────────────────────────
  {
    id: 'th-22a',
    memberId: 'member-22',
    scores: ds(42, 48, 82, 68, 40),
    archetype: 'Especialista Técnico',
    completedAt: '2025-05-01T08:00:00Z',
  },
  {
    id: 'th-22b',
    memberId: 'member-22',
    scores: ds(48, 52, 88, 72, 45),
    archetype: 'Executor Analítico',
    completedAt: '2025-10-01T08:00:00Z',
  },

  // ── member-23: Natália Rezende ────────────────────────────────────────
  {
    id: 'th-23a',
    memberId: 'member-23',
    scores: ds(58, 52, 78, 72, 50),
    archetype: 'Especialista Técnico',
    completedAt: '2025-03-30T13:00:00Z',
  },
  {
    id: 'th-23b',
    memberId: 'member-23',
    scores: ds(62, 58, 82, 78, 55),
    archetype: 'Especialista Técnico',
    completedAt: '2025-08-30T13:00:00Z',
  },

  // ── member-24: Carlos Eduardo ─────────────────────────────────────────
  {
    id: 'th-24a',
    memberId: 'member-24',
    scores: ds(80, 58, 70, 65, 55),
    archetype: 'Motor de Resultados',
    completedAt: '2024-11-20T15:00:00Z',
  },
  {
    id: 'th-24b',
    memberId: 'member-24',
    scores: ds(85, 62, 75, 70, 60),
    archetype: 'Motor de Resultados',
    completedAt: '2025-05-20T15:00:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 5. COMPATIBILITY RESULTS (10 pairs)
// ═══════════════════════════════════════════════════════════════════════════
export const mockCompatibilityResults: CompatibilityResult[] = [
  // Excellent pair: Tech Lead + Mediador
  {
    memberId1: 'member-3',
    memberId2: 'member-4',
    score: 88,
    level: 'excellent',
    dimensionBreakdown: ds(15, 10, 10, 10, 15),
    strengths: [
      'Complementaridade ideal: liderança assertiva com suporte relacional',
      'Equilíbrio entre decisão rápida e empatia na execução',
      'Comunicação fluida por orientação relacional equilibrada',
    ],
    tensions: [
      'Possível descompasso de ritmo em entregas urgentes',
    ],
  },
  // Excellent pair: Líder Inspirador RH + Mentor Estratégico RH
  {
    memberId1: 'member-11',
    memberId2: 'member-10',
    score: 85,
    level: 'excellent',
    dimensionBreakdown: ds(10, 10, 5, 5, 15),
    strengths: [
      'Ambos com alta orientação relacional: ambiente de confiança',
      'Boa sinergia social para trabalho em equipe',
      'Conformidade equilibrada: organização sem rigidez',
    ],
    tensions: [
      'Ambos empáticos: podem evitar confrontos necessários',
    ],
  },
  // Good pair: Bruno Martins + Fernanda Lima (Comercial)
  {
    memberId1: 'member-5',
    memberId2: 'member-6',
    score: 72,
    level: 'good',
    dimensionBreakdown: ds(-5, 10, 10, 5, 10),
    strengths: [
      'Alta sociabilidade de ambos: sinergia em negociações',
      'Fernanda equilibra a assertividade extrema de Bruno',
      'Orientação relacional alta em Fernanda complementa o foco em resultados',
    ],
    tensions: [
      'Ambos dominantes: pode haver competição por protagonismo',
      'Conformidade baixa em ambos: processos podem ser negligenciados',
    ],
  },
  // Good pair: Gabriela Santos + Carolina Freitas (Marketing)
  {
    memberId1: 'member-13',
    memberId2: 'member-15',
    score: 78,
    level: 'good',
    dimensionBreakdown: ds(5, 10, 5, 10, 10),
    strengths: [
      'Dupla criativa com alta sociabilidade: brainstorms produtivos',
      'Carolina organiza o que Gabriela cria',
      'Boa harmonia relacional para trabalho colaborativo',
    ],
    tensions: [
      'Ambas com conformidade baixa-média: deadlines podem escapar',
    ],
  },
  // Moderate pair: Analistas Financeiros
  {
    memberId1: 'member-17',
    memberId2: 'member-18',
    score: 55,
    level: 'moderate',
    dimensionBreakdown: ds(5, 0, 5, 10, 5),
    strengths: [
      'Alta conformidade em ambos: processos bem estruturados',
      'Ritmo similar: alinhamento em entregas',
    ],
    tensions: [
      'Sociabilidade baixa em ambos: comunicação pode ser insuficiente',
      'Orientação relacional baixa: ambiente impessoal',
      'Sem liderança clara: decisões podem travar',
    ],
  },
  // Moderate pair: cross-dept
  {
    memberId1: 'member-1',
    memberId2: 'member-22',
    score: 58,
    level: 'moderate',
    dimensionBreakdown: ds(5, 5, 10, 5, 0),
    strengths: [
      'Ritmo alto e conformidade alta: entregas consistentes',
      'Perfis complementares para projetos técnicos-operacionais',
    ],
    tensions: [
      'Ambos com orientação relacional baixa: foco excessivo na tarefa',
      'Sociabilidade média: pouca interação espontânea',
    ],
  },
  // Low pair: Motor vs Motor (dois D1 altos)
  {
    memberId1: 'member-5',
    memberId2: 'member-8',
    score: 35,
    level: 'low',
    dimensionBreakdown: ds(-20, 10, 5, 5, 5),
    strengths: [
      'Alta energia e foco em resultados quando alinhados',
      'Sociabilidade alta em ambos: comunicação direta',
    ],
    tensions: [
      'Dois perfis de dominância extrema: alto risco de disputa por liderança',
      'Competição interna pode gerar atrito constante',
      'Conformidade baixa em ambos: processos serão ignorados',
    ],
  },
  // Low pair: Especialista Técnico + Inovador Criativo
  {
    memberId1: 'member-2',
    memberId2: 'member-13',
    score: 38,
    level: 'low',
    dimensionBreakdown: ds(5, -10, -15, -15, 5),
    strengths: [
      'Perspectivas complementares quando há boa mediação',
    ],
    tensions: [
      'Ritmo muito diferente: Mariana metódica vs Gabriela acelerada',
      'Conformidade oposta: Mariana segue processos, Gabriela questiona',
      'Sociabilidade divergente: estilos de comunicação incompatíveis',
    ],
  },
  // Critical pair
  {
    memberId1: 'member-8',
    memberId2: 'member-17',
    score: 22,
    level: 'critical',
    dimensionBreakdown: ds(-20, -10, 5, -10, -5),
    strengths: [
      'Ritmo levemente similar: possível alinhamento em prazos',
    ],
    tensions: [
      'Dominância extrema de Patrícia vs passividade de Amanda: desequilíbrio de poder',
      'Sociabilidade oposta: Patrícia extrovertida, Amanda introspectiva',
      'Conformidade oposta: Patrícia flexível, Amanda rígida — atrito em processos',
      'Orientação relacional divergente: risco de comunicação fria',
    ],
  },
  // Critical pair
  {
    memberId1: 'member-24',
    memberId2: 'member-18',
    score: 28,
    level: 'critical',
    dimensionBreakdown: ds(-15, -5, -10, 5, -5),
    strengths: [
      'Conformidade similar: podem alinhar em processos e normas',
    ],
    tensions: [
      'Carlos é altamente dominante; Ricardo é passivo — decisões unilaterais',
      'Ritmo discrepante: Carlos acelerado, Ricardo cauteloso',
      'Sociabilidade baixa em Ricardo: comunicação difícil',
      'Ambiente tenso com pouca empatia de ambos os lados',
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 6. TEAM BUILDER SCENARIOS (3)
// ═══════════════════════════════════════════════════════════════════════════
export const mockTeamBuilderScenarios: TeamBuilderScenario[] = [
  {
    id: 'scenario-1',
    name: 'Projeto Alpha',
    description: 'Reorganização dos squads de tecnologia para o novo projeto de plataforma.',
    teams: [
      {
        id: 'team-1a',
        name: 'Squad Backend',
        memberIds: ['member-2', 'member-3', 'member-1'],
      },
      {
        id: 'team-1b',
        name: 'Squad Frontend',
        memberIds: ['member-4', 'member-22', 'member-23'],
      },
    ],
    createdAt: '2025-10-15T10:00:00Z',
    updatedAt: '2025-10-20T14:30:00Z',
  },
  {
    id: 'scenario-2',
    name: 'Reorganização Marketing',
    description: 'Divisão do Marketing em duas equipes: Branding e Growth.',
    teams: [
      {
        id: 'team-2a',
        name: 'Branding',
        memberIds: ['member-13', 'member-16'],
      },
      {
        id: 'team-2b',
        name: 'Growth',
        memberIds: ['member-14', 'member-15'],
      },
    ],
    createdAt: '2025-11-01T09:00:00Z',
    updatedAt: '2025-11-05T11:00:00Z',
  },
  {
    id: 'scenario-3',
    name: 'Squad Inovação',
    description: 'Equipe multidisciplinar para projetos de inovação aberta, com membros de diferentes áreas.',
    teams: [
      {
        id: 'team-3a',
        name: 'Pesquisa',
        memberIds: ['member-3', 'member-13', 'member-10'],
      },
      {
        id: 'team-3b',
        name: 'Prototipagem',
        memberIds: ['member-2', 'member-22', 'member-14'],
      },
      {
        id: 'team-3c',
        name: 'Go-to-Market',
        memberIds: ['member-5', 'member-15', 'member-8'],
      },
    ],
    createdAt: '2025-12-01T08:00:00Z',
    updatedAt: '2025-12-10T16:00:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 7. DEVELOPMENT PLANS (5)
// ═══════════════════════════════════════════════════════════════════════════
export const mockDevelopmentPlans: DevelopmentPlan[] = [
  // Plan 1 — Lucas Ferreira (member-1): low D1 & D5
  {
    id: 'plan-1',
    memberId: 'member-1',
    objectives: [
      {
        id: 'obj-1a',
        planId: 'plan-1',
        dimension: 'D1',
        title: 'Desenvolver assertividade em reuniões de equipe',
        description: 'Participar ativamente das dailies apresentando bloqueios e propondo soluções sem aguardar ser questionado.',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-03-30',
        notes: 'Lucas já começou a se posicionar mais nas retrospectivas.',
        createdAt: '2025-10-01T10:00:00Z',
      },
      {
        id: 'obj-1b',
        planId: 'plan-1',
        dimension: 'D5',
        title: 'Treinamento de Inteligência Emocional',
        description: 'Concluir workshop interno de IE com foco em empatia e feedback construtivo.',
        status: 'pending',
        priority: 'high',
        dueDate: '2026-02-28',
        createdAt: '2025-10-01T10:00:00Z',
      },
      {
        id: 'obj-1c',
        planId: 'plan-1',
        dimension: 'D3',
        title: 'Manter ritmo de entrega acima da média',
        description: 'Continuar utilizando técnicas de Pomodoro e gestão de tempo que já funcionam.',
        status: 'completed',
        priority: 'low',
        dueDate: '2025-12-31',
        notes: 'Ritmo excelente mantido no último trimestre.',
        createdAt: '2025-10-01T10:00:00Z',
      },
    ],
    createdAt: '2025-10-01T10:00:00Z',
    updatedAt: '2025-12-15T09:00:00Z',
  },

  // Plan 2 — Bruno Martins (member-5): low D4
  {
    id: 'plan-2',
    memberId: 'member-5',
    objectives: [
      {
        id: 'obj-2a',
        planId: 'plan-2',
        dimension: 'D4',
        title: 'Adotar metodologia de CRM estruturada',
        description: 'Registrar todas as interações com clientes no CRM seguindo o processo definido pela coordenação.',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-01-31',
        notes: 'Melhorou de 40% para 70% de registro nos últimos 2 meses.',
        createdAt: '2025-08-15T10:00:00Z',
      },
      {
        id: 'obj-2b',
        planId: 'plan-2',
        dimension: 'D1',
        title: 'Usar assertividade como alavanca de mentoria',
        description: 'Mentorar vendedores juniores usando liderança natural para desenvolver a equipe.',
        status: 'in_progress',
        priority: 'medium',
        dueDate: '2026-03-31',
        createdAt: '2025-08-15T10:00:00Z',
      },
      {
        id: 'obj-2c',
        planId: 'plan-2',
        dimension: 'D2',
        title: 'Alavancar sociabilidade em networking estratégico',
        description: 'Participar de pelo menos 2 eventos de networking por trimestre representando a empresa.',
        status: 'completed',
        priority: 'medium',
        dueDate: '2025-12-31',
        notes: 'Participou de 3 eventos e trouxe 2 leads qualificados.',
        createdAt: '2025-08-15T10:00:00Z',
      },
      {
        id: 'obj-2d',
        planId: 'plan-2',
        dimension: 'D5',
        title: 'Fortalecer escuta ativa com clientes',
        description: 'Aplicar técnicas de escuta ativa nas reuniões de discovery com prospects.',
        status: 'pending',
        priority: 'medium',
        dueDate: '2026-04-30',
        createdAt: '2025-08-15T10:00:00Z',
      },
    ],
    createdAt: '2025-08-15T10:00:00Z',
    updatedAt: '2025-12-20T14:00:00Z',
  },

  // Plan 3 — Ana Clara Moreira (member-9): low D1
  {
    id: 'plan-3',
    memberId: 'member-9',
    objectives: [
      {
        id: 'obj-3a',
        planId: 'plan-3',
        dimension: 'D1',
        title: 'Treinamento de tomada de decisão',
        description: 'Participar do programa de Decisões Estratégicas para RH com foco em posicionamento.',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-02-15',
        createdAt: '2025-09-01T10:00:00Z',
      },
      {
        id: 'obj-3b',
        planId: 'plan-3',
        dimension: 'D5',
        title: 'Usar empatia como diferencial em entrevistas',
        description: 'Aplicar técnicas de rapport em processos seletivos para melhor avaliação de candidatos.',
        status: 'completed',
        priority: 'low',
        dueDate: '2025-11-30',
        notes: 'Excelente aplicação. Feedback positivo de candidatos.',
        createdAt: '2025-09-01T10:00:00Z',
      },
      {
        id: 'obj-3c',
        planId: 'plan-3',
        dimension: 'D3',
        title: 'Melhorar gestão de tempo em processos seletivos',
        description: 'Reduzir tempo médio de triagem de currículos utilizando checklists padronizados.',
        status: 'pending',
        priority: 'medium',
        dueDate: '2026-03-31',
        createdAt: '2025-09-01T10:00:00Z',
      },
    ],
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-12-10T11:00:00Z',
  },

  // Plan 4 — Gabriela Santos (member-13): low D4
  {
    id: 'plan-4',
    memberId: 'member-13',
    objectives: [
      {
        id: 'obj-4a',
        planId: 'plan-4',
        dimension: 'D4',
        title: 'Implementar framework de gestão de campanhas',
        description: 'Adotar framework Agile Marketing com sprints de 2 semanas para organizar entregas.',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-01-31',
        notes: 'Primeiro sprint concluído com sucesso.',
        createdAt: '2025-09-15T10:00:00Z',
      },
      {
        id: 'obj-4b',
        planId: 'plan-4',
        dimension: 'D2',
        title: 'Liderar sessões de brainstorm estruturadas',
        description: 'Organizar e facilitar 1 sessão de brainstorm por sprint com a equipe de Marketing.',
        status: 'in_progress',
        priority: 'medium',
        dueDate: '2026-04-30',
        createdAt: '2025-09-15T10:00:00Z',
      },
      {
        id: 'obj-4c',
        planId: 'plan-4',
        dimension: 'D1',
        title: 'Desenvolver protagonismo em apresentações para diretoria',
        description: 'Apresentar resultados de campanhas mensais diretamente para a diretoria.',
        status: 'pending',
        priority: 'medium',
        dueDate: '2026-05-31',
        createdAt: '2025-09-15T10:00:00Z',
      },
      {
        id: 'obj-4d',
        planId: 'plan-4',
        dimension: 'D3',
        title: 'Melhorar cadência de entregas',
        description: 'Atingir 90% de entregas dentro do prazo usando board Kanban pessoal.',
        status: 'pending',
        priority: 'high',
        dueDate: '2026-03-31',
        createdAt: '2025-09-15T10:00:00Z',
      },
      {
        id: 'obj-4e',
        planId: 'plan-4',
        dimension: 'D5',
        title: 'Fortalecer relacionamento com stakeholders internos',
        description: 'Realizar reuniões quinzenais de alinhamento com Comercial e Produto.',
        status: 'in_progress',
        priority: 'low',
        dueDate: '2026-06-30',
        createdAt: '2025-09-15T10:00:00Z',
      },
    ],
    createdAt: '2025-09-15T10:00:00Z',
    updatedAt: '2025-12-18T15:00:00Z',
  },

  // Plan 5 — Amanda Rocha (member-17): low D1 & D2
  {
    id: 'plan-5',
    memberId: 'member-17',
    objectives: [
      {
        id: 'obj-5a',
        planId: 'plan-5',
        dimension: 'D1',
        title: 'Participar de programa de protagonismo profissional',
        description: 'Inscrever-se no programa interno de liderança para analistas com foco em autonomia e tomada de decisão.',
        status: 'pending',
        priority: 'high',
        dueDate: '2026-04-30',
        createdAt: '2025-10-20T10:00:00Z',
      },
      {
        id: 'obj-5b',
        planId: 'plan-5',
        dimension: 'D2',
        title: 'Workshop de comunicação assertiva',
        description: 'Concluir workshop de comunicação com foco em apresentação de relatórios financeiros para áreas parceiras.',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-02-28',
        notes: 'Módulo 1 de 3 concluído.',
        createdAt: '2025-10-20T10:00:00Z',
      },
      {
        id: 'obj-5c',
        planId: 'plan-5',
        dimension: 'D4',
        title: 'Manter excelência em conformidade regulatória',
        description: 'Continuar aplicando as normas contábeis com alto rigor e atualizar-se sobre mudanças legislativas.',
        status: 'in_progress',
        priority: 'low',
        dueDate: '2026-06-30',
        createdAt: '2025-10-20T10:00:00Z',
      },
    ],
    createdAt: '2025-10-20T10:00:00Z',
    updatedAt: '2025-12-22T10:00:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 8. RETEST SCHEDULES (8)
// ═══════════════════════════════════════════════════════════════════════════
export const mockRetestSchedules: RetestSchedule[] = [
  {
    id: 'retest-1',
    memberId: 'member-3',
    frequency: '6months',
    nextDate: '2026-01-15',
    autoSend: true,
    lastSentAt: '2025-07-15T09:00:00Z',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'retest-2',
    memberId: 'member-5',
    frequency: '6months',
    nextDate: '2025-12-20',
    autoSend: true,
    lastSentAt: '2025-06-20T11:00:00Z',
    createdAt: '2025-01-20T10:00:00Z',
  },
  {
    id: 'retest-3',
    memberId: 'member-8',
    frequency: '12months',
    nextDate: '2026-04-15',
    autoSend: false,
    lastSentAt: '2025-04-15T10:00:00Z',
    createdAt: '2024-04-15T10:00:00Z',
  },
  {
    id: 'retest-4',
    memberId: 'member-11',
    frequency: '6months',
    nextDate: '2025-12-30',
    autoSend: true,
    lastSentAt: '2025-06-30T08:30:00Z',
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'retest-5',
    memberId: 'member-16',
    frequency: '9months',
    nextDate: '2026-02-10',
    autoSend: false,
    lastSentAt: '2025-05-10T16:00:00Z',
    createdAt: '2025-05-10T10:00:00Z',
  },
  {
    id: 'retest-6',
    memberId: 'member-21',
    frequency: '12months',
    nextDate: '2026-04-08',
    autoSend: true,
    lastSentAt: '2025-04-08T10:30:00Z',
    createdAt: '2024-04-08T10:00:00Z',
  },
  {
    id: 'retest-7',
    memberId: 'member-24',
    frequency: '6months',
    nextDate: '2025-11-20',
    autoSend: true,
    lastSentAt: '2025-05-20T15:00:00Z',
    createdAt: '2025-05-20T10:00:00Z',
  },
  {
    id: 'retest-8',
    memberId: 'member-32',
    frequency: '3months',
    nextDate: '2025-02-20',
    autoSend: false,
    lastSentAt: '2024-11-20T10:00:00Z',
    createdAt: '2024-11-20T10:00:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 9. EVOLUTION ANNOTATIONS (6)
// ═══════════════════════════════════════════════════════════════════════════
export const mockEvolutionAnnotations: EvolutionAnnotation[] = [
  {
    id: 'annot-1',
    memberId: 'member-3',
    text: 'Após programa de liderança servidora, Rafael evoluiu significativamente em D2 e D5. Está mais comunicativo e empático com a equipe.',
    type: 'training',
    date: '2025-07-20',
    createdAt: '2025-07-20T10:00:00Z',
  },
  {
    id: 'annot-2',
    memberId: 'member-4',
    text: 'Sessões de coaching de carreira ajudaram Camila a fortalecer sociabilidade e orientação relacional. Progresso consistente.',
    type: 'coaching',
    date: '2025-10-10',
    createdAt: '2025-10-10T14:00:00Z',
  },
  {
    id: 'annot-3',
    memberId: 'member-9',
    text: 'Feedback positivo da gestora sobre melhoria na comunicação durante processos seletivos. D2 subiu 6 pontos.',
    type: 'feedback',
    date: '2025-08-10',
    createdAt: '2025-08-10T09:00:00Z',
  },
  {
    id: 'annot-4',
    memberId: 'member-11',
    text: 'Promoção para Gerente de Pessoas. Perfil evoluiu de Comunicador Nato para Líder Inspirador, refletindo maior assertividade.',
    type: 'promotion',
    date: '2025-07-01',
    createdAt: '2025-07-01T10:00:00Z',
  },
  {
    id: 'annot-5',
    memberId: 'member-5',
    text: 'Treinamento de processos comerciais ajudou Bruno a melhorar conformidade de 32 para 35. Ainda requer acompanhamento.',
    type: 'training',
    date: '2025-06-25',
    createdAt: '2025-06-25T11:00:00Z',
  },
  {
    id: 'annot-6',
    memberId: 'member-20',
    text: 'Sessões de coaching executivo contribuíram para evolução de Eduardo: subiu D1 de 55 para 60 e D5 de 52 para 58.',
    type: 'coaching',
    date: '2025-10-02',
    createdAt: '2025-10-02T09:00:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 10. COMPANY CULTURE SNAPSHOTS (4 — Oct 2025 through Jan 2026)
// ═══════════════════════════════════════════════════════════════════════════
export const mockCultureSnapshots: CompanyCultureSnapshot[] = [
  {
    id: 'culture-1',
    date: '2025-10-01',
    dnaScores: ds(58, 64, 65, 67, 63),
    totalMembers: 32,
    mappedMembers: 22,
    createdAt: '2025-10-01T03:00:00Z',
  },
  {
    id: 'culture-2',
    date: '2025-11-01',
    dnaScores: ds(59, 65, 66, 68, 64),
    totalMembers: 32,
    mappedMembers: 23,
    createdAt: '2025-11-01T03:00:00Z',
  },
  {
    id: 'culture-3',
    date: '2025-12-01',
    dnaScores: ds(60, 65, 66, 69, 64),
    totalMembers: 32,
    mappedMembers: 24,
    createdAt: '2025-12-01T03:00:00Z',
  },
  {
    id: 'culture-4',
    date: '2026-01-01',
    dnaScores: ds(60, 66, 67, 69, 65),
    totalMembers: 32,
    mappedMembers: 24,
    manifesto:
      'A nossa empresa valoriza a estrutura e a organização (alta Conformidade) equilibradas com um ritmo de entrega consistente. ' +
      'Somos uma equipe que combina foco relacional com sociabilidade, cultivando um ambiente colaborativo e empático. ' +
      'Nosso ponto de desenvolvimento é fortalecer a assertividade individual, permitindo que mais colaboradores assumam protagonismo ' +
      'em decisões estratégicas. O perfil predominante é o Executor Analítico, refletindo uma cultura de execução disciplinada ' +
      'com atenção a processos e qualidade.',
    createdAt: '2026-01-01T03:00:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 11. TEAM ALERTS (auto-generated based on data)
// ═══════════════════════════════════════════════════════════════════════════

/** Threshold in milliseconds for "old test" (12 months). */
const TWELVE_MONTHS_MS = 365.25 * 24 * 60 * 60 * 1000;

function generateTeamAlerts(): TeamAlert[] {
  const now = new Date('2026-02-01T00:00:00Z');
  const alerts: TeamAlert[] = [];
  let alertIdx = 1;

  // 1. Members without test (unmapped, invited, in_progress)
  const unmappedMembers = mockTeamMembers.filter(
    (m) => m.isActive && m.gaugeStatus !== 'mapped' && m.gaugeStatus !== 'retest_pending',
  );
  for (const m of unmappedMembers) {
    alerts.push({
      id: `alert-${alertIdx++}`,
      type: 'no_test',
      message: `${m.name} ainda não possui perfil comportamental mapeado.`,
      severity: m.gaugeStatus === 'unmapped' ? 'warning' : 'info',
      relatedId: m.id,
      createdAt: now.toISOString(),
    });
  }

  // 2. Members with test older than 12 months
  const mappedMembers = mockTeamMembers.filter(
    (m) => m.isActive && m.gaugeStatus === 'mapped' && m.lastTestDate,
  );
  for (const m of mappedMembers) {
    const testDate = new Date(m.lastTestDate!);
    if (now.getTime() - testDate.getTime() > TWELVE_MONTHS_MS) {
      alerts.push({
        id: `alert-${alertIdx++}`,
        type: 'old_test',
        message: `O teste de ${m.name} tem mais de 12 meses. Considere agendar um reteste.`,
        severity: 'warning',
        relatedId: m.id,
        createdAt: now.toISOString(),
      });
    }
  }

  // 3. Departments with < 50% mapping
  for (const dept of mockDepartments) {
    const deptMembers = mockTeamMembers.filter(
      (m) => m.departmentId === dept.id && m.isActive,
    );
    if (deptMembers.length === 0) continue;
    const mappedCount = deptMembers.filter((m) => m.gaugeStatus === 'mapped' || m.gaugeStatus === 'retest_pending').length;
    const ratio = mappedCount / deptMembers.length;
    if (ratio < 0.5) {
      alerts.push({
        id: `alert-${alertIdx++}`,
        type: 'dept_unmapped',
        message: `Departamento "${dept.name}" possui menos de 50% dos colaboradores mapeados (${mappedCount}/${deptMembers.length}).`,
        severity: 'critical',
        relatedId: dept.id,
        createdAt: now.toISOString(),
      });
    }
  }

  // 4. Retest due alerts
  for (const schedule of mockRetestSchedules) {
    const nextDate = new Date(schedule.nextDate);
    if (nextDate <= now) {
      const member = mockTeamMembers.find((m) => m.id === schedule.memberId);
      if (member) {
        alerts.push({
          id: `alert-${alertIdx++}`,
          type: 'retest_due',
          message: `Reteste de ${member.name} está pendente desde ${schedule.nextDate}.`,
          severity: 'warning',
          relatedId: member.id,
          createdAt: now.toISOString(),
        });
      }
    }
  }

  return alerts;
}

export const mockTeamAlerts: TeamAlert[] = generateTeamAlerts();
