-- Migration 108: profiles SELECT policy para membros da mesma empresa
--
-- Problema: as únicas policies de SELECT em profiles eram profiles_select_own
-- (auth.uid() = id) e profiles_select_admin. Logado como empresa, o dono/membro
-- só conseguia ler o PRÓPRIO profile. Em getCompanyUsers o embed profiles() retornava
-- null para os demais membros → nome/email/avatar em branco e badge "Aguardando
-- ativação" falso (last_access_at também vinha null).
--
-- Correção: permitir que um usuário leia os profiles dos membros da MESMA empresa.
-- get_company_id é SECURITY DEFINER (não recursa com a RLS de company_users);
-- usuários sem empresa (ex.: candidatos) têm get_company_id = null e não ganham acesso.

CREATE POLICY profiles_select_company_team ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.company_users cu
    WHERE cu.profile_id = profiles.id
      AND cu.company_id = public.get_company_id(auth.uid())
  )
);
