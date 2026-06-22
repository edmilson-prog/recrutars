/**
 * Consent Service — Interface & Factory
 * LGPD data-disclosure consent (candidate × company × application).
 */

import type { DataDisclosure } from '@/types/consent';

export interface AcceptConsentInput {
  applicationId: string;
  termVersion: string;
  termHash: string;
}

export interface IConsentService {
  /** Disclosure for a single application (company gate + candidate decision). */
  getDisclosure(applicationId: string): Promise<DataDisclosure | null>;
  /** All disclosures for a candidate, keyed later by applicationId in hooks. */
  listDisclosuresByCandidate(candidateId: string): Promise<DataDisclosure[]>;
  /** Candidate accepts: records term version/hash + IP/user-agent server-side. */
  accept(input: AcceptConsentInput): Promise<DataDisclosure>;
  /** Candidate refuses an offered disclosure. */
  refuse(applicationId: string): Promise<DataDisclosure>;
  /** Candidate revokes a previously accepted disclosure (re-hides data). */
  revoke(applicationId: string): Promise<DataDisclosure>;
}

let _instance: IConsentService | null = null;

export async function getConsentService(): Promise<IConsentService> {
  if (_instance) return _instance;
  const { ConsentServiceSupabase } = await import('./consentService.supabase');
  _instance = new ConsentServiceSupabase();
  return _instance;
}

export function resetConsentService(): void {
  _instance = null;
}
