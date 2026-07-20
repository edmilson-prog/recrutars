-- =====================================================
-- Migration 119: Sync candidate talent-pool visibility on team lifecycle
-- Fix: colaborador desligado (terminate/unlink) nao retornava ao Banco de Talentos
-- =====================================================
-- Root cause:
--   hire_candidate() sets candidates.visibility_mode = 'private' to hide hired
--   candidates from the talent pool (migration 039). Only the 'unlink' action
--   restored visibility_mode = 'public'; the termination paths never did:
--     - manage-team-lifecycle: action 'terminate' (immediate)
--     - manage-team-lifecycle: action 'terminate' (bulk)
--     - process_scheduled_terminations() cron (migration 075)
--   As a result, terminated ex-collaborators stayed 'private' and remained
--   invisible in the Banco de Talentos (Candidates.tsx filters out
--   visibility_mode = 'private' via isVisibleInSearch).
--
-- Solution:
--   A single AFTER UPDATE trigger on team_members.status keeps the linked
--   candidate's visibility in sync for ALL lifecycle paths (present & future):
--     active/on_leave -> terminated/unlinked  => candidate returns to pool (public)
--     * -> active (reactivate)                => candidate hidden again (private)
--   Guards:
--     - only process-hired candidates (imported_from_candidate_id IS NOT NULL);
--       invited collaborators (no candidate link) are untouched.
--     - never overrides locked profiles (visibility_locked = true).
--     - only returns to the pool when the candidate has no other active bond.
-- =====================================================
-- Execute AFTER 118_reveal_documents_in_selection.sql
-- =====================================================

BEGIN;

-- -----------------------------------------------------
-- 1. Trigger function
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_candidate_visibility_on_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- No linked candidate (e.g. invited collaborators) -> nothing to sync.
  IF NEW.imported_from_candidate_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Status must actually change (AFTER UPDATE OF status fires even on no-op sets).
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  -- Left the team -> return the candidate to the talent pool, but only if there
  -- is no OTHER active bond (a candidate hired by two companies must stay hidden
  -- while any bond remains active).
  IF NEW.status IN ('terminated', 'unlinked')
     AND OLD.status NOT IN ('terminated', 'unlinked') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.imported_from_candidate_id = NEW.imported_from_candidate_id
        AND tm.id <> NEW.id
        AND tm.status IN ('active', 'on_leave')
    ) THEN
      UPDATE public.candidates
      SET visibility_mode = 'public'
      WHERE id = NEW.imported_from_candidate_id
        AND visibility_locked = false
        AND visibility_mode = 'private';
    END IF;

  -- Became active again (reactivate) -> hide from the talent pool.
  ELSIF NEW.status = 'active' AND OLD.status <> 'active' THEN
    UPDATE public.candidates
    SET visibility_mode = 'private'
    WHERE id = NEW.imported_from_candidate_id
      AND visibility_locked = false
      AND visibility_mode <> 'private';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.sync_candidate_visibility_on_lifecycle() IS
  'Keeps candidates.visibility_mode in sync with team_members lifecycle status so process-hired candidates return to the Banco de Talentos when terminated/unlinked and are hidden again when reactivated (migration 119).';

-- Trigger-only function: never meant to be called via PostgREST RPC. Revoke the
-- default EXECUTE grant so a SECURITY DEFINER function is not exposed to anon.
REVOKE EXECUTE ON FUNCTION public.sync_candidate_visibility_on_lifecycle()
  FROM PUBLIC, anon, authenticated;

-- -----------------------------------------------------
-- 2. Trigger
-- -----------------------------------------------------
DROP TRIGGER IF EXISTS trg_sync_candidate_visibility_on_lifecycle ON public.team_members;

CREATE TRIGGER trg_sync_candidate_visibility_on_lifecycle
  AFTER UPDATE OF status ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_candidate_visibility_on_lifecycle();

-- -----------------------------------------------------
-- 3. Backfill: candidates already stuck in 'private'
-- -----------------------------------------------------
-- Process-hired candidates terminated/unlinked with no remaining active bond,
-- not locked. Invited collaborators (locked) are intentionally left as-is.
UPDATE public.candidates c
SET visibility_mode = 'public'
WHERE c.visibility_mode = 'private'
  AND c.visibility_locked = false
  AND EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.imported_from_candidate_id = c.id
      AND tm.status IN ('terminated', 'unlinked')
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.team_members tm2
    WHERE tm2.imported_from_candidate_id = c.id
      AND tm2.status IN ('active', 'on_leave')
  );

COMMIT;
