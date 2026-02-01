/**
 * Company Test Mock Data
 * PRD-052, 053, 054: Testes, Convites, Resultados, Audit Logs
 */

import type {
  CompanyTest,
  TestInvitation,
  CompanyTestResult,
  AuditLog,
  HubAlert,
  ActivityItem,
} from '@/types/companyTest';
import type { DimensionScores } from '@/types/gaugePro';
import { ARCHETYPE_PROFILES } from '@/data/gaugeProArchetypes';
import { calculateFitScore, classifyFitScore } from '@/utils/fitScore';

// --- Mock Tests ---
export const mockCompanyTests: CompanyTest[] = [
  {
    id: 'ct-001',
    companyId: 'comp-1',
    name: 'Avaliação Liderança - Gerente de Projetos',
    description: 'Teste comportamental para posição de Gerente de Projetos com foco em liderança e assertividade.',
    templateId: 'leadership',
    weights: { D1: 1.8, D2: 1.5, D3: 0.8, D4: 1.0, D5: 1.5 },
    status: 'active',
    jobId: 'job-1',
    jobTitle: 'Gerente de Projetos Sênior',
    deadline: '2026-03-01',
    instructions: 'Complete o teste em ambiente tranquilo. Duração estimada: 25-35 minutos.',
    publicLinkSlug: 'gp-senior-2026',
    publicLinkActive: true,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-16T08:00:00Z',
    activatedAt: '2026-01-16T08:00:00Z',
  },
  {
    id: 'ct-002',
    companyId: 'comp-1',
    name: 'Perfil Vendas - Executivo Comercial',
    description: 'Avaliação comportamental para time comercial focando em sociabilidade e assertividade.',
    templateId: 'sales',
    weights: { D1: 1.5, D2: 2.0, D3: 0.7, D4: 0.7, D5: 1.5 },
    status: 'active',
    jobId: 'job-2',
    jobTitle: 'Executivo de Vendas',
    deadline: '2026-02-28',
    createdAt: '2026-01-10T14:00:00Z',
    updatedAt: '2026-01-12T09:00:00Z',
    activatedAt: '2026-01-12T09:00:00Z',
  },
  {
    id: 'ct-003',
    companyId: 'comp-1',
    name: 'Avaliação Técnica - Dev Backend',
    description: 'Teste para desenvolvedores backend com ênfase em conformidade e ritmo.',
    templateId: 'technical',
    weights: { D1: 0.8, D2: 0.7, D3: 1.5, D4: 2.0, D5: 0.8 },
    status: 'active',
    jobId: 'job-3',
    jobTitle: 'Desenvolvedor Backend Pleno',
    deadline: '2026-03-15',
    createdAt: '2026-01-20T11:00:00Z',
    updatedAt: '2026-01-21T10:00:00Z',
    activatedAt: '2026-01-21T10:00:00Z',
  },
  {
    id: 'ct-004',
    companyId: 'comp-1',
    name: 'Perfil Criativo - Designer UX',
    description: 'Avaliação para time de design com foco em criatividade e sociabilidade.',
    templateId: 'creative',
    weights: { D1: 1.5, D2: 1.5, D3: 0.7, D4: 0.5, D5: 1.2 },
    status: 'closed',
    jobId: 'job-4',
    jobTitle: 'UX Designer Sênior',
    createdAt: '2025-12-01T09:00:00Z',
    updatedAt: '2026-01-15T16:00:00Z',
    activatedAt: '2025-12-02T08:00:00Z',
    closedAt: '2026-01-15T16:00:00Z',
  },
  {
    id: 'ct-005',
    companyId: 'comp-1',
    name: 'Avaliação Geral - Trainee 2026',
    description: 'Teste padrão para programa de trainee, sem pesos específicos.',
    templateId: 'standard',
    weights: { D1: 1.0, D2: 1.0, D3: 1.0, D4: 1.0, D5: 1.0 },
    status: 'draft',
    instructions: 'Teste para o programa de trainee 2026. Será ativado após aprovação do RH.',
    createdAt: '2026-01-28T15:00:00Z',
    updatedAt: '2026-01-28T15:00:00Z',
  },
  {
    id: 'ct-006',
    companyId: 'comp-1',
    name: 'Operações - Analista de Processos',
    description: 'Foco em ritmo, conformidade e estabilidade para área operacional.',
    templateId: 'operational',
    weights: { D1: 0.8, D2: 0.8, D3: 1.8, D4: 1.5, D5: 1.0 },
    status: 'active',
    jobId: 'job-5',
    jobTitle: 'Analista de Processos',
    deadline: '2026-02-20',
    createdAt: '2026-01-18T13:00:00Z',
    updatedAt: '2026-01-19T07:00:00Z',
    activatedAt: '2026-01-19T07:00:00Z',
  },
  {
    id: 'ct-007',
    companyId: 'comp-1',
    name: 'Customizado - Gerente de Inovação',
    description: 'Perfil personalizado para posição de Gerente de Inovação.',
    templateId: 'custom',
    weights: { D1: 1.8, D2: 1.2, D3: 0.6, D4: 0.8, D5: 1.4 },
    status: 'archived',
    jobTitle: 'Gerente de Inovação',
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-12-20T14:00:00Z',
    activatedAt: '2025-11-02T08:00:00Z',
    closedAt: '2025-12-15T16:00:00Z',
    archivedAt: '2025-12-20T14:00:00Z',
  },
];

