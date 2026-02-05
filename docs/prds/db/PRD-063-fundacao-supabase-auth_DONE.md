# PRD-063: Fundação Supabase + Autenticação

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Plataforma SaaS de Recrutamento Inteligente |
| **Repositório** | GitHub (privado) — AILA Automação Inteligente |
| **Objetivo** | Estabelecer a conexão com Supabase, criar schema de identidade (profiles, candidates, companies), implementar autenticação real via Supabase Auth e substituir o AuthContext mock, mantendo compatibilidade com todos os módulos existentes |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Migração Mock → Supabase (10 PRDs) |
| **PRDs Relacionados** | PRD-064, PRD-065, PRD-066, PRD-067, PRD-068, PRD-069, PRD-070, PRD-071, PRD-072 |
| **Padrão de código** | camelCase para campos TypeScript; snake_case para colunas do banco |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** ✅ | 10+ arquivos, múltiplas integrações (Supabase Auth + DB + RLS), regras de negócio complexas (3 tipos de usuário, onboarding condicional), impacta 23 arquivos consumidores do AuthContext |

---

## Contexto do Problema

O RecrutaRS opera inteiramente com dados mockados. O `AuthContext` atual é um simulador: o login consiste em um `mockUsers.find(u => u.type === userType)` sem validação de credenciais. O registro (`Register.tsx`) redireciona para `/login` sem criar conta real. Não existe persistência — ao recarregar a página, o usuário perde a sessão.

Essa situação impede qualquer evolução para produção. Sem autenticação real, não há identidade de usuário, não há Row Level Security, não há sessão persistente, e todos os dados futuros (vagas, candidaturas, mensagens) ficam sem dono. A autenticação é o alicerce que sustenta toda a cadeia de migração.

Este PRD é o **primeiro e mais crítico** da cadeia de 10 PRDs de migração. Ele estabelece: (a) a conexão com o Supabase, (b) o schema de identidade, (c) a autenticação funcional, e (d) a substituição transparente do AuthContext — sem quebrar os 23 arquivos que o consomem.

---

## Conceito da Solução

### Situação Atual (As-Is)

- `AuthContext.tsx` (57 linhas) — login mock por tipo de usuário, sem credenciais
- `Login.tsx` — seleciona tipo (admin/empresa/candidato) e faz login instantâneo com dados falsos
- `Register.tsx` — formulário visual sem funcionalidade real (redireciona para `/login`)
- `ProtectedRoute.tsx` — verifica `isAuthenticated` e `user.type`, ambos do mock
- `RedirectIfAuthenticated.tsx` — redireciona autenticados, baseado em mock
- **23 arquivos** consomem `useAuth()` diretamente
- `RBACContext` depende de `useAuth()` para obter `user.id`
- **Zero** integração com Supabase
- **Sem** persistência de sessão (F5 = logout)

### Situação Desejada (To-Be)

- Supabase client configurado com variáveis de ambiente
- 3 tabelas no schema `public`: `profiles`, `candidates`, `companies`
- Autenticação via Supabase Auth nativo (email + senha)
- AuthContext reescrito para consumir Supabase Auth, mantendo **mesma interface** pública
- Login real com validação de credenciais e sessão persistente
- Registro real com criação de conta + perfil + dados específicos (candidato ou empresa)
- Fluxo de "Esqueceu a senha" funcional
- Políticas RLS ativas para as tabelas de identidade
- Seed de dados para ambiente de desenvolvimento

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Firebase Auth | Supabase já é a escolha do projeto (banco + auth unificados), evita vendor split |
| Auth0 / Clerk | Adiciona dependência externa desnecessária; Supabase Auth é nativo e gratuito no tier usado |
| Manter mock + adicionar auth depois | Atrasa toda a cadeia de migração; RLS depende de auth para funcionar |
| Migração big-bang (tudo de uma vez) | 125 arquivos consomem dados mock, risco altíssimo de regressão |

---

## Escopo

### Incluído

- ✅ Configuração do Supabase client (`@supabase/supabase-js`)
- ✅ Variáveis de ambiente (`.env`, `.env.example`)
- ✅ Tabelas: `profiles`, `candidates`, `companies` com triggers automáticos
- ✅ Políticas RLS para as 3 tabelas
- ✅ Reescrita do `AuthContext.tsx` para Supabase Auth (mesma interface pública)
- ✅ Reescrita do `Login.tsx` com autenticação real (email + senha)
- ✅ Reescrita do `Register.tsx` com criação de conta real (escolha: candidato ou empresa)
- ✅ Fluxo de "Esqueceu a senha" (reset via email)
- ✅ Confirmação de email no registro
- ✅ Atualização dos componentes `ProtectedRoute` e `RedirectIfAuthenticated`
- ✅ Seed SQL para dados de desenvolvimento (mesmos usuários mock atuais)
- ✅ Atualização do `CLAUDE.md` com instruções Supabase
- ✅ Login por Magic Link (OTP via email, sem criação de conta nova)
- ✅ Tela "Verifique seu email" pós-registro (com reenvio de email)
- ✅ Trigger expandido `handle_new_user()` cria profiles + candidates/companies atomicamente no banco

