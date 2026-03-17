-- Migration 059: Add CPF and phone to team_members
-- Required for collaborator pre-registration and WhatsApp test invitations

ALTER TABLE team_members ADD COLUMN cpf TEXT;
ALTER TABLE team_members ADD COLUMN phone TEXT;

-- CPF unique per company (same person can be collaborator at multiple companies)
CREATE UNIQUE INDEX idx_team_members_cpf_company
  ON team_members(company_id, cpf) WHERE cpf IS NOT NULL;