// --- Mock Invitations ---
export const mockTestInvitations: TestInvitation[] = [
  // ct-001: Liderança
  { id: 'inv-001', testId: 'ct-001', candidateId: 'cand-1', candidateName: 'Ana Silva', candidateEmail: 'ana.silva@email.com', method: 'email', status: 'completed', sentAt: '2026-01-17T09:00:00Z', viewedAt: '2026-01-17T10:30:00Z', startedAt: '2026-01-17T11:00:00Z', completedAt: '2026-01-17T11:45:00Z', expiresAt: '2026-02-17T09:00:00Z' },
  { id: 'inv-002', testId: 'ct-001', candidateId: 'cand-2', candidateName: 'Bruno Costa', candidateEmail: 'bruno.costa@email.com', method: 'email', status: 'completed', sentAt: '2026-01-17T09:00:00Z', viewedAt: '2026-01-17T14:00:00Z', startedAt: '2026-01-18T08:00:00Z', completedAt: '2026-01-18T08:40:00Z', expiresAt: '2026-02-17T09:00:00Z' },
  { id: 'inv-003', testId: 'ct-001', candidateId: 'cand-3', candidateName: 'Carla Mendes', candidateEmail: 'carla.mendes@email.com', method: 'internal', status: 'started', sentAt: '2026-01-17T09:00:00Z', viewedAt: '2026-01-17T12:00:00Z', startedAt: '2026-01-20T09:00:00Z', expiresAt: '2026-02-17T09:00:00Z' },
  { id: 'inv-004', testId: 'ct-001', candidateName: 'Diego Ferreira', candidateEmail: 'diego.f@email.com', method: 'email', status: 'sent', sentAt: '2026-01-25T10:00:00Z', expiresAt: '2026-02-25T10:00:00Z' },

  // ct-002: Vendas
  { id: 'inv-005', testId: 'ct-002', candidateId: 'cand-4', candidateName: 'Eduardo Lima', candidateEmail: 'edu.lima@email.com', method: 'email', status: 'completed', sentAt: '2026-01-12T10:00:00Z', viewedAt: '2026-01-12T11:00:00Z', startedAt: '2026-01-12T14:00:00Z', completedAt: '2026-01-12T14:50:00Z', expiresAt: '2026-02-12T10:00:00Z' },
  { id: 'inv-006', testId: 'ct-002', candidateId: 'cand-5', candidateName: 'Fernanda Rocha', candidateEmail: 'fer.rocha@email.com', method: 'internal', status: 'completed', sentAt: '2026-01-12T10:00:00Z', viewedAt: '2026-01-13T08:00:00Z', startedAt: '2026-01-13T09:00:00Z', completedAt: '2026-01-13T09:35:00Z', expiresAt: '2026-02-12T10:00:00Z' },
  { id: 'inv-007', testId: 'ct-002', candidateName: 'Gabriel Santos', candidateEmail: 'gabriel.s@email.com', method: 'public_link', status: 'expired', sentAt: '2026-01-12T10:00:00Z', viewedAt: '2026-01-12T15:00:00Z', expiresAt: '2026-01-19T10:00:00Z' },
  { id: 'inv-008', testId: 'ct-002', candidateName: 'Helena Barbosa', candidateEmail: 'helena.b@email.com', method: 'email', status: 'viewed', sentAt: '2026-01-20T08:00:00Z', viewedAt: '2026-01-20T10:00:00Z', expiresAt: '2026-02-20T08:00:00Z' },

  // ct-003: Técnico
  { id: 'inv-009', testId: 'ct-003', candidateId: 'cand-6', candidateName: 'Igor Almeida', candidateEmail: 'igor.a@email.com', method: 'email', status: 'completed', sentAt: '2026-01-21T10:00:00Z', viewedAt: '2026-01-21T11:00:00Z', startedAt: '2026-01-21T14:00:00Z', completedAt: '2026-01-21T14:55:00Z', expiresAt: '2026-02-21T10:00:00Z' },
  { id: 'inv-010', testId: 'ct-003', candidateId: 'cand-7', candidateName: 'Julia Martins', candidateEmail: 'julia.m@email.com', method: 'internal', status: 'completed', sentAt: '2026-01-21T10:00:00Z', viewedAt: '2026-01-22T08:00:00Z', startedAt: '2026-01-22T10:00:00Z', completedAt: '2026-01-22T10:40:00Z', expiresAt: '2026-02-21T10:00:00Z' },
  { id: 'inv-011', testId: 'ct-003', candidateName: 'Karen Oliveira', candidateEmail: 'karen.o@email.com', method: 'email', status: 'started', sentAt: '2026-01-22T09:00:00Z', viewedAt: '2026-01-22T12:00:00Z', startedAt: '2026-01-28T09:00:00Z', expiresAt: '2026-02-22T09:00:00Z' },

  // ct-004: Criativo (closed)
  { id: 'inv-012', testId: 'ct-004', candidateId: 'cand-8', candidateName: 'Lucas Pereira', candidateEmail: 'lucas.p@email.com', method: 'email', status: 'completed', sentAt: '2025-12-03T09:00:00Z', viewedAt: '2025-12-03T10:00:00Z', startedAt: '2025-12-03T14:00:00Z', completedAt: '2025-12-03T14:50:00Z', expiresAt: '2026-01-03T09:00:00Z' },
  { id: 'inv-013', testId: 'ct-004', candidateId: 'cand-9', candidateName: 'Marina Souza', candidateEmail: 'marina.s@email.com', method: 'internal', status: 'completed', sentAt: '2025-12-03T09:00:00Z', viewedAt: '2025-12-04T08:00:00Z', startedAt: '2025-12-04T10:00:00Z', completedAt: '2025-12-04T10:45:00Z', expiresAt: '2026-01-03T09:00:00Z' },

  // ct-006: Operações
  { id: 'inv-014', testId: 'ct-006', candidateId: 'cand-10', candidateName: 'Nathalia Dias', candidateEmail: 'nathalia.d@email.com', method: 'email', status: 'completed', sentAt: '2026-01-19T08:00:00Z', viewedAt: '2026-01-19T09:00:00Z', startedAt: '2026-01-19T14:00:00Z', completedAt: '2026-01-19T14:40:00Z', expiresAt: '2026-02-19T08:00:00Z' },
  { id: 'inv-015', testId: 'ct-006', candidateName: 'Otávio Ramos', candidateEmail: 'otavio.r@email.com', method: 'email', status: 'abandoned', sentAt: '2026-01-19T08:00:00Z', viewedAt: '2026-01-19T12:00:00Z', startedAt: '2026-01-20T08:00:00Z', expiresAt: '2026-02-19T08:00:00Z' },
];

