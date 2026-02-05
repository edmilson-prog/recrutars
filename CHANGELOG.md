# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.3] - 2026-02-05

### Fixed
- **Login "Lembrar-me"** — Checkbox agora funciona corretamente
  - Default corrigido para desmarcado (era sempre marcado por erro de logica `null !== 'false'` -> `true`)
  - Preferencia do usuario preservada entre ciclos de login/logout
  - Storage adapter com null check explicito para maior robustez

---

## [1.3.2] - 2026-02-05

### Fixed
- **CandidateDashboard** — Tela branca após login com erro "Rendered more hooks than during the previous render"
  - `useEffect` de sync do `profileCompletion` estava após um early return condicional, violando as regras de Hooks do React
  - Movido cálculo de `profileCompletion` e `useEffect` para antes do guard `if (!candidate)`
  - Adicionados ternários com guard para `candidate` nulo nas variáveis computadas

---

## [1.3.1] - 2026-02-05

### Changed
- **Tab "Localização"** — Campo "Cidade" convertido de input livre para combobox pesquisável
  - Cidades filtradas automaticamente pelo estado selecionado
  - Ordem invertida: Estado primeiro, Cidade depois
  - Padrão: Rio Grande do Sul / Frederico Westphalen
  - Dados de ~5.570 municípios brasileiros (fonte: IBGE)
- **Novo arquivo de dados** — `src/data/brazilianCities.ts` com todas as cidades agrupadas por UF

---

## [1.3.0] - 2026-02-05 — "Job Preferences in Profile"

### Added
- **Tab "Interesses"** — Nova aba em `candidato/perfil` com preferências de vagas
  - **Áreas de Interesse**: Setores preferidos (multiselect com 10 opções) e Funções desejadas (multiselect com 10 opções)
  - **Modelo de Trabalho**: Modalidade (Presencial/Híbrido/Remoto) e Tipo de contrato (CLT/PJ/Temporário/Estágio/Freelancer)
  - Persistido no Supabase (colunas `preferred_sectors`, `preferred_roles`, `work_model`, `contract_type`)

- **Tab "Salário"** — Nova aba em `candidato/perfil` com expectativa salarial
  - Faixa salarial: mínimo e máximo (R$)
  - Toggle "Aceita Negociar"
  - Persistido no Supabase (colunas `salary_min`, `salary_max`, `salary_negotiable`)

- **Migration 023** — `sql/migrations/023_candidate_job_preferences.sql`
  - Adiciona 5 colunas à tabela `candidates`: `preferred_sectors`, `preferred_roles`, `work_model`, `contract_type`, `salary_negotiable`
  - Index GIN em `work_model` para filtros

- **Constantes exportadas** — `jobSectorOptions`, `jobRoleOptions`, `workModelOptions`, `contractTypeOptions`, `profileVisibilityOptions`, `resumeVisibilityOptions` em `settingsConfig.ts`

- **Tab "Privacidade"** — Nova aba em `candidato/perfil` com controle de visibilidade
  - **Visibilidade do Perfil**: Select (Público/Parcial/Privado), persistido via `visibility_mode`
  - **Exibir Expectativa Salarial**: Toggle boolean, persistido via `show_salary_expectation`
  - **Visibilidade do Currículo**: Select (Todos/Empresas/Candidaturas), persistido via `resume_visibility`

- **Migration 024** — `candidate_privacy_columns`
  - Adiciona 2 colunas: `show_salary_expectation`, `resume_visibility`

### Changed
- **Profile.tsx** — Expandido de 5 para 8 tabs (layout `grid-cols-4 sm:grid-cols-8`)
- **Candidate interface** — 7 novos campos opcionais: `preferredSectors`, `preferredRoles`, `workModel`, `contractType`, `salaryNegotiable`, `showSalaryExpectation`, `resumeVisibility`
- **supabaseConverters.ts** — 7 novos mapeamentos snake_case → camelCase
- **candidatesService.supabase.ts** — 7 novos mapeamentos no `updateCandidate()`

### Removed
- **Seção "Preferências de Vagas"** — Removida da página de Configurações (`/candidato/configuracoes`)
  - Agora disponível diretamente em `/candidato/perfil` nas tabs Interesses e Salário
- **Seção "Privacidade"** — Removida da página de Configurações (`/candidato/configuracoes`)
  - Agora disponível diretamente em `/candidato/perfil` na tab Privacidade

---

## [1.2.1] - 2026-02-05

### Removed
- **Tab "Dados Pessoais"** — Removida da página de Configurações do candidato (`/candidato/configuracoes`)
  - Avatar upload e crop modal
  - Formulário de informações pessoais (nome, email, CPF, cargo, telefone, LinkedIn, etc.)
  - Seção de localização (cidade, estado, disponibilidade para mudança)
  - **Os dados pessoais continuam disponíveis em `/candidato/perfil`**

### Changed
- **Settings.tsx** — Página simplificada (968 → 416 linhas)
  - Removido wrapper de Tabs (agora exibe ConfigLayout diretamente)
  - Removidos 13 estados React não utilizados
  - Removidos hooks `useCandidateByProfile` e `useUpdateCandidate`
  - Removidas dependências: `react-easy-crop`, `Cropper`, `Avatar`, `Switch`, `Select`, `Textarea`, `Tabs`
  - Mantidos: ConfigLayout de preferências, Ações de Segurança, Zona de Perigo, 4 modals

---

## [1.2.0] - 2026-02-05 — "Profile Consolidation"

### Added
- **Campo "Nome de Exibição"** — Novo campo em `candidato/perfil` para o candidato definir como quer ser chamado
  - Posição: primeiro campo da seção "Informações Pessoais"
  - Persistido no Supabase (coluna `display_name`)

- **Aba "Localização"** — Nova aba em `candidato/perfil` com campos detalhados de localização
  - **Cidade** — Campo de texto livre
  - **Estado** — Select com 27 estados brasileiros (UF)
  - **Disponível para Mudança** — Toggle boolean
  - Dados persistidos no Supabase (colunas `city`, `state`, `open_to_relocation`)

- **Image Cropper para Avatar** — Modal de recorte ao selecionar foto de perfil
  - Arrastar para posicionar a imagem
  - Slider de zoom (1x a 3x)
  - Crop circular para enquadrar o rosto
  - Biblioteca: `react-easy-crop`

- **Campo CPF** — Novo campo em `candidato/perfil` para exibir CPF com máscara
  - Formato: `000.000.000-00`
  - Campo readonly (não editável)
  - Persistido no Supabase (coluna `cpf`)

- **Avatar no Header** — Foto do candidato no menu do header (canto superior direito)
  - Substituiu a inicial do nome pelo avatar real
  - Fallback para inicial se não houver foto
  - Usa componente Avatar do shadcn/ui

### Fixed
- **Atualização da UI após salvar** — Header e avatar atualizam imediatamente sem F5
  - Novo método `refreshCurrentCandidate()` no AuthContext
  - Chamado após `handleSave()` e `handleCropConfirm()` em Profile.tsx
  - React Query invalidation otimizada (removida condicional userId)

### Changed
- **Profile.tsx** — Grid de abas expandido de 4 para 5 colunas
- **settingsConfig.ts** — `brazilianStates` exportado para reutilização
- **Candidate types** — Interface estendida com `displayName`, `city`, `state`, `openToRelocation`
- **Exibição do nome** — Header e avatar agora mostram Nome de Exibição (com fallback para nome completo)
  - DashboardLayout: header usa `displayName || name`
  - Profile.tsx: seção do avatar usa `displayName || name`

### Removed
- **Campo "Localização" redundante** — Removido da tab "perfil" (agora existe a aba dedicada "Localização")
  - O campo antigo exibia uma string única (ex: "São Paulo, SP")
  - Substituído pela aba com campos estruturados: Cidade, Estado, Disponibilidade para Mudança

### Database
- **Migration** — `add_candidate_profile_fields`: adiciona 4 colunas + índice `idx_candidates_city_state`
- **Migration** — `add_candidate_cpf`: adiciona coluna `cpf` (VARCHAR 14, UNIQUE) + índice `idx_candidates_cpf`
- **Constraint** — `chk_candidates_state_length` garante estado com 2 caracteres (sigla UF)

### Notes
- Campos continuam existindo em Settings (localStorage) para redundância temporária conforme solicitado
- Campo `location` mantido no banco/model para compatibilidade com dados legados (apenas UI removida)

## [1.1.0] - 2026-02-05 — "Stability"

### Fixed
- **Perfil do Candidato** — Dados do perfil agora persistem corretamente no Supabase
  - `handleSave()` em Profile.tsx agora chama `updateCandidateMutation.mutateAsync()` ao invés de apenas exibir toast
  - `dateOfBirth` tratado corretamente: string vazia convertida para `null` (tipo DATE do PostgreSQL)
  - Campos persistidos: name, title, location, phone, linkedin, about, dateOfBirth

- **IDs Mock Hardcoded** — 26 arquivos corrigidos que usavam fallbacks `'candidate-1'` ou `'company-1'`
  - Esses IDs causavam erros 400 no Supabase (`invalid input syntax for type uuid`)
  - Substituídos por `''` (string vazia) que desabilita queries via `enabled: !!id` no React Query
  - Arquivos afetados: 12 páginas candidato, 13 páginas empresa, 2 componentes

- **Select.Item com Value Vazio** — Corrigido erro do Radix UI Select
  - `brazilianStates` em settingsConfig.ts tinha opção com `value: ''`
  - Radix UI não permite value vazio em SelectItem
  - Alterado para `value: '__none__'` como placeholder válido

### Changed
- Adicionado import de `useAuth` em 5 arquivos que não tinham acesso a `currentCompany`/`currentCandidate`

## [1.0.0] - 2026-02-04 — "Genesis" (PRD-072: Limpeza Final)

### Removed
- **mockData.ts** — Arquivo principal de mocks transacionais (~4.000 linhas) deletado
- **20 arquivos .mock.ts** — Implementacoes mock de todos os service modules removidas
- **5 arquivos de dados mock-only** — featureFlagsData, plansData, rbacData, reportsData, mockData deletados
- **DATA_SOURCE toggle** — Todos os modulos agora apontam diretamente para Supabase (sem branch mock)

### Added
- **src/lib/behavioralProfiles.ts** — Helpers de perfil comportamental extraidos de mockData.ts
  - `idealBehavioralProfiles` (constante de referencia)
  - `getIdealBehavioralProfile(jobId)` (lookup helper)
  - `getCandidateBehavioralProfile(candidateId, tests)` (desacoplado de mocks, aceita dados como parametro)

### Changed
- **Service Factories** — 20 factories simplificadas: importam diretamente `*ServiceSupabase` sem branch condicional
- **14 paginas/hooks** migrados de mockData imports para lib/behavioralProfiles + dados inline + service hooks
- **Build** — Zero erros TypeScript com `strict: false`

### Technical Details
- 17 arquivos de referencia permanecem em src/data/ (assessmentData, gaugeProConfig, gamificationConfig, etc.)
- Estes sao dados de configuracao bundled (nao transacionais), usados por 74 arquivos de UI
- Dados admin (stats, actions) inlined como constantes locais com TODO para futura API
- useCandidateActivity usa arrays vazios como placeholder (TODO: API de timeline)

