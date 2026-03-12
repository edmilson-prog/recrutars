-- =====================================================
-- RecrutaRS: Fix accent marks on standardized skills
-- Correção de acentuação nos nomes e categorias
-- =====================================================
-- Applied after 048_standardized_skills.sql
-- Fixes Portuguese diacritical marks missing from
-- skill names and category names.
-- Slugs remain without accents (URL-safe).
-- =====================================================

-- Fix categories
UPDATE public.standardized_skills SET category = 'Liderança e Influência' WHERE category = 'Lideranca e Influencia';
UPDATE public.standardized_skills SET category = 'Comunicação e Relacionamento' WHERE category = 'Comunicacao e Relacionamento';
UPDATE public.standardized_skills SET category = 'Organização e Execução' WHERE category = 'Organizacao e Execucao';
UPDATE public.standardized_skills SET category = 'Pensamento e Resolução' WHERE category = 'Pensamento e Resolucao';
UPDATE public.standardized_skills SET category = 'Colaboração e Serviço' WHERE category = 'Colaboracao e Servico';
UPDATE public.standardized_skills SET category = 'Gestão e Processos' WHERE category = 'Gestao e Processos';
UPDATE public.standardized_skills SET category = 'Saúde e Regulatório' WHERE category = 'Saude e Regulatorio';

-- Fix behavioral skill names
UPDATE public.standardized_skills SET name = 'Liderança' WHERE slug = 'lideranca';
UPDATE public.standardized_skills SET name = 'Tomada de Decisão' WHERE slug = 'tomada-de-decisao';
UPDATE public.standardized_skills SET name = 'Delegação' WHERE slug = 'delegacao';
UPDATE public.standardized_skills SET name = 'Influência e Persuasão' WHERE slug = 'influencia-e-persuasao';
UPDATE public.standardized_skills SET name = 'Gestão de Conflitos' WHERE slug = 'gestao-de-conflitos';
UPDATE public.standardized_skills SET name = 'Visão Estratégica' WHERE slug = 'visao-estrategica';
UPDATE public.standardized_skills SET name = 'Comunicação Verbal' WHERE slug = 'comunicacao-verbal';
UPDATE public.standardized_skills SET name = 'Comunicação Escrita' WHERE slug = 'comunicacao-escrita';
UPDATE public.standardized_skills SET name = 'Negociação' WHERE slug = 'negociacao';
UPDATE public.standardized_skills SET name = 'Apresentação e Oratória' WHERE slug = 'apresentacao-e-oratoria';
UPDATE public.standardized_skills SET name = 'Gestão do Tempo' WHERE slug = 'gestao-do-tempo';
UPDATE public.standardized_skills SET name = 'Organização' WHERE slug = 'organizacao';
UPDATE public.standardized_skills SET name = 'Atenção a Detalhes' WHERE slug = 'atencao-a-detalhes';
UPDATE public.standardized_skills SET name = 'Disciplina e Consistência' WHERE slug = 'disciplina-e-consistencia';
UPDATE public.standardized_skills SET name = 'Priorização' WHERE slug = 'priorizacao';
UPDATE public.standardized_skills SET name = 'Pensamento Crítico' WHERE slug = 'pensamento-critico';
UPDATE public.standardized_skills SET name = 'Resolução de Problemas' WHERE slug = 'resolucao-de-problemas';
UPDATE public.standardized_skills SET name = 'Pensamento Analítico' WHERE slug = 'pensamento-analitico';
UPDATE public.standardized_skills SET name = 'Inovação' WHERE slug = 'inovacao';
UPDATE public.standardized_skills SET name = 'Raciocínio Lógico' WHERE slug = 'raciocinio-logico';
UPDATE public.standardized_skills SET name = 'Resiliência' WHERE slug = 'resiliencia';
UPDATE public.standardized_skills SET name = 'Aprendizado Contínuo' WHERE slug = 'aprendizado-continuo';
UPDATE public.standardized_skills SET name = 'Inteligência Emocional' WHERE slug = 'inteligencia-emocional';
UPDATE public.standardized_skills SET name = 'Autogestão' WHERE slug = 'autogestao';
UPDATE public.standardized_skills SET name = 'Tolerância a Pressão' WHERE slug = 'tolerancia-a-pressao';
UPDATE public.standardized_skills SET name = 'Orientação ao Cliente' WHERE slug = 'orientacao-ao-cliente';
UPDATE public.standardized_skills SET name = 'Ética Profissional' WHERE slug = 'etica-profissional';

-- Fix technical skill names
UPDATE public.standardized_skills SET name = 'Análise de Dados' WHERE slug = 'analise-de-dados';
UPDATE public.standardized_skills SET name = 'Automação de Processos' WHERE slug = 'automacao-de-processos';
UPDATE public.standardized_skills SET name = 'Segurança da Informação e LGPD' WHERE slug = 'seguranca-da-informacao-e-lgpd';
UPDATE public.standardized_skills SET name = 'Gestão de Projetos' WHERE slug = 'gestao-de-projetos';
UPDATE public.standardized_skills SET name = 'Metodologias Ágeis' WHERE slug = 'metodologias-ageis';
UPDATE public.standardized_skills SET name = 'Gestão de Qualidade' WHERE slug = 'gestao-de-qualidade';
UPDATE public.standardized_skills SET name = 'Melhoria Contínua' WHERE slug = 'melhoria-continua';
UPDATE public.standardized_skills SET name = 'Gestão de Riscos' WHERE slug = 'gestao-de-riscos';
UPDATE public.standardized_skills SET name = 'Planejamento Orçamentário' WHERE slug = 'planejamento-orcamentario';
UPDATE public.standardized_skills SET name = 'Indicadores e Métricas' WHERE slug = 'indicadores-e-metricas';
UPDATE public.standardized_skills SET name = 'Técnicas de Vendas' WHERE slug = 'tecnicas-de-vendas';
UPDATE public.standardized_skills SET name = 'Pós-Venda e Customer Success' WHERE slug = 'pos-venda-e-customer-success';
UPDATE public.standardized_skills SET name = 'Gestão de Estoque' WHERE slug = 'gestao-de-estoque';
UPDATE public.standardized_skills SET name = 'Faturamento e Cobrança' WHERE slug = 'faturamento-e-cobranca';
UPDATE public.standardized_skills SET name = 'Logística e Supply Chain' WHERE slug = 'logistica-e-supply-chain';
UPDATE public.standardized_skills SET name = 'Gestão de Contratos' WHERE slug = 'gestao-de-contratos';
UPDATE public.standardized_skills SET name = 'Normas Regulatórias' WHERE slug = 'normas-regulatorias';
UPDATE public.standardized_skills SET name = 'Biossegurança' WHERE slug = 'biosseguranca';
UPDATE public.standardized_skills SET name = 'Atendimento Clínico' WHERE slug = 'atendimento-clinico';
UPDATE public.standardized_skills SET name = 'Gestão Hospitalar' WHERE slug = 'gestao-hospitalar';
UPDATE public.standardized_skills SET name = 'Farmacovigilância' WHERE slug = 'farmacovigilancia';
UPDATE public.standardized_skills SET name = 'Recrutamento e Seleção' WHERE slug = 'recrutamento-e-selecao';
UPDATE public.standardized_skills SET name = 'Avaliação de Desempenho' WHERE slug = 'avaliacao-de-desempenho';
UPDATE public.standardized_skills SET name = 'Legislação Trabalhista' WHERE slug = 'legislacao-trabalhista';
