-- =====================================================
-- RecrutaRS: Standardized Skills System
-- Padronizacao de Habilidades/Competencias (40+40)
-- =====================================================
-- Execute this in: Supabase Dashboard > SQL Editor
-- AFTER 047_one_time_period.sql has been applied.
-- =====================================================

-- =====================================================
-- TABLE: standardized_skills
-- Catalogo padronizado de 80 habilidades (40 comportamentais + 40 tecnicas)
-- Organizado em 12 categorias (6 por tipo)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.standardized_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('technical', 'behavioral')),
  category TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_standardized_skills_type ON public.standardized_skills(type);
CREATE INDEX IF NOT EXISTS idx_standardized_skills_category ON public.standardized_skills(category);
CREATE INDEX IF NOT EXISTS idx_standardized_skills_slug ON public.standardized_skills(slug);

-- =====================================================
-- TABLE: candidate_standardized_skills
-- Habilidades padronizadas selecionadas pelo candidato
-- Max 10 tecnicas + 10 comportamentais (enforced in app)
-- Priority 1 = mais importante
-- =====================================================

CREATE TABLE IF NOT EXISTS public.candidate_standardized_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.standardized_skills(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(candidate_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_candidate_std_skills_candidate ON public.candidate_standardized_skills(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_std_skills_skill ON public.candidate_standardized_skills(skill_id);

-- =====================================================
-- TABLE: job_standardized_skills
-- Competencias padronizadas definidas por vaga
-- Max 5 tecnicas + 5 comportamentais (enforced in app)
-- Priority 1 = mais importante
-- =====================================================

CREATE TABLE IF NOT EXISTS public.job_standardized_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.standardized_skills(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_job_std_skills_job ON public.job_standardized_skills(job_id);
CREATE INDEX IF NOT EXISTS idx_job_std_skills_skill ON public.job_standardized_skills(skill_id);

-- =====================================================
-- RLS: standardized_skills (catalogo — leitura publica, escrita admin)
-- =====================================================

ALTER TABLE public.standardized_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "standardized_skills_select_authenticated"
  ON public.standardized_skills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "standardized_skills_insert_admin"
  ON public.standardized_skills FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "standardized_skills_update_admin"
  ON public.standardized_skills FOR UPDATE
  TO authenticated
  USING (public.get_user_type(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "standardized_skills_delete_admin"
  ON public.standardized_skills FOR DELETE
  TO authenticated
  USING (public.get_user_type(auth.uid()) = 'admin');

-- =====================================================
-- RLS: candidate_standardized_skills
-- SELECT: proprio candidato + empresa + admin
-- INSERT/UPDATE/DELETE: proprio candidato + admin
-- =====================================================

ALTER TABLE public.candidate_standardized_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "candidate_std_skills_select"
  ON public.candidate_standardized_skills FOR SELECT
  TO authenticated
  USING (
    candidate_id = public.get_candidate_id(auth.uid())
    OR public.get_user_type(auth.uid()) IN ('company', 'admin')
  );

CREATE POLICY "candidate_std_skills_insert"
  ON public.candidate_standardized_skills FOR INSERT
  TO authenticated
  WITH CHECK (
    candidate_id = public.get_candidate_id(auth.uid())
    OR public.get_user_type(auth.uid()) = 'admin'
  );

CREATE POLICY "candidate_std_skills_update"
  ON public.candidate_standardized_skills FOR UPDATE
  TO authenticated
  USING (
    candidate_id = public.get_candidate_id(auth.uid())
    OR public.get_user_type(auth.uid()) = 'admin'
  )
  WITH CHECK (
    candidate_id = public.get_candidate_id(auth.uid())
    OR public.get_user_type(auth.uid()) = 'admin'
  );

CREATE POLICY "candidate_std_skills_delete"
  ON public.candidate_standardized_skills FOR DELETE
  TO authenticated
  USING (
    candidate_id = public.get_candidate_id(auth.uid())
    OR public.get_user_type(auth.uid()) = 'admin'
  );

-- =====================================================
-- RLS: job_standardized_skills
-- SELECT: todos autenticados (vagas sao publicas)
-- INSERT/UPDATE/DELETE: empresa dona da vaga + admin
-- =====================================================

ALTER TABLE public.job_standardized_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_std_skills_select"
  ON public.job_standardized_skills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "job_std_skills_insert"
  ON public.job_standardized_skills FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id
        AND j.company_id = public.get_company_id(auth.uid())
    )
    OR public.get_user_type(auth.uid()) = 'admin'
  );

CREATE POLICY "job_std_skills_update"
  ON public.job_standardized_skills FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id
        AND j.company_id = public.get_company_id(auth.uid())
    )
    OR public.get_user_type(auth.uid()) = 'admin'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id
        AND j.company_id = public.get_company_id(auth.uid())
    )
    OR public.get_user_type(auth.uid()) = 'admin'
  );

CREATE POLICY "job_std_skills_delete"
  ON public.job_standardized_skills FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id
        AND j.company_id = public.get_company_id(auth.uid())
    )
    OR public.get_user_type(auth.uid()) = 'admin'
  );