### Excluído

- ❌ Login social (Google, LinkedIn) — PRD futuro
- ❌ Migração de jobs, applications, messages — PRDs 064-071
- ❌ Migração do RBAC para banco — PRD-071
- ❌ Migração de planos/subscriptions para banco — PRD-071
- ❌ Remoção dos arquivos mock — PRD-072
- ❌ Multi-factor authentication (2FA) — escopo futuro
- ❌ Rate limiting de login — escopo futuro

---

## Requisitos Funcionais

### Setup e Infraestrutura

- **RF-001:** O sistema deve possuir um client Supabase configurado e reutilizável por toda a aplicação, inicializado com as credenciais do projeto via variáveis de ambiente.

- **RF-002:** O sistema deve dispor de um arquivo `.env.example` documentando todas as variáveis de ambiente necessárias para o Supabase, sem conter valores reais.

- **RF-003:** O arquivo `.env` (local) não deve ser versionado no Git (garantir entrada no `.gitignore`).

### Schema de Identidade

- **RF-004:** O sistema deve possuir uma tabela `profiles` no schema `public` que estenda `auth.users` com os campos da interface `User` atual: `type` (admin/company/candidate), `name`, `email`, `avatar_url`, `status`, `role_id`, `last_access_at`, `group_ids`, `created_at`, `updated_at`.

- **RF-005:** O sistema deve possuir uma tabela `candidates` no schema `public` com os campos da interface `Candidate` atual: referência ao `profile_id`, `title`, `location`, `experience_years`, `education`, `skills`, `salary_min`, `salary_max`, `salary_currency`, `availability`, `profile_completion`, `has_test`, `phone`, `linkedin`, `about`, `plan`, `date_of_birth`, `visibility_mode`, `anonymous_id`, `status`, `deactivated_at`.

- **RF-006:** O sistema deve possuir uma tabela `companies` no schema `public` com os campos da interface `Company` atual: referência ao `profile_id`, `name`, `cnpj`, `logo_url`, `industry`, `size`, `location`, `description`, `website`, `linkedin`, `phone`, `city`, `state`, `address`, `active_jobs`, `total_candidates`, `status`, `plan`, `payment_status`, `deactivated_at`.

- **RF-007:** Ao criar um usuário via Supabase Auth, um registro correspondente na tabela `profiles` deve ser criado automaticamente via trigger/function no banco.

- **RF-008:** A relação entre `profiles` e `auth.users` deve ser 1:1 via foreign key no campo `id` (usando o mesmo UUID do `auth.users`).

- **RF-009:** A relação entre `candidates`/`companies` e `profiles` deve ser 1:1, criada durante o registro conforme o tipo de conta escolhido.

### Autenticação

- **RF-010:** O sistema deve permitir login via email + senha usando Supabase Auth nativo.

- **RF-011:** O sistema deve persistir a sessão do usuário entre recarregamentos de página (session persistence via Supabase).

- **RF-012:** O sistema deve fazer logout limpando a sessão do Supabase e redirecionando para a landing page.

- **RF-013:** O AuthContext reescrito deve expor **exatamente a mesma interface pública** atual: `user`, `isAuthenticated`, `login`, `logout`, `currentCompany`, `currentCandidate`. Adicionalmente, deve expor: `loading` (estado de carregamento da sessão), `signUp`, e `resetPassword`.

- **RF-014:** Durante o carregamento inicial da sessão (verificação de token), o sistema deve exibir um estado de loading em vez de redirecionar prematuramente para `/login`.

- **RF-015:** O campo `user` do AuthContext deve retornar um objeto com a mesma estrutura da interface `User` atual (`id`, `name`, `email`, `type`, `avatar`, `createdAt`, `roleId`, `status`, `lastAccessAt`, `groupIds`), populado com dados reais do `profiles`.

- **RF-016:** Os campos `currentCompany` e `currentCandidate` devem ser carregados do banco (tabelas `companies` e `candidates` respectivamente) quando o tipo do usuário autenticado corresponder.

### Registro

- **RF-017:** O sistema deve permitir criação de conta com escolha obrigatória de tipo: "Candidato" ou "Empresa".

- **RF-018:** O formulário de registro para **Candidato** deve coletar: nome completo, email, telefone, senha. Os demais campos do perfil de candidato devem ser preenchidos posteriormente (onboarding progressivo).

- **RF-019:** O formulário de registro para **Empresa** deve coletar: nome da empresa, email corporativo, telefone, senha. Os demais campos do perfil empresarial devem ser preenchidos posteriormente.

- **RF-020:** Ao registrar com sucesso, o sistema deve criar: (a) conta no `auth.users` via Supabase Auth, (b) registro em `profiles` via trigger, (c) registro em `candidates` ou `companies` conforme tipo escolhido.

- **RF-021:** O sistema deve exibir feedback claro de erros de registro: email já em uso, senha fraca, campos obrigatórios ausentes.

- **RF-022:** Após registro bem-sucedido, o sistema deve redirecionar para o dashboard correspondente ao tipo de conta (candidato → `/candidato`, empresa → `/empresa`).