// --- Mock Results (with realistic Gauge-Pro scores) ---
function makeResult(
  id: string, testId: string, candidateId: string, name: string, email: string,
  invId: string, scores: DimensionScores, archetypeId: string, completedAt: string,
  aiAnalysis: string, shortlisted?: boolean, shortlistNotes?: string
): CompanyTestResult {
  const archetype = ARCHETYPE_PROFILES.find(a => a.id === archetypeId)!;
  const sortedDims = (Object.entries(scores) as [string, number][]).sort((a, b) => b[1] - a[1]);

  // Calculate fit score based on test weights
  const test = mockCompanyTests.find(t => t.id === testId);
  const fitScore = test ? calculateFitScore(scores, test.weights) : undefined;
  const fitClassification = fitScore !== undefined ? classifyFitScore(fitScore) : undefined;

  return {
    id, testId, candidateId, candidateName: name, candidateEmail: email,
    invitationId: invId, scores, archetype,
    primaryDimension: sortedDims[0][0] as any,
    secondaryDimension: sortedDims[1][0] as any,
    strengths: archetype.strengths.slice(0, 3),
    developmentAreas: archetype.developmentAreas.slice(0, 2),
    fitScore, fitClassification, aiAnalysis, completedAt, shortlisted, shortlistNotes,
  };
}

