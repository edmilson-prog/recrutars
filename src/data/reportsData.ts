/**
 * Mock data for Reports & Analytics
 * PRD-059: Relatorios "Radar"
 *
 * Generates 365 days of daily platform metrics with deterministic seeded RNG,
 * plus activity feed events and report schedules.
 */

import type { PlatformMetricsDaily, ActivityFeedEvent, ActivityEventType, ReportSchedule } from '@/types';

// ---------------------------------------------------------------------------
// Deterministic seeded pseudo-random number generator
// ---------------------------------------------------------------------------
function createSeededRNG(initialSeed: number) {
  let seed = initialSeed;
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/** Returns a seeded random integer in [min, max] (inclusive). */
function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Returns a seeded random float in [min, max). */
function randFloat(rng: () => number, min: number, max: number): number {
  return rng() * (max - min) + min;
}

// ---------------------------------------------------------------------------
// Daily metrics generator
// ---------------------------------------------------------------------------
function generateDailyMetrics(startDate: Date, days: number): PlatformMetricsDaily[] {
  const rng = createSeededRNG(42);
  const metrics: PlatformMetricsDaily[] = [];

  // Base cumulative values at day 0
  let totalCandidates = 500;
  let totalCompanies = 50;
  let activeJobs = 30;

  // Revenue base (monthly): R$15 000, grows ~5% per month
  const baseMonthlyRevenue = 15000;
  let baseMRR = baseMonthlyRevenue;

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
    const monthIndex = i / 30; // approximate month index for growth curve

    // Seasonal / weekly multiplier: weekdays are busier
    let weekdayMultiplier = 1.0;
    if (dayOfWeek === 0) weekdayMultiplier = 0.4; // Sunday
    else if (dayOfWeek === 6) weekdayMultiplier = 0.55; // Saturday
    else if (dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 3) weekdayMultiplier = 1.15; // Mon-Wed higher
    // Thu-Fri stays at 1.0

    // Apply noise factor (+-15%)
    const noise = () => randFloat(rng, 0.85, 1.15);

    // Growth per day: candidates +3-8, companies +0-2, jobs +1-3
    const newCandidates = Math.round(randInt(rng, 3, 8) * weekdayMultiplier * noise() * (1 + monthIndex * 0.015));
    const newCompanies = Math.round(Math.max(0, randInt(rng, 0, 2) * weekdayMultiplier * noise()));
    const newJobs = Math.round(Math.max(0, randInt(rng, 1, 3) * weekdayMultiplier * noise()));

    totalCandidates += newCandidates;
    totalCompanies += newCompanies;
    activeJobs = Math.max(10, activeJobs + newJobs - randInt(rng, 0, 2)); // some jobs expire

    // Applications are a function of active jobs and candidates
    const applications = Math.round(activeJobs * randFloat(rng, 0.8, 2.0) * weekdayMultiplier * noise());
    const hires = Math.round(applications * randFloat(rng, 0.03, 0.07)); // ~5% of applications
    const interviewsScheduled = Math.round(applications * randFloat(rng, 0.15, 0.25) * noise());
    const interviewsDone = Math.round(interviewsScheduled * randFloat(rng, 0.7, 0.9));

    // Tests
    const testsStarted = Math.round(applications * randFloat(rng, 0.3, 0.5) * noise());
    const testsCompleted = Math.round(testsStarted * randFloat(rng, 0.6, 0.85));

    // Revenue: MRR grows ~5% per month, daily revenue = MRR / 30
    const monthGrowthFactor = 1 + 0.05 * (monthIndex / 1); // compound-ish
    baseMRR = baseMonthlyRevenue * Math.pow(1.05, monthIndex);
    const mrr = Math.round(baseMRR * noise());
    const dailyRevenue = Math.round((mrr / 30) * noise());

    // Subscriptions and cancellations
    const newSubscriptions = Math.round(Math.max(0, randInt(rng, 0, 3) * weekdayMultiplier * noise()));
    const cancellations = rng() < 0.15 ? randInt(rng, 0, 1) : 0; // ~15% chance of a cancellation day

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const metricDate = `${year}-${month}-${day}`;

    metrics.push({
      id: `metric-${metricDate}`,
      metricDate,
      totalCandidates,
      totalCompanies,
      newCandidates,
      newCompanies,
      activeJobs,
      newJobs,
      applications,
      interviewsScheduled,
      interviewsDone,
      hires,
      testsStarted,
      testsCompleted,
      mrr,
      newSubscriptions,
      cancellations,
      revenue: dailyRevenue,
    });
  }

  return metrics;
}