### Magic Link

- **RF-023A:** O sistema deve suportar login por magic link — o usuário informa o email e recebe um link de acesso via `signInWithOtp`, sem necessidade de senha.

- **RF-023B:** O magic link não deve criar contas novas (`shouldCreateUser: false`). Apenas usuários previamente cadastrados podem usar essa funcionalidade.

- **RF-023C:** Na tela de login, deve existir um botão "Entrar com link magico" que alterna para a view de magic link. Após envio, exibir confirmação "Link enviado!".

### Confirmação de Email

- **RF-023D:** Após o registro, se o Supabase exigir confirmação de email (`session === null`), o sistema deve exibir uma tela "Verifique seu email" em vez de redirecionar ao dashboard.

- **RF-023E:** A tela de verificação deve mostrar o email cadastrado, botão "Reenviar email" (via `supabase.auth.resend`), e link "Ja confirmei, ir para login".

- **RF-023F:** Com confirmação de email desabilitada (dev mode), o registro deve redirecionar diretamente ao dashboard (comportamento preservado).

### Trigger Expandido

- **RF-023G:** O trigger `handle_new_user()` deve criar atomicamente: (a) registro em `profiles`, (b) registro em `candidates` ou `companies` conforme o tipo, lendo `name`, `type`, e `phone` do `raw_user_meta_data`. O frontend não realiza INSERT manual nessas tabelas durante o registro.

### Recuperação de Senha

- **RF-023:** O sistema deve oferecer fluxo de "Esqueceu a senha" na página de login.

- **RF-024:** O fluxo deve enviar email de reset via Supabase Auth para o endereço informado.

- **RF-025:** O sistema deve exibir confirmação de envio do email, independentemente de o email existir ou não no sistema (prevenção de enumeração de contas).

### Proteção de Rotas

- **RF-026:** O componente `ProtectedRoute` deve funcionar com o novo AuthContext, incluindo tratamento do estado `loading` (não redirecionar enquanto sessão está sendo verificada).

- **RF-027:** O componente `RedirectIfAuthenticated` deve funcionar com o novo AuthContext, incluindo tratamento do estado `loading`.

### Segurança de Dados (RLS)

- **RF-028:** A tabela `profiles` deve ter RLS habilitado. Cada usuário deve poder ler e atualizar apenas seu próprio perfil. Administradores devem poder ler todos os perfis.

- **RF-029:** A tabela `candidates` deve ter RLS habilitado. Cada candidato deve poder ler e atualizar apenas seu registro. Administradores e empresas com vagas ativas devem poder ler registros de candidatos (read-only).

- **RF-030:** A tabela `companies` deve ter RLS habilitado. Cada empresa deve poder ler e atualizar apenas seu registro. Administradores devem poder ler todas. Candidatos devem poder ler dados públicos das empresas.

### Seed de Desenvolvimento

- **RF-031:** O projeto deve incluir um arquivo SQL de seed que recrie os mesmos 9 usuários mock atuais (`admin-1`, `company-1` a `company-3`, `candidate-1` a `candidate-5`) com seus dados correspondentes em `profiles`, `candidates` e `companies`.

- **RF-032:** O seed deve ser idempotente (executável múltiplas vezes sem duplicar dados).

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** O carregamento da sessão (verificação de token existente) deve ser concluído em menos de 2 segundos em conexões 4G.

- **RNF-002 (Compatibilidade):** O novo AuthContext deve manter retrocompatibilidade total com os 23 arquivos consumidores existentes, sem necessidade de alteração em nenhum deles neste PRD.

- **RNF-003 (Resiliência):** Se o Supabase estiver indisponível durante verificação de sessão, o sistema deve tratar como "não autenticado" com mensagem amigável, sem crash.

- **RNF-004 (Segurança):** A chave `service_role` nunca deve estar presente no código frontend. Apenas a chave `anon` (pública) deve ser usada no client-side.

- **RNF-005 (DX — Developer Experience):** O seed de desenvolvimento deve ser documentado no `CLAUDE.md` com instruções claras de execução.

---

## Critérios de Aceitação

### RF-010: Login com Email + Senha

```gherkin
DADO que o usuário possui uma conta registrada com email "joao@email.com"
QUANDO ele preenche email e senha corretos na página de login
ENTÃO o sistema deve autenticá-lo via Supabase Auth
  E redirecionar para o dashboard correspondente ao seu tipo (/candidato, /empresa, /admin)
  E o AuthContext deve refletir o usuário autenticado com todos os campos do perfil
```

```gherkin
DADO que o usuário informa credenciais inválidas
QUANDO ele tenta fazer login
ENTÃO o sistema deve exibir mensagem de erro clara ("Email ou senha incorretos")
  E não deve revelar se o email existe no sistema
```

### RF-011: Persistência de Sessão

```gherkin
DADO que o usuário está autenticado
QUANDO ele recarrega a página (F5)
ENTÃO o sistema deve manter a sessão ativa
  E exibir um estado de loading enquanto verifica o token
  E restaurar o estado completo do AuthContext (user, currentCompany/currentCandidate)
```