export const mockTestResults: CompanyTestResult[] = [
  // ct-001: Liderança
  makeResult('res-001', 'ct-001', 'cand-1', 'Ana Silva', 'ana.silva@email.com', 'inv-001',
    { D1: 82, D2: 75, D3: 45, D4: 60, D5: 78 }, 'captain', '2026-01-17T11:45:00Z',
    'Ana demonstra um perfil de liderança forte com excelente equilíbrio entre assertividade e empatia. Sua alta orientação relacional (D5=78) combinada com assertividade (D1=82) indica capacidade natural para liderar equipes diversas. Ponto de atenção: ritmo mais baixo pode indicar necessidade de suporte em ambientes de alta pressão por velocidade.',
    true, 'Melhor perfil para a posição. Agendar entrevista final.'),
  makeResult('res-002', 'ct-001', 'cand-2', 'Bruno Costa', 'bruno.costa@email.com', 'inv-002',
    { D1: 90, D2: 55, D3: 40, D4: 72, D5: 50 }, 'commander', '2026-01-18T08:40:00Z',
    'Bruno apresenta perfil altamente assertivo (D1=90) com forte conformidade (D4=72), indicando um estilo de liderança diretivo e estruturado. Pode precisar desenvolver habilidades relacionais (D5=50) para melhorar conexão com equipe.',
    true),

  // ct-002: Vendas
  makeResult('res-003', 'ct-002', 'cand-4', 'Eduardo Lima', 'edu.lima@email.com', 'inv-005',
    { D1: 72, D2: 88, D3: 35, D4: 40, D5: 80 }, 'influencer', '2026-01-12T14:50:00Z',
    'Eduardo é um comunicador nato com alta sociabilidade (D2=88) e orientação relacional (D5=80). Perfil ideal para vendas consultivas. Baixa conformidade (D4=40) sugere preferência por abordagens flexíveis sobre processos rígidos.',
    true, 'Perfil excelente para vendas B2B.'),
  makeResult('res-004', 'ct-002', 'cand-5', 'Fernanda Rocha', 'fer.rocha@email.com', 'inv-006',
    { D1: 65, D2: 92, D3: 48, D4: 38, D5: 85 }, 'promoter', '2026-01-13T09:35:00Z',
    'Fernanda apresenta sociabilidade excepcional (D2=92) com forte orientação relacional (D5=85). Perfil energético e comunicativo, ideal para desenvolvimento de relacionamentos comerciais. Pode precisar de suporte em tarefas analíticas (D4=38).',
    true),

  // ct-003: Técnico
  makeResult('res-005', 'ct-003', 'cand-6', 'Igor Almeida', 'igor.a@email.com', 'inv-009',
    { D1: 45, D2: 38, D3: 78, D4: 92, D5: 42 }, 'specialist', '2026-01-21T14:55:00Z',
    'Igor demonstra perfil técnico exemplar com alta conformidade (D4=92) e bom ritmo (D3=78). Focado em qualidade e processos estruturados. Pode beneficiar-se de desenvolvimento em habilidades interpessoais (D2=38, D5=42).',
    true, 'Perfil técnico forte. Ideal para backend.'),
  makeResult('res-006', 'ct-003', 'cand-7', 'Julia Martins', 'julia.m@email.com', 'inv-010',
    { D1: 55, D2: 62, D3: 70, D4: 85, D5: 58 }, 'artisan', '2026-01-22T10:40:00Z',
    'Julia combina forte conformidade (D4=85) com boa sociabilidade (D2=62), raro em perfis técnicos. Seu ritmo sólido (D3=70) garante entregas consistentes. Boa candidata para posições que exigem interação com stakeholders.'),

  // ct-004: Criativo
  makeResult('res-007', 'ct-004', 'cand-8', 'Lucas Pereira', 'lucas.p@email.com', 'inv-012',
    { D1: 78, D2: 70, D3: 42, D4: 35, D5: 65 }, 'innovator', '2025-12-03T14:50:00Z',
    'Lucas apresenta perfil criativo com alta assertividade (D1=78) e boa sociabilidade (D2=70). Baixa conformidade (D4=35) indica preferência por liberdade criativa. Ideal para projetos de inovação.'),
  makeResult('res-008', 'ct-004', 'cand-9', 'Marina Souza', 'marina.s@email.com', 'inv-013',
    { D1: 60, D2: 82, D3: 50, D4: 45, D5: 75 }, 'counselor', '2025-12-04T10:45:00Z',
    'Marina combina sociabilidade (D2=82) com forte orientação relacional (D5=75). Seu estilo empático e comunicativo é valioso em UX, onde entender o usuário é fundamental. Boa capacidade de advocacy do usuário.'),

  // ct-006: Operações
  makeResult('res-009', 'ct-006', 'cand-10', 'Nathalia Dias', 'nathalia.d@email.com', 'inv-014',
    { D1: 42, D2: 50, D3: 85, D4: 80, D5: 65 }, 'guardian', '2026-01-19T14:40:00Z',
    'Nathalia demonstra perfil operacional sólido com excelente ritmo (D3=85) e alta conformidade (D4=80). Consistente, confiável e focada em qualidade. Ideal para processos que exigem atenção a detalhes.',
    true, 'Melhor fit para a posição. Forte em processos.'),
];