## [0.60.0] - 2026-02-04 — "Migration" (PRD-064 a PRD-071)

### Added
- **Database Schema** (PRD-064/065) — 21 PostgreSQL migrations criando 64+ tabelas com RLS, triggers, FTS
- **Seed Data** — Seeds transacionais (jobs, applications, interviews) e permanentes (plans, roles, permissions, feature flags, gamification)
- **Service Layer** (PRD-066/067) — 62 arquivos em src/services/ com padrao Interface + Factory + Mock/Supabase implementations
- **React Query Hooks** — 18 hooks em src/hooks/use*Query.ts com query key factories para cache management
- **DATA_SOURCE Toggle** — src/services/config.ts permite flip por modulo entre mock e supabase

### Changed
- **UI Migration** (PRD-068-071) — Pages e hooks migrados de imports diretos de mock para React Query service hooks
- **RBAC Engine** — Refatorado src/lib/rbac.ts para usar data store injetavel via `configureRBAC()`
- **Recommendation Engines** — jobRecommendation.ts e candidateRecommendation.ts aceitam dados como parametros
- **RBACContext** — Busca dados via useRoles/usePermissionGroups hooks e injeta no engine
- **Build** — Zero erros TypeScript apos todas as migracoes

## [0.55.0] - 2026-02-04 — "Keystone" (PRD-063 consolidado)

### Added
- **Magic Link** — login por OTP/email sem senha
  - `loginWithMagicLink(email)` no AuthContext via `supabase.auth.signInWithOtp()`
  - `shouldCreateUser: false` impede criacao acidental de conta via magic link
  - Nova view `magic-link` no Login.tsx com formulario, feedback de envio e tratamento de erros
  - Divisor "ou" + botao "Entrar com link magico" na tela de login principal
  - Callback automatico via `detectSessionInUrl: true` no Supabase client
- **Tela "Verifique seu email"** pos-registro
  - Exibida quando `signUp` retorna `needsEmailConfirmation: true` (session === null)
  - Mostra email cadastrado, botao "Reenviar email" via `supabase.auth.resend()`, link para login
  - Botao "Voltar ao cadastro" caso usuario tenha errado o email
  - Com confirmacao desabilitada (dev mode), redireciona direto ao dashboard
- **Trigger expandido** `handle_new_user()` (`sql/migrations/002_expand_handle_new_user.sql`)
  - Cria profiles + candidates/companies atomicamente no banco durante signup
  - Le `name`, `type`, `phone` do `raw_user_meta_data`
  - Frontend nao faz mais INSERT manual em candidates/companies

### Changed
- `signUp()` simplificado: removido INSERT manual de candidates/companies (trigger faz tudo)
- `signUp()` agora inclui `phone` no `options.data` para o trigger usar
- `signUp()` retorna `{ needsEmailConfirmation: boolean }` em vez de `void`
- `loginWithMagicLink` adicionado ao Provider value do AuthContext

## [0.54.0] - 2026-02-04 — "Foundation" (PRD-063)

### Added
- **Integração Supabase** — Conexão real com Supabase como backend-as-a-service
  - Client singleton tipado (`src/lib/supabase.ts`) com `persistSession`, `autoRefreshToken`, `detectSessionInUrl`
  - Tipos TypeScript do schema do banco (`src/types/database.ts`) com Row/Insert/Update generics
  - Conversores snake_case (DB) ↔ camelCase (TS) para profiles, candidates e companies
  - Variáveis de ambiente via `.env` com template `.env.example`
- **Schema de Identidade SQL** (`sql/migrations/001_identity_schema.sql`)
  - Tabelas `profiles`, `candidates`, `companies` com indexes e constraints
  - Trigger `handle_new_user()` cria profile automaticamente no signup via `auth.users`
  - Trigger `update_updated_at()` em todas as tabelas
  - Helper `get_user_type()` com `SECURITY DEFINER` para avaliação de políticas RLS
  - 13 políticas RLS cobrindo SELECT/INSERT/UPDATE por tipo de usuário
- **AuthContext Supabase** — Reescrita completa do contexto de autenticação
  - `login(email, password)` via `supabase.auth.signInWithPassword()`
  - `signUp({ email, password, name, phone, type })` com criação automática de profile + candidate/company
  - `resetPassword(email)` via `supabase.auth.resetPasswordForEmail()`
  - `onAuthStateChange` listener para persistência de sessão e refresh automático
  - Loading state com spinner em `ProtectedRoute` e `RedirectIfAuthenticated`
  - Retrocompatibilidade total com os 25+ consumidores de `useAuth()`
- **Login real** (`src/pages/Login.tsx`) com email+senha, mensagens de erro e fluxo de recuperação de senha
- **Registro real** (`src/pages/Register.tsx`) com validação client-side, confirmação de senha e criação de conta
- **Seed de desenvolvimento** (`sql/seeds/001_dev_users.sql`) com 9 usuários (1 admin, 3 empresas, 5 candidatos)

### Changed
- AuthContext migrado de mock (`mockUsers.find`) para Supabase Auth real
- Login.tsx removido seletor de tipo e valores demo, substituído por formulário de credenciais
- Register.tsx adicionado campo de confirmação de senha e validações
- ProtectedRoute e RedirectIfAuthenticated agora verificam `loading` antes de redirecionar

## [0.53.0] - 2026-02-03 — "Sentinel" (PRD-058, PRD-059, PRD-060, PRD-061, PRD-062)

### Added
- **Painel Admin Avançado** com 5 novos módulos e ~96 arquivos novos
- **RBAC "Guardian"** (PRD-061): Gestão de Usuários e Permissões
  - Listagem unificada com filtros, busca e ações em lote
  - Detalhe do usuário com override de permissões individual
  - Grupos de permissão com CRUD e atribuição de papéis
  - 8 papéis pré-definidos com 34 permissões granulares
  - Motor RBAC com resolução: override → grupo → papel → negar
  - Auditoria completa com filtros e timeline
  - Impersonação de usuário com banner de sessão
- **Planos & Assinaturas "Commerce"** (PRD-060): Gestão de Planos
  - CRUD de 6 planos (3 candidato + 3 empresa) com preço de lançamento
  - Matriz de 25 capabilities com atribuição por plano
  - Gestão de assinaturas com upgrade/downgrade e regras de negócio
  - Dashboard de assinaturas com MRR, churn e métricas financeiras
  - Compras avulsas (one-time purchases)
- **Feature Flags "Switch"** (PRD-062): Sistema de Feature Flags
  - CRUD de 25 flags com condições compostas (plano, role, capability, rollout %)
  - Kill switch com razão e timestamp
  - Overrides por usuário/empresa
  - Simulador de planos com painel lateral e contexto de avaliação
  - Motor de avaliação com cadeia explicativa (kill → override → condições → rollout → default)
  - Auditoria de flags com timeline
- **Vagas & Moderação "Sentinel"** (PRD-058): Gestão de Vagas Admin
  - Dashboard com KPIs, gráficos (pie, bar, area, funnel) e alertas
  - Listagem de vagas com filtros por status, empresa, área
  - Fila de moderação com aprovação/rejeição/correção
  - Vagas finalizadas com razão (preenchida/cancelada/expirada)
  - Entrevistas e contratações com timeline
  - Configuração de moderação: regras de auto-flag e templates de email
- **Relatórios "Radar"** (PRD-059): Analytics e Relatórios
  - Dashboard Financeiro com MRR, ARR, churn rate, LTV e gráficos
  - Dashboard de Crescimento com métricas de aquisição e cohort table
  - Dashboard Operacional com funil de recrutamento e tempo médio
  - Activity Feed em tempo real com filtros por tipo de evento
  - Exportação para PDF/Excel com agendamento de relatórios

### Changed
- **Sidebar admin convertido de submenus colapsáveis para tabs horizontais nas páginas**
  - 5 grupos de tabs: Usuários (4), Avaliações (2), Vagas (6), Relatórios (5), Configurações (7)
  - Sidebar flat sem setas de expansão
  - Tab ativa destacada com estilo shadcn TabsTrigger
  - Scroll horizontal em mobile para grupos com muitas tabs
  - Páginas de detalhe (UserDetail, JobDetail, FlagEditor) não exibem tabs
- Nomes de planos migrados: Gratuito→Essencial, Pro→Avançar, Premium→Destaque Máximo, Básico Empresas→Essencial Empresas, Profissional→Seleção Inteligente, Enterprise→Recrutamento Premium
- Tipo User enriquecido com campos RBAC: roleId, status, lastAccessAt, groupIds

## [0.49.0] - 2026-02-01 — "Tribe" (PRD-055, PRD-056, PRD-057)

### Added
- **Gestão de Equipes** no Painel Empresa (`/empresa/equipes`)
  - Dashboard com KPIs, alertas de mapeamento e distribuição de arquétipos
  - CRUD de departamentos e cargos com níveis (operacional/tático/estratégico)
  - Cadastro de colaboradores manual, importação de candidatos contratados e planilha CSV/Excel
  - Perfil individual do colaborador com resultado Gauge-Pro completo
  - Badge de status de mapeamento (sem teste, convite enviado, em andamento, mapeado, reteste pendente)
- **Mapa Comportamental** (PRD-055)
  - Radar chart coletivo com média da equipe e overlay por departamento
  - Heatmap dimensional: departamentos x D1-D5 com código de cores
  - Distribuição de arquétipos por departamento em barras empilhadas
  - Filtros por departamento, cargo, nível e status
- **Compatibilidade entre Membros** (PRD-056)
  - Algoritmo de sinergia dimensional com score 0-100% e 5 faixas de classificação
  - Matriz NxN com código de cores por departamento
  - Top 5 melhores duplas e alertas de conflito potencial
  - Modal de detalhes do par com radar sobreposto e breakdown dimensional
- **Gap Analysis** (PRD-056)
  - Radar com zona ideal sombreada, cards de lacunas e excessos
  - Recomendação de perfil ideal para próxima contratação
  - Botão "Criar Teste com Base no Gap" integrado ao Hub de Testes
- **Team Builder** (PRD-056)
  - Simulador drag-and-drop com @dnd-kit para montagem de equipes
  - Cálculo em tempo real de equilíbrio, radar e conflitos por time
  - Salvar/carregar cenários de reorganização
- **Plano de Desenvolvimento Individual** (PRD-057)
  - PDI auto-gerado baseado no perfil Gauge-Pro com sugestões por dimensão
  - CRUD de objetivos com dimensão vinculada, prioridade e status
  - Barra de progresso por plano
- **Evolução Temporal** (PRD-057)
  - Linha do tempo com gráfico de linhas D1-D5 por data de teste
  - Cálculo de delta com indicadores visuais (evolução/estável/regressão)
  - Anotações vinculadas à evolução (treinamentos, coaching)
  - Agendamento de retestes periódicos (3/6/9/12 meses)
- **Identificação de Talentos** (PRD-057)
  - 6 perfis de potencial: Líder Natural, Especialista, Mediador, Inovador, Motor, Mentor
  - Nine-Box Comportamental (Entrega x Potencial Relacional)
- **Cultura Organizacional** (PRD-057)
  - DNA Cultural: radar da média ponderada por nível hierárquico
  - Manifesto Cultural gerado automaticamente
  - Evolução cultural com comparação de snapshots mensais
  - Score de Fit Cultural para candidatos (0-100%)
