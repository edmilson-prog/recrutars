-- =====================================================
-- Migration 079: get_or_create_conversation RPC
-- Fix: RLS 403 on INSERT into conversations table
-- Applied via MCP Supabase
-- =====================================================

-- 1. UNIQUE partial indexes to prevent duplicate conversations
--    and enable ON CONFLICT in the RPC function

CREATE UNIQUE INDEX IF NOT EXISTS conversations_candidate_company_no_job_uniq
  ON public.conversations (candidate_id, company_id)
  WHERE job_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS conversations_candidate_company_job_uniq
  ON public.conversations (candidate_id, company_id, job_id)
  WHERE job_id IS NOT NULL;

-- 2. RPC function: get_or_create_conversation
--    SECURITY DEFINER bypasses RLS, validates authorization internally.
--    Returns JSON with conversation data + participant names.

CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  p_candidate_id UUID,
  p_company_id UUID,
  p_job_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation RECORD;
  v_caller_company_id UUID;
  v_caller_candidate_id UUID;
BEGIN
  -- Authorization: verify the caller is the company, the candidate, or an admin
  v_caller_company_id := get_company_id(auth.uid());
  v_caller_candidate_id := get_candidate_id(auth.uid());

  IF v_caller_company_id IS DISTINCT FROM p_company_id
     AND v_caller_candidate_id IS DISTINCT FROM p_candidate_id
     AND get_user_type(auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: caller is not a participant'
      USING ERRCODE = '42501';
  END IF;

  -- Try to find existing conversation
  IF p_job_id IS NULL THEN
    SELECT * INTO v_conversation
    FROM conversations
    WHERE candidate_id = p_candidate_id
      AND company_id = p_company_id
      AND job_id IS NULL
    LIMIT 1;
  ELSE
    SELECT * INTO v_conversation
    FROM conversations
    WHERE candidate_id = p_candidate_id
      AND company_id = p_company_id
      AND job_id = p_job_id
    LIMIT 1;
  END IF;

  -- If found, return it
  IF v_conversation.id IS NOT NULL THEN
    RETURN json_build_object(
      'id', v_conversation.id,
      'candidate_id', v_conversation.candidate_id,
      'company_id', v_conversation.company_id,
      'job_id', v_conversation.job_id,
      'created_at', v_conversation.created_at,
      'updated_at', v_conversation.updated_at,
      'candidates', (SELECT json_build_object('name', name) FROM candidates WHERE id = v_conversation.candidate_id),
      'companies', (SELECT json_build_object('name', name) FROM companies WHERE id = v_conversation.company_id),
      'jobs', (SELECT json_build_object('title', title) FROM jobs WHERE id = v_conversation.job_id)
    );
  END IF;

  -- Not found — create new conversation
  IF p_job_id IS NULL THEN
    INSERT INTO conversations (candidate_id, company_id, job_id)
    VALUES (p_candidate_id, p_company_id, NULL)
    ON CONFLICT (candidate_id, company_id) WHERE job_id IS NULL
    DO NOTHING
    RETURNING * INTO v_conversation;
  ELSE
    INSERT INTO conversations (candidate_id, company_id, job_id)
    VALUES (p_candidate_id, p_company_id, p_job_id)
    ON CONFLICT (candidate_id, company_id, job_id) WHERE job_id IS NOT NULL
    DO NOTHING
    RETURNING * INTO v_conversation;
  END IF;

  -- Handle race condition: ON CONFLICT hit, re-select
  IF v_conversation.id IS NULL THEN
    IF p_job_id IS NULL THEN
      SELECT * INTO v_conversation
      FROM conversations
      WHERE candidate_id = p_candidate_id
        AND company_id = p_company_id
        AND job_id IS NULL
      LIMIT 1;
    ELSE
      SELECT * INTO v_conversation
      FROM conversations
      WHERE candidate_id = p_candidate_id
        AND company_id = p_company_id
        AND job_id = p_job_id
      LIMIT 1;
    END IF;
  END IF;

  RETURN json_build_object(
    'id', v_conversation.id,
    'candidate_id', v_conversation.candidate_id,
    'company_id', v_conversation.company_id,
    'job_id', v_conversation.job_id,
    'created_at', v_conversation.created_at,
    'updated_at', v_conversation.updated_at,
    'candidates', (SELECT json_build_object('name', name) FROM candidates WHERE id = v_conversation.candidate_id),
    'companies', (SELECT json_build_object('name', name) FROM companies WHERE id = v_conversation.company_id),
    'jobs', (SELECT json_build_object('title', title) FROM jobs WHERE id = v_conversation.job_id)
  );
END;
$$;