// ---------------------------------------------------------------------------
// Activity feed generator
// ---------------------------------------------------------------------------

const BRAZILIAN_NAMES = [
  'Joao Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Souza',
  'Juliana Ferreira', 'Bruno Lima', 'Fernanda Almeida', 'Rafael Pereira', 'Camila Rodrigues',
  'Lucas Martins', 'Isabela Nascimento', 'Gustavo Carvalho', 'Leticia Araujo', 'Thiago Barbosa',
  'Patricia Goncalves', 'Diego Ribeiro', 'Amanda Rocha', 'Felipe Moreira', 'Larissa Mendes',
  'Eduardo Cardoso', 'Vanessa Correia', 'Marcelo Dias', 'Tatiana Lopes', 'Roberto Vieira',
];

const COMPANY_NAMES = [
  'TechCorp RS', 'Inovacao Digital', 'StartupRS', 'DataBrasil', 'ConsultBR',
  'AgileSoft POA', 'CloudTech Sul', 'FinanceiroRS', 'LogiTech Brasil', 'GreenTech RS',
];

const JOB_TITLES = [
  'Desenvolvedor Full Stack', 'Analista de Dados', 'Gerente de Projetos',
  'Designer UX/UI', 'Engenheiro de Software', 'Analista de RH',
  'Coordenador de Marketing', 'DevOps Engineer', 'Product Manager',
  'Analista Financeiro',
];

function generateEventDescription(type: ActivityEventType, actorName: string, rng: () => number): {
  description: string;
  actorType: 'candidate' | 'company' | 'admin' | 'system';
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, string>;
} {
  const companyName = COMPANY_NAMES[Math.floor(rng() * COMPANY_NAMES.length)];
  const jobTitle = JOB_TITLES[Math.floor(rng() * JOB_TITLES.length)];

  switch (type) {
    case 'new_candidate':
      return {
        description: `${actorName} se cadastrou como candidato na plataforma`,
        actorType: 'candidate',
        resourceType: 'candidate',
        resourceId: `cand-${Math.floor(rng() * 10000)}`,
      };
    case 'new_company':
      return {
        description: `${companyName} criou uma conta empresarial`,
        actorType: 'company',
        resourceType: 'company',
        resourceId: `comp-${Math.floor(rng() * 1000)}`,
        metadata: { companyName },
      };
    case 'new_job':
      return {
        description: `${companyName} publicou a vaga "${jobTitle}"`,
        actorType: 'company',
        resourceType: 'job',
        resourceId: `job-${Math.floor(rng() * 5000)}`,
        metadata: { jobTitle, companyName },
      };
    case 'application':
      return {
        description: `${actorName} se candidatou para "${jobTitle}" na ${companyName}`,
        actorType: 'candidate',
        resourceType: 'application',
        resourceId: `app-${Math.floor(rng() * 10000)}`,
        metadata: { jobTitle, companyName },
      };
    case 'test_completed':
      return {
        description: `${actorName} completou o teste comportamental Gauge-Pro`,
        actorType: 'candidate',
        resourceType: 'test',
        resourceId: `test-${Math.floor(rng() * 10000)}`,
      };
    case 'subscription':
      return {
        description: `${companyName} assinou o plano Profissional`,
        actorType: 'company',
        resourceType: 'subscription',
        resourceId: `sub-${Math.floor(rng() * 1000)}`,
        metadata: { plan: 'Profissional', companyName },
      };
    case 'cancellation':
      return {
        description: `${companyName} cancelou a assinatura`,
        actorType: 'company',
        resourceType: 'subscription',
        resourceId: `sub-${Math.floor(rng() * 1000)}`,
        metadata: { companyName },
      };
    case 'hire':
      return {
        description: `${companyName} contratou ${actorName} para "${jobTitle}"`,
        actorType: 'company',
        resourceType: 'hire',
        resourceId: `hire-${Math.floor(rng() * 5000)}`,
        metadata: { jobTitle, candidateName: actorName, companyName },
      };
    case 'interview_scheduled':
      return {
        description: `Entrevista agendada: ${actorName} com ${companyName} para "${jobTitle}"`,
        actorType: 'system',
        resourceType: 'interview',
        resourceId: `int-${Math.floor(rng() * 5000)}`,
        metadata: { jobTitle, companyName },
      };
    case 'moderation_action':
      return {
        description: `Administrador revisou e aprovou vaga "${jobTitle}" de ${companyName}`,
        actorType: 'admin',
        resourceType: 'moderation',
        resourceId: `mod-${Math.floor(rng() * 5000)}`,
        metadata: { jobTitle, companyName, action: 'approved' },
      };
    default:
      return {
        description: `Evento do sistema`,
        actorType: 'system',
      };
  }
}

