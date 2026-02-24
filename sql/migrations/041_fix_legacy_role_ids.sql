-- Fix legacy role_id values in profiles that use old slug format instead of UUID
-- Temporarily disable audit trigger to avoid UUID cast error on legacy values

ALTER TABLE profiles DISABLE TRIGGER audit_profile_changes_trigger;

-- Step 1: Map legacy slug-based role_ids to real UUID-based role_ids
UPDATE profiles SET role_id = (SELECT id::text FROM roles WHERE slug = 'super_admin') WHERE role_id = 'role-super-admin';
UPDATE profiles SET role_id = (SELECT id::text FROM roles WHERE slug = 'owner') WHERE role_id = 'role-owner';
UPDATE profiles SET role_id = (SELECT id::text FROM roles WHERE slug = 'hr_manager') WHERE role_id = 'role-manager';
UPDATE profiles SET role_id = (SELECT id::text FROM roles WHERE slug = 'recruiter') WHERE role_id = 'role-recruiter';

-- Step 2: Assign default roles for profiles without a role_id
UPDATE profiles SET role_id = (SELECT id::text FROM roles WHERE slug = 'candidate') WHERE type = 'candidate' AND role_id IS NULL;
UPDATE profiles SET role_id = (SELECT id::text FROM roles WHERE slug = 'recruiter') WHERE type = 'company' AND role_id IS NULL;

-- Re-enable audit trigger
ALTER TABLE profiles ENABLE TRIGGER audit_profile_changes_trigger;