-- =====================================================
-- SEED DATA: 40 Habilidades Comportamentais
-- =====================================================

INSERT INTO public.standardized_skills (name, slug, type, category, sort_order) VALUES
-- Liderança e Influência (7)
('Liderança', 'lideranca', 'behavioral', 'Liderança e Influência', 1),
('Tomada de Decisão', 'tomada-de-decisao', 'behavioral', 'Liderança e Influência', 2),
('Delegação', 'delegacao', 'behavioral', 'Liderança e Influência', 3),
('Mentoria e Coaching', 'mentoria-e-coaching', 'behavioral', 'Liderança e Influência', 4),
('Influência e Persuasão', 'influencia-e-persuasao', 'behavioral', 'Liderança e Influência', 5),
('Gestão de Conflitos', 'gestao-de-conflitos', 'behavioral', 'Liderança e Influência', 6),
('Visão Estratégica', 'visao-estrategica', 'behavioral', 'Liderança e Influência', 7),

-- Comunicação e Relacionamento (7)
('Comunicação Verbal', 'comunicacao-verbal', 'behavioral', 'Comunicação e Relacionamento', 1),
('Comunicação Escrita', 'comunicacao-escrita', 'behavioral', 'Comunicação e Relacionamento', 2),
('Escuta Ativa', 'escuta-ativa', 'behavioral', 'Comunicação e Relacionamento', 3),
('Empatia', 'empatia', 'behavioral', 'Comunicação e Relacionamento', 4),
('Negociação', 'negociacao', 'behavioral', 'Comunicação e Relacionamento', 5),
('Apresentação e Oratória', 'apresentacao-e-oratoria', 'behavioral', 'Comunicação e Relacionamento', 6),
('Relacionamento Interpessoal', 'relacionamento-interpessoal', 'behavioral', 'Comunicação e Relacionamento', 7),

-- Organização e Execução (7)
('Gestão do Tempo', 'gestao-do-tempo', 'behavioral', 'Organização e Execução', 1),
('Organização', 'organizacao', 'behavioral', 'Organização e Execução', 2),
('Planejamento', 'planejamento', 'behavioral', 'Organização e Execução', 3),
('Atenção a Detalhes', 'atencao-a-detalhes', 'behavioral', 'Organização e Execução', 4),
('Foco em Resultados', 'foco-em-resultados', 'behavioral', 'Organização e Execução', 5),
('Disciplina e Consistência', 'disciplina-e-consistencia', 'behavioral', 'Organização e Execução', 6),
('Priorização', 'priorizacao', 'behavioral', 'Organização e Execução', 7),

-- Pensamento e Resolução (6)
('Pensamento Crítico', 'pensamento-critico', 'behavioral', 'Pensamento e Resolução', 1),
('Resolução de Problemas', 'resolucao-de-problemas', 'behavioral', 'Pensamento e Resolução', 2),
('Pensamento Analítico', 'pensamento-analitico', 'behavioral', 'Pensamento e Resolução', 3),
('Criatividade', 'criatividade', 'behavioral', 'Pensamento e Resolução', 4),
('Inovação', 'inovacao', 'behavioral', 'Pensamento e Resolução', 5),
('Raciocínio Lógico', 'raciocinio-logico', 'behavioral', 'Pensamento e Resolução', 6),

-- Adaptabilidade e Crescimento (7)
('Adaptabilidade', 'adaptabilidade', 'behavioral', 'Adaptabilidade e Crescimento', 1),
('Resiliência', 'resiliencia', 'behavioral', 'Adaptabilidade e Crescimento', 2),
('Aprendizado Contínuo', 'aprendizado-continuo', 'behavioral', 'Adaptabilidade e Crescimento', 3),
('Flexibilidade', 'flexibilidade', 'behavioral', 'Adaptabilidade e Crescimento', 4),
('Inteligência Emocional', 'inteligencia-emocional', 'behavioral', 'Adaptabilidade e Crescimento', 5),
('Autogestão', 'autogestao', 'behavioral', 'Adaptabilidade e Crescimento', 6),
('Tolerância a Pressão', 'tolerancia-a-pressao', 'behavioral', 'Adaptabilidade e Crescimento', 7),

-- Colaboração e Serviço (6)
('Trabalho em Equipe', 'trabalho-em-equipe', 'behavioral', 'Colaboração e Serviço', 1),
('Orientação ao Cliente', 'orientacao-ao-cliente', 'behavioral', 'Colaboração e Serviço', 2),
('Proatividade', 'proatividade', 'behavioral', 'Colaboração e Serviço', 3),
('Comprometimento', 'comprometimento', 'behavioral', 'Colaboração e Serviço', 4),
('Ética Profissional', 'etica-profissional', 'behavioral', 'Colaboração e Serviço', 5),
('Responsabilidade e Accountability', 'responsabilidade-e-accountability', 'behavioral', 'Colaboração e Serviço', 6);