function generateActivityFeed(count: number): ActivityFeedEvent[] {
  const rng = createSeededRNG(7777);
  const events: ActivityFeedEvent[] = [];

  const eventTypes: ActivityEventType[] = [
    'new_candidate', 'new_candidate', 'new_candidate',   // weighted: more candidates
    'application', 'application', 'application', 'application', // weighted: more applications
    'new_company',
    'new_job', 'new_job',
    'test_completed', 'test_completed',
    'subscription',
    'cancellation',
    'hire',
    'interview_scheduled', 'interview_scheduled',
    'moderation_action',
  ];

  const now = new Date();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const type = eventTypes[Math.floor(rng() * eventTypes.length)];
    const actorName = BRAZILIAN_NAMES[Math.floor(rng() * BRAZILIAN_NAMES.length)];

    // Spread events across last 7 days, more recent ones more likely
    const recencyBias = rng() * rng(); // biased toward 0 = more recent
    const timeOffset = Math.floor(recencyBias * sevenDaysMs);
    const eventDate = new Date(now.getTime() - timeOffset);

    const details = generateEventDescription(type, actorName, rng);

    events.push({
      id: `event-${i + 1}`,
      eventType: type,
      actorType: details.actorType,
      actorId: `actor-${Math.floor(rng() * 10000)}`,
      actorName: details.actorType === 'company'
        ? (details.metadata?.companyName ?? actorName)
        : details.actorType === 'admin'
          ? 'Admin Sistema'
          : actorName,
      resourceType: details.resourceType,
      resourceId: details.resourceId,
      description: details.description,
      metadata: details.metadata,
      createdAt: eventDate.toISOString(),
    });
  }

  // Sort by createdAt descending (most recent first)
  events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return events;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const mockDailyMetrics: PlatformMetricsDaily[] = generateDailyMetrics(new Date(2025, 0, 1), 365);

export const mockActivityFeed: ActivityFeedEvent[] = generateActivityFeed(100);

export const mockSchedules: ReportSchedule[] = [
  {
    id: 'sched-1',
    name: 'Relatorio Semanal Executivo',
    type: 'pdf',
    frequency: 'weekly',
    dayOfWeek: 1,
    hour: 8,
    recipients: ['admin@recrutars.com.br', 'ceo@recrutars.com.br'],
    isActive: true,
    lastSentAt: '2025-01-27T08:00:00Z',
    nextSendAt: '2025-02-03T08:00:00Z',
  },
  {
    id: 'sched-2',
    name: 'Relatorio Mensal Detalhado',
    type: 'excel',
    frequency: 'monthly',
    dayOfMonth: 1,
    hour: 9,
    recipients: ['admin@recrutars.com.br', 'financeiro@recrutars.com.br'],
    isActive: true,
    lastSentAt: '2025-01-01T09:00:00Z',
    nextSendAt: '2025-02-01T09:00:00Z',
  },
  {
    id: 'sched-3',
    name: 'Relatorio Crescimento',
    type: 'pdf',
    frequency: 'monthly',
    dayOfMonth: 15,
    hour: 10,
    recipients: ['marketing@recrutars.com.br'],
    isActive: false,
  },
];
