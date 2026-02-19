/**
 * Anonymous Job Display Utilities
 * Handles company name/logo anonymization for candidate-facing views.
 */

const ANONYMOUS_COMPANY_NAME = 'Empresa Confidencial';

interface AnonymizableJob {
  companyName: string;
  companyLogo?: string;
  isAnonymous: boolean;
}

/**
 * Returns the display name for the company.
 * If the job is anonymous and the viewer is NOT the owner or admin,
 * returns "Empresa Confidencial".
 */
export function getDisplayCompanyName(
  job: AnonymizableJob,
  options?: { isOwner?: boolean; isAdmin?: boolean }
): string {
  if (!job.isAnonymous) return job.companyName;
  if (options?.isOwner || options?.isAdmin) return job.companyName;
  return ANONYMOUS_COMPANY_NAME;
}

/**
 * Returns the display logo for the company.
 * If the job is anonymous and the viewer is NOT the owner or admin,
 * returns undefined (no logo shown).
 */
export function getDisplayCompanyLogo(
  job: AnonymizableJob,
  options?: { isOwner?: boolean; isAdmin?: boolean }
): string | undefined {
  if (!job.isAnonymous) return job.companyLogo;
  if (options?.isOwner || options?.isAdmin) return job.companyLogo;
  return undefined;
}

export { ANONYMOUS_COMPANY_NAME };
