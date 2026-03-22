-- ============================================================================
-- Migration 071: Gauge-Pro Content Tables
-- Move hardcoded behavioral test data to Supabase tables with admin CRUD
-- CRITICAL: Word IDs and Scenario IDs are immutable — referenced by results
-- ============================================================================

-- ============================================================================
-- 1. gauge_pro_words — 100 adjectives (5 dimensions × 20 words)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gauge_pro_words (
  id          INT PRIMARY KEY,
  text        TEXT NOT NULL,
  dimension   TEXT NOT NULL CHECK (dimension IN ('D1', 'D2', 'D3', 'D4', 'D5')),
  polarity    TEXT NOT NULL CHECK (polarity IN ('high', 'low')),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE gauge_pro_words IS 'Gauge-Pro adjective bank (PRD-049). IDs are immutable — referenced by assessment responses.';
COMMENT ON COLUMN gauge_pro_words.is_active IS 'Soft-delete flag. Inactive words are hidden from new tests but preserved for historical results.';

-- Auto-increment for new words (start after existing 100)
CREATE SEQUENCE IF NOT EXISTS gauge_pro_words_id_seq START WITH 101;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_gauge_pro_words_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_gauge_pro_words_updated_at ON gauge_pro_words;
CREATE TRIGGER trg_gauge_pro_words_updated_at
  BEFORE UPDATE ON gauge_pro_words
  FOR EACH ROW EXECUTE FUNCTION update_gauge_pro_words_updated_at();

-- ============================================================================
-- 2. gauge_pro_scenarios — 15 situational scenarios with embedded options
-- ============================================================================

CREATE TABLE IF NOT EXISTS gauge_pro_scenarios (
  id          INT PRIMARY KEY,
  sort_order  INT NOT NULL,
  title       TEXT NOT NULL,
  situation   TEXT NOT NULL,
  options     JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE gauge_pro_scenarios IS 'Gauge-Pro situational scenarios (PRD-050). Options stored as JSONB array. IDs are immutable.';
COMMENT ON COLUMN gauge_pro_scenarios.options IS 'Array of {key, text, mappings[{dimension, direction}]}';

CREATE SEQUENCE IF NOT EXISTS gauge_pro_scenarios_id_seq START WITH 16;

DROP TRIGGER IF EXISTS trg_gauge_pro_scenarios_updated_at ON gauge_pro_scenarios;
CREATE TRIGGER trg_gauge_pro_scenarios_updated_at
  BEFORE UPDATE ON gauge_pro_scenarios
  FOR EACH ROW EXECUTE FUNCTION update_gauge_pro_words_updated_at();

-- ============================================================================
-- 3. gauge_pro_archetypes — 16 behavioral profiles
-- ============================================================================

CREATE TABLE IF NOT EXISTS gauge_pro_archetypes (
  id                   TEXT PRIMARY KEY,
  name                 TEXT NOT NULL,
  description          TEXT NOT NULL,
  strengths            TEXT[] NOT NULL DEFAULT '{}',
  development_areas    TEXT[] NOT NULL DEFAULT '{}',
  ideal_roles          TEXT[] NOT NULL DEFAULT '{}',
  work_style           TEXT NOT NULL DEFAULT '',
  communication_style  TEXT NOT NULL DEFAULT '',
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE gauge_pro_archetypes IS 'Gauge-Pro archetype profiles (PRD-050). IDs are immutable — referenced by results.';

DROP TRIGGER IF EXISTS trg_gauge_pro_archetypes_updated_at ON gauge_pro_archetypes;
CREATE TRIGGER trg_gauge_pro_archetypes_updated_at
  BEFORE UPDATE ON gauge_pro_archetypes
  FOR EACH ROW EXECUTE FUNCTION update_gauge_pro_words_updated_at();

-- ============================================================================
-- 4. RLS Policies
-- ============================================================================

ALTER TABLE gauge_pro_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE gauge_pro_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE gauge_pro_archetypes ENABLE ROW LEVEL SECURITY;

-- SELECT: All authenticated users (test needs to read this data)
CREATE POLICY "gauge_pro_words_select" ON gauge_pro_words
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "gauge_pro_scenarios_select" ON gauge_pro_scenarios
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "gauge_pro_archetypes_select" ON gauge_pro_archetypes
  FOR SELECT TO authenticated USING (true);

-- INSERT: Admin only
CREATE POLICY "gauge_pro_words_insert_admin" ON gauge_pro_words
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "gauge_pro_scenarios_insert_admin" ON gauge_pro_scenarios
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "gauge_pro_archetypes_insert_admin" ON gauge_pro_archetypes
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

-- UPDATE: Admin only
CREATE POLICY "gauge_pro_words_update_admin" ON gauge_pro_words
  FOR UPDATE TO authenticated
  USING (public.get_user_type(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "gauge_pro_scenarios_update_admin" ON gauge_pro_scenarios
  FOR UPDATE TO authenticated
  USING (public.get_user_type(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "gauge_pro_archetypes_update_admin" ON gauge_pro_archetypes
  FOR UPDATE TO authenticated
  USING (public.get_user_type(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

-- NO DELETE policies — hard delete is forbidden

-- ============================================================================
-- 5. Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_gauge_pro_words_dimension ON gauge_pro_words(dimension);
CREATE INDEX IF NOT EXISTS idx_gauge_pro_words_active ON gauge_pro_words(is_active);
CREATE INDEX IF NOT EXISTS idx_gauge_pro_scenarios_active ON gauge_pro_scenarios(is_active);
CREATE INDEX IF NOT EXISTS idx_gauge_pro_archetypes_active ON gauge_pro_archetypes(is_active);

-- ============================================================================
-- 6. SEED DATA — Preserving exact IDs from bundled TypeScript files
-- ============================================================================

-- ----- D1: Dominância/Assertividade -----
INSERT INTO gauge_pro_words (id, text, dimension, polarity) VALUES
  (1, 'Decidido', 'D1', 'high'),
  (2, 'Influente', 'D1', 'high'),
  (3, 'Competitivo', 'D1', 'high'),
  (4, 'Determinado', 'D1', 'high'),
  (5, 'Direto', 'D1', 'high'),
  (6, 'Ousado', 'D1', 'high'),
  (7, 'Controlador', 'D1', 'high'),
  (8, 'Autoritário', 'D1', 'high'),
  (9, 'Comandante', 'D1', 'high'),
  (10, 'Desafiador', 'D1', 'high'),
  (11, 'Cooperativo', 'D1', 'low'),
  (12, 'Receptivo', 'D1', 'low'),
  (13, 'Conciliador', 'D1', 'low'),
  (14, 'Diplomático', 'D1', 'low'),
  (15, 'Consensual', 'D1', 'low'),
  (16, 'Harmonioso', 'D1', 'low'),
  (17, 'Moderado', 'D1', 'low'),
  (18, 'Cauteloso', 'D1', 'low'),
  (19, 'Prudente', 'D1', 'low'),
  (20, 'Reservado', 'D1', 'low')
ON CONFLICT (id) DO NOTHING;

-- ----- D2: Sociabilidade/Extroversão -----
INSERT INTO gauge_pro_words (id, text, dimension, polarity) VALUES
  (21, 'Comunicativo', 'D2', 'high'),
  (22, 'Entusiasmado', 'D2', 'high'),
  (23, 'Persuasivo', 'D2', 'high'),
  (24, 'Amigável', 'D2', 'high'),
  (25, 'Expressivo', 'D2', 'high'),
  (26, 'Sociável', 'D2', 'high'),
  (27, 'Animado', 'D2', 'high'),
  (28, 'Caloroso', 'D2', 'high'),
  (29, 'Extrovertido', 'D2', 'high'),
  (30, 'Falante', 'D2', 'high'),
  (31, 'Reservado', 'D2', 'low'),
  (32, 'Reflexivo', 'D2', 'low'),
  (33, 'Introspectivo', 'D2', 'low'),
  (34, 'Discreto', 'D2', 'low'),
  (35, 'Observador', 'D2', 'low'),
  (36, 'Quieto', 'D2', 'low'),
  (37, 'Concentrado', 'D2', 'low'),
  (38, 'Sério', 'D2', 'low'),
  (39, 'Analítico', 'D2', 'low'),
  (40, 'Independente', 'D2', 'low')
ON CONFLICT (id) DO NOTHING;

-- ----- D3: Ritmo/Paciência -----
INSERT INTO gauge_pro_words (id, text, dimension, polarity) VALUES
  (41, 'Paciente', 'D3', 'high'),
  (42, 'Constante', 'D3', 'high'),
  (43, 'Persistente', 'D3', 'high'),
  (44, 'Estável', 'D3', 'high'),
  (45, 'Metódico', 'D3', 'high'),
  (46, 'Regular', 'D3', 'high'),
  (47, 'Previsível', 'D3', 'high'),
  (48, 'Calmo', 'D3', 'high'),
  (49, 'Consistente', 'D3', 'high'),
  (50, 'Deliberado', 'D3', 'high'),
  (51, 'Ágil', 'D3', 'low'),
  (52, 'Dinâmico', 'D3', 'low'),
  (53, 'Rápido', 'D3', 'low'),
  (54, 'Energético', 'D3', 'low'),
  (55, 'Impulsivo', 'D3', 'low'),
  (56, 'Versátil', 'D3', 'low'),
  (57, 'Inquieto', 'D3', 'low'),
  (58, 'Urgente', 'D3', 'low'),
  (59, 'Espontâneo', 'D3', 'low'),
  (60, 'Multitarefa', 'D3', 'low')
ON CONFLICT (id) DO NOTHING;

-- ----- D4: Conformidade/Estrutura -----
INSERT INTO gauge_pro_words (id, text, dimension, polarity) VALUES
  (61, 'Organizado', 'D4', 'high'),
  (62, 'Preciso', 'D4', 'high'),
  (63, 'Detalhista', 'D4', 'high'),
  (64, 'Sistemático', 'D4', 'high'),
  (65, 'Disciplinado', 'D4', 'high'),
  (66, 'Cuidadoso', 'D4', 'high'),
  (67, 'Meticuloso', 'D4', 'high'),
  (68, 'Formal', 'D4', 'high'),
  (69, 'Estruturado', 'D4', 'high'),
  (70, 'Rigoroso', 'D4', 'high'),
  (71, 'Criativo', 'D4', 'low'),
  (72, 'Inovador', 'D4', 'low'),
  (73, 'Flexível', 'D4', 'low'),
  (74, 'Informal', 'D4', 'low'),
  (75, 'Independente', 'D4', 'low'),
  (76, 'Improvisador', 'D4', 'low'),
  (77, 'Adaptável', 'D4', 'low'),
  (78, 'Livre', 'D4', 'low'),
  (79, 'Original', 'D4', 'low'),
  (80, 'Questionador', 'D4', 'low')
ON CONFLICT (id) DO NOTHING;

-- ----- D5: Orientação Relacional -----
INSERT INTO gauge_pro_words (id, text, dimension, polarity) VALUES
  (81, 'Empático', 'D5', 'high'),
  (82, 'Compreensivo', 'D5', 'high'),
  (83, 'Atencioso', 'D5', 'high'),
  (84, 'Solidário', 'D5', 'high'),
  (85, 'Colaborativo', 'D5', 'high'),
  (86, 'Acolhedor', 'D5', 'high'),
  (87, 'Gentil', 'D5', 'high'),
  (88, 'Sensível', 'D5', 'high'),
  (89, 'Prestativo', 'D5', 'high'),
  (90, 'Carinhoso', 'D5', 'high'),
  (91, 'Objetivo', 'D5', 'low'),
  (92, 'Prático', 'D5', 'low'),
  (93, 'Focado', 'D5', 'low'),
  (94, 'Eficiente', 'D5', 'low'),
  (95, 'Direto', 'D5', 'low'),
  (96, 'Produtivo', 'D5', 'low'),
  (97, 'Lógico', 'D5', 'low'),
  (98, 'Pragmático', 'D5', 'low'),
  (99, 'Realista', 'D5', 'low'),
  (100, 'Técnico', 'D5', 'low')
ON CONFLICT (id) DO NOTHING;

-- ----- Scenarios -----
INSERT INTO gauge_pro_scenarios (id, sort_order, title, situation, options) VALUES
(1, 1, 'Priorização de Urgência',
 'Seu gerente solicita um projeto urgente que precisa ser entregue até o fim do dia, mas você já tem outras prioridades programadas.',
 '[{"key":"A","text":"Reorganizo imediatamente minhas prioridades e foco totalmente no urgente","mappings":[{"dimension":"D1","direction":"+"},{"dimension":"D3","direction":"-"}]},{"key":"B","text":"Converso com o gerente para entender se há flexibilidade ou posso delegar algo","mappings":[{"dimension":"D1","direction":"-"},{"dimension":"D5","direction":"+"}]},{"key":"C","text":"Peço ajuda aos colegas para dividir as tarefas e cumprir tudo","mappings":[{"dimension":"D2","direction":"+"},{"dimension":"D5","direction":"+"}]},{"key":"D","text":"Analiso tecnicamente o que é viável fazer com qualidade no prazo","mappings":[{"dimension":"D4","direction":"+"},{"dimension":"D3","direction":"+"}]}]'::jsonb),
(2, 2, 'Discordância em Reunião',
 'Durante uma reunião, você percebe que a equipe está indo em uma direção que você considera equivocada.',
 '[{"key":"A","text":"Interrompo educadamente e apresento minha perspectiva com argumentos","mappings":[{"dimension":"D1","direction":"+"},{"dimension":"D2","direction":"+"}]},{"key":"B","text":"Anoto minhas preocupações e abordo o líder em particular depois","mappings":[{"dimension":"D1","direction":"-"},{"dimension":"D4","direction":"+"}]},{"key":"C","text":"Faço perguntas para levar o grupo a refletir sobre outras possibilidades","mappings":[{"dimension":"D5","direction":"+"},{"dimension":"D2","direction":"+"}]},{"key":"D","text":"Aguardo o momento certo e apresento dados que fundamentem outra direção","mappings":[{"dimension":"D4","direction":"+"},{"dimension":"D3","direction":"+"}]}]'::jsonb),
(3, 3, 'Apresentação de Resultados Negativos',
 'Você precisa apresentar resultados negativos do trimestre para a diretoria.',
 '[{"key":"A","text":"Apresento os números objetivamente e as ações corretivas já planejadas","mappings":[{"dimension":"D1","direction":"+"},{"dimension":"D4","direction":"+"}]},{"key":"B","text":"Contextualizo os desafios enfrentados e proponho soluções colaborativas","mappings":[{"dimension":"D5","direction":"+"},{"dimension":"D2","direction":"+"}]},{"key":"C","text":"Preparo uma análise detalhada das causas com evidências e plano estruturado","mappings":[{"dimension":"D4","direction":"+"},{"dimension":"D3","direction":"+"}]},{"key":"D","text":"Assumo a responsabilidade e demonstro comprometimento com a reversão","mappings":[{"dimension":"D1","direction":"+"},{"dimension":"D5","direction":"+"}]}]'::jsonb),
(4, 4, 'Colega com Dificuldades',
 'Um novo colega de equipe tem dificuldades para se adaptar aos processos da empresa.',
 '[{"key":"A","text":"Ofereço ajuda e dedico tempo para ensiná-lo com paciência","mappings":[{"dimension":"D5","direction":"+"},{"dimension":"D3","direction":"+"}]},{"key":"B","text":"Indico os manuais e recursos disponíveis para que ele estude","mappings":[{"dimension":"D4","direction":"+"},{"dimension":"D1","direction":"-"}]},{"key":"C","text":"Apresento-o a outros colegas que podem ajudar e integro-o socialmente","mappings":[{"dimension":"D2","direction":"+"},{"dimension":"D5","direction":"+"}]},{"key":"D","text":"Dou feedback direto sobre o que precisa melhorar para acompanhar o ritmo","mappings":[{"dimension":"D1","direction":"+"},{"dimension":"D3","direction":"-"}]}]'::jsonb),
(5, 5, 'Liberdade de Execução',
 'Você tem liberdade para escolher como executar um novo projeto importante.',
 '[{"key":"A","text":"Crio um plano estruturado com etapas, prazos e métricas claras","mappings":[{"dimension":"D4","direction":"+"},{"dimension":"D3","direction":"+"}]},{"key":"B","text":"Reúno a equipe para definir colaborativamente a melhor abordagem","mappings":[{"dimension":"D2","direction":"+"},{"dimension":"D5","direction":"+"}]},{"key":"C","text":"Busco referências externas e adapto criativamente para nossa realidade","mappings":[{"dimension":"D4","direction":"-"},{"dimension":"D1","direction":"+"}]},{"key":"D","text":"Defino as diretrizes principais e executo com agilidade ajustando no caminho","mappings":[{"dimension":"D1","direction":"+"},{"dimension":"D3","direction":"-"}]}]'::jsonb),
(6, 6, 'Conflito na Equipe',
 'Há um conflito entre dois membros da sua equipe que está impactando o clima.',
 '[{"key":"A","text":"Chamo ambos para uma conversa e medio até chegarem a um acordo","mappings":[{"dimension":"D5","direction":"+"},{"dimension":"D2","direction":"+"}]},{"key":"B","text":"Defino claramente as expectativas e responsabilidades de cada um","mappings":[{"dimension":"D1","direction":"+"},{"dimension":"D4","direction":"+"}]},{"key":"C","text":"Escuto individualmente cada lado e busco entender as causas profundas","mappings":[{"dimension":"D5","direction":"+"},{"dimension":"D3","direction":"+"}]},{"key":"D","text":"Estabeleço regras de convivência e monitoro o cumprimento","mappings":[{"dimension":"D4","direction":"+"},{"dimension":"D1","direction":"+"}]}]'::jsonb),
(7, 7, 'Projeto sob Pressão',
 'Você precisa trabalhar em um projeto com prazo apertado e muita pressão.',
 '[{"key":"A","text":"Prospero sob pressão, me mantenho focado e entrego no prazo","mappings":[{"dimension":"D1","direction":"+"},{"dimension":"D3","direction":"-"}]},{"key":"B","text":"Mantenho a calma, organizo as etapas e trabalho metodicamente","mappings":[{"dimension":"D3","direction":"+"},{"dimension":"D4","direction":"+"}]},{"key":"C","text":"Mobilizo a equipe, delego e mantenho todos motivados e alinhados","mappings":[{"dimension":"D2","direction":"+"},{"dimension":"D5","direction":"+"}]},{"key":"D","text":"Reviso prioridades, negocio prazos realistas se necessário","mappings":[{"dimension":"D4","direction":"+"},{"dimension":"D1","direction":"-"}]}]'::jsonb),
(8, 8, 'Feedback Negativo em Público',
 'Você recebe feedback negativo sobre seu trabalho em público.',
 '[{"key":"A","text":"Agradeço o feedback e busco entender especificamente o que melhorar","mappings":[{"dimension":"D5","direction":"+"},{"dimension":"D4","direction":"+"}]},{"key":"B","text":"Defendo meu ponto de vista se acredito que o feedback não é justo","mappings":[{"dimension":"D1","direction":"+"},{"dimension":"D4","direction":"-"}]},{"key":"C","text":"Fico incomodado mas não demonstro, reflito depois sozinho","mappings":[{"dimension":"D2","direction":"-"},{"dimension":"D3","direction":"+"}]},{"key":"D","text":"Peço para conversarmos em particular para entender melhor o contexto","mappings":[{"dimension":"D1","direction":"-"},{"dimension":"D5","direction":"+"}]}]'::jsonb),
(9, 9, 'Mudanças Organizacionais',
 'Sua empresa está passando por mudanças organizacionais significativas.',
 '[{"key":"A","text":"Adapto-me rapidamente e busco oportunidades nas mudanças","mappings":[{"dimension":"D3","direction":"-"},{"dimension":"D1","direction":"+"}]},{"key":"B","text":"Procuro entender o racional das mudanças antes de me posicionar","mappings":[{"dimension":"D4","direction":"+"},{"dimension":"D3","direction":"+"}]},{"key":"C","text":"Preocupo-me com o impacto nas pessoas e ofereço suporte aos colegas","mappings":[{"dimension":"D5","direction":"+"},{"dimension":"D2","direction":"+"}]},{"key":"D","text":"Questiono aspectos que não fazem sentido e proponho alternativas","mappings":[{"dimension":"D1","direction":"+"},{"dimension":"D4","direction":"-"}]}]'::jsonb),
(10, 10, 'Membro Não Performando',
 'Você está liderando um projeto e um membro da equipe não está entregando conforme o esperado.',
 '[{"key":"A","text":"Converso individualmente para entender se há algum problema pessoal ou profissional","mappings":[{"dimension":"D5","direction":"+"},{"dimension":"D2","direction":"+"}]},{"key":"B","text":"Estabeleço metas claras e prazos específicos para correção","mappings":[{"dimension":"D1","direction":"+"},{"dimension":"D4","direction":"+"}]},{"key":"C","text":"Ofereço treinamento ou recursos adicionais para apoiar o desenvolvimento","mappings":[{"dimension":"D3","direction":"+"},{"dimension":"D5","direction":"+"}]},{"key":"D","text":"Redireciono as tarefas e ajusto a distribuição da carga de trabalho","mappings":[{"dimension":"D1","direction":"+"},{"dimension":"D3","direction":"-"}]}]'::jsonb),
(11, 11, 'Ideia Contra Processos',
 'Você tem uma ideia inovadora que vai contra os processos estabelecidos da empresa.',
 '[{"key":"A","text":"Apresento a ideia para liderança com dados e argumentos sólidos","mappings":[{"dimension":"D1","direction":"+"},{"dimension":"D4","direction":"-"}]},{"key":"B","text":"Testo a ideia informalmente primeiro para validar antes de propor oficialmente","mappings":[{"dimension":"D3","direction":"+"},{"dimension":"D4","direction":"-"}]},{"key":"C","text":"Busco aliados que apoiem a ideia e construo consenso gradualmente","mappings":[{"dimension":"D2","direction":"+"},{"dimension":"D5","direction":"+"}]},{"key":"D","text":"Respeito os processos atuais e busco inovar dentro das estruturas existentes","mappings":[{"dimension":"D4","direction":"+"},{"dimension":"D1","direction":"-"}]}]'::jsonb),
(12, 12, 'Promoção vs Equilíbrio',
 'Você precisa escolher entre uma promoção que exige mais horas de trabalho ou manter seu equilíbrio atual.',
 '[{"key":"A","text":"Aceito o desafio, sei que posso me adaptar e crescer","mappings":[{"dimension":"D1","direction":"+"},{"dimension":"D3","direction":"-"}]},{"key":"B","text":"Analiso cuidadosamente prós e contras antes de decidir","mappings":[{"dimension":"D4","direction":"+"},{"dimension":"D3","direction":"+"}]},{"key":"C","text":"Converso com pessoas próximas para considerar o impacto na vida pessoal","mappings":[{"dimension":"D5","direction":"+"},{"dimension":"D2","direction":"+"}]},{"key":"D","text":"Negocio condições que permitam aceitar mantendo qualidade de vida","mappings":[{"dimension":"D1","direction":"-"},{"dimension":"D5","direction":"+"}]}]'::jsonb),
(13, 13, 'Evento de Networking',
 'Em um evento de networking profissional, você:',
 '[{"key":"A","text":"Circulo ativamente, conheço muitas pessoas e troco contatos","mappings":[{"dimension":"D2","direction":"+"},{"dimension":"D3","direction":"-"}]},{"key":"B","text":"Foco em conversas profundas com poucas pessoas estratégicas","mappings":[{"dimension":"D2","direction":"-"},{"dimension":"D4","direction":"+"}]},{"key":"C","text":"Apresento-me quando abordado e mantenho conversas educadas","mappings":[{"dimension":"D1","direction":"-"},{"dimension":"D2","direction":"-"}]},{"key":"D","text":"Busco pessoas que possam gerar oportunidades de negócio concretas","mappings":[{"dimension":"D1","direction":"+"},{"dimension":"D5","direction":"-"}]}]'::jsonb),
(14, 14, 'Erro em Processo',
 'Você identifica um erro em um processo que pode causar problemas futuros, mas corrigir dará trabalho extra.',
 '[{"key":"A","text":"Corrijo imediatamente, não deixo para depois","mappings":[{"dimension":"D4","direction":"+"},{"dimension":"D1","direction":"+"}]},{"key":"B","text":"Documento o erro e proponho uma solução estruturada","mappings":[{"dimension":"D4","direction":"+"},{"dimension":"D3","direction":"+"}]},{"key":"C","text":"Avalio a criticidade e priorizo conforme o risco real","mappings":[{"dimension":"D1","direction":"+"},{"dimension":"D3","direction":"+"}]},{"key":"D","text":"Comunico a equipe e delego a correção para quem tem mais expertise","mappings":[{"dimension":"D2","direction":"+"},{"dimension":"D1","direction":"-"}]}]'::jsonb),
(15, 15, 'Tarefa Repetitiva',
 'Você está trabalhando em uma tarefa repetitiva e monótona que precisa ser concluída.',
 '[{"key":"A","text":"Foco e concluo com consistência, sem pressa","mappings":[{"dimension":"D3","direction":"+"},{"dimension":"D4","direction":"+"}]},{"key":"B","text":"Busco formas criativas de automatizar ou otimizar o processo","mappings":[{"dimension":"D4","direction":"-"},{"dimension":"D1","direction":"+"}]},{"key":"C","text":"Divido em blocos menores e faço pausas para manter energia","mappings":[{"dimension":"D3","direction":"-"},{"dimension":"D2","direction":"+"}]},{"key":"D","text":"Convido colegas para fazer juntos e tornar mais agradável","mappings":[{"dimension":"D2","direction":"+"},{"dimension":"D5","direction":"+"}]}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ----- Archetypes -----
INSERT INTO gauge_pro_archetypes (id, name, description, strengths, development_areas, ideal_roles, work_style, communication_style) VALUES
('commander', 'O Comandante',
 'Líder nato com foco em resultados e alta capacidade de execução. Prefere estrutura e controle sobre processos e pessoas.',
 ARRAY['Tomada de decisão rápida', 'Foco em resultados', 'Capacidade de liderança', 'Visão estratégica'],
 ARRAY['Ouvir mais antes de agir', 'Desenvolver paciência com processos lentos', 'Considerar impacto emocional das decisões'],
 ARRAY['CEO', 'Diretor de Operações', 'Gerente de Projetos', 'Líder de Área'],
 'Direto, orientado a resultados, prefere autonomia e controle.',
 'Objetivo, conciso, focado em ação e soluções.'),
('strategist', 'O Estrategista',
 'Combina assertividade com pensamento analítico e metódico. Planeja com rigor e executa com determinação.',
 ARRAY['Planejamento estratégico', 'Análise detalhada', 'Execução disciplinada', 'Pensamento de longo prazo'],
 ARRAY['Flexibilidade diante de mudanças', 'Delegação de tarefas', 'Conexão emocional com equipe'],
 ARRAY['Consultor Estratégico', 'Analista Sênior', 'Planejador Financeiro', 'Arquiteto de Soluções'],
 'Metódico, estruturado, combina visão macro com atenção a detalhes.',
 'Preciso, fundamentado em dados, prefere comunicação escrita.'),
('innovator', 'O Inovador',
 'Assertivo e criativo, desafia o status quo. Prefere liberdade para explorar novas ideias e abordagens.',
 ARRAY['Criatividade', 'Pensamento disruptivo', 'Coragem para inovar', 'Adaptabilidade'],
 ARRAY['Seguir processos quando necessário', 'Concluir projetos antes de iniciar novos', 'Documentação'],
 ARRAY['Empreendedor', 'Diretor de Inovação', 'Product Owner', 'Designer Líder'],
 'Experimental, rápido, prefere autonomia e liberdade criativa.',
 'Entusiasmado, visionário, usa metáforas e storytelling.'),
('agile_executor', 'O Executor Ágil',
 'Combina assertividade com velocidade. Age rápido, adapta-se facilmente e mantém o foco na entrega.',
 ARRAY['Velocidade de execução', 'Adaptabilidade', 'Orientação a resultados', 'Resiliência'],
 ARRAY['Paciência com detalhes', 'Planejamento de longo prazo', 'Cuidado com qualidade vs velocidade'],
 ARRAY['Gerente de Projetos Ágeis', 'Líder de Vendas', 'Startup Founder', 'Growth Hacker'],
 'Rápido, pragmático, prefere ação imediata a planejamento extenso.',
 'Direto, informal, focado no que precisa ser feito agora.'),
('influencer', 'O Influenciador',
 'Líder carismático que combina assertividade com habilidades sociais. Inspira e mobiliza pessoas.',
 ARRAY['Carisma', 'Persuasão', 'Networking', 'Motivação de equipes'],
 ARRAY['Atenção a detalhes', 'Follow-through em projetos', 'Análise crítica'],
 ARRAY['Diretor Comercial', 'Relações Públicas', 'Líder de Transformação', 'Marketing'],
 'Sociável, energético, prefere trabalho em equipe e visibilidade.',
 'Entusiasmado, persuasivo, usa histórias e exemplos.'),
('captain', 'O Capitão',
 'Líder que combina assertividade, sociabilidade e cuidado com pessoas. Construtor de equipes fortes.',
 ARRAY['Liderança de equipes', 'Empatia com assertividade', 'Construção de cultura', 'Desenvolvimento de pessoas'],
 ARRAY['Dizer não quando necessário', 'Foco em métricas objetivas', 'Gerenciar conflitos difíceis'],
 ARRAY['Líder de Equipes', 'Gerente de RH', 'Coach Executivo', 'Diretor de Pessoas'],
 'Colaborativo, acessível, equilibra resultados com bem-estar.',
 'Empático, motivador, sabe ouvir e direcionar.'),
('promoter', 'O Promotor',
 'Sociável e dinâmico, adora interagir e criar conexões. Traz energia e entusiasmo para qualquer ambiente.',
 ARRAY['Comunicação', 'Entusiasmo', 'Relacionamento interpessoal', 'Energia positiva'],
 ARRAY['Foco em tarefas individuais', 'Organização', 'Profundidade analítica'],
 ARRAY['Vendas', 'Marketing', 'Eventos', 'Relações Corporativas', 'Atendimento'],
 'Energético, social, prefere ambiente colaborativo e dinâmico.',
 'Animado, expressivo, prefere conversas presenciais.'),
('counselor', 'O Conselheiro',
 'Sociável e empático, combina habilidades de comunicação com genuíno interesse pelas pessoas.',
 ARRAY['Escuta ativa', 'Aconselhamento', 'Empatia', 'Construção de confiança'],
 ARRAY['Assertividade em situações difíceis', 'Tomada de decisão rápida', 'Objetividade'],
 ARRAY['Psicólogo Organizacional', 'Mediador', 'Atendimento VIP', 'Coaching'],
 'Acolhedor, paciente, prioriza qualidade das relações.',
 'Atencioso, gentil, faz perguntas profundas.'),
('facilitator', 'O Facilitador',
 'Conecta pessoas e processos com habilidade. Cria ambientes de colaboração e ajuda grupos a alcançar consenso.',
 ARRAY['Facilitação de grupos', 'Colaboração', 'Mediação', 'Organização colaborativa'],
 ARRAY['Posicionamento firme', 'Liderança diretiva quando necessário', 'Gestão de conflitos'],
 ARRAY['Scrum Master', 'Coordenador de Equipes', 'Community Manager', 'Facilitador'],
 'Colaborativo, organizado, foca em processos participativos.',
 'Inclusivo, claro, busca garantir que todos sejam ouvidos.'),
('specialist', 'O Especialista',
 'Profundo conhecimento técnico com foco em qualidade e precisão. Prefere trabalho independente e analítico.',
 ARRAY['Expertise técnica', 'Atenção a detalhes', 'Precisão', 'Consistência'],
 ARRAY['Comunicação interpessoal', 'Trabalho em equipe', 'Adaptação a mudanças rápidas'],
 ARRAY['Analista Técnico', 'Pesquisador', 'Controller Financeiro', 'Engenheiro de Dados'],
 'Independente, focado, prefere ambientes estruturados e previsíveis.',
 'Preciso, técnico, prefere documentação detalhada.'),
('guardian', 'O Guardião',
 'Foco em conformidade, qualidade e proteção. Garante que regras sejam seguidas e padrões mantidos.',
 ARRAY['Compliance', 'Controle de qualidade', 'Atenção a riscos', 'Confiabilidade'],
 ARRAY['Flexibilidade', 'Inovação', 'Comunicação de decisões difíceis'],
 ARRAY['Auditor', 'Compliance', 'Analista de Qualidade', 'Controlador'],
 'Meticuloso, consistente, prioriza conformidade e segurança.',
 'Formal, documentado, baseado em políticas e procedimentos.'),
('artisan', 'O Artesão',
 'Combina habilidade técnica com paciência e meticulosidade. Produz trabalho de alta qualidade com dedicação.',
 ARRAY['Qualidade de entrega', 'Paciência', 'Expertise técnica', 'Perfeccionismo produtivo'],
 ARRAY['Velocidade de entrega', 'Comunicação com stakeholders', 'Visão de negócio'],
 ARRAY['Designer Técnico', 'Desenvolvedor Backend', 'Arquiteto de Dados', 'Engenheiro de Software'],
 'Focado, meticuloso, prefere trabalho profundo sem interrupções.',
 'Reservado, técnico, comunica através do trabalho entregue.'),
('supporter', 'O Apoiador',
 'Paciente, prestativo e focado em ajudar outros. Pilar de estabilidade e suporte em qualquer equipe.',
 ARRAY['Suporte consistente', 'Paciência', 'Confiabilidade', 'Cuidado com outros'],
 ARRAY['Assertividade', 'Iniciativa própria', 'Lidar com mudanças rápidas'],
 ARRAY['Assistente Executivo', 'Suporte ao Cliente', 'Professor', 'Enfermeiro'],
 'Estável, prestativo, prioriza ajudar e manter harmonia.',
 'Gentil, paciente, disponível e acolhedor.'),
('mediator', 'O Mediador',
 'Equilibra relações e processos com diplomacia. Busca harmonia e consenso em todas as situações.',
 ARRAY['Diplomacia', 'Mediação de conflitos', 'Equilíbrio', 'Imparcialidade'],
 ARRAY['Tomada de decisão firme', 'Lidar com pressão', 'Posicionar-se em conflitos'],
 ARRAY['Recursos Humanos', 'Relações Trabalhistas', 'Ombudsman', 'Mediador'],
 'Equilibrado, diplomático, busca consenso e harmonia.',
 'Imparcial, ponderado, ouve todos os lados.'),
('creative_analyst', 'O Analista Criativo',
 'Combina pensamento analítico com criatividade. Encontra soluções originais para problemas complexos.',
 ARRAY['Resolução criativa de problemas', 'Análise + inovação', 'Pensamento lateral', 'Curiosidade'],
 ARRAY['Comunicação de ideias', 'Trabalho em equipe', 'Execução consistente'],
 ARRAY['UX Designer', 'Arquiteto de Soluções', 'Cientista de Dados', 'Product Designer'],
 'Curioso, analítico, alterna entre análise profunda e experimentação.',
 'Reflexivo, faz perguntas inesperadas, apresenta ideias visualmente.'),
('versatile', 'O Versátil',
 'Perfil equilibrado em todas as dimensões. Adapta-se a diferentes contextos e papéis com facilidade.',
 ARRAY['Versatilidade', 'Adaptabilidade', 'Equilíbrio', 'Visão holística'],
 ARRAY['Desenvolver especialização', 'Definir posicionamento claro', 'Aprofundar em uma área'],
 ARRAY['Gerente Geral', 'Consultor', 'Analista de Negócios', 'Project Manager'],
 'Flexível, equilibrado, adapta estilo conforme a situação.',
 'Versátil, ajusta tom e abordagem conforme o interlocutor.')
ON CONFLICT (id) DO NOTHING;