// --- Mock Alerts ---
export const mockHubAlerts: HubAlert[] = [
  {
    id: 'alert-001',
    type: 'expired_invites',
    message: '1 convite expirado no teste "Perfil Vendas"',
    testId: 'ct-002',
    testName: 'Perfil Vendas - Executivo Comercial',
    severity: 'warning',
    createdAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'alert-002',
    type: 'abandoned_tests',
    message: 'Otávio Ramos abandonou o teste "Operações" há mais de 48h',
    testId: 'ct-006',
    testName: 'Operações - Analista de Processos',
    severity: 'error',
    createdAt: '2026-01-22T08:00:00Z',
  },
  {
    id: 'alert-003',
    type: 'deadline_approaching',
    message: 'Prazo do teste "Perfil Vendas" expira em 7 dias',
    testId: 'ct-002',
    testName: 'Perfil Vendas - Executivo Comercial',
    severity: 'info',
    createdAt: '2026-01-28T08:00:00Z',
  },
  {
    id: 'alert-004',
    type: 'no_candidates',
    message: 'Teste "Avaliação Geral - Trainee 2026" ainda não possui candidatos',
    testId: 'ct-005',
    testName: 'Avaliação Geral - Trainee 2026',
    severity: 'info',
    createdAt: '2026-01-29T08:00:00Z',
  },
];