- **Relatórios PDF** (PRD-057)
  - Relatório de evolução por colaborador
  - Relatório de cultura organizacional

## [0.48.0] - 2026-02-01 — "Command" (PRD-052, PRD-053, PRD-054)

### Added
- **Hub de Testes Comportamentais** no Painel Empresa (`/empresa/testes`)
  - Dashboard com KPIs, funil de conversão, alertas e feed de atividades
  - Criação de testes com 7 templates (Padrão, Liderança, Operacional, Vendas, Técnico, Criativo, Personalizado)
  - Customização de pesos por dimensão (D1-D5) com sliders e radar chart em tempo real
  - Gestão de ciclo de vida: Rascunho → Ativo → Encerrado → Arquivado
  - Sistema de convites: por email, link público, e seleção da base de candidatos
- **Resultados e Comparativos** (PRD-053)
  - Visualização individual rica: radar chart D1-D5, barras por dimensão, perfil arquetipal, análise IA
  - Score de Fit (compatibilidade com vaga) com classificação Excelente/Bom/Regular/Baixo
  - Comparativo lado a lado de 2-4 candidatos com radar sobreposto
  - Ranking de compatibilidade ordenado por Fit Score
  - Shortlist automática (Top 3) e manual com anotações
- **Relatórios, Métricas e Auditoria** (PRD-054)
  - Relatório PDF individual (3 páginas com radar chart e análise IA)
  - Relatório PDF comparativo (2-4 candidatos)
  - Relatório Excel consolidado com 4 abas (Resumo, Resultados, Estatísticas, Convites)
  - Dashboard de métricas: gauges, distribuição de perfis, tendências temporais
  - Sistema de auditoria com log imutável de todas as ações
  - Relatório de conformidade LGPD (acesso a dados por candidato)

## [0.47.0] - 2026-02-01 — "Kanban" (PRD-015)

### Added
- **Dashboard Empresa melhorado**: novos cards de métricas
  - 5 mini-cards de status de vagas (Total, Ativas, Rascunhos, Pausadas, Finalizadas)
  - 3 cards de métricas operacionais (Testes do Plano, Avaliações do Mês, Candidatos Avaliados)
  - 3 cards de métricas de equipe (Contratações, Entrevistas Agendadas, Entrevistas Realizadas)
- **Drag-and-drop Kanban** na página de Candidaturas (`/empresa/candidaturas`)
  - Biblioteca `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`
  - Arrastar cards entre colunas (Novos, Em Análise, Entrevista, Aprovados)
  - DragOverlay com feedback visual (sombra, rotação 2°, escala 105%)
  - Diferenciação click vs. drag com `activationConstraint: { distance: 8 }`
  - Acessibilidade: drag via teclado (Space + setas) com ARIA descriptions
  - Seção Reprovados sem drag-and-drop por design

### Changed
- **Modal de detalhes do candidato** agora abre centralizado (Dialog) em vez de drawer lateral direito (Sheet)

### Fixed
- Texto da página Gauge-Pro Empresas ajustado ("Junte-se às empresas" em vez de "milhares de empresas")

## [0.46.0] - 2026-01-31 — "Compass"

### Changed
- **Perfil do Candidato refatorado**: separação entre perfil pessoal (plataforma) e perfil profissional (currículos)
  - Página `/candidato/perfil` agora contém apenas informações pessoais (nome, email, cargo, localização, telefone, LinkedIn, bio)
  - Seções profissionais (experiência, formação, habilidades, salário) removidas — gerenciadas exclusivamente em `/candidato/curriculos`
  - Novo cálculo de completude baseado em 7 campos pessoais (peso total 100%)
  - Card informativo direcionando para gerenciamento de currículos

### Added
- **Widget de Completude do Currículo no Dashboard**: exibe % do currículo padrão com link para gerenciar
- **Campo `about` no tipo Candidate**: bio/descrição pessoal adicionada aos dados do candidato
- **Utilitário `profileCompleteness.ts`**: cálculo centralizado de completude do perfil pessoal
- **Páginas de Planos de Assinatura**: `/candidato/planos` e `/empresa/planos` com 3 tiers cada (1 grátis + 2 pagos)
- **Tooltips HelpCircle no Dashboard**: ícones explicativos em 5 seções (Perfil, Currículo, Gauge-Pro, Candidaturas, Mensagens)
- **Badge de assinante no header**: indicador Premium/Pro ao lado do nome do candidato e Profissional/Enterprise para empresas
- **Tipo `CandidatePlanType`**: Gratuito | Pro | Premium com campo `plan` no Candidate

### Fixed
- Texto da CEO na página Quem Somos atualizado
- Referências a "Big Five" removidas das páginas públicas (Quem Somos e Como Funciona)

## [0.45.0] - 2026-01-31 — "Oracle" (PRD-051)

### Added
- **Agente de Análise Comportamental por IA (PRD-051)**
  - Integração com API Claude (Anthropic) via proxy Vite dev-only
  - Geração de Análise Prática para recrutadores (linguagem simples, ações práticas)
  - Geração de Análise Técnica para administradores (linguagem científica, fundamentação teórica)
  - Configuração do agente no Painel Admin (IA > Agente de Análise)
  - Persistência de análises em localStorage associadas ao resultado do teste
  - Exibição de Análise Prática no perfil do candidato (Painel Empresa)
  - Exibição de Análise Técnica no drawer do candidato (Painel Admin)
  - Botão "Regenerar Análise" para administradores
  - Indicador "Gerado por IA" em todas as análises exibidas
  - Integração com export PDF (seção opcional "Análise IA")
  - Tratamento de erros com fallback para relatório básico
  - Retry com backoff exponencial para chamadas API (2 tentativas, timeout 30s)
  - Loading states durante geração de análises
  - Geração fire-and-forget em background após conclusão do Gauge-Pro

## [0.44.0] - 2026-01-27 — "Archetype" (PRD-049 & PRD-050)

### Added
- **Gauge-Pro DISC — Parte 1: Seleção de Palavras (PRD-049)**
  - Banco de 100 adjetivos mapeados em 5 dimensões (D1-D5)
  - Interface de seleção com grid responsivo e embaralhamento Fisher-Yates
  - Duas listas: Lista A (autopercepção) e Lista B (expectativa social)
  - Validação de exatamente 5 seleções por lista
  - Pontuação: (Soma_A × 1.0) + (Soma_B × 0.5) normalizada 0-100
- **Gauge-Pro DISC — Parte 2: Cenários Situacionais (PRD-050)**
  - 15 cenários profissionais com 4 opções (A/B/C/D) cada
  - Navegação sequencial com possibilidade de voltar
  - Mapeamento de cada opção para combinações de dimensões D1-D5
  - Score combinado: Parte 1 (60%) + Parte 2 (40%)
- **Sistema de Perfis Arquetípicos**
  - 16 perfis comportamentais baseados nas combinações D1-D5
  - Determinação automática de arquétipo com fallback
  - Descrição, forças, áreas de desenvolvimento, carreiras por perfil
- **Página de Resultado Gauge-Pro**
  - Banner com nome do arquétipo e descrição
  - Barras de progresso para cada dimensão com classificação (Baixo/Médio/Alto)
  - Pontos fortes e áreas de desenvolvimento
  - Estilo de trabalho e comunicação
  - Carreiras recomendadas
- Persistência via localStorage com auto-save por etapa
- Badge "Mestre DISC" (épico) +150 XP
- Rota `/candidato/gauge-pro` e `/candidato/gauge-pro/resultado`
- Link "Gauge-Pro DISC" no sidebar do candidato

## [0.43.0] - 2026-01-20 (PRD-047 & PRD-048)

### Added
- **Sistema de Testes Comportamentais Gauge-Pro 2.0** - PRD-047 & PRD-048

#### PRD-047: Teste Geral do Candidato
- Teste voluntario com 50-60 perguntas balanceadas
- Tipos de pergunta: Likert (escala 1-5) e Situacional (A-D)
- Algoritmo de selecao que balanceia:
  - ~35% Personalidade, ~30% Carater, ~35% Competencias
  - Minimo 2 perguntas por categoria
  - Balanceamento de niveis (Basico/Intermediario/Avancado)
- Salvamento automatico de respostas a cada pergunta
- Sessao valida por 7 dias com possibilidade de pausar/retomar
- Cooldown de 90 dias para refazer o teste
- Pagina de resultado com:
  - Grafico radar por dimensao (Recharts)
  - Barras de progresso por categoria
  - Insights personalizados por dimensao
  - Recomendacoes de carreira
- Gamificacao: +50 XP e badge "Perfil Completo"
- Menu "Teste Comportamental" no dashboard do candidato

#### PRD-048: Teste por Vaga (Empresa)
- Wizard de 3 passos para criacao de teste:
  1. Selecao de competencias (2-8) com prioridade (critica/importante)
  2. Revisao de perguntas sugeridas (15-25)
  3. Preview e publicacao
- Sistema de convites:
  - Lista de candidatos internos com status de convite
  - Gerador de links magicos para candidatos externos
  - Gestao de convites (reenviar, cancelar, visualizar)
- Link magico publico (/t/:token):
  - Landing page com informacoes do teste
  - Formulario de dados basicos
  - Expiracao configuravel (3-30 dias)
  - Limite de 50 links por vaga
- Relatorio do candidato:
  - Score geral e por competencia
  - Pontos fortes e areas de desenvolvimento
  - Red flags com alertas visuais
  - Analise detalhada por resposta
  - Ajuste de score pelo recrutador
  - Decisao: aprovar/avaliar depois/reprovar
- Comparacao de candidatos:
  - Selecao de ate 4 candidatos
  - Tabela comparativa por competencia
  - Grafico radar sobreposto
- Botao "Teste Comportamental" no menu de acoes das vagas

### Added (Files)
- `src/data/behavioralAssessmentData.ts` - configuracoes e mock data
- `src/hooks/useBehavioralAssessment.ts` - gerenciamento de sessao do teste
- `src/hooks/useQuestionSelection.ts` - algoritmo de selecao balanceada
- `src/hooks/useAssessmentAnalysis.ts` - analise com regras de fallback
- `src/hooks/useJobAssessment.ts` - CRUD de testes por vaga
- `src/hooks/useCompetencySelection.ts` - selecao de competencias e pesos
- `src/hooks/useMagicLink.ts` - geracao e validacao de links magicos
- `src/hooks/useRecruiterAnalysis.ts` - analise com ajustes do recrutador
- Componentes do teste candidato:
  - `src/components/assessment/TestIntro.tsx`
  - `src/components/assessment/TestProgress.tsx`
  - `src/components/assessment/LikertScale.tsx`
  - `src/components/assessment/SituationalOptions.tsx`
  - `src/components/assessment/QuestionDisplay.tsx`
  - `src/components/assessment/TestNavigation.tsx`
  - `src/components/assessment/AnalysisProgress.tsx`
  - `src/components/assessment/ResultBanner.tsx`
  - `src/components/assessment/DimensionRadar.tsx`
  - `src/components/assessment/CategoryBars.tsx`
  - `src/components/assessment/InsightsSection.tsx`
  - `src/components/assessment/CareerRecommendations.tsx`