### RF-017 a RF-022: Registro de Conta

```gherkin
DADO que o visitante acessa /cadastro
QUANDO ele seleciona "Candidato", preenche nome, email, telefone e senha, e submete
ENTÃO o sistema deve criar conta no Supabase Auth
  E criar registro em profiles com type = 'candidate'
  E criar registro em candidates com dados iniciais
  E redirecionar para /candidato
```

```gherkin
DADO que o visitante acessa /cadastro
QUANDO ele seleciona "Empresa", preenche nome da empresa, email, telefone e senha, e submete
ENTÃO o sistema deve criar conta no Supabase Auth
  E criar registro em profiles com type = 'company'
  E criar registro em companies com dados iniciais
  E redirecionar para /empresa
```

```gherkin
DADO que o visitante tenta registrar com email já existente
QUANDO ele submete o formulário
ENTÃO o sistema deve exibir mensagem de erro informando que o email já está em uso
```

### RF-023 a RF-025: Reset de Senha

```gherkin
DADO que o usuário clica em "Esqueceu a senha" na página de login
QUANDO ele informa seu email e confirma
ENTÃO o sistema deve enviar email de reset via Supabase Auth
  E exibir confirmação genérica ("Se o email existir, enviaremos instruções")
```

### RNF-002: Retrocompatibilidade do AuthContext

```gherkin
DADO que o AuthContext foi reescrito para Supabase
QUANDO qualquer dos 23 arquivos consumidores chama useAuth()
ENTÃO deve receber a mesma interface: { user, isAuthenticated, login, logout, currentCompany, currentCandidate }
  E o campo user deve ter a mesma estrutura da interface User existente
  E nenhum arquivo consumidor deve precisar de alteração
```

### RF-028 a RF-030: RLS

```gherkin
DADO que um candidato está autenticado
QUANDO ele tenta acessar dados de profiles via Supabase client
ENTÃO deve receber apenas seu próprio perfil
  E não deve ter acesso a perfis de outros usuários

DADO que um administrador está autenticado
QUANDO ele consulta a tabela profiles
ENTÃO deve receber todos os perfis do sistema
```

### Cenários de Erro

```gherkin
DADO que o Supabase está indisponível
QUANDO o sistema tenta verificar a sessão ao carregar
ENTÃO deve tratar como "não autenticado"
  E exibir a aplicação normalmente (rotas públicas acessíveis)
  E não apresentar erro de JavaScript no console visível ao usuário
```

```gherkin
DADO que o usuário tenta registrar com senha menor que 6 caracteres
QUANDO ele submete o formulário
ENTÃO o sistema deve exibir mensagem indicando requisito mínimo de senha
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Setup do Supabase client e variáveis de ambiente | 4 |
| 2 | Schema de identidade (SQL: tabelas, triggers, RLS) | 3 |
| 3 | AuthContext Supabase (substituição com retrocompatibilidade) | 3 |
| 4 | Fluxos de Login, Registro e Reset de Senha | 4 |
| 5 | Seed de desenvolvimento, documentação e validação | 3 |

**Total estimado: ~17 arquivos** (criados ou modificados)

### Detalhamento das Fases

#### Fase 1: Setup Supabase Client

**Objetivo:** Estabelecer a conexão entre o frontend e o projeto Supabase.

**Ações:**
- [ ] Instalar dependência `@supabase/supabase-js`
- [ ] Criar arquivo de inicialização do client Supabase (ex: `src/lib/supabase.ts`)
- [ ] Criar `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- [ ] Criar `.env.example` documentando as variáveis (sem valores reais)
- [ ] Garantir `.env` no `.gitignore`
- [ ] Criar arquivo de tipos TypeScript para o schema do banco (ex: `src/types/database.ts`)

**Validação:** Import do client Supabase não gera erros; `supabase.from('profiles').select('*')` executa (mesmo retornando vazio).

#### Fase 2: Schema de Identidade

**Objetivo:** Criar as tabelas de identidade no Supabase com triggers e RLS.

**Ações:**
- [ ] Criar script SQL de migração com as tabelas `profiles`, `candidates`, `companies`
- [ ] Criar function + trigger para criação automática de `profiles` ao inserir em `auth.users`
- [ ] Habilitar RLS nas 3 tabelas
- [ ] Criar políticas RLS conforme RF-028 a RF-030
- [ ] Executar migração no projeto Supabase

**Validação:** Tabelas existem no dashboard do Supabase; RLS está habilitado; trigger dispara ao criar usuário de teste.

#### Fase 3: AuthContext Supabase

**Objetivo:** Substituir o AuthContext mock pelo Supabase Auth real, mantendo a mesma interface pública.

**Ações:**
- [ ] Reescrever `src/contexts/AuthContext.tsx` para usar Supabase Auth
- [ ] Implementar listener de mudança de sessão (`onAuthStateChange`)
- [ ] Implementar carregamento de dados do perfil (`profiles`) ao autenticar
- [ ] Implementar carregamento condicional de `candidates` ou `companies`
- [ ] Adicionar estado `loading` para verificação inicial de sessão
- [ ] Atualizar `ProtectedRoute.tsx` para tratar estado `loading`
- [ ] Atualizar `RedirectIfAuthenticated.tsx` para tratar estado `loading`

