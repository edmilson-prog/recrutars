/**
 * Hook: useActivityFeed (PRD-071 Migration)
 *
 * Backward-compatible wrapper that delegates to useReportsQuery (useActivityFeed).
 * Preserves filtering, polling simulation, and daily summary API.
 *
 * Data now flows through the service layer instead of importing mockActivityFeed.
 */

import { useState, useEffect, useMemo } from 'react';
import type { ActivityFeedEvent, ActivityEventType } from '@/types';
import { useActivityFeed as useActivityFeedQuery } from './useReportsQuery';

// ---------------------------------------------------------------------------
// Event generation helpers for simulated polling
// ---------------------------------------------------------------------------

const EVENT_TYPES: ActivityEventType[] = [
  'new_candidate',
  'application',
  'new_job',
  'test_completed',
  'interview_scheduled',
  'hire',
];

const CANDIDATE_NAMES = [
  'Ana Costa',
  'Bruno Lima',
  'Carla Souza',
  'Diego Santos',
  'Elena Ferreira',
  'Fabio Almeida',
  'Gabriela Rocha',
  'Hugo Martins',
  'Iris Nascimento',
  'Jorge Pereira',
];

const COMPANY_NAMES = [
  'TechCorp RS',
  'Inovacao Digital',
  'StartupRS',
  'DataBrasil',
  'ConsultBR',
];

const JOB_TITLES = [
  'Desenvolvedor Full Stack',
  'Analista de Dados',
  'Designer UX/UI',
  'Gerente de Projetos',
  'DevOps Engineer',
];

function generateDescription(
  type: ActivityEventType,
  name: string,
  company: string,
  job: string,
): string {
  switch (type) {
    case 'new_candidate':
      return `${name} se cadastrou como candidato na plataforma`;
    case 'application':
      return `${name} se candidatou para "${job}" na ${company}`;
    case 'new_job':
      return `${company} publicou a vaga "${job}"`;
    case 'test_completed':
      return `${name} completou o teste comportamental Gauge-Pro`;
    case 'interview_scheduled':
      return `Entrevista agendada: ${name} com ${company} para "${job}"`;
    case 'hire':
      return `${company} contratou ${name} para "${job}"`;
    default:
      return `Evento do sistema`;
  }
}

function getActorType(type: ActivityEventType): 'candidate' | 'company' | 'admin' | 'system' {
  switch (type) {
    case 'new_candidate':
    case 'application':
    case 'test_completed':
      return 'candidate';
    case 'new_job':
    case 'hire':
      return 'company';
    case 'interview_scheduled':
      return 'system';
    default:
      return 'system';
  }
}

function createRandomEvent(): ActivityFeedEvent {
  const type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  const name = CANDIDATE_NAMES[Math.floor(Math.random() * CANDIDATE_NAMES.length)];
  const company = COMPANY_NAMES[Math.floor(Math.random() * COMPANY_NAMES.length)];
  const job = JOB_TITLES[Math.floor(Math.random() * JOB_TITLES.length)];
  const actorType = getActorType(type);

  return {
    id: `event-live-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    eventType: type,
    actorType,
    actorId: `actor-${Math.floor(Math.random() * 10000)}`,
    actorName: actorType === 'company' ? company : name,
    resourceType: type.replace('new_', ''),
    resourceId: `res-${Math.floor(Math.random() * 10000)}`,
    description: generateDescription(type, name, company, job),
    metadata: { companyName: company, jobTitle: job },
    createdAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

const MAX_EVENTS = 200;
const POLL_INTERVAL_MS = 30000; // 30 seconds

export function useActivityFeed() {
  const { data: initialEvents = [], isLoading, error } = useActivityFeedQuery(MAX_EVENTS);
  const [liveEvents, setLiveEvents] = useState<ActivityFeedEvent[]>([]);
  const [filterTypes, setFilterTypes] = useState<ActivityEventType[]>([]);

  // Merge initial (service) events with live events
  const events = useMemo(
    () => [...liveEvents, ...initialEvents].slice(0, MAX_EVENTS),
    [liveEvents, initialEvents],
  );

  // Simulate polling: occasionally add a new event
  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent = createRandomEvent();
      setLiveEvents((prev) => [newEvent, ...prev].slice(0, 50));
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  // Filtered events based on selected event types
  const filteredEvents = useMemo(() => {
    if (filterTypes.length === 0) return events;
    return events.filter((e) => filterTypes.includes(e.eventType));
  }, [events, filterTypes]);

  // Daily summary: count today's events by type
  const todaySummary = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayEvents = events.filter((e) => e.createdAt.startsWith(today));
    const byType = todayEvents.reduce<Record<string, number>>((acc, e) => {
      acc[e.eventType] = (acc[e.eventType] || 0) + 1;
      return acc;
    }, {});

    return {
      total: todayEvents.length,
      byType,
    };
  }, [events]);

  return {
    events: filteredEvents,
    allEvents: events,
    filterTypes,
    setFilterTypes,
    todaySummary,
    isLoading,
    error,
  };
}