- Componentes do teste por vaga:
  - `src/components/job-assessment/CompetencySelector.tsx`
  - `src/components/job-assessment/QuestionSuggestions.tsx`
  - `src/components/job-assessment/TestPreview.tsx`
  - `src/components/job-assessment/TestWizard.tsx`
  - `src/components/job-assessment/InternalCandidateList.tsx`
  - `src/components/job-assessment/MagicLinkGenerator.tsx`
  - `src/components/job-assessment/InviteManager.tsx`
  - `src/components/job-assessment/CandidateReport.tsx`
  - `src/components/job-assessment/ResponseAnalysis.tsx`
  - `src/components/job-assessment/ScoreAdjuster.tsx`
  - `src/components/job-assessment/RecruiterDecision.tsx`
  - `src/components/job-assessment/CandidateComparison.tsx`
  - `src/components/job-assessment/ComparisonRadar.tsx`
  - `src/components/job-assessment/index.ts`
- Paginas:
  - `src/pages/candidato/BehavioralTest.tsx`
  - `src/pages/candidato/BehavioralTestResult.tsx`
  - `src/pages/empresa/CreateJobTest.tsx`
  - `src/pages/empresa/JobTestManager.tsx`
  - `src/pages/empresa/CandidateTestReport.tsx`
  - `src/pages/empresa/CompareCandidates.tsx`
  - `src/pages/MagicLinkLanding.tsx`

### Changed
- `src/types/assessment.ts` - tipos para sessoes, respostas, resultados e ajustes
- `src/components/assessment/index.ts` - exports dos novos componentes
- `src/App.tsx` - rotas do teste candidato e empresa
- `src/components/layout/DashboardLayout.tsx` - menu "Teste Comportamental"
- `src/pages/empresa/Jobs.tsx` - botao de teste no menu de acoes

---

## [0.42.0] - 2026-01-20 (PRD-046)

### Added
- **Banco de Perguntas e Avaliacao Comportamental** - PRD-046
  - Sistema completo de gerenciamento de perguntas Gauge-Pro 2.0
  - 222 perguntas organizadas em 3 dimensoes e 20 categorias:
    - Personalidade (Big Five): 60 perguntas em 5 categorias
    - Carater: 48 perguntas em 5 categorias
    - Competencias: 114 perguntas em 10 categorias
  - Tipos de pergunta: Comportamental, Situacional, Autoavaliacao
  - Niveis de complexidade: Basico, Intermediario, Avancado
  - Pagina Admin de Categorias com visualizacao hierarquica (arvore)
  - Pagina Admin de Perguntas com:
    - Busca com debounce 300ms por codigo ou texto
    - Filtros cumulativos: dimensao, categoria (cascata), tipo, nivel, status
    - Paginacao de 50 itens por pagina
    - CRUD completo: criar, editar, duplicar, ativar/desativar
    - Estatisticas no topo da pagina
  - Menu lateral Admin com itens "Categorias" e "Perguntas"

### Added (Files)
- `src/types/assessment.ts` - tipos para dimensoes, categorias, perguntas
- `src/data/assessmentData.ts` - seed com 222 perguntas do framework RecrutaRS
- `src/hooks/useAssessmentQuestions.ts` - hook CRUD de perguntas com filtros
- `src/hooks/useAssessmentCategories.ts` - hook para categorias e dimensoes
- `src/components/assessment/DimensionBadge.tsx` - badge colorido por dimensao
- `src/components/assessment/QuestionCard.tsx` - card de pergunta com acoes
- `src/components/assessment/QuestionFilters.tsx` - filtros de busca
- `src/components/assessment/QuestionForm.tsx` - formulario criar/editar
- `src/components/assessment/CategoryTree.tsx` - arvore hierarquica
- `src/components/assessment/CategoryForm.tsx` - formulario de categoria
- `src/components/assessment/index.ts` - barrel export
- `src/pages/admin/AssessmentCategories.tsx` - pagina de categorias
- `src/pages/admin/AssessmentQuestions.tsx` - pagina de perguntas

### Changed
- `src/types/index.ts` - export de assessment types
- `src/App.tsx` - rotas `/admin/avaliacoes/categorias` e `/admin/avaliacoes/perguntas`
- `src/components/layout/DashboardLayout.tsx` - itens de menu admin

---

## [0.41.0] - 2026-01-18 (PRD-045)

### Added
- **Pagina de Configuracoes Admin** - PRD-045
  - Layout duas colunas: Sidebar categorias (30%) + Conteudo (70%)
  - Sidebar com 8 categorias expansiveis via Accordion:
    - Geral: Dados da Plataforma, Identidade Visual, Preferencias Regionais
    - Inteligencia Artificial: Gauge-Pro, Matching, Analise Comportamental
    - Gamificacao: Niveis, Conquistas, Recompensas
    - Notificacoes: Canais, Frequencia
    - Integracoes: APIs Externas, Webhooks
    - Usuarios & Permissoes: Politicas de senha e sessao
    - Relatorios: Metricas, Exports
    - Sistema: Manutencao, Logs, Seguranca
  - Busca global com dropdown de resultados por tipo (categoria/subcategoria/campo)
  - Historico de alteracoes com filtros por categoria e periodo
  - Botao "Restaurar Padrao" por secao com confirmacao
  - Campos editaveis: TextField, Toggle, Select, ImageUpload, ColorPicker
  - Persistencia em localStorage com chave `recrutars-settings-admin`
  - Responsivo: Drawer mobile para sidebar (< 768px)

### Added (Files)
- `src/types/settings.ts` - tipos ConfigCategory, ConfigField, ConfigHistoryEntry
- `src/data/settingsConfig.ts` - categorias e campos do Admin com valores padrao
- `src/hooks/useSettings.ts` - hook de gerenciamento de estado e persistencia
- `src/components/settings/ConfigLayout.tsx` - layout principal com duas colunas
- `src/components/settings/ConfigSidebar.tsx` - sidebar com Accordion
- `src/components/settings/ConfigContent.tsx` - area de conteudo com campos
- `src/components/settings/ConfigSection.tsx` - renderizacao por tipo de campo
- `src/components/settings/ConfigSearch.tsx` - busca com dropdown de resultados
- `src/components/settings/ConfigHistoryModal.tsx` - modal com lista filtrada
- `src/components/settings/fields/ConfigTextField.tsx` - campo texto/numero/cor
- `src/components/settings/fields/ConfigToggle.tsx` - campo boolean (Switch)
- `src/components/settings/fields/ConfigSelect.tsx` - campo select/multiselect
- `src/components/settings/fields/ConfigImageUpload.tsx` - upload de imagem
- `src/components/settings/fields/index.ts` - barrel export dos fields
- `src/components/settings/index.ts` - barrel export dos componentes
- `src/pages/admin/Settings.tsx` - pagina Admin Settings

### Changed
- `src/App.tsx` - rota `/admin/configuracoes` aponta para AdminSettings

---

## [0.40.0] - 2026-01-18 (PRD-044)

### Added
- **Página "Sobre" e Tooltip de Versão** - PRD-044
  - Página dedicada `/sobre` com histórico completo de versões
  - Tooltip interativo no footer ao passar o mouse sobre a versão
  - Exibe versão atual, codinome, tipo de release e data
  - Link "Ver o que há de novo" navega para página Sobre
  - Item "Sobre" no menu lateral de todos os painéis (candidato, empresa, admin)
  - Card hero com métricas: data de lançamento, tipo, total de mudanças
  - Card do desenvolvedor com informações da AILA
  - Histórico expansível em accordion com todas as versões
  - Busca com debounce (300ms) no histórico
  - Filtros por tipo de release (Major/Minor/Patch) e período
  - Contador "X de Y versões" com filtros aplicados
  - Badges coloridos por tipo: Major (vermelho), Minor (azul), Patch (amarelo)
  - Badge "Atual" (verde) na versão corrente
  - Detalhes agrupados por categoria (Adicionado, Alterado, Corrigido, etc.)
  - Ícones diferenciados para cada tipo de mudança

### Added (Files)
- `src/types/changelog.ts` - tipos para changelog
- `public/changelog.json` - dados de 43 versões em JSON
- `src/hooks/useChangelog.ts` - hook com fetch, filtros e busca
- `src/components/layout/VersionTooltip.tsx` - tooltip com HoverCard
- `src/components/about/AboutHeroCard.tsx` - card da versão atual
- `src/components/about/DeveloperCard.tsx` - card do desenvolvedor
- `src/components/about/VersionHistory.tsx` - busca e filtros
- `src/components/about/VersionAccordion.tsx` - lista expansível
- `src/pages/About.tsx` - página principal

### Changed
- `src/constants/app.ts` - versão 0.40.0, adicionado APP_CODENAME, APP_COMPANY_URL
- `src/components/layout/GlassFooter.tsx` - integração do VersionTooltip
- `src/components/layout/DashboardLayout.tsx` - item "Sobre" nos 3 menus
- `src/App.tsx` - rota `/sobre` protegida
- `src/types/index.ts` - export do changelog

---

## [0.39.0] - 2026-01-18 (PRD-043)

### Added
- **Footer Fixo com Glassmorphism** - PRD-043
  - Footer fixo nas áreas autenticadas (candidato, empresa, admin)
  - Efeito glassmorphism com backdrop-blur e transparência
  - Versão do app exibida dinamicamente (v0.39.0)
  - Crédito "AILA Sistemas Inteligentes" no canto direito
  - Altura responsiva: 40px mobile, 48px desktop
  - Posicionamento adaptado para BottomNav em mobile (mb-16)
  - Suporte a dark mode com cores ajustadas

### Added (Components)
- `GlassFooter.tsx` - componente do footer com glassmorphism

### Changed
- `DashboardLayout.tsx` - integração do GlassFooter
- Padding bottom do conteúdo ajustado para evitar sobreposição

---

## [0.37.0] - 2026-01-15 (PRD-033)

### Added
- **Sistema de Notificações (Empresa)** - PRD-033
  - 10 tipos de notificação específicos para empresas:
    - `new_application` - Nova candidatura recebida
    - `invite_accepted` - Convite para vaga aceito
    - `invite_declined` - Convite para vaga recusado
    - `interview_confirmed` - Entrevista confirmada pelo candidato
    - `interview_suggested` - Candidato sugeriu outro horário
    - `interview_cancelled` - Entrevista cancelada
    - `new_message` - Nova mensagem de candidato
    - `test_completed` - Candidato completou teste comportamental
    - `job_expiring` - Vaga expirando em breve
    - `job_expired` - Vaga expirou
  - Sino de notificações no header para empresas
  - Dropdown com últimas 5 notificações
  - Badge com contador de não lidas
  - Botão "Marcar todas como lidas"
  - Página completa de notificações (`/empresa/notificacoes`)
  - Filtros: Todas, Candidaturas, Entrevistas, Mensagens, Vagas
  - Agrupamento por data: Hoje, Ontem, Esta semana, Este mês, Anteriores
  - Persistência de estado de leitura em localStorage
  - Metadados contextuais: match %, perfil DISC, datas de entrevista, etc.
  - Item "Notificações" no menu lateral da empresa

### Added (Components)
- `CompanyNotificationBell.tsx` - sino com popover e badge
- `CompanyNotificationItem.tsx` - item individual com ícones por tipo

