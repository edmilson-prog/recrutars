import { describe, it, expect } from 'vitest';
import { selectPendingApprovals } from './usePendingApprovals';
import type { Application } from '@/types';
import type { DataDisclosure } from '@/types/consent';

const app = (
  id: string,
  status: Application['status'],
  updatedAt = '2026-06-20',
): Application => ({
  id,
  jobId: `job-${id}`,
  candidateId: 'cand-1',
  candidateName: 'X',
  jobTitle: 'Dev',
  companyName: 'ACME',
  status,
  appliedAt: '2026-06-01',
  updatedAt,
  testStatus: 'nao_solicitado',
});

const disc = (
  applicationId: string,
  status: DataDisclosure['status'],
): DataDisclosure => ({
  id: `d-${applicationId}`,
  applicationId,
  candidateId: 'cand-1',
  companyId: 'co-1',
  status,
  createdAt: '2026-06-20',
});

describe('selectPendingApprovals', () => {
  it('inclui apenas offer + disclosure pending', () => {
    const apps = [
      app('1', 'offer'),
      app('2', 'reviewing'),
      app('3', 'offer'),
      app('4', 'hired'),
    ];
    const discs = {
      '1': disc('1', 'pending'),
      '3': disc('3', 'accepted'),
      '2': disc('2', 'pending'),
    };
    const result = selectPendingApprovals(apps, discs);
    expect(result.map((r) => r.application.id)).toEqual(['1']);
    expect(result[0].disclosure.id).toBe('d-1');
  });

  it('retorna vazio quando não há offer com disclosure pending', () => {
    expect(selectPendingApprovals([app('1', 'reviewing')], {})).toEqual([]);
    // offer sem disclosure registrada também não bloqueia
    expect(selectPendingApprovals([app('1', 'offer')], {})).toEqual([]);
    // offer com disclosure já aceita não bloqueia
    expect(
      selectPendingApprovals([app('1', 'offer')], { '1': disc('1', 'accepted') }),
    ).toEqual([]);
  });

  it('ordena por updatedAt ascendente (mais antiga primeiro)', () => {
    const apps = [app('1', 'offer', '2026-06-21'), app('2', 'offer', '2026-06-19')];
    const discs = { '1': disc('1', 'pending'), '2': disc('2', 'pending') };
    expect(selectPendingApprovals(apps, discs).map((r) => r.application.id)).toEqual([
      '2',
      '1',
    ]);
  });
});