-- =====================================================
-- SEED DATA: 40 Habilidades Tecnicas
-- =====================================================

INSERT INTO public.standardized_skills (name, slug, type, category, sort_order) VALUES
-- Tecnologia e Digital (8)
('Pacote Office', 'pacote-office', 'technical', 'Tecnologia e Digital', 1),
('Google Workspace', 'google-workspace', 'technical', 'Tecnologia e Digital', 2),
('Sistemas ERP', 'sistemas-erp', 'technical', 'Tecnologia e Digital', 3),
('CRM', 'crm', 'technical', 'Tecnologia e Digital', 4),
('Análise de Dados', 'analise-de-dados', 'technical', 'Tecnologia e Digital', 5),
('BI e Dashboards', 'bi-e-dashboards', 'technical', 'Tecnologia e Digital', 6),
('Automação de Processos', 'automacao-de-processos', 'technical', 'Tecnologia e Digital', 7),
('Segurança da Informação e LGPD', 'seguranca-da-informacao-e-lgpd', 'technical', 'Tecnologia e Digital', 8),

-- Gestão e Processos (7)
('Gestão de Projetos', 'gestao-de-projetos', 'technical', 'Gestão e Processos', 1),
('Metodologias Ágeis', 'metodologias-ageis', 'technical', 'Gestão e Processos', 2),
('Gestão de Qualidade', 'gestao-de-qualidade', 'technical', 'Gestão e Processos', 3),
('Melhoria Contínua', 'melhoria-continua', 'technical', 'Gestão e Processos', 4),
('Gestão de Riscos', 'gestao-de-riscos', 'technical', 'Gestão e Processos', 5),
('Planejamento Orçamentário', 'planejamento-orcamentario', 'technical', 'Gestão e Processos', 6),
('Indicadores e Métricas', 'indicadores-e-metricas', 'technical', 'Gestão e Processos', 7),

-- Comercial e Atendimento (7)
('Técnicas de Vendas', 'tecnicas-de-vendas', 'technical', 'Comercial e Atendimento', 1),
('Atendimento ao Cliente', 'atendimento-ao-cliente', 'technical', 'Comercial e Atendimento', 2),
('Pós-Venda e Customer Success', 'pos-venda-e-customer-success', 'technical', 'Comercial e Atendimento', 3),
('Gestão de Estoque', 'gestao-de-estoque', 'technical', 'Comercial e Atendimento', 4),
('Visual Merchandising', 'visual-merchandising', 'technical', 'Comercial e Atendimento', 5),
('E-commerce', 'e-commerce', 'technical', 'Comercial e Atendimento', 6),
('Marketing Digital', 'marketing-digital', 'technical', 'Comercial e Atendimento', 7),

-- Financeiro e Administrativo (6)
('Contabilidade e Fiscal', 'contabilidade-e-fiscal', 'technical', 'Financeiro e Administrativo', 1),
('Controle Financeiro', 'controle-financeiro', 'technical', 'Financeiro e Administrativo', 2),
('Faturamento e Cobrança', 'faturamento-e-cobranca', 'technical', 'Financeiro e Administrativo', 3),
('Compras e Suprimentos', 'compras-e-suprimentos', 'technical', 'Financeiro e Administrativo', 4),
('Logística e Supply Chain', 'logistica-e-supply-chain', 'technical', 'Financeiro e Administrativo', 5),
('Gestão de Contratos', 'gestao-de-contratos', 'technical', 'Financeiro e Administrativo', 6),

-- Saúde e Regulatório (6)
('Normas Regulatórias', 'normas-regulatorias', 'technical', 'Saúde e Regulatório', 1),
('Biossegurança', 'biosseguranca', 'technical', 'Saúde e Regulatório', 2),
('Atendimento Clínico', 'atendimento-clinico', 'technical', 'Saúde e Regulatório', 3),
('Gestão Hospitalar', 'gestao-hospitalar', 'technical', 'Saúde e Regulatório', 4),
('Farmacovigilância', 'farmacovigilancia', 'technical', 'Saúde e Regulatório', 5),
('Auditoria e Compliance', 'auditoria-e-compliance', 'technical', 'Saúde e Regulatório', 6),

-- Pessoas e Desenvolvimento (6)
('Recrutamento e Seleção', 'recrutamento-e-selecao', 'technical', 'Pessoas e Desenvolvimento', 1),
('Treinamento e Desenvolvimento', 'treinamento-e-desenvolvimento', 'technical', 'Pessoas e Desenvolvimento', 2),
('Avaliação de Desempenho', 'avaliacao-de-desempenho', 'technical', 'Pessoas e Desenvolvimento', 3),
('Departamento Pessoal', 'departamento-pessoal', 'technical', 'Pessoas e Desenvolvimento', 4),
('Legislação Trabalhista', 'legislacao-trabalhista', 'technical', 'Pessoas e Desenvolvimento', 5),
('Clima Organizacional', 'clima-organizacional', 'technical', 'Pessoas e Desenvolvimento', 6);