// --- Mock Activity Feed ---
export const mockActivityFeed: ActivityItem[] = [
  { id: 'act-001', type: 'test_completed', message: 'Ana Silva concluiu o teste "Avaliação Liderança"', timestamp: '2026-01-17T11:45:00Z', testId: 'ct-001', candidateName: 'Ana Silva' },
  { id: 'act-002', type: 'test_completed', message: 'Bruno Costa concluiu o teste "Avaliação Liderança"', timestamp: '2026-01-18T08:40:00Z', testId: 'ct-001', candidateName: 'Bruno Costa' },
  { id: 'act-003', type: 'shortlist_added', message: 'Ana Silva adicionada à shortlist de "Avaliação Liderança"', timestamp: '2026-01-18T10:00:00Z', testId: 'ct-001', candidateName: 'Ana Silva' },
  { id: 'act-004', type: 'invite_sent', message: '4 convites enviados para "Avaliação Liderança"', timestamp: '2026-01-17T09:00:00Z', testId: 'ct-001' },
  { id: 'act-005', type: 'test_activated', message: 'Teste "Avaliação Técnica - Dev Backend" ativado', timestamp: '2026-01-21T10:00:00Z', testId: 'ct-003' },
  { id: 'act-006', type: 'test_completed', message: 'Igor Almeida concluiu o teste "Avaliação Técnica"', timestamp: '2026-01-21T14:55:00Z', testId: 'ct-003', candidateName: 'Igor Almeida' },
  { id: 'act-007', type: 'test_completed', message: 'Nathalia Dias concluiu o teste "Operações"', timestamp: '2026-01-19T14:40:00Z', testId: 'ct-006', candidateName: 'Nathalia Dias' },
  { id: 'act-008', type: 'report_downloaded', message: 'PDF do resultado de Eduardo Lima baixado', timestamp: '2026-01-25T14:00:00Z', testId: 'ct-002', candidateName: 'Eduardo Lima' },
  { id: 'act-009', type: 'test_created', message: 'Teste "Avaliação Geral - Trainee 2026" criado como rascunho', timestamp: '2026-01-28T15:00:00Z', testId: 'ct-005' },
  { id: 'act-010', type: 'invite_sent', message: 'Diego Ferreira convidado para "Avaliação Liderança"', timestamp: '2026-01-25T10:00:00Z', testId: 'ct-001', candidateName: 'Diego Ferreira' },
];

