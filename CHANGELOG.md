# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