### Added (Types)
- `src/types/companyNotifications.ts` - tipos específicos para empresa

### Added (Hooks)
- `useCompanyNotifications.ts` - hook com estado e localStorage

### Changed
- `DashboardLayout.tsx` - sino no header + item no menu da empresa
- `App.tsx` - rota `/empresa/notificacoes`
- `src/types/index.ts` - export dos tipos de notificação da empresa

---

## [0.36.0] - 2026-01-15 (PRD-032)

### Added
- **Exportar Candidatos (Empresa)** - PRD-032
  - Modal de exportação com seleção de formato (XLSX/PDF)
  - Checkboxes para seleção de campos a incluir
  - Seções: Info Básica, Experiência, Formação, Habilidades, DISC, Match, Salário
  - Ordenação configurável (match, nome, experiência, recentes)
  - Aviso sobre candidatos em modo anônimo
  - Exportação Excel via biblioteca `xlsx`
  - Exportação PDF via `@react-pdf/renderer` com template formatado
  - Header com nome da empresa e paginação no PDF
  - Botão "Exportar" no Banco de Talentos
  - Botão "Exportar" em Candidatos Salvos
  - Botão "Exportar Lista" nas Candidaturas de uma vaga
  - Nome do arquivo com contexto e data (ex: `BancoTalentos_2026-01-15.xlsx`)

### Added (Components)
- `ExportCandidatesModal` - modal de configuração de exportação
- `exportToExcel.ts` - função de geração de planilha Excel
- `exportToPDF.tsx` - componente PDF com template e paginação

### Added (Types)
- `src/types/export.ts` - tipos de exportação (ExportConfig, ExportContext, ExportSection)

### Changed
- `Candidates.tsx` - botão de exportar na seção de resultados
- `SavedCandidates.tsx` - botão de exportar na seção de controles
- `Applications.tsx` - botão de exportar lista nos filtros

### Dependencies
- Adicionado `xlsx: ^0.18.5` para geração de planilhas Excel

---

## [0.35.0] - 2026-01-15 (PRD-031)

### Added
- **Comparar Candidatos (Empresa)** - PRD-031
  - Checkbox de seleção nos cards de candidatos (máximo 3)
  - Barra flutuante de seleção com contador
  - Modal de comparação lado a lado
  - Métricas expandidas: Match Score, Experiência, Formação, Salário, Disponibilidade, Localização
  - Perfil DISC com gráfico radar mini
  - Habilidades top 5 com badges
  - Destaque visual (troféu) para melhor valor em cada categoria
  - Toggle "Mostrar apenas diferenças"
  - Botões de ação: Convidar e Contatar

### Changed
- `CandidateForComparison` - expandido com campos: experienceYears, currentRole, education, skills, salary, availability, location
- `ComparisonTable` - métricas expandidas com formatação de moeda (R$), anos e agrupamento por seção
- `CandidateComparison` - seções visuais adicionais (informações, habilidades)
- `SavedCandidates.tsx` - integração completa do sistema de comparação

---

## [0.34.0] - 2026-01-15 (PRD-030)

### Added
- **Candidatos Favoritos (Empresa)** - PRD-030
  - Botão de favoritar (coração) nos cards de candidato no Banco de Talentos
  - Botão de favoritar na página de perfil do candidato
  - Toggle de favorito com feedback instantâneo (toast)
  - Nova opção "Candidatos Salvos" no menu lateral da empresa
  - Badge com contador de candidatos salvos no menu
  - Nova página `/empresa/candidatos-salvos`
  - Ordenação: mais recentes, maior match, mais experiência
  - Filtro por área de atuação
  - Indicador "Salvo há X dias"
  - Estado vazio com CTA para Banco de Talentos
  - Persistência em localStorage

### Added (Hooks)
- `useFavoriteCandidates` - gerenciamento de candidatos favoritos
- `formatCandidateSavedAt` - formatação de data de salvamento

### Added (Pages)
- `SavedCandidates` - página de candidatos salvos da empresa

### Changed
- `DashboardLayout` - adicionado item "Candidatos Salvos" no menu da empresa com badge
- `Candidates.tsx` - adicionado botão de favoritar nos cards
- `CandidateProfile.tsx` - adicionado botão de favoritar no header

---

## [0.33.0] - 2026-01-15 (Access)

### Added
- **Bottom Navigation Bar** para dispositivos móveis (PRD-003-dgn)
  - Navegação fixa na parte inferior da tela (<768px)
  - 5 itens principais: Início, Vagas, Candidaturas, Mensagens, Perfil
  - Variantes para candidato e empresa
  - Badges de notificação dinâmicos
  - Comportamento scroll hide/show (oculta ao scrollar para baixo)
  - Suporte a safe-area-inset para iPhone X+

