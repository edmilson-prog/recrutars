-- =============================================================================
-- Migration: 040_add_rbac_audit_triggers
-- Description: Creates trigger functions for automatic RBAC audit logging
-- Tables affected: profiles, permission_groups, user_permission_overrides
-- Target: permission_audit_logs
-- Applied via MCP: 2026-02-23
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Helper function: log_rbac_audit
--    Resolves user names and inserts into permission_audit_logs.
--    SECURITY DEFINER to bypass RLS on permission_audit_logs.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_rbac_audit(
  p_action text,
  p_target_user_id uuid,
  p_old_value text DEFAULT NULL,
  p_new_value text DEFAULT NULL,
  p_details text DEFAULT NULL,
  p_permission_code text DEFAULT NULL,
  p_target_role_id uuid DEFAULT NULL,
  p_target_group_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_target_user_name text;
  v_performed_by uuid;
  v_performed_by_name text;
BEGIN
  -- Resolve target user name
  IF p_target_user_id IS NOT NULL THEN
    SELECT name INTO v_target_user_name
    FROM public.profiles
    WHERE id = p_target_user_id;
  END IF;

  -- Resolve performer (the admin/user making the change)
  v_performed_by := auth.uid();

  IF v_performed_by IS NOT NULL THEN
    SELECT name INTO v_performed_by_name
    FROM public.profiles
    WHERE id = v_performed_by;
  END IF;

  -- Fallback when auth.uid() is NULL (service role, trigger context, etc.)
  IF v_performed_by IS NULL THEN
    v_performed_by := COALESCE(p_target_user_id, '00000000-0000-0000-0000-000000000000'::uuid);
    v_performed_by_name := COALESCE(v_performed_by_name, 'Sistema');
  END IF;

  -- Ensure performed_by_name is never null (NOT NULL constraint)
  IF v_performed_by_name IS NULL THEN
    v_performed_by_name := 'Sistema';
  END IF;

  -- Insert the audit log entry
  INSERT INTO public.permission_audit_logs (
    action,
    target_user_id,
    target_user_name,
    target_role_id,
    target_group_id,
    permission_code,
    old_value,
    new_value,
    performed_by,
    performed_by_name,
    details
  ) VALUES (
    p_action,
    p_target_user_id,
    v_target_user_name,
    p_target_role_id,
    p_target_group_id,
    p_permission_code,
    p_old_value,
    p_new_value,
    v_performed_by,
    v_performed_by_name,
    p_details
  );
END;
$$;

-- -----------------------------------------------------------------------------
-- 2. Trigger function: audit_profile_changes (AFTER UPDATE on profiles)
--    Detects changes to status, role_id, name, and email.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_old_role_name text;
  v_new_role_name text;
  v_changes text[];
BEGIN
  -- Check if status changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.log_rbac_audit(
      'user_status_changed',
      NEW.id,
      OLD.status,
      NEW.status,
      'Status alterado de ' || COALESCE(OLD.status, 'N/A') || ' para ' || COALESCE(NEW.status, 'N/A')
    );
  END IF;

  -- Check if role_id changed
  IF OLD.role_id IS DISTINCT FROM NEW.role_id THEN
    -- Resolve old role name (role_id is text, roles.id is uuid)
    IF OLD.role_id IS NOT NULL THEN
      SELECT name INTO v_old_role_name
      FROM public.roles
      WHERE id = OLD.role_id::uuid;
    END IF;

    -- Resolve new role name
    IF NEW.role_id IS NOT NULL THEN
      SELECT name INTO v_new_role_name
      FROM public.roles
      WHERE id = NEW.role_id::uuid;
    END IF;

    PERFORM public.log_rbac_audit(
      'role_assigned',
      NEW.id,
      COALESCE(v_old_role_name, 'Nenhum'),
      COALESCE(v_new_role_name, 'Nenhum'),
      'Papel alterado de ' || COALESCE(v_old_role_name, 'Nenhum') || ' para ' || COALESCE(v_new_role_name, 'Nenhum'),
      NULL,
      CASE WHEN NEW.role_id IS NOT NULL THEN NEW.role_id::uuid ELSE NULL END
    );
  END IF;

  -- Check if name or email changed
  v_changes := ARRAY[]::text[];

  IF OLD.name IS DISTINCT FROM NEW.name THEN
    v_changes := array_append(v_changes,
      'Nome: ' || COALESCE(OLD.name, 'N/A') || ' -> ' || COALESCE(NEW.name, 'N/A'));
  END IF;

  IF OLD.email IS DISTINCT FROM NEW.email THEN
    v_changes := array_append(v_changes,
      'Email: ' || COALESCE(OLD.email, 'N/A') || ' -> ' || COALESCE(NEW.email, 'N/A'));
  END IF;

  IF array_length(v_changes, 1) > 0 THEN
    PERFORM public.log_rbac_audit(
      'user_updated',
      NEW.id,
      NULL,
      NULL,
      array_to_string(v_changes, '; ')
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create the AFTER UPDATE trigger on profiles
CREATE TRIGGER audit_profile_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_changes();

-- -----------------------------------------------------------------------------
-- 3. Trigger function: audit_profile_insert (AFTER INSERT on profiles)
--    Logs creation of new user profiles.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.audit_profile_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.log_rbac_audit(
    'user_created',
    NEW.id,
    NULL,
    NULL,
    'Novo usuario criado: ' || COALESCE(NEW.type, 'desconhecido')
  );

  RETURN NEW;
END;
$$;

-- Create the AFTER INSERT trigger on profiles
CREATE TRIGGER audit_profile_insert_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_insert();

-- -----------------------------------------------------------------------------
-- 4. Trigger function: audit_permission_group_changes
--    Handles INSERT, UPDATE, and DELETE on permission_groups.
--    Detects member additions/removals from member_user_ids array.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.audit_permission_group_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_added_members uuid[];
  v_removed_members uuid[];
  v_member uuid;
  v_member_name text;
BEGIN
  -- AFTER INSERT: group created
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_rbac_audit(
      'group_created',
      NULL,
      NULL,
      NEW.name,
      'Grupo de permissoes criado: ' || NEW.name,
      NULL,
      NULL,
      NEW.id
    );

    -- Log each initial member if any
    IF NEW.member_user_ids IS NOT NULL AND array_length(NEW.member_user_ids, 1) > 0 THEN
      FOREACH v_member IN ARRAY NEW.member_user_ids LOOP
        SELECT name INTO v_member_name FROM public.profiles WHERE id = v_member;
        PERFORM public.log_rbac_audit(
          'group_member_added',
          v_member,
          NULL,
          NEW.name,
          'Adicionado ao grupo ' || NEW.name || COALESCE(' (' || v_member_name || ')', ''),
          NULL,
          NULL,
          NEW.id
        );
      END LOOP;
    END IF;

    RETURN NEW;
  END IF;

  -- AFTER UPDATE: group updated + detect member changes
  IF TG_OP = 'UPDATE' THEN
    -- Log general group update if name or description or permissions changed
    IF OLD.name IS DISTINCT FROM NEW.name
       OR OLD.description IS DISTINCT FROM NEW.description
       OR OLD.permission_codes IS DISTINCT FROM NEW.permission_codes THEN
      PERFORM public.log_rbac_audit(
        'group_updated',
        NULL,
        OLD.name,
        NEW.name,
        CASE
          WHEN OLD.name IS DISTINCT FROM NEW.name THEN 'Nome alterado de ' || OLD.name || ' para ' || NEW.name
          WHEN OLD.description IS DISTINCT FROM NEW.description THEN 'Descricao do grupo alterada'
          WHEN OLD.permission_codes IS DISTINCT FROM NEW.permission_codes THEN 'Permissoes do grupo alteradas'
          ELSE 'Grupo atualizado'
        END,
        NULL,
        NULL,
        NEW.id
      );
    END IF;

    -- Detect member changes: compare old vs new member_user_ids arrays
    IF OLD.member_user_ids IS DISTINCT FROM NEW.member_user_ids THEN
      -- Members added: in NEW but not in OLD
      v_added_members := COALESCE(NEW.member_user_ids, ARRAY[]::uuid[])
        OPERATOR(pg_catalog.-) COALESCE(OLD.member_user_ids, ARRAY[]::uuid[]);

      -- Members removed: in OLD but not in NEW
      v_removed_members := COALESCE(OLD.member_user_ids, ARRAY[]::uuid[])
        OPERATOR(pg_catalog.-) COALESCE(NEW.member_user_ids, ARRAY[]::uuid[]);

      -- Log each added member
      IF v_added_members IS NOT NULL AND array_length(v_added_members, 1) > 0 THEN
        FOREACH v_member IN ARRAY v_added_members LOOP
          SELECT name INTO v_member_name FROM public.profiles WHERE id = v_member;
          PERFORM public.log_rbac_audit(
            'group_member_added',
            v_member,
            NULL,
            NEW.name,
            'Adicionado ao grupo ' || NEW.name || COALESCE(' (' || v_member_name || ')', ''),
            NULL,
            NULL,
            NEW.id
          );
        END LOOP;
      END IF;

      -- Log each removed member
      IF v_removed_members IS NOT NULL AND array_length(v_removed_members, 1) > 0 THEN
        FOREACH v_member IN ARRAY v_removed_members LOOP
          SELECT name INTO v_member_name FROM public.profiles WHERE id = v_member;
          PERFORM public.log_rbac_audit(
            'group_member_removed',
            v_member,
            NEW.name,
            NULL,
            'Removido do grupo ' || NEW.name || COALESCE(' (' || v_member_name || ')', ''),
            NULL,
            NULL,
            NEW.id
          );
        END LOOP;
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  -- AFTER DELETE: group deleted
  IF TG_OP = 'DELETE' THEN
    PERFORM public.log_rbac_audit(
      'group_deleted',
      NULL,
      OLD.name,
      NULL,
      'Grupo de permissoes excluido: ' || OLD.name,
      NULL,
      NULL,
      OLD.id
    );

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- Create the trigger on permission_groups (handles INSERT, UPDATE, DELETE)
CREATE TRIGGER audit_permission_group_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.permission_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_permission_group_changes();

-- -----------------------------------------------------------------------------
-- 5. Trigger function: audit_override_changes
--    Handles INSERT and DELETE on user_permission_overrides.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.audit_override_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- AFTER INSERT: permission granted or denied
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_rbac_audit(
      CASE
        WHEN NEW.type = 'grant' THEN 'permission_granted'
        WHEN NEW.type = 'deny' THEN 'permission_denied'
        ELSE 'permission_override_added'
      END,
      NEW.user_id,
      NULL,
      NEW.type,
      CASE
        WHEN NEW.type = 'grant' THEN 'Permissao concedida: ' || NEW.permission_code
        WHEN NEW.type = 'deny' THEN 'Permissao negada: ' || NEW.permission_code
        ELSE 'Override adicionado: ' || NEW.permission_code || ' (' || NEW.type || ')'
      END
        || COALESCE(' - Motivo: ' || NEW.reason, ''),
      NEW.permission_code
    );

    RETURN NEW;
  END IF;

  -- AFTER DELETE: permission removed
  IF TG_OP = 'DELETE' THEN
    PERFORM public.log_rbac_audit(
      'permission_removed',
      OLD.user_id,
      OLD.type,
      NULL,
      'Override de permissao removido: ' || OLD.permission_code || ' (' || OLD.type || ')',
      OLD.permission_code
    );

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- Create the trigger on user_permission_overrides (handles INSERT, DELETE)
CREATE TRIGGER audit_override_changes_trigger
  AFTER INSERT OR DELETE ON public.user_permission_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_override_changes();

-- -----------------------------------------------------------------------------
-- Comments for documentation
-- -----------------------------------------------------------------------------
COMMENT ON FUNCTION public.log_rbac_audit IS
  'Helper function that resolves user names and inserts RBAC audit log entries. SECURITY DEFINER to bypass RLS.';

COMMENT ON FUNCTION public.audit_profile_changes IS
  'Trigger function: logs status changes, role assignments, and profile updates on the profiles table.';

COMMENT ON FUNCTION public.audit_profile_insert IS
  'Trigger function: logs new user profile creation.';

COMMENT ON FUNCTION public.audit_permission_group_changes IS
  'Trigger function: logs permission group creation, updates, deletions, and member changes.';

COMMENT ON FUNCTION public.audit_override_changes IS
  'Trigger function: logs permission override grants, denials, and removals.';
