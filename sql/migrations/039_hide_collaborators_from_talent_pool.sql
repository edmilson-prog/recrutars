-- Migration 039: Hide collaborators/employees from public talent pool
-- Adds visibility_locked column, updates trigger/RPC, backfills existing data, updates RLS
-- Applied via MCP Supabase

-- 1. Add visibility_locked column
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS visibility_locked BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Backfill: collaborators invited via test → private + locked
UPDATE public.candidates c
SET visibility_mode = 'private', visibility_locked = TRUE
WHERE EXISTS (
  SELECT 1 FROM public.team_members tm
  WHERE tm.email = c.email AND tm.is_active = TRUE
    AND tm.imported_from_candidate_id IS NULL
);

-- 3. Backfill: candidates hired via process → private (no lock)
UPDATE public.candidates c
SET visibility_mode = 'private'
WHERE visibility_mode != 'private'
  AND EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.imported_from_candidate_id = c.id AND tm.is_active = TRUE
  );

-- 4. handle_new_user() trigger updated — sets visibility_mode='private' + visibility_locked=true for invited candidates
-- 5. hire_candidate() RPC updated — sets visibility_mode='private' after creating team_member
-- 6. RLS policy candidates_select_company updated — filters private candidates, allows company's own team/applicants
-- 7. Indexes: idx_applications_candidate_id, idx_candidates_visibility_mode

-- See full trigger/RPC/RLS definitions in migration applied via MCP
