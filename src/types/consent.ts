/**
 * Types for LGPD data-disclosure consent (candidate × company × application).
 * Sensitive candidate data is only revealed to the company after the candidate
 * accepts a disclosure for a specific application that reached 'offer'.
 */

export type DisclosureStatus = 'pending' | 'accepted' | 'refused' | 'revoked';

export interface DataDisclosure {
  id: string;
  applicationId: string;
  candidateId: string;
  companyId: string;
  status: DisclosureStatus;
  termVersion?: string;
  termHash?: string;
  acceptedAt?: string;
  revokedAt?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

/** Current canonical version of the consent term text. */
export const CONSENT_TERM_VERSION = '1.0';