**Validação:** Os 23 arquivos consumidores de `useAuth()` continuam funcionando sem alteração; sessão persiste após F5.

#### Fase 4: Fluxos de Autenticação

**Objetivo:** Implementar login, registro e reset de senha funcionais.

**Ações:**
- [ ] Reescrever `Login.tsx` — formulário real com email + senha + feedback de erros
- [ ] Reescrever `Register.tsx` — escolha candidato/empresa + criação de conta real + inserção em tabela específica
- [ ] Implementar fluxo de "Esqueceu a senha" (pode ser modal no Login ou página separada)
- [ ] Implementar validação de formulários (campos obrigatórios, formato de email, força da senha)
- [ ] Remover seleção de "Administrador" do login público (admins são criados internamente)

**Validação:** Usuário consegue registrar, fazer login, recarregar a página com sessão ativa, fazer logout, e resetar senha.

#### Fase 5: Seed, Documentação e Validação Final

**Objetivo:** Garantir ambiente de desenvolvimento funcional e documentação atualizada.

**Ações:**
- [ ] Criar script SQL de seed com os 9 usuários mock atuais (convertidos para Supabase Auth + profiles + candidates/companies)
- [ ] Documentar no `CLAUDE.md` as instruções de setup do Supabase (variáveis, seed, comandos)
- [ ] Testar todos os fluxos end-to-end (registro, login, F5, logout, reset)
- [ ] Validar que nenhum arquivo consumidor quebrou
- [ ] Validar RLS com diferentes tipos de usuário

**Validação:** Seed executável; CLAUDE.md atualizado; todos os cenários dos critérios de aceitação passam.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-061 | RBAC "Guardian" — tipos e estrutura | ✅ Concluído |
| PRD-062 | Feature Flags "Switch" | ✅ Concluído |

> **Nota:** PRD-061 e PRD-062 criaram os **tipos** e **dados mock** para RBAC e Feature Flags. A migração desses dados para o banco será feita no PRD-071. Este PRD (063) não depende deles para funcionar, mas os tipos existentes informam a estrutura do schema.

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Supabase (filackbesialiapjwijb) | BaaS — Auth + PostgreSQL | ✅ Projeto criado, schema vazio |

### Decisões Pendentes

- [ ] Nenhuma — todas as decisões foram tomadas na sessão de planejamento

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Migração Mock → Supabase"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| **1** | **PRD-063** | **Fundação Supabase + Auth** | **🔄 ATUAL** | **Base — desbloqueia tudo** |
| 2 | PRD-064 | Schema Core + Seeds Transacionais | ⏳ | Depende de 063 |
| 3 | PRD-065 | Dados de Referência + Seeds Permanentes | ⏳ | Depende de 063 |
| 4 | PRD-066 | Service Layer — Padrão e Módulos Core | ⏳ | Depende de 063, 064 |
| 5 | PRD-067 | Service Layer — Módulos Especializados | ⏳ | Depende de 065, 066 |
| 6 | PRD-068 | Migração — Auth + Perfis | ⏳ | Depende de 066 |
| 7 | PRD-069 | Migração — Vagas e Candidaturas | ⏳ | Depende de 064, 066 |
| 8 | PRD-070 | Migração — Comunicação + Avaliações | ⏳ | Depende de 067, 069 |
| 9 | PRD-071 | Migração — Admin + Planos + RBAC | ⏳ | Depende de 065, 067 |
| 10 | PRD-072 | Migração — Limpeza e Remoção dos Mocks | ⏳ | Depende de 068-071 |

> **Nota:** Este é o PRD-063 — primeiro da cadeia. Nenhum PRD anterior é pré-requisito. Todos os demais dependem deste.

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Senha do usuário | Sensível | Gerenciado pelo Supabase Auth (bcrypt), nunca acessível pelo frontend |
| Email | PII | Armazenado no auth.users e profiles; acessível apenas ao próprio usuário e admins via RLS |
| CNPJ | PII corporativo | Armazenado em companies; visível ao próprio e admins |
| Telefone | PII | Armazenado em candidates/companies; visível ao próprio e admins |
| Token de sessão | Sensível | JWT gerenciado pelo Supabase, armazenado em localStorage pelo client SDK |
| Chave anon | Pública | Pode estar no código frontend (é projetada para ser pública) |
| Chave service_role | Secreta | NUNCA no frontend; apenas em scripts server-side ou CI/CD |

### Autenticação e Autorização

- Supabase Auth gerencia sessão, tokens JWT, e refresh automático
- RLS no banco garante isolamento de dados por usuário autenticado
- Tipo de usuário (`profiles.type`) determina acesso às rotas no frontend (`ProtectedRoute`)
- `service_role` key não deve existir em nenhum arquivo do repositório frontend

### Auditoria

- Supabase registra automaticamente logins em `auth.audit_log_entries`
- O campo `last_access_at` em `profiles` deve ser atualizado a cada login bem-sucedido
- Registros de criação de conta geram timestamps automáticos (`created_at`)