// --- Mock Audit Logs ---
export const mockAuditLogs: AuditLog[] = [
  { id: 'log-001', action: 'test_created', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'test', resourceId: 'ct-001', resourceName: 'Avaliação Liderança', timestamp: '2026-01-15T10:00:00Z' },
  { id: 'log-002', action: 'test_activated', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'test', resourceId: 'ct-001', resourceName: 'Avaliação Liderança', timestamp: '2026-01-16T08:00:00Z' },
  { id: 'log-003', action: 'invite_sent', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'invitation', resourceId: 'inv-001', resourceName: 'Ana Silva', details: 'Teste: Avaliação Liderança', timestamp: '2026-01-17T09:00:00Z' },
  { id: 'log-004', action: 'invite_sent', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'invitation', resourceId: 'inv-002', resourceName: 'Bruno Costa', details: 'Teste: Avaliação Liderança', timestamp: '2026-01-17T09:01:00Z' },
  { id: 'log-005', action: 'result_viewed', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'result', resourceId: 'res-001', resourceName: 'Ana Silva', details: 'Teste: Avaliação Liderança', timestamp: '2026-01-17T12:00:00Z' },
  { id: 'log-006', action: 'shortlist_added', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'result', resourceId: 'res-001', resourceName: 'Ana Silva', details: 'Teste: Avaliação Liderança', timestamp: '2026-01-18T10:00:00Z' },
  { id: 'log-007', action: 'test_created', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'test', resourceId: 'ct-002', resourceName: 'Perfil Vendas', timestamp: '2026-01-10T14:00:00Z' },
  { id: 'log-008', action: 'test_activated', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'test', resourceId: 'ct-002', resourceName: 'Perfil Vendas', timestamp: '2026-01-12T09:00:00Z' },
  { id: 'log-009', action: 'link_generated', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'test', resourceId: 'ct-001', resourceName: 'Avaliação Liderança', details: 'Slug: gp-senior-2026', timestamp: '2026-01-16T08:30:00Z' },
  { id: 'log-010', action: 'result_viewed', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'result', resourceId: 'res-003', resourceName: 'Eduardo Lima', details: 'Teste: Perfil Vendas', timestamp: '2026-01-13T10:00:00Z' },
  { id: 'log-011', action: 'pdf_downloaded', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'result', resourceId: 'res-003', resourceName: 'Eduardo Lima', details: 'PDF individual', timestamp: '2026-01-25T14:00:00Z' },
  { id: 'log-012', action: 'result_compared', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'test', resourceId: 'ct-001', resourceName: 'Avaliação Liderança', details: 'Candidatos: Ana Silva, Bruno Costa', timestamp: '2026-01-18T11:00:00Z' },
  { id: 'log-013', action: 'test_created', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'test', resourceId: 'ct-003', resourceName: 'Avaliação Técnica', timestamp: '2026-01-20T11:00:00Z' },
  { id: 'log-014', action: 'test_activated', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'test', resourceId: 'ct-003', resourceName: 'Avaliação Técnica', timestamp: '2026-01-21T10:00:00Z' },
  { id: 'log-015', action: 'invite_sent', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'invitation', resourceId: 'inv-009', resourceName: 'Igor Almeida', details: 'Teste: Avaliação Técnica', timestamp: '2026-01-21T10:05:00Z' },
  { id: 'log-016', action: 'shortlist_added', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'result', resourceId: 'res-005', resourceName: 'Igor Almeida', details: 'Teste: Avaliação Técnica', timestamp: '2026-01-22T11:00:00Z' },
  { id: 'log-017', action: 'test_created', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'test', resourceId: 'ct-005', resourceName: 'Trainee 2026', timestamp: '2026-01-28T15:00:00Z' },
  { id: 'log-018', action: 'excel_downloaded', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'test', resourceId: 'ct-002', resourceName: 'Perfil Vendas', details: 'Excel consolidado', timestamp: '2026-01-26T09:00:00Z' },
  { id: 'log-019', action: 'test_closed', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'test', resourceId: 'ct-004', resourceName: 'Perfil Criativo', timestamp: '2026-01-15T16:00:00Z' },
  { id: 'log-020', action: 'test_archived', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'test', resourceId: 'ct-007', resourceName: 'Customizado - Gerente de Inovação', timestamp: '2025-12-20T14:00:00Z' },
  { id: 'log-021', action: 'shortlist_added', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'result', resourceId: 'res-003', resourceName: 'Eduardo Lima', details: 'Teste: Perfil Vendas', timestamp: '2026-01-13T11:00:00Z' },
  { id: 'log-022', action: 'invite_sent', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'invitation', resourceId: 'inv-004', resourceName: 'Diego Ferreira', details: 'Teste: Avaliação Liderança', timestamp: '2026-01-25T10:00:00Z' },
  { id: 'log-023', action: 'shortlist_added', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'result', resourceId: 'res-009', resourceName: 'Nathalia Dias', details: 'Teste: Operações', timestamp: '2026-01-20T09:00:00Z' },
  { id: 'log-024', action: 'result_viewed', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'result', resourceId: 'res-005', resourceName: 'Igor Almeida', details: 'Teste: Avaliação Técnica', timestamp: '2026-01-22T10:50:00Z' },
  { id: 'log-025', action: 'shortlist_added', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'result', resourceId: 'res-002', resourceName: 'Bruno Costa', details: 'Teste: Avaliação Liderança', timestamp: '2026-01-18T12:00:00Z' },
  { id: 'log-026', action: 'shortlist_added', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'result', resourceId: 'res-004', resourceName: 'Fernanda Rocha', details: 'Teste: Perfil Vendas', timestamp: '2026-01-14T09:00:00Z' },
  { id: 'log-027', action: 'invite_sent', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'invitation', resourceId: 'inv-014', resourceName: 'Nathalia Dias', details: 'Teste: Operações', timestamp: '2026-01-19T08:00:00Z' },
  { id: 'log-028', action: 'result_viewed', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'result', resourceId: 'res-009', resourceName: 'Nathalia Dias', details: 'Teste: Operações', timestamp: '2026-01-20T08:30:00Z' },
  { id: 'log-029', action: 'lgpd_report_generated', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'result', resourceId: 'cand-1', resourceName: 'Ana Silva', details: 'Relatório LGPD de acessos', timestamp: '2026-01-27T14:00:00Z' },
  { id: 'log-030', action: 'invite_resent', userId: 'user-comp-1', userName: 'Maria Recrutadora', resourceType: 'invitation', resourceId: 'inv-004', resourceName: 'Diego Ferreira', details: 'Reenvio de convite', timestamp: '2026-01-28T09:00:00Z' },
];