- **Skip Link** para navegação por teclado
  - Visível apenas no foco (sr-only)
  - Link direto para conteúdo principal (#main-content)
  - Implementado em DashboardLayout e PublicLayout

- **Painel de Configurações de Acessibilidade**
  - Tamanho de fonte ajustável (12px a 24px)
  - Espaçamento de linhas configurável (1.2 a 2.0)
  - Toggle para reduzir animações
  - Toggle para alto contraste
  - Persistência em localStorage
  - Aplicação imediata sem refresh

### Added (Componentes)
- `BottomNav`, `BottomNavItem` - navegação mobile
- `SkipLink`, `MainContent`, `LiveRegion`, `ScreenReaderOnly` - acessibilidade
- `AccessibilityPanel`, `AccessibilityFAB` - configurações de usuário
- `AccessibilityContext`, `useAccessibility` - context e hook

### Added (Hooks)
- `useScrollDirection`, `useScrollVisibility` - detectar direção de scroll
- `useAccessibilityPrefs` - preferências de acessibilidade

### Changed
- DashboardLayout agora oculta sidebar em mobile (<768px)
- DashboardLayout usa hook `useIsMobile` para responsividade
- GlassFooter ajusta posicionamento para mobile

### Technical
- CSS utilities: `.touch-target`, `.touch-target-sm`, `.touch-target-lg` (min 48x48px)
- CSS utilities: `.skip-link` para skip links
- CSS variables: `--a11y-font-size`, `--a11y-line-height`
- Classes CSS: `.reduce-motion`, `.high-contrast`
- Media query `prefers-reduced-motion: reduce` desabilita todas as animações
- Focus states melhorados com `:focus-visible`
- Landmarks semânticos: `<main id="main-content" role="main">`

## [0.32.0] - 2026-01-15 (Radar)

### Added
- Visualização interativa de perfil DISC com radar chart e quadrante 2D (PRD-002-dgn)
- Match Score com breakdown transparente por categorias:
  - Skills Técnicas (40%), Experiência (30%), Perfil Comportamental (20%), Localização (10%)
- Seção "Por que você combina" com pontos fortes específicos
- Seção "Oportunidades de melhoria" com sugestões e impacto potencial
- Comparação visual candidato vs perfil ideal da vaga (overlay radar)
- Ferramenta de comparação de até 3 candidatos para recrutadores:
  - Seleção via checkbox na lista de candidatos
  - Layout lado a lado com cards e radar mini
  - Tabela comparativa com destaque do melhor valor
  - Toggle "Mostrar apenas diferenças"

### Added (Componentes DISC)
- `DISCRadarChart` e `DISCRadarChartMini` - radar chart com Recharts
- `DISCQuadrant` e `DISCQuadrantMini` - quadrante 2D interativo
- `DISCLegend`, `DISCLegendCompact`, `DISCDimensionCard` - legendas explicativas

### Added (Componentes Match)
- `MatchScoreCircle`, `MatchScoreInline`, `MatchScoreBadge` - exibição de score
- `MatchProgressBar`, `MatchProgressBarSimple`, `MatchProgressStack` - barras de progresso
- `MatchBreakdown`, `MatchBreakdownCompact`, `MatchSummary` - breakdown detalhado
- `MatchStrengths`, `MatchStrengthsList` - pontos fortes
- `MatchOpportunities`, `MatchOpportunitiesCompact`, `MatchOpportunitiesList` - oportunidades
- `MatchComparison`, `MatchComparisonSideBySide`, `MatchCard` - comparação de perfis

### Added (Componentes Compare)
- `CandidateSelector`, `SelectionBar` - seleção de candidatos
- `ComparisonTable`, `ComparisonTableCompact` - tabela comparativa
- `CandidateComparison`, `CandidateComparisonModal` - comparação lado a lado
- `CompareButton`, `ComparisonSummary` - ações e resumo
- Hook `useCandidateSelection` para gerenciamento de seleção

### Technical
- Tipos TypeScript: `DISCProfile`, `DISCDimension`, `MatchCategory`, `MatchStrength`, `MatchOpportunity`, `MatchResult`, `CandidateForComparison`
- Funções utilitárias: `getMatchScoreLevel`, `getMatchScoreColor`
- Cores DISC padronizadas: D=#EF4444 (vermelho), I=#F59E0B (amarelo), S=#22C55E (verde), C=#3B82F6 (azul)
- Cores semânticas de match: ≥80% verde, 60-79% amarelo, <60% vermelho
- Tooltips explicativos em todas as métricas
- Acessibilidade: aria-labels descritivos, valores sempre textuais (não apenas cor)
- Responsividade: gráficos funcionam em mobile (min 200px)
- Respeita `prefers-reduced-motion` para animações

## [0.31.0] - 2026-01-15 (Quest)

### Added
- Sistema de Gamificação completo para candidatos (PRD-001-dgn)
- Sistema de XP com pontuação por ações significativas:
  - Login diário (10 XP), perfil completo (100 XP), teste Gauge-Pro (200 XP)
  - Candidatura enviada (50 XP), visualização de vaga (2 XP)
  - Entrevista recebida (150 XP), proposta recebida (300 XP)
- 5 níveis de progressão: Iniciante, Explorador, Candidato Ativo, Profissional, Expert
- 17 badges organizados em 5 categorias:
  - Perfil: Primeiro Passo, Perfil Completo
  - Testes: Autoconhecimento
  - Candidaturas: Candidato Ativo, Persistente, Imparável, Entrevistado, Proposta Recebida, Contratado
  - Atividade: Em Alta, No Radar, Streak Semanal, Streak Mensal, Streak Centenário, Explorador de Vagas
  - Especiais: Madrugador, Coruja
- Sistema de raridade de badges: Comum, Incomum, Raro, Épico, Lendário
- Sistema de Streak com contador de dias consecutivos
- Streak Freeze automático (1 por semana) para proteger streak
- Celebrações visuais ao desbloquear badges (confetti para Épico/Lendário)
- Celebrações visuais ao subir de nível (confetti + modal)
- Animação flutuante de +XP ao ganhar pontos

### Added (Componentes)
- `LevelBadge` e `LevelBadgeCompact` - exibição de nível
- `XPProgress` e `XPProgressCompact` - barra de progresso de XP
- `XPGainAnimation` - animação flutuante de +XP
- `LevelUpModal` - modal de celebração de level up
- `BadgeCard` e `BadgeCardDetailed` - cards de badges
- `BadgeGallery` - galeria de badges com filtros por categoria
- `BadgeUnlockModal` - modal de conquista desbloqueada
- `StreakCounter` e `StreakBanner` - contador de streak
- `StreakCalendar` - calendário visual de atividade
- `ProgressRing` - círculo de progresso animado
- `NextAchievements` - próximas conquistas a desbloquear
- `GamificationCard` - card de visão geral para dashboard

### Technical
- Tipos TypeScript: `GamificationState`, `Level`, `Badge`, `StreakState`, `XPAction`
- Configuração centralizada em `gamificationConfig.ts` (fácil adicionar novos badges)
- Hook `useGamification` para gerenciamento de estado completo
- Persistência em localStorage com key `recrutars-gamification`
- Integração com date-fns para cálculos de streak
- Respeita `prefers-reduced-motion` para acessibilidade
- Gamificação ética: foco em progresso pessoal, sem rankings competitivos

## [0.30.0] - 2026-01-15 (Polish)

### Added
- Design System expandido com tokens de espaçamento, border-radius e timing (PRD-000-dgn)
- Sistema de animações centralizado em `src/lib/animations.ts`
- Hook `useReducedMotion` para acessibilidade (respeita prefers-reduced-motion)
- Componente `PageTransition` para transições suaves entre páginas
- Componentes de skeleton loading com efeito shimmer:
  - `SkeletonCard`, `SkeletonJobCard`, `SkeletonCandidateCard`
  - `SkeletonList`, `SkeletonSimpleList`
  - `SkeletonTable`, `SkeletonTableRow`
- Componentes de estado padronizados:
  - `EmptyState` com ícones, título, descrição e ações opcionais
  - `ErrorState` com variantes (error, warning, info) e retry
  - `LoadingState` com variantes (spinner, dots, pulse)
  - `SuccessState` com checkmark animado SVG
- `LoadingButton` com spinner inline e estado de loading
- `InteractiveCard` com hover lift, press scale e reveal de ações
- Sistema de celebrações visuais com `canvas-confetti`:
  - Hook `useConfetti` com variantes (fire, explosion, stars, canon)
  - Componente `ConfettiTrigger` para disparo automático
- Confetti explosion no modal de sucesso de candidatura
- Checkmark animado SVG no modal de sucesso de candidatura

### Changed
- Modal `ApplicationSuccessModal` atualizado com animações e confetti

### Technical
- Novos keyframes CSS: shimmer, shake, checkmark-draw, circle-fill
- Tokens CSS expandidos:
  - Espaçamentos: --space-1 até --space-16 (escala 4px)
  - Border-radius: --radius-xs até --radius-full
  - Timing: --duration-fast (150ms), --duration-normal (300ms), --duration-slow (500ms)
  - Easing: --ease-out, --ease-in-out, --ease-spring
- Variants Framer Motion exportáveis: fadeIn, fadeInUp, fadeInDown, scaleIn, slideInLeft, slideInRight
- Stagger animations: staggerContainer, staggerItem
- Dependência canvas-confetti (~3KB gzipped) adicionada

## [0.29.0] - 2026-01-15

### Added
- Modo escuro (dark mode) com 3 opções: Claro, Escuro, Sistema (PRD-029)
- Toggle de tema no header do dashboard (ícone sol/lua)
- Seção "Aparência" nas configurações de candidato e empresa
- 3 opções visuais de tema com ícones (Sol, Lua, Monitor)
- Detecção automática da preferência do sistema operacional
- Persistência da escolha de tema no localStorage
- Script anti-flash para evitar mudança brusca ao carregar página
- Transição suave de 200ms entre temas (background e texto)

### Changed
- Fonte alterada de Plus Jakarta Sans para Roboto Mono
- Fonte aplicada globalmente: Roboto Mono (pesos 300, 400, 500, 700)
- Fallback atualizado para monospace

### Technical
- ThemeProvider do next-themes integrado no App.tsx
- Componente ThemeToggle com animação de ícones
- Componente ThemeSettings com RadioGroup para escolha de tema
- Atributo "class" aplicado no `<html>` para controle de tema
- storageKey customizada: "recrutars-theme"
- Variáveis CSS dark mode já existentes ativadas
- Tailwind darkMode configurado com classe `.dark`
- Glassmorphism funcional em ambos os temas

## [0.28.0] - 2026-01-15

### Added
- Central de Ajuda com FAQ e sistema de tickets (PRD-028)
- Página pública de ajuda (/ajuda) acessível sem autenticação
- FAQ accordion com busca em tempo real (debounce 300ms)
- Filtro de FAQ por categoria
- FAQ específico por tipo de usuário (candidato, empresa, admin, geral)
- Informações de contato (email, telefone, horário de atendimento)
- Sistema de tickets de suporte para usuários autenticados
- Aba "Meus Tickets" na página de ajuda (apenas para usuários logados)
- Modal "Novo Ticket" com formulário completo
- 10 categorias de ticket (conta, candidaturas, currículos, testes, entrevistas, mensagens, pagamentos, problemas técnicos, sugestões, outros)
- Upload de anexos em tickets (PNG, JPG, PDF, máx 5MB)
- Página de detalhes do ticket (/ajuda/tickets/:ticketId)
- Thread de conversação em tickets com diferenciação visual
- Campo para adicionar respostas ao ticket
- Botão "Marcar como Resolvido" com confirmação
- Simulação de respostas automáticas do suporte (2-5 segundos)
- Respostas genéricas baseadas na categoria do ticket
- Lista de tickets com filtros por status (Todos, Abertos, Respondidos, Resolvidos)
- Status badges coloridos (Aberto: amarelo, Respondido: verde, Resolvido: cinza)
- Auto-scroll para última mensagem nos tickets
- Persistência de tickets no localStorage por usuário
- Sistema de numeração automática de tickets (#1000+)
- Link "Central de Ajuda" no footer da landing page
- Item "Central de Ajuda" nos menus laterais de admin, empresa e candidato

### Technical
- Types: UserArea, TicketStatus, TicketCategory
- Interfaces: FAQItem, TicketMessage, Ticket
- Hook useFAQ para gerenciamento de FAQ com busca e filtros
- Hook useTickets para gerenciamento completo de tickets
- Componentes: ContactInfo, FAQSection, TicketsList, TicketCard, NewTicketModal
- Componentes: TicketThread, TicketReply
- Mock data: mockFAQItems (15 perguntas) e mockTickets (3 tickets de exemplo)
- Validação de formulários com react-hook-form e zod
- Upload de anexos com validação de tipo e tamanho
- Formatação de datas com date-fns pt-BR
- Labels e cores mapeados para categorias e status

## [0.27.0] - 2026-01-15

### Added
- Sistema de agendamento de entrevistas para candidatos (PRD-027)
- Página "Minhas Entrevistas" (/candidato/entrevistas)
- 3 abas: Pendentes, Confirmadas, Realizadas
- Aceitar horário proposto pela empresa
- Sugerir horários alternativos (até 3)
- Cancelar entrevista com motivo obrigatório
- Suporte a 3 tipos: Videochamada, Telefone, Presencial
- Mini-calendário com indicadores de entrevistas
- Badge de entrevistas pendentes no menu lateral
- Countdown para entrevistas próximas ("Hoje", "Amanhã", "Em X dias")
- Cards com detalhes: entrevistador, observações, links/endereços
- Dicas contextuais para cada tipo de entrevista

### Technical
- Type InterviewType ('video' | 'phone' | 'in_person')
- Type InterviewStatus (6 estados: pending_candidate, pending_company, confirmed, completed, cancelled_by_candidate, cancelled_by_company)
- Interface Interview com todos os campos necessários
- Interface ProposedSlot para horários propostos
- Hook useInterviews para gerenciamento de estado
- Componentes: InterviewCard, AcceptInterviewModal, SuggestAlternativeModal, CancelInterviewModal, MiniCalendar
- Integração com date-fns para formatação de datas em pt-BR

## [0.26.0] - 2026-01-15

### Added
- Configuração de visibilidade do perfil do candidato (PRD-026)
- 3 modos de visibilidade: Público, Parcial (Anônimo), Privado
- Modo Público: perfil totalmente visível para empresas
- Modo Parcial: aparece como "Perfil Anônimo #XXXX" nas buscas
- Modo Privado: perfil não aparece em nenhuma busca
- Componente VisibilitySettings com interface detalhada
- Radio buttons com descrições, benefícios e alertas para cada modo
- Tooltip explicativo sobre o modo anônimo
- Exibição do identificador anônimo quando em modo parcial
- Dica de segurança sobre privacidade dos dados
- Filtro de candidatos em modo privado no Banco de Talentos
- Indicador visual "Anônimo" com badge e tooltip para empresas
- Avatar genérico (ícone EyeOff) para candidatos anônimos
- Geração automática de anonymousId baseado no ID do candidato

### Technical
- Type VisibilityMode ('public' | 'partial' | 'private')
- Interface VisibilitySettings { mode, anonymousId }
- Interface AnonymousProfile para dados visíveis em modo parcial
- Helpers: isVisibleInSearch, isAnonymous, getDisplayName, getDisplayAvatar
- Função generateAnonymousId para IDs consistentes
- src/utils/visibility.ts com helpers de visibilidade
- Campo visibility opcional em Candidate para compatibilidade

## [0.25.0] - 2026-01-15

### Added
- Sistema de notificações para candidatos (PRD-025)
- Ícone de sino (NotificationBell) no header do dashboard do candidato
- Badge com contador de notificações não lidas
- Dropdown com as 5 últimas notificações ao clicar no sino
- Botão "Marcar todas como lidas" no dropdown
- Botão "Ver todas as notificações" que leva à página completa
- Página completa de notificações (/candidato/notificacoes)
- Agrupamento de notificações por período (Hoje, Ontem, Esta semana, etc.)
- Filtro por tipo de notificação (Vagas compatíveis, Candidaturas, Testes, Mensagens)
- 6 tipos de notificação: job_match, application_update, test_request, message, application_approved, application_rejected
- Ícones e cores diferenciados por tipo de notificação
- Indicador de match percentage para vagas compatíveis
- Indicador de urgência para testes com prazo próximo
- Indicador de nova etapa para atualizações de candidatura
- Formatação de tempo relativo (há X min, há X horas, há X dias)
- Estado vazio amigável quando não há notificações
- Seção explicativa sobre os tipos de notificação
- Persistência de estado de leitura via localStorage

### Technical
- Hook useNotifications com localStorage para persistência
- Interface Notification com tipo, título, descrição, metadata
- Type NotificationType com 6 valores possíveis
- Interface NotificationMetadata para dados extras (jobId, matchPercentage, etc.)
- Helpers: formatTimeAgo, groupNotificationsByDate
- Componente NotificationItem reutilizável (modo compacto e completo)
- Componente NotificationBell com Popover do shadcn/ui
- Mock data com 8 notificações de exemplo

## [0.24.0] - 2026-01-15

### Added
- Sistema de vagas favoritas para candidatos (PRD-024)
- Botão de coração (favoritar) em todos os cards de vaga na busca
- Botão de favoritar na página de detalhes da vaga
- Toggle visual com transição suave (coração vazio/preenchido)
- Feedback via toast ao salvar/remover vaga ("Vaga salva!" / "Vaga removida")
- Nova página "Vagas Salvas" (/candidato/vagas-salvas)
- Contador de vagas salvas no menu lateral do candidato
- Ordenação de vagas salvas: mais recentes, maior salário, prazo mais próximo
- Indicador "Salva há X dias" em cada card de vaga salva
- Indicador de vaga encerrada com badge "Encerrada"
- Indicador de prazo próximo "Encerra em X dias" (quando <= 7 dias)
- Botão "Remover da lista" para vagas encerradas
- Estado vazio amigável com call-to-action para buscar vagas
- Persistência de favoritos via localStorage

### Technical
- Hook useFavoriteJobs com localStorage para persistência
- Interface FavoriteJob { jobId, savedAt }
- Helpers: formatSavedAt, getDaysUntilDeadline
- Contador dinâmico no menu via countKey nos NavItems
- Optimistic update no toggle de favoritos

## [0.23.0] - 2026-01-15

### Added
- Exportação de currículos em PDF (PRD-023)
- Três templates de PDF disponíveis: Clássico, Moderno e Minimalista
- Template Clássico: layout tradicional linear com seções sublinhadas
- Template Moderno: layout em duas colunas com header em fundo escuro (navy)
- Template Minimalista: layout centralizado com muito espaço em branco
- Modal de exportação com seleção de template por cards visuais (ícones + descrição)
- Checkboxes para seleção de seções a incluir no PDF (8 seções configuráveis)
- Seção "Informações pessoais" sempre incluída (checkbox desabilitado)
- Opção "Pretensão salarial" desabilitada por padrão (privacidade)
- Opção para incluir link do LinkedIn no PDF
- Indicador de loading durante geração do PDF
- Feedback visual com toast de sucesso após download
- Nome do arquivo gerado: Curriculo_NomeSobrenome_DDMMAAAA.pdf
- Botão "Exportar PDF" no dropdown de ações do card do currículo
- Estilos de PDF compartilhados com cores do design system RecrutaRS
- Helpers para formatação: níveis de skill (●●●●○), períodos, salários
- Suporte a exibição de badges "ATUAL" em experiências em andamento
- Suporte a status de formação (Completo, Cursando, Trancado)

### Technical
- Biblioteca @react-pdf/renderer para geração de PDF
- Componentes: PDFTemplateClassic, PDFTemplateModern, PDFTemplateMinimal
- Wrapper PDFDocument para seleção dinâmica de template
- Arquivo styles.ts com StyleSheet.create para estilos PDF
- Interface PDFSectionConfig para configuração das seções
- Type PDFTemplateType ('classic' | 'modern' | 'minimal')
- Funções helpers: getSkillLevelDots, formatPeriod, formatSalary

## [0.22.0] - 2026-01-15

### Added
- Sistema avançado de múltiplos currículos para candidatos (PRD-022)
- Página de listagem de currículos com abas "Ativos" e "Arquivados"
- Funcionalidade de duplicar currículo (cria cópia com nome "[Original] - Cópia")
- Funcionalidade de arquivar/desarquivar currículos
- Funcionalidade de definir currículo como padrão (único padrão por candidato)
- Exclusão de currículos com confirmação (currículos padrão não podem ser excluídos)
- Cálculo de completude detalhado mostrando seções faltantes (5 seções: básico, experiência, formação, habilidades, cursos)
- Barra de progresso visual por currículo com cores indicativas (verde >80%, amarelo >60%, vermelho <40%)
- Mensagens motivacionais baseadas na completude ("Currículos completos têm 3x mais visualizações")
- Preview do currículo mostrando "como a empresa vê" com aviso contextual
- Editor de currículo em 5 abas: Informações, Experiência, Formação, Habilidades, Cursos
- Experiência profissional com checkbox "Trabalho atual" que oculta data de término
- Badge visual "Atual" (verde) nas experiências em andamento
- Formação acadêmica com status: Completo, Cursando, Trancado, Incompleto
- Badges de status na formação com cores diferenciadas (✅ Completo, 🔄 Cursando, etc.)
- Habilidades separadas por tipo: Técnicas e Comportamentais
- Níveis de proficiência em habilidades: Básico, Iniciante, Intermediário, Avançado, Especialista
- Seletor visual de nível com bolinhas (●●●●○ = Avançado) e popover para alteração
- Cursos e certificações com upload de certificado (PDF, PNG, JPG até 5MB)
- Opção de adicionar link de verificação do certificado
- Preview de certificado anexado com indicador visual
- Tipos TypeScript: Curriculum, SkillWithLevel, EducationWithStatus, ExperienceWithCurrent, Course
- Tipos auxiliares: SkillLevel, EducationStatus, SkillType, CertificateType
- Labels e constantes em português para todos os tipos
- Utilitário curriculumCompleteness.ts com funções de cálculo e formatação
- Mock data com 5 currículos de exemplo (3 do João Santos, 1 da Maria, 1 do Pedro)
- Currículo de exemplo completo (100%), parcialmente completo e arquivado

### Changed
- Navegação do candidato: "Meu Perfil" renomeado para "Currículos"
- Link de navegação atualizado de /candidato/perfil para /candidato/curriculos
- Ícone da navegação de Currículos alterado para FileText (documento)
- Ícone de Candidaturas alterado para ClipboardList para diferenciação

### Technical
- Novas rotas: /candidato/curriculos (listagem), /candidato/curriculos/:id (edição/criação)
- Componente CurriculumPreview.tsx para visualização em Sheet
- Componente CurriculumEdit.tsx com dialogs modulares para cada seção
- Utilitário formatLastUpdated para exibição amigável de datas ("Atualizado hoje", "há X dias")

## [0.21.0] - 2026-01-15

### Added
- Gestão de candidatos para administrador (PRD-021)
- Listagem de candidatos com busca por nome ou email
- Filtros combináveis: status (ativo, inativo), teste comportamental (realizado/não realizado), perfil DISC
- Paginação de 20 candidatos por página
- Cards com resumo: avatar, nome, email, título, localização, status teste, perfil DISC
- Drawer de detalhes com 4 tabs: Perfil, Teste, Candidaturas, Histórico
- Tab Perfil: informações básicas (email, telefone, LinkedIn), experiência, formação, habilidades, pretensão salarial, métricas
- Tab Teste: resultado DISC completo com gráfico de barras (dominância, influência, estabilidade, conformidade), pontos fortes e pontos de atenção
- Tab Candidaturas: lista de candidaturas do candidato com status, empresa e match percentage
- Tab Histórico: log de ações administrativas ordenadas por data
- Ações administrativas: desativar candidato (com modal de confirmação e motivo opcional)
- Ação: reativar candidato (com modal de confirmação)
- Ação: resetar teste comportamental (permite refazer o teste)
- Ação: enviar notificação (dialog com textarea limitado a 500 caracteres)
- Tipos administrativos: CandidateStatus ('active' | 'inactive')
- Interface CandidateAdminAction para histórico de ações (activated, deactivated, test_reset, notification_sent)
- Campos adicionais em Candidate: status, createdAt, deactivatedAt, phone, linkedin
- Mock data expandido: 33 candidatos (5 existentes + 28 novos) com diversidade de títulos, localizações e perfis DISC
- Mock data: mockCandidateAdminActions com 15 ações históricas de exemplo
- Visualização de resultado DISC com badges de cores para cada dimensão (vermelho=dominância, amarelo=influência, verde=estabilidade, azul=conformidade)
- Estado vazio personalizado quando não há resultados na busca
- Filtros responsivos: sidebar desktop (288px) e sheet mobile
- Avatar com fallback para inicial do nome do candidato

### Changed
- Rota /admin/candidatos agora aponta para componente Candidates ao invés de AdminDashboard
- Interface Candidate expandida com campos administrativos obrigatórios
- mockCandidates atualizado com novos campos: status, createdAt, phone, linkedin
- Candidatos agora incluem variedade de 14 perfis DISC diferentes

## [0.20.0] - 2026-01-15

### Added
- Gestão de empresas para administrador (PRD-020)
- Listagem de empresas com busca por nome ou CNPJ
- Filtros combináveis: status (ativa, pendente, inativa), plano (Básico, Profissional, Enterprise), setor
- Paginação de 20 empresas por página
- Cards com resumo completo (logo, nome, CNPJ, status, plano, vagas ativas, candidatos, data de cadastro)
- Drawer de detalhes com 4 tabs: Informações, Vagas, Usuários, Histórico
- Tab Informações: plano atual, status de pagamento, contato (telefone, website, LinkedIn, endereço), métricas
- Tab Vagas: lista das vagas da empresa com status e contador de candidaturas
- Tab Usuários: placeholder para futura implementação
- Tab Histórico: log completo de ações administrativas ordenadas por data
- Ações administrativas: desativar empresa (com modal de confirmação e motivo)
- Ação: reativar empresa (com modal de confirmação)
- Ação: alterar plano (dialog com select e confirmação)
- Ação: enviar notificação (dialog com textarea limitado a 500 caracteres)
- Tipos administrativos: CompanyStatus ('active' | 'pending' | 'inactive')
- Tipo CompanyPlanType ('Básico' | 'Profissional' | 'Enterprise')
- Interface AdminAction para histórico de ações administrativas
- Campos adicionais em Company: cnpj (formato XX.XXX.XXX/XXXX-XX), phone (formato (XX) XXXXX-XXXX)
- Campos administrativos em Company: status, plan, createdAt, paymentStatus, deactivatedAt
- Mock data expandido: 33 empresas (3 existentes + 30 novas) com diversidade de setores, estados e tamanhos
- Mock data: mockAdminActions com 15 ações históricas de exemplo
- Alertas visuais para empresas com pagamento pendente ou atrasado
- Filtros responsivos: sidebar desktop (288px) e sheet mobile
- Estado vazio personalizado quando não há resultados

### Changed
- Rota /admin/empresas agora aponta para componente Companies ao invés de AdminDashboard
- Interface Company expandida com campos administrativos obrigatórios
- mockCompanies atualizado com novos campos: cnpj, phone, status, plan, createdAt, paymentStatus
- Empresas agora possuem variação de 19 setores diferentes (Tecnologia, Saúde, Educação, etc.)

## [0.19.0] - 2026-01-14

### Added
- Dashboard administrativo completo com visualizações avançadas (PRD-019)
- Gráfico de crescimento mostrando evolução de empresas e candidatos nos últimos 30 dias
- Distribuição visual de candidaturas por status com barras horizontais animadas
- Ranking das top 5 empresas por número de vagas ativas
- Seção de ações rápidas para navegação entre áreas administrativas
- Cards de métricas agora são clicáveis e navegam para páginas correspondentes
- Mock data de crescimento histórico (30 dias) para visualização de tendências

### Changed
- Layout do dashboard admin reorganizado em grade responsiva de 3 colunas
- Melhorias nas animações de entrada com delays escalonados
- Links "Ver todas/todos" agora funcionais nas seções de listas

## [0.18.0] - 2026-01-11

### Added
- Página de configurações da empresa completa (PRD-018)
- Tab Perfil: upload de logo, informações básicas, descrição e localização
- Tab Equipe: lista de membros, convites pendentes, modal de convite
- Tab Conta: segurança (email/senha), preferências de notificação, zona de perigo
- Tab Plano: informações do plano, barras de uso, ações mock
- Tipos TeamMember, PendingInvite, CompanyPlan, CompanyNotificationPreferences
- Mock data para membros da equipe e plano da empresa
- Campos city, state, linkedin, address na interface Company

### Changed
- Interface Company expandida com campos de localização detalhada
- mockCompanies atualizado com novos campos

## [0.17.0] - 2026-01-11

### Added
- Sistema de mensagens da empresa completo (PRD-017)
- Lista de conversas agrupadas por candidato + vaga
- Filtro por vaga com dropdown
- Busca por nome do candidato
- Link "Ver candidatura" no header do chat
- Indicador de mensagens não lidas
- Layout responsivo (lista/detalhe separados em mobile)
- Estado vazio com sugestão de explorar Banco de Talentos
- Campo candidateName na interface Conversation
- Suporte a userType no hook useMessages

### Changed
- Hook useMessages refatorado para suportar perspectiva empresa e candidato
- mockConversations atualizado com candidateName
- mockMessages expandido com conversas para company-1

## [0.16.0] - 2026-01-11

### Added
- Solicitação de teste comportamental pela empresa (PRD-016)
- Modal de solicitação com mensagem personalizável e prazo
- Status do teste na candidatura (não solicitado, solicitado, realizado)
- Notificação especial para candidato nas mensagens
- Botão direto para realizar teste na notificação
- Indicadores visuais de status de teste nos cards de candidatura
- Tipos TestRequestStatus e TestRequestMetadata
- Campo type e metadata na interface Message

### Changed
- mockApplications atualizado com campo testStatus
- mockMessages atualizado com mensagem de solicitação de teste
- Tab Teste no drawer exibe status e botão de solicitação

## [0.15.0] - 2026-01-11

### Added
- Gestão de Candidaturas completa (PRD-015)
- Pipeline visual (Kanban) com colunas de status (Novos, Em Análise, Entrevista, Aprovados)
- Seletor de vaga para visualizar candidaturas
- Cards de candidato com match, perfil DISC e indicador de teste
- Drawer com detalhes do candidato (5 tabs: Perfil, Experiência, Teste, Mensagem, Histórico)
- Movimentação de candidatos entre etapas
- Modal de reprovação com motivo opcional
- Anotações internas por candidato
- Histórico de movimentações
- Filtros por match, perfil DISC e status de teste
- Seção colapsável para candidatos reprovados
- Tipos ApplicationNote e ApplicationHistory

### Changed
- Navegação da empresa com item Candidaturas
- mockApplications expandido com mais dados para demonstrar pipeline

## [0.14.0] - 2026-01-11

### Added
- Banco de Talentos completo (PRD-014)
- Listagem de candidatos com busca e filtros (localização, perfil DISC, experiência, skills)
- Busca com debounce de 300ms
- Filtro de skills como tags clicáveis
- Cards de candidato com avatar, informações e indicador de match
- Paginação de resultados (10 por página)
- Página de perfil completo do candidato
- Visualização do perfil comportamental DISC com barras de progresso
- Seção de pontos fortes e pontos de atenção
- Experiência profissional mockada
- Dropdown para convidar candidato para vagas ativas
- Modal de convite com mensagem personalizada

### Changed
- Rotas de empresa atualizadas para Banco de Talentos

## [0.13.0] - 2026-01-11

### Added
- CRUD completo de vagas da empresa (PRD-013)
- Filtros por status com contadores (Todas, Ativas, Pausadas, Encerradas)
- Formulário completo com checkboxes de benefícios
- Skills desejadas como tags
- Contadores de caracteres em descrição e requisitos
- Checkbox "Salário a combinar"
- Edição de vaga existente
- Gestão de status (pausar, reativar, encerrar)
- Duplicar vaga existente
- Excluir vaga encerrada com confirmação dupla
- Ações contextuais por status nos cards

### Changed
- Cards de vaga redesenhados com ícone e layout melhorado

## [0.12.0] - 2026-01-11

### Added
- Dashboard completo da empresa (PRD-012)
- Saudação personalizada com horário (Bom dia/Boa tarde/Boa noite)
- Cards de métricas clicáveis (vagas, candidatos, novos hoje, em análise)
- Gráfico de barras horizontais de candidaturas por vaga
- Seção de ações pendentes (novos candidatos, mensagens, testes)
- Seção de ações rápidas (Nova Vaga, Banco de Talentos, Mensagens)
- Indicadores de match e teste nas candidaturas recentes

### Changed
- Layout do dashboard empresa reorganizado

## [0.11.0] - 2026-01-11

### Added
- Página de configurações do candidato (PRD-011)
- Seção de segurança (alterar email/senha com modais)
- Preferências de notificação por email (4 opções)
- Configuração de visibilidade do perfil
- Botão para baixar dados pessoais (mock)
- Opção de desativar conta com confirmação
- Opção de excluir conta com confirmação dupla (digitar "EXCLUIR")

## [0.10.0] - 2026-01-11

### Added
- Sistema de mensagens do candidato completo (PRD-010)
- Lista de conversas agrupadas por empresa e vaga
- Visualização de histórico de mensagens
- Envio de novas mensagens com atualização em tempo real
- Indicador de mensagens não lidas com badge
- Busca de conversas por empresa ou vaga
- Scroll automático para última mensagem
- Layout responsivo (lista/detalhe separados em mobile)
- Estado vazio para quando não há conversas
- Hook useMessages para gerenciamento de estado
- Tipo Conversation para estrutura de conversas

### Changed
- Tipo Message expandido com conversationId
- mockData atualizado com estrutura de conversas

## [0.9.0] - 2026-01-11

### Added
- Página Minhas Candidaturas completa (PRD-009)
- Listagem de candidaturas ordenada por data (mais recentes primeiro)
- Filtros por status com contadores (Todas, Pendentes, Em análise, etc.)
- Cards com informações da vaga, empresa e status
- Funcionalidade de cancelamento com modal de confirmação
- Estado vazio com link para busca de vagas
- Status 'withdrawn' para candidaturas canceladas

### Changed
- Hook useApplications agora inclui método cancelApplication
- Tipo ApplicationStatus expandido com status 'withdrawn'

## [0.8.0] - 2026-01-11

### Added
- Teste comportamental Gauge-Pro aprimorado (PRD-008)
- Botão "Anterior" para navegação entre questões
- Persistência de progresso via localStorage
- Botão "Continuar Teste" para retomar progresso salvo
- Tela de processamento animada ao finalizar teste
- Seção "Características Principais" no resultado
- Seção "Ambientes Ideais" no resultado
- Botão "Baixar PDF" (mock com toast)
- Salvamento do resultado no mockData

### Changed
- Dados de perfil DISC expandidos com características e ambientes
- Mensagem de aviso atualizada sobre salvamento automático

## [0.7.0] - 2026-01-11

### Added
- Fluxo completo de candidatura a vagas (PRD-007)
- Modal de confirmação de candidatura com resumo da vaga
- Campo opcional de mensagem ao recrutador (máx 500 caracteres)
- Modal de sucesso com opções de navegação
- Indicador visual "Candidatado" nas vagas já aplicadas (JobSearch)
- Hook `useApplications` para gerenciamento de candidaturas
- Componente `ApplicationModal` para confirmação
- Componente `ApplicationSuccessModal` para feedback

### Changed
- Botão "Candidatar-se" agora abre modal de confirmação
- Botão desabilitado e texto "Já candidatado" para vagas aplicadas
- Footer da página de detalhes muda baseado no status da candidatura
- Tipo `Application` agora inclui campo `message` opcional

## [0.6.0] - 2026-01-11

### Added
- Busca de vagas com debounce de 300ms (PRD-006)
- Botão X para limpar campo de busca
- Dropdown de ordenação (mais recentes, maior/menor salário)
- Paginação de resultados (10 itens por página)
- Página de detalhes da vaga (`/candidato/vagas/:id`)
- Seção "Sobre a empresa" na página de detalhes
- Hook `useDebounce` reutilizável

### Changed
- Cards de vaga agora navegam para página de detalhes (não modal)
- Filtros agora também limpam campo de busca

## [0.5.0] - 2026-01-11

### Added
- Página de perfil completo do candidato (PRD-005)
- Seção de foto de perfil com upload e preview local
- Contador de caracteres no campo "Sobre mim" (máx 500)
- Confirmação de remoção via AlertDialog para experiências e formações
- Ordenação automática por data (mais recente primeiro)
- Validação de skills duplicadas com feedback visual
- Ordenação alfabética de skills
- Interfaces Experience e Education no sistema de tipos

### Changed
- Campo de email desabilitado (não editável)
- Experiências e formações agora usam tipos centralizados de @/types

## [0.4.0] - 2026-01-11

### Added
- Pasta src/types/ com tipos TypeScript para todas as entidades
- Interface User e tipo UserType
- Interface Company
- Interface Candidate com dependência de BehavioralTest e SalaryRange
- Interface Job com JobType, JobStatus e SalaryRange
- Interface Application com ApplicationStatus
- Interface BehavioralTest com TestResult e TestStatus
- Interface Message com MessageSenderType
- Interfaces AdminStats, CompanyStats, CandidateStats para dashboards
- Arquivo index.ts com re-exportação centralizada de todos os tipos

### Changed
- mockData.ts atualizado para importar tipos de @/types
- Tipagem explícita adicionada a adminStats, companyStats, candidateStats

## [0.3.0] - 2026-01-10

### Added
- Header com efeito glassmorphism nas áreas logadas (DashboardLayout)
- Footer com efeito glassmorphism exibindo "AILA · v0.3.0" em todas as páginas
- Componente GlassHeader reutilizável
- Componente GlassFooter reutilizável
- Componente PublicLayout para páginas públicas
- Constante APP_VERSION para controle de versão visível
- Utilitários CSS glassmorphism com suporte a fallback para navegadores antigos

### Changed
- DashboardLayout atualizado com GlassHeader e GlassFooter
- Páginas públicas (Landing, HowItWorks, Plans) agora usam PublicLayout
- Páginas de autenticação (Login, Register) incluem GlassFooter
- Página 404 (NotFound) inclui GlassFooter

## [0.2.0] - 2025-01-10

### Added
- Componente ProtectedRoute para proteção de rotas por tipo de usuário
- Componente RedirectIfAuthenticated para redirecionar usuários logados
- Redirecionamento automático baseado em autenticação e permissão

### Fixed
- Removidas rotas duplicadas no App.tsx (candidaturas, testes, mensagens, configuracoes)

### Changed
- Rotas privadas agora exigem autenticação e tipo de usuário correto
- Usuários logados são redirecionados do /login para seu dashboard
- Reorganizada estrutura de rotas por área (admin, empresa, candidato)

## [0.1.1] - 2025-01-10

### Fixed
- Removidas referências à plataforma Lovable do projeto

### Changed
- Atualizados metadados do package.json para AILA Automacao Inteligente
- Atualizado README.md com informações corretas do projeto RecrutaRS
- Removida dependência lovable-tagger do projeto
- Limpo vite.config.ts removendo plugin componentTagger
- Removidas meta tags OG/Twitter com URLs externos do index.html

## [0.1.0] - 2025-01-10

### Added
- Estrutura inicial do projeto RecrutaRS
- Landing page com seções Hero, Features, HowItWorks, CTA
- Sistema de autenticação mockado (Admin, Empresa, Candidato)
- Dashboards para cada tipo de usuário
- Componentes UI baseados em shadcn/ui
- Sistema de rotas com React Router v6