---

## Fluxos de Usuário

### Fluxo 1: Registro de Novo Candidato

```
Visitante ──▶ /cadastro ──▶ Seleciona "Candidato"
    ──▶ Preenche: nome, email, telefone, senha
    ──▶ Submete formulário
    ──▶ Sistema cria conta no Supabase Auth
    ──▶ Trigger cria registro em profiles (type = 'candidate')
    ──▶ Aplicação cria registro em candidates (dados mínimos)
    ──▶ Sessão é estabelecida automaticamente
    ──▶ Redirecionamento para /candidato (dashboard)
```

### Fluxo 2: Registro de Nova Empresa

```
Visitante ──▶ /cadastro ──▶ Seleciona "Empresa"
    ──▶ Preenche: nome da empresa, email, telefone, senha
    ──▶ Submete formulário
    ──▶ Sistema cria conta no Supabase Auth
    ──▶ Trigger cria registro em profiles (type = 'company')
    ──▶ Aplicação cria registro em companies (dados mínimos)
    ──▶ Sessão é estabelecida automaticamente
    ──▶ Redirecionamento para /empresa (dashboard)
```

### Fluxo 3: Login

```
Visitante ──▶ /login ──▶ Preenche email + senha
    ──▶ Submete formulário
    ──▶ Supabase Auth valida credenciais
    ──▶ AuthContext carrega profile + candidate/company
    ──▶ Redirecionamento para dashboard conforme type
```

### Fluxo 4: Persistência de Sessão (Reload)

```
Usuário autenticado ──▶ Recarrega página (F5)
    ──▶ AuthContext detecta token existente (loading = true)
    ──▶ Supabase valida token / faz refresh se expirado
    ──▶ AuthContext carrega dados do profile
    ──▶ AuthContext carrega candidate ou company
    ──▶ loading = false, aplicação renderiza normalmente
```

### Fluxo 5: Reset de Senha

```
Visitante ──▶ /login ──▶ Clica "Esqueceu a senha"
    ──▶ Modal/formulário solicita email
    ──▶ Sistema chama Supabase Auth resetPasswordForEmail
    ──▶ Exibe: "Se o email existir, enviaremos instruções"
    ──▶ Usuário recebe email ──▶ Clica no link
    ──▶ Página de redefinição de senha ──▶ Nova senha
    ──▶ Redirecionamento para /login
```

### Fluxo de Exceção: Supabase Indisponível

```
Usuário ──▶ Qualquer página
    ──▶ AuthContext tenta verificar sessão
    ──▶ Supabase não responde (timeout)
    ──▶ AuthContext define: user = null, isAuthenticated = false, loading = false
    ──▶ Aplicação renderiza normalmente (rotas públicas acessíveis)
    ──▶ Rotas protegidas redirecionam para /login
```

### Fluxo de Erro: Login com Credenciais Inválidas

```
Visitante ──▶ /login ──▶ Preenche email/senha incorretos
    ──▶ Submete formulário
    ──▶ Supabase retorna erro
    ──▶ UI exibe: "Email ou senha incorretos"
    ──▶ Formulário mantém o email preenchido
    ──▶ Usuário pode tentar novamente
```

---

## Modelo Conceitual de Dados

### Diagrama de Relações

```
┌─────────────────────┐
│    auth.users        │  ← Gerenciado pelo Supabase Auth
│  (email, password)   │
└─────────┬───────────┘
          │ 1:1 (mesmo UUID)
          ▼
┌─────────────────────┐
│     profiles         │  ← Criado automaticamente via trigger
│  type, name, email,  │
│  avatar_url, status, │
│  role_id, ...        │
└────┬───────────┬────┘
     │           │
     │ 1:1       │ 1:1
     │ (se type  │ (se type
     │  = cand.) │  = comp.)
     ▼           ▼
┌──────────┐  ┌──────────┐
│candidates│  │companies │
│title,    │  │cnpj,     │
│skills,   │  │industry, │
│salary,...│  │plan,...   │
└──────────┘  └──────────┘
```

### Mapeamento TypeScript → PostgreSQL

#### Tabela: profiles

| Campo TypeScript (User) | Coluna PostgreSQL | Tipo PostgreSQL | Notas |
|------------------------|-------------------|-----------------|-------|
| id | id | UUID (PK, FK → auth.users.id) | Mesmo UUID do auth |
| name | name | TEXT NOT NULL | |
| email | email | TEXT NOT NULL UNIQUE | Espelhado do auth.users |
| type | type | TEXT NOT NULL CHECK (admin, company, candidate) | |
| avatar | avatar_url | TEXT | |
| createdAt | created_at | TIMESTAMPTZ DEFAULT NOW() | |
| roleId | role_id | TEXT | Referência futura para RBAC |
| status | status | TEXT DEFAULT 'active' CHECK (active, inactive, suspended, pending) | |
| lastAccessAt | last_access_at | TIMESTAMPTZ | |
| groupIds | group_ids | TEXT[] DEFAULT '{}' | Array de IDs para RBAC groups |
| — | updated_at | TIMESTAMPTZ DEFAULT NOW() | Automático via trigger |

