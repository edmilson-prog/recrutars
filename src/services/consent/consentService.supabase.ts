/**
 * Consent Service — Supabase Implementation
 *
 * Reads candidate_data_disclosures directly (RLS scoped to candidate-own / company).
 * Mutations go through the manage-data-consent Edge Function so that IP/user-agent
 * and audit logging happen server-side with the service role.
 */

import { supabase } from '@/lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';
import type { DataDisclosure } from '@/types/consent';
import type {
  IConsentService,
  AcceptConsentInput,
} from './consentService';

type DisclosureRow = {
  id: string;
  application_id: string;
  candidate_id: string;
  company_id: string;
  status: DataDisclosure['status'];
  term_version: string | null;
  term_hash: string | null;
  accepted_at: string | null;
  revoked_at: string | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
};

function rowToDisclosure(r: DisclosureRow): DataDisclosure {
  return {
    id: r.id,
    applicationId: r.application_id,
    candidateId: r.candidate_id,
    companyId: r.company_id,
    status: r.status,
    termVersion: r.term_version ?? undefined,
    termHash: r.term_hash ?? undefined,
    acceptedAt: r.accepted_at ?? undefined,
    revokedAt: r.revoked_at ?? undefined,
    ip: r.ip ?? undefined,
    userAgent: r.user_agent ?? undefined,
    createdAt: r.created_at,
  };
}

const DISCLOSURE_COLUMNS =
  'id, application_id, candidate_id, company_id, status, term_version, term_hash, accepted_at, revoked_at, ip, user_agent, created_at';

// manage-data-consent table is not yet in the generated Database types; cast the
// table name so tsc stays clean until src/types/database.ts is regenerated.
const DISCLOSURES_TABLE = 'candidate_data_disclosures' as never;

/** Invoke manage-data-consent, recovering the specific error body on non-2xx. */
async function invokeConsent(
  action: 'accept' | 'refuse' | 'revoke',
  payload: Record<string, unknown>,
): Promise<DataDisclosure> {
  const { data, error } = await supabase.functions.invoke('manage-data-consent', {
    body: { action, ...payload },
  });

  if (error) {
    let message = 'Erro ao processar o consentimento. Tente novamente.';
    if (error instanceof FunctionsHttpError) {
      try {
        const body = await error.context.json();
        if (body?.message) message = body.message as string;
      } catch {
        // Body was not JSON — keep the generic message.
      }
    }
    throw new Error(message);
  }

  if (!data?.disclosure) {
    throw new Error('Resposta inesperada do serviço de consentimento.');
  }
  return rowToDisclosure(data.disclosure as DisclosureRow);
}

export class ConsentServiceSupabase implements IConsentService {
  async getDisclosure(applicationId: string): Promise<DataDisclosure | null> {
    const { data, error } = await supabase
      .from(DISCLOSURES_TABLE)
      .select(DISCLOSURE_COLUMNS)
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch disclosure: ${error.message}`);
    }
    return data ? rowToDisclosure(data as unknown as DisclosureRow) : null;
  }

  async listDisclosuresByCandidate(candidateId: string): Promise<DataDisclosure[]> {
    const { data, error } = await supabase
      .from(DISCLOSURES_TABLE)
      .select(DISCLOSURE_COLUMNS)
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch disclosures: ${error.message}`);
    }
    return (data ?? []).map((r) => rowToDisclosure(r as unknown as DisclosureRow));
  }

  async accept(input: AcceptConsentInput): Promise<DataDisclosure> {
    return invokeConsent('accept', {
      applicationId: input.applicationId,
      termVersion: input.termVersion,
      termHash: input.termHash,
    });
  }

  async refuse(applicationId: string): Promise<DataDisclosure> {
    return invokeConsent('refuse', { applicationId });
  }

  async revoke(applicationId: string): Promise<DataDisclosure> {
    return invokeConsent('revoke', { applicationId });
  }
}