#### Tabela: candidates

| Campo TypeScript (Candidate) | Coluna PostgreSQL | Tipo PostgreSQL | Notas |
|-----------------------------|-------------------|-----------------|-------|
| id | id | UUID (PK) DEFAULT gen_random_uuid() | |
| userId | profile_id | UUID NOT NULL UNIQUE FK → profiles.id | |
| name | name | TEXT NOT NULL | Desnormalizado para queries |
| email | email | TEXT NOT NULL | Desnormalizado para queries |
| avatar | avatar_url | TEXT | |
| title | title | TEXT DEFAULT '' | |
| location | location | TEXT DEFAULT '' | |
| experience | experience_years | INTEGER DEFAULT 0 | |
| education | education | TEXT DEFAULT '' | |
| skills | skills | TEXT[] DEFAULT '{}' | |
| salary.min | salary_min | NUMERIC | |
| salary.max | salary_max | NUMERIC | |
| salary.currency | salary_currency | TEXT DEFAULT 'BRL' | |
| availability | availability | TEXT DEFAULT '' | |
| profileCompletion | profile_completion | INTEGER DEFAULT 0 | |
| hasTest | has_test | BOOLEAN DEFAULT FALSE | |
| status | status | TEXT DEFAULT 'active' | |
| createdAt | created_at | TIMESTAMPTZ DEFAULT NOW() | |
| deactivatedAt | deactivated_at | TIMESTAMPTZ | |
| phone | phone | TEXT | |
| linkedin | linkedin | TEXT | |
| about | about | TEXT | |
| plan | plan | TEXT DEFAULT 'Essencial' | |
| dateOfBirth | date_of_birth | DATE | |
| visibility.mode | visibility_mode | TEXT DEFAULT 'public' | |
| visibility.anonymousId | anonymous_id | TEXT | Gerado no registro |
| — | updated_at | TIMESTAMPTZ DEFAULT NOW() | |

#### Tabela: companies

| Campo TypeScript (Company) | Coluna PostgreSQL | Tipo PostgreSQL | Notas |
|---------------------------|-------------------|-----------------|-------|
| id | id | UUID (PK) DEFAULT gen_random_uuid() | |
| userId | profile_id | UUID NOT NULL UNIQUE FK → profiles.id | |
| name | name | TEXT NOT NULL | |
| cnpj | cnpj | TEXT | Formato livre, validado no frontend |
| logo | logo_url | TEXT | |
| industry | industry | TEXT DEFAULT '' | |
| size | size | TEXT DEFAULT '' | |
| location | location | TEXT DEFAULT '' | |
| description | description | TEXT DEFAULT '' | |
| website | website | TEXT | |
| linkedin | linkedin | TEXT | |
| phone | phone | TEXT | |
| city | city | TEXT DEFAULT '' | |
| state | state | TEXT DEFAULT '' | |
| address | address | TEXT | |
| activeJobs | active_jobs | INTEGER DEFAULT 0 | |
| totalCandidates | total_candidates | INTEGER DEFAULT 0 | |
| status | status | TEXT DEFAULT 'active' CHECK (active, pending, inactive) | |
| plan | plan | TEXT DEFAULT 'Essencial Empresas' | |
| createdAt | created_at | TIMESTAMPTZ DEFAULT NOW() | |
| paymentStatus | payment_status | TEXT DEFAULT 'ok' CHECK (ok, pending, overdue) | |
| deactivatedAt | deactivated_at | TIMESTAMPTZ | |
| — | updated_at | TIMESTAMPTZ DEFAULT NOW() | |

### Políticas RLS (Conceitual)

| Tabela | Operação | Quem | Condição |
|--------|----------|------|----------|
| profiles | SELECT own | Todos autenticados | `auth.uid() = id` |
| profiles | SELECT all | Admins | `profiles.type = 'admin'` (do próprio user) |
| profiles | UPDATE | Próprio usuário | `auth.uid() = id` |
| candidates | SELECT own | Candidato | `profile_id = auth.uid()` |
| candidates | SELECT all | Admin | Tipo do auth.uid() = admin |
| candidates | SELECT all | Empresa | Tipo do auth.uid() = company (read-only) |
| candidates | UPDATE | Próprio candidato | `profile_id = auth.uid()` |
| companies | SELECT own | Empresa | `profile_id = auth.uid()` |
| companies | SELECT all | Admin | Tipo do auth.uid() = admin |
| companies | SELECT public | Candidato | Read-only (dados públicos) |
| companies | UPDATE | Própria empresa | `profile_id = auth.uid()` |

> **Nota:** A verificação "tipo do auth.uid()" será feita via function helper no banco que consulta `profiles.type`.

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. CREDENCIAIS SUPABASE:**
> - As credenciais do projeto Supabase estão no `.env` local
> - Project URL: `https://filackbesialiapjwijb.supabase.co`
> - NUNCA commitar `.env` no repositório
> - NUNCA usar `service_role` key no código frontend
> - Para executar SQL no Supabase, usar o dashboard SQL Editor ou a CLI do Supabase

> **⚠️ 3. RETROCOMPATIBILIDADE CRÍTICA:**
> - O AuthContext reescrito DEVE manter a mesma interface pública
> - Os 23 arquivos que importam `useAuth()` NÃO devem ser alterados neste PRD
> - Se a interface precisar mudar, adicionar novos campos (nunca remover existentes)
> - Testar que `user.type`, `currentCompany`, `currentCandidate` funcionam após a migração

> **⚠️ 4. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/) — **MINOR +1** (nova funcionalidade)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — usar tipo **Added**
> - Gerar codinome para a nova versão MINOR (sugestão: **"Foundation"** ou **"Keystone"**)
> - Renomear este arquivo adicionando `_DONE` ao final
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| **Nova funcionalidade** | **MINOR +1, PATCH = 0** | **0.53.0 → 0.54.0** |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Para MINOR ou MAJOR, gerar codinome em inglês baseado no contexto das mudanças.

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

Tipos de mudança a documentar:
- **Added** — novas funcionalidades
- **Changed** — mudanças em funcionalidades existentes
- **Deprecated** — funcionalidades que serão removidas
- **Removed** — funcionalidades removidas
- **Fixed** — correções de bugs
- **Security** — correções de vulnerabilidades

🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | Se o Supabase falhar, a app deve degradar graciosamente (não crash) |
| **Fail gracefully** | Erros de auth devem resultar em "não autenticado", não em tela branca |
| **Preservar evidências** | Logs de erro devem ser capturados no console para debugging |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas durante implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Supabase Client** | Usar `createClient` do `@supabase/supabase-js` v2; um único client singleton |
| **Variáveis de ambiente** | Vite usa `VITE_` prefix; acessar via `import.meta.env.VITE_*` |
| **Trigger SQL** | A function de trigger para `profiles` deve rodar como `SECURITY DEFINER` para ter acesso ao schema `auth` |
| **RLS helper** | Criar uma function SQL `get_user_type(uuid)` que retorna o type do profiles para uso nas policies |
| **Login admin** | O tipo "admin" NÃO deve aparecer como opção de registro público. Admins são criados manualmente ou via seed |
| **Campos desnormalizados** | `name` e `email` em candidates/companies são cópias do profiles para facilitar queries sem joins |
| **Estados de loading** | Usar um loading state global no AuthProvider para evitar flash de redirect no ProtectedRoute |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Usar `service_role` key no frontend |
| Alterar os 23 arquivos que consomem `useAuth()` |
| Migrar dados além de profiles/candidates/companies neste PRD |
| Criar rotas novas (usar as existentes: /login, /cadastro) |
| Implementar login social (Google/LinkedIn) — escopo futuro |
| Desabilitar ou remover os dados mock existentes — eles ainda são usados pelo resto da app |
| Fazer `TRUNCATE` ou `DROP` em tabelas do Supabase sem confirmação |
| Armazenar o token de sessão manualmente — o Supabase client SDK gerencia isso |

---

## Testes de Regressão

| Cenário | Resultado Esperado | Prioridade |
|---------|-------------------|------------|
| Login com credenciais válidas | Autenticação bem-sucedida, redirect ao dashboard | Alta |
| Login com credenciais inválidas | Mensagem de erro, formulário mantido | Alta |
| Registro de candidato | Conta criada, profile + candidate inseridos, redirect | Alta |
| Registro de empresa | Conta criada, profile + company inseridos, redirect | Alta |
| F5 com sessão ativa | Sessão mantida, dados restaurados | Alta |
| Logout | Sessão limpa, redirect para landing | Alta |
| ProtectedRoute sem auth | Redirect para /login | Alta |
| RedirectIfAuthenticated com auth | Redirect para dashboard | Média |
| useAuth() em componentes existentes | Mesma interface, sem erros | Alta |
| RBACContext com novo AuthContext | Funciona normalmente (user.id disponível) | Média |
| DashboardLayout com novo AuthContext | Renderiza corretamente (user, currentCompany/Candidate) | Alta |
| Reset de senha | Email enviado, confirmação exibida | Média |
| Registro com email duplicado | Erro claro informado | Média |
| Supabase indisponível | App não crasha, rotas públicas acessíveis | Média |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ CONCLUÍDO |
| **Data de Implementação** | 04/02/2026 |
| **Versão do App** | 0.55.0 "Keystone" |
| **Implementado por** | Claude Opus 4.5 (Claude Code) |
| **Observações** | v0.54.0: Schema base + Auth real (7 arquivos novos, 8 modificados). v0.55.0: +Magic Link, +Verify Email, +Trigger expandido (3 arquivos modificados, 1 migration). Retrocompatibilidade total com 25+ consumidores de useAuth(). |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 04/02/2026 | v1 | Criação inicial — Agente Arquiteto (Claude Opus 4.5, plataforma web) |
| 04/02/2026 | v2 | Consolidação com PRD-063-auth2: +Magic Link, +Verify Email, +Trigger expandido, +signUp simplificado |

---

**AILA - Sistemas Inteligentes**
