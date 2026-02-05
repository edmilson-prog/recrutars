# PRD-063: Fundação Supabase + Autenticação

> **AILA - Sistemas Inteligentes**  
> RecrutaRS — Plataforma de Recrutamento Inteligente

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| **`PRD-063`** | ⬅ Você está aqui — Fundação Supabase + Auth |
| `PRD-064` | Schema Core + Seeds Transacionais |
| `PRD-065` | Dados de Referência + Seeds Permanentes |
| `PRD-066` | Service Layer — Padrão e Módulos Core |
| `PRD-067` | Service Layer — Módulos Especializados |
| `PRD-068` | Migração — Auth + Perfis |
| `PRD-069` | Migração — Vagas e Candidaturas |
| `PRD-070` | Migração — Comunicação + Avaliações |
| `PRD-071` | Migração — Admin + Planos + RBAC |
| `PRD-072` | Migração — Limpeza e Remoção dos Mocks |

---

# PRD-063: Fundação Supabase + Autenticação

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Migração para Supabase |
| **Repositório** | https://github.com/AilaAutomacaoInteligente/RecrutaRS |
| **Objetivo** | Estabelecer a fundação de infraestrutura Supabase: configurar o client, implementar autenticação real via Supabase Auth nativo (email/senha + magic link), criar as tabelas base de identidade (profiles, companies, candidates), aplicar RLS fundamental, e substituir o AuthContext mock por autenticação real com persistência |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 6 |
| **Prioridade** | Alta |
| **Épico** | Migração Mock → Supabase |
| **PRDs Relacionados** | PRD-064, PRD-065, PRD-066, PRD-067, PRD-068, PRD-069, PRD-070, PRD-071, PRD-072 |
| **Padrão de código** | camelCase para campos/tabelas, snake_case para SQL |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 10+ arquivos, integração com serviço externo (Supabase), migração de auth context existente, schema de banco + RLS, afeta toda a aplicação |

---

## Contexto do Problema

O RecrutaRS opera hoje com **100% de dados mockados**. São 22 arquivos de mock data totalizando ~17.500 linhas de TypeScript, consumidos por 125 arquivos via 151 importações diretas de `@/data/`. A autenticação é simulada — o `AuthContext` simplesmente seleciona o primeiro usuário de determinado tipo no array `mockUsers`, sem nenhuma verificação real de credenciais.

Isso significa que:
- Não existe persistência de dados — tudo reseta a cada reload
- Não há segurança — qualquer pessoa acessa qualquer perfil
- Não é possível testar fluxos reais de registro, login, ou recuperação de senha
- O Row Level Security (RLS) do Supabase — que é a base de segurança de toda a aplicação — não pode ser ativado sem autenticação real

Este PRD é o **primeiro da cadeia de 10 PRDs** que migrará o RecrutaRS de dados mock para persistência real no Supabase. Ele é o alicerce: sem auth funcional, nenhum dos PRDs subsequentes (schema, seeds, service layer, migração de módulos) pode operar com segurança.

---

## Conceito da Solução

### Situação Atual (As-Is)

- **Auth:** Mock — `AuthContext` usa `mockUsers.find()` para simular login
- **Banco:** Inexistente — zero tabelas, zero conexão com Supabase
- **Client Supabase:** Não instalado — sem dependência `@supabase/supabase-js`
- **Variáveis de ambiente:** Sem `.env` configurado
- **Registro:** Mock — seleção de tipo de usuário sem persistência
- **Sessão:** Volátil — perde-se ao recarregar a página

### Situação Desejada (To-Be)

- **Auth:** Real — Supabase Auth nativo com email/senha e magic link
- **Banco:** 3 tabelas base criadas (profiles, companies, candidates) com RLS
- **Client Supabase:** Configurado e funcional, com singleton pattern
- **Variáveis de ambiente:** `.env` com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
- **Registro:** Funcional — fluxo de cadastro com seleção de tipo (candidato/empresa) e persistência
- **Sessão:** Persistente — mantida via Supabase Auth com refresh automático
- **Coexistência:** O restante do app continua usando dados mock normalmente

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Firebase Auth | Supabase já é o banco escolhido; usar auth externo adiciona complexidade desnecessária |
| Auth0 | Custo adicional, dependência externa, e Supabase Auth já oferece tudo que precisamos |
| Implementar auth do zero | Reinventar a roda — Supabase Auth é maduro, seguro, e nativo |
| Big bang (auth + todas as tabelas de uma vez) | Risco altíssimo com 17.500 linhas de mock data e 125 arquivos dependentes |

---

## Escopo

### Incluído

- ✅ Instalação e configuração do client Supabase (`@supabase/supabase-js`)
- ✅ Configuração de variáveis de ambiente (`.env`, `.env.example`)
- ✅ Criação das tabelas de identidade: `profiles`, `companies`, `candidates`
- ✅ Trigger automático de criação de profile ao registrar via Supabase Auth
- ✅ RLS base para as 3 tabelas de identidade
- ✅ Fluxo de registro com seleção de tipo (candidato ou empresa)
- ✅ Login por email/senha
- ✅ Login por magic link
- ✅ Recuperação de senha
- ✅ Confirmação de email
- ✅ Gerenciamento de sessão (persistência, refresh, logout)
- ✅ Migração do `AuthContext` para Supabase Auth real
- ✅ Atualização do `ProtectedRoute` para usar auth real
- ✅ Seed de usuários de teste (1 admin, 2 empresas, 3 candidatos)
- ✅ Compatibilidade: restante do app continua funcionando com mocks

### Excluído

- ❌ Login social (Google, LinkedIn) — futuro
- ❌ Tabelas de negócio (jobs, applications, messages...) — PRD-064
- ❌ Tabelas de referência (plans, permissions, assessments...) — PRD-065
- ❌ Camada de serviço/repository — PRD-066/067
- ❌ Migração de páginas e componentes para consumir Supabase — PRD-068+
- ❌ Multi-factor Authentication (MFA) — futuro
- ❌ SSO/SAML — futuro
- ❌ Remoção dos arquivos mock — PRD-072

---

## Requisitos Funcionais

### Infraestrutura Supabase

- **RF-001:** O sistema deve instalar e configurar o SDK do Supabase para JavaScript/TypeScript
- **RF-002:** O sistema deve criar um client Supabase singleton, reutilizável por toda a aplicação
- **RF-003:** As credenciais do Supabase (URL e anon key) devem ser configuradas exclusivamente via variáveis de ambiente prefixadas com `VITE_`
- **RF-004:** O sistema deve incluir um arquivo `.env.example` documentando todas as variáveis necessárias (sem valores reais)
- **RF-005:** A service_role key **não deve** existir no frontend em nenhuma circunstância — é exclusiva para scripts de administração/seed executados em ambiente seguro

### Schema de Identidade

- **RF-006:** O sistema deve criar uma tabela `profiles` vinculada a `auth.users` via foreign key, contendo: tipo de usuário (candidato, empresa, admin), nome completo, email, avatar, telefone, status, e timestamps
- **RF-007:** O sistema deve criar uma tabela `companies` vinculada a `profiles`, contendo: razão social, nome fantasia, CNPJ, setor, porte, descrição, website, logo, endereço, e plano atual
- **RF-008:** O sistema deve criar uma tabela `candidates` vinculada a `profiles`, contendo: título profissional, bio, localização, pretensão salarial, disponibilidade, anos de experiência, e plano atual
- **RF-009:** O sistema deve criar uma função de trigger que automaticamente insere um registro em `profiles` quando um novo usuário é criado em `auth.users`, utilizando os metadados fornecidos no signup
- **RF-010:** O campo `user_type` em profiles deve aceitar apenas os valores: `candidate`, `company`, `admin`
- **RF-011:** Cada profile deve ter relação 1:1 com no máximo uma entrada em `companies` OU `candidates`, dependendo do `user_type`

### Registro (Signup)

- **RF-012:** O fluxo de registro deve apresentar uma tela inicial onde o usuário escolhe se está se cadastrando como **candidato** ou **empresa**
- **RF-013:** Após a seleção do tipo, o formulário de registro deve solicitar: email, senha, confirmação de senha, e nome completo
- **RF-014:** Para registro de **empresa**, o formulário deve solicitar adicionalmente: nome da empresa (obrigatório) e CNPJ (opcional)
- **RF-015:** Para registro de **candidato**, o formulário deve solicitar adicionalmente: título profissional (opcional)
- **RF-016:** O tipo de usuário selecionado deve ser enviado nos metadados do signup (`user_metadata`) para que o trigger de criação de profile funcione corretamente
- **RF-017:** Após o registro, o sistema deve enviar email de confirmação via Supabase Auth
- **RF-018:** O registro deve criar automaticamente: 1 profile + 1 company (se empresa) ou 1 profile + 1 candidate (se candidato)
- **RF-019:** Registros de tipo `admin` não devem ser possíveis pelo fluxo público — admins são criados exclusivamente via script/seed

### Login

- **RF-020:** O sistema deve suportar login por **email + senha** via Supabase Auth
- **RF-021:** O sistema deve suportar login por **magic link** — o usuário informa o email e recebe um link de acesso
- **RF-022:** Após login bem-sucedido, o sistema deve redirecionar o usuário para o dashboard correspondente ao seu `user_type`
- **RF-023:** O sistema deve manter a sessão persistente entre reloads da página, utilizando o gerenciamento nativo de sessão do Supabase Auth
- **RF-024:** O sistema deve detectar automaticamente mudanças de estado de autenticação (login, logout, expiração de token) via listener do Supabase Auth
- **RF-025:** O sistema deve suportar **recuperação de senha** — o usuário informa o email e recebe link para redefinir

### AuthContext Migrado

- **RF-026:** O `AuthContext` deve ser refatorado para utilizar Supabase Auth como fonte de verdade, em vez do array `mockUsers`
- **RF-027:** O hook `useAuth` deve expor: usuário autenticado (com profile completo), loading state, funções de login (email/senha), login (magic link), logout, signup, e resetPassword
- **RF-028:** O `ProtectedRoute` deve utilizar o estado real de autenticação do Supabase Auth para permitir ou bloquear acesso
- **RF-029:** O `ProtectedRoute` deve verificar o `user_type` do profile real para autorizar acesso por tipo (admin, empresa, candidato)
- **RF-030:** Durante o carregamento inicial da sessão (verificação do token), o sistema deve exibir um estado de loading (não redirecionar prematuramente)

### Row Level Security (RLS)

- **RF-031:** A tabela `profiles` deve ter RLS habilitado com as seguintes políticas:
  - SELECT: usuários autenticados podem ler seu próprio profile
  - UPDATE: usuários autenticados podem atualizar apenas seu próprio profile
  - INSERT: permitido apenas pelo trigger de signup (service_role)
- **RF-032:** A tabela `companies` deve ter RLS habilitado com as seguintes políticas:
  - SELECT: usuários autenticados podem ler sua própria company
  - UPDATE: usuários autenticados podem atualizar sua própria company
  - INSERT: permitido apenas pelo trigger de signup (service_role)
- **RF-033:** A tabela `candidates` deve ter RLS habilitado com as seguintes políticas:
  - SELECT: usuários autenticados podem ler seu próprio candidate
  - UPDATE: usuários autenticados podem atualizar seu próprio candidate
  - INSERT: permitido apenas pelo trigger de signup (service_role)
- **RF-034:** As políticas de RLS devem ser expansíveis — os PRDs futuros (064+) adicionarão políticas para que empresas vejam candidatos, candidatos vejam vagas, admins vejam tudo, etc.

### Seeds de Teste

- **RF-035:** O sistema deve incluir um script de seed executável localmente que cria os seguintes usuários de teste:
  - 1 Admin: `admin@recrutars.com`
  - 2 Empresas: `empresa1@recrutars.com`, `empresa2@recrutars.com`
  - 3 Candidatos: `candidato1@recrutars.com`, `candidato2@recrutars.com`, `candidato3@recrutars.com`
- **RF-036:** O script de seed deve usar a service_role key (via variável de ambiente local, nunca commitada) para criar os usuários via Admin API do Supabase Auth
- **RF-037:** Os usuários seed devem ter profiles, companies/candidates preenchidos com dados representativos (baseados nos mocks atuais para manter familiaridade)
- **RF-038:** O script de seed deve ser idempotente — se executado novamente, não deve duplicar dados

### Coexistência com Mocks

- **RF-039:** As demais páginas e componentes do app que consomem dados de `@/data/` devem continuar funcionando normalmente — este PRD altera apenas o módulo de autenticação
- **RF-040:** O `user` retornado pelo `useAuth` migrado deve manter a mesma interface/formato que o mock atual usa, para que componentes que dependem de `user.type`, `user.name`, etc. não quebrem
- **RF-041:** Se o perfil completo do usuário (company ou candidate details) não estiver carregado, o sistema deve exibir os dados básicos do profile e carregar os detalhes assincronamente

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** O tempo entre o carregamento da página e a resolução do estado de autenticação (logado ou não) deve ser inferior a 2 segundos
- **RNF-002 (Segurança):** A anon key deve ser a única credencial presente no código frontend. A service_role key jamais deve aparecer no bundle, no repositório, ou em qualquer arquivo que não seja `.env.local`
- **RNF-003 (Resiliência):** Se a conexão com Supabase falhar, o sistema deve exibir mensagem amigável e permitir retry — não deve crashar ou mostrar tela branca
- **RNF-004 (Compatibilidade):** O app deve continuar funcionando 100% para todas as funcionalidades que usam mock data — a migração de auth não deve quebrar nenhuma página existente
- **RNF-005 (Responsividade):** Os fluxos de registro e login devem funcionar corretamente em mobile (seguindo o design system existente)
- **RNF-006 (Acessibilidade):** Os formulários de login e registro devem seguir as práticas do PRD-003-dgn (Mobile-first e Acessibilidade)

---

## Modelo Conceitual de Dados

### Diagrama de Relacionamento

```
┌─────────────────────┐
│    auth.users        │  ← Gerenciado pelo Supabase Auth
│  (email, password)   │
└─────────┬───────────┘
          │ 1:1 (trigger automático)
          ▼
┌─────────────────────┐
│     profiles         │
│  id (= auth.users.id)│
│  userType            │
│  fullName            │
│  email               │
│  avatarUrl           │
│  phone               │
│  status              │
└──────┬──────┬────────┘
       │      │
       │ 1:0..1  (se userType = 'company')
       │      │
       │      ▼
       │  ┌─────────────────┐
       │  │   companies      │
       │  │  profileId (FK)  │
       │  │  companyName     │
       │  │  tradeName       │
       │  │  cnpj            │
       │  │  sector          │
       │  │  size            │
       │  │  description     │
       │  │  website         │
       │  │  logoUrl         │
       │  │  address (JSON)  │
       │  │  planId          │
       │  └─────────────────┘
       │
       │ 1:0..1  (se userType = 'candidate')
       ▼
  ┌─────────────────┐
  │   candidates     │
  │  profileId (FK)  │
  │  headline        │
  │  bio             │
  │  location        │
  │  salaryExpect.   │
  │  availability    │
  │  experienceYears │
  │  planId          │
  └─────────────────┘
```

### Notas sobre o Modelo

- O `id` da tabela `profiles` é o mesmo UUID do `auth.users.id` — não é auto-gerado
- O vínculo profiles → companies/candidates é 1:0..1 — um profile de tipo 'company' terá exatamente 1 company, e 0 candidates (e vice-versa)
- O campo `planId` em companies e candidates é uma string referenciando o plano atual — a FK formal para a tabela de planos será criada no PRD-065
- O campo `address` em companies é armazenado como JSON (cidade, estado, CEP, logradouro) — será normalizado se necessário em PRD futuro

---

## Critérios de Aceitação

### RF-002: Client Supabase

```gherkin
DADO que as variáveis de ambiente estão configuradas corretamente
QUANDO a aplicação inicializa
ENTÃO o client Supabase deve ser criado com sucesso
  E deve ser reutilizável como singleton em toda a aplicação
```

### RF-012/RF-018: Registro com Seleção de Tipo

```gherkin
DADO que o usuário acessa a página de registro
QUANDO ele seleciona "Candidato" e preenche email, senha, e nome
ENTÃO o sistema deve criar um auth.user via Supabase Auth
  E o trigger deve criar automaticamente 1 profile (userType = 'candidate')
  E deve criar automaticamente 1 candidate vinculado ao profile
  E deve enviar email de confirmação
```

```gherkin
DADO que o usuário acessa a página de registro
QUANDO ele seleciona "Empresa" e preenche email, senha, nome, e nome da empresa
ENTÃO o sistema deve criar um auth.user via Supabase Auth
  E o trigger deve criar automaticamente 1 profile (userType = 'company')
  E deve criar automaticamente 1 company vinculada ao profile com o nome informado
  E deve enviar email de confirmação
```

### RF-020: Login Email/Senha

```gherkin
DADO que o usuário possui conta confirmada
QUANDO ele informa email e senha corretos na tela de login
ENTÃO o sistema deve autenticá-lo via Supabase Auth
  E deve carregar o profile completo (com company ou candidate)
  E deve redirecionar para o dashboard correspondente ao userType
```

```gherkin
DADO que o usuário informa credenciais inválidas
QUANDO ele tenta fazer login
ENTÃO o sistema deve exibir mensagem de erro clara
  E não deve redirecionar nem criar sessão
```

### RF-021: Magic Link

```gherkin
DADO que o usuário possui conta confirmada
QUANDO ele informa apenas o email e solicita magic link
ENTÃO o sistema deve enviar um email com link de acesso via Supabase Auth
  E ao clicar no link, o usuário deve ser autenticado e redirecionado ao dashboard
```

### RF-023: Persistência de Sessão

```gherkin
DADO que o usuário está autenticado
QUANDO ele recarrega a página (F5/refresh)
ENTÃO a sessão deve ser mantida via Supabase Auth
  E o usuário deve permanecer logado
  E não deve ver tela de login
```

### RF-026: AuthContext Migrado

```gherkin
DADO que o AuthContext foi migrado para Supabase Auth
QUANDO qualquer componente usa o hook useAuth()
ENTÃO deve receber o user real do Supabase (não mock)
  E deve receber loading state enquanto verifica sessão
  E deve receber funções de login, logout, signup
```

### RF-039: Coexistência com Mocks

```gherkin
DADO que apenas o módulo de autenticação foi migrado
QUANDO o usuário navega para páginas que usam dados mock (vagas, candidaturas, etc.)
ENTÃO essas páginas devem continuar funcionando normalmente com dados mock
  E nenhum erro deve ser exibido
```

### RF-031: RLS

```gherkin
DADO que o usuário está autenticado como candidato
QUANDO ele tenta acessar o profile de outro usuário via query direta
ENTÃO o RLS deve bloquear o acesso
  E retornar resultado vazio (não erro)
```

### Cenários de Erro

```gherkin
DADO que o Supabase está indisponível ou o client não está configurado
QUANDO o usuário tenta fazer login ou registro
ENTÃO o sistema deve exibir mensagem amigável de erro
  E deve permitir retry
  E não deve crashar a aplicação
```

```gherkin
DADO que o usuário tenta registrar com email já existente
QUANDO ele submete o formulário de registro
ENTÃO o sistema deve exibir mensagem informando que o email já está em uso
  E não deve criar duplicata
```

---

## Fluxos de Usuário

### Fluxo 1: Registro (Happy Path)

```
[Usuário] ──▶ [Página de Registro] ──▶ [Seleciona: Candidato ou Empresa]
                                               │
                          ┌────────────────────┤
                          ▼                    ▼
                   [Form Candidato]      [Form Empresa]
                   │ Nome               │ Nome
                   │ Email              │ Email
                   │ Senha              │ Senha
                   │ Título (opc.)      │ Nome Empresa
                   │                    │ CNPJ (opc.)
                   └──────┬─────────────┘
                          ▼
                   [Supabase Auth: signUp]
                          │
                          ▼
                   [Trigger: cria profile + company/candidate]
                          │
                          ▼
                   [Email de confirmação enviado]
                          │
                          ▼
                   [Tela: "Verifique seu email"]
```

### Fluxo 2: Login Email/Senha

```
[Usuário] ──▶ [Página de Login] ──▶ [Informa email + senha]
                                           │
                                           ▼
                                    [Supabase Auth: signIn]
                                           │
                               ┌───────────┤
                               ▼           ▼
                          [Sucesso]   [Erro: credenciais]
                               │           │
                               ▼           ▼
                     [Carrega profile]  [Msg de erro]
                               │
                               ▼
                     [Redireciona por userType]
                         │         │         │
                         ▼         ▼         ▼
                    [/admin]  [/empresa]  [/candidato]
```

### Fluxo 3: Magic Link

```
[Usuário] ──▶ [Página de Login] ──▶ [Tab: Magic Link]
                                           │
                                           ▼
                                    [Informa email]
                                           │
                                           ▼
                                    [Supabase Auth: signInWithOtp]
                                           │
                                           ▼
                                    [Tela: "Link enviado"]
                                           │
                                           ▼
                                    [Usuário clica no email]
                                           │
                                           ▼
                                    [Supabase Auth: callback]
                                           │
                                           ▼
                                    [Redireciona por userType]
```

### Fluxo de Exceção: Supabase Indisponível

```
[Usuário] ──▶ [Tenta login/registro] ──▶ [Erro de conexão]
                                               │
                                               ▼
                                        [Msg: "Serviço temporariamente indisponível"]
                                               │
                                               ▼
                                        [Botão: Tentar novamente]
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Setup Supabase — Client e Variáveis de Ambiente | 4 |
| 2 | Schema — Tabelas de Identidade + Trigger + RLS | 3 (migrations SQL) |
| 3 | Auth Flows — Registro com Seleção de Tipo | 5 |
| 4 | Auth Flows — Login (Email/Senha + Magic Link) + Recuperação | 4 |
| 5 | Migração do AuthContext + ProtectedRoute | 4 |
| 6 | Seeds de Teste + Validação Final | 3 |

**Total estimado: ~23 arquivos**

### Detalhamento das Fases

#### Fase 1: Setup Supabase

**Objetivo:** Configurar o client Supabase e variáveis de ambiente

**Ações:**
- [ ] Instalar dependência `@supabase/supabase-js`
- [ ] Criar arquivo de inicialização do client Supabase (singleton)
- [ ] Criar `.env.example` documentando as variáveis necessárias
- [ ] Configurar `.env.local` com as credenciais reais (anon key + URL)
- [ ] Garantir que `.env.local` está no `.gitignore`
- [ ] Testar conexão básica com o Supabase (health check)

**Validação:** Importar o client em qualquer arquivo e executar uma query simples sem erro

#### Fase 2: Schema de Identidade

**Objetivo:** Criar as tabelas base e políticas de segurança

**Ações:**
- [ ] Criar migration SQL para a tabela `profiles`
- [ ] Criar migration SQL para a tabela `companies`
- [ ] Criar migration SQL para a tabela `candidates`
- [ ] Criar função de trigger `handle_new_user()` que insere em profiles + companies/candidates baseado nos metadados do signup
- [ ] Criar trigger `on_auth_user_created` vinculado a `auth.users`
- [ ] Habilitar RLS nas 3 tabelas com as políticas definidas nos RFs
- [ ] Criar função `updated_at` trigger para atualizar timestamp automaticamente
- [ ] Testar: criar usuário via Supabase Dashboard → verificar se profile foi criado

**Validação:** Criar um usuário manualmente no Supabase Dashboard e verificar que profile + company/candidate foram criados automaticamente

#### Fase 3: Registro com Seleção de Tipo

**Objetivo:** Implementar o fluxo completo de signup

**Ações:**
- [ ] Criar/refatorar página de registro com seleção de tipo (candidato/empresa)
- [ ] Implementar formulário de registro para candidato (nome, email, senha, título)
- [ ] Implementar formulário de registro para empresa (nome, email, senha, empresa, CNPJ)
- [ ] Integrar com `supabase.auth.signUp()` passando `user_metadata` com o tipo
- [ ] Implementar tela de "Verifique seu email" pós-registro
- [ ] Implementar tratamento de erros (email duplicado, senha fraca, etc.)
- [ ] Testar fluxo completo: registro → email confirmação → profile criado

**Validação:** Registrar um candidato e uma empresa, verificar que os dados persistiram nas 3 tabelas (profiles + companies/candidates)

#### Fase 4: Login e Recuperação

**Objetivo:** Implementar todos os fluxos de autenticação

**Ações:**
- [ ] Implementar login por email/senha (`signInWithPassword`)
- [ ] Implementar login por magic link (`signInWithOtp`)
- [ ] Implementar recuperação de senha (`resetPasswordForEmail`)
- [ ] Implementar página de redefinição de senha (callback URL)
- [ ] Implementar página de callback para magic link
- [ ] Implementar redirect por tipo de usuário após login
- [ ] Implementar tratamento de erros para cada fluxo

**Validação:** Login com email/senha, magic link, e recuperação de senha funcionando end-to-end

#### Fase 5: Migração do AuthContext

**Objetivo:** Substituir o AuthContext mock pelo Supabase Auth real

**Ações:**
- [ ] Refatorar `AuthContext` para usar `supabase.auth.getSession()` e `onAuthStateChange()`
- [ ] Refatorar `useAuth` para expor: user (com profile), loading, login, loginMagicLink, logout, signup, resetPassword
- [ ] Garantir que o `user` retornado mantém compatibilidade com o formato esperado pelos componentes existentes (user.type, user.name, user.email, etc.)
- [ ] Refatorar `ProtectedRoute` para usar auth real + verificação de userType
- [ ] Implementar loading state durante verificação inicial de sessão
- [ ] Testar que páginas protegidas bloqueiam acesso sem auth
- [ ] Testar que o restante do app (mocks) continua funcionando

**Validação:** Login real → navegação pelo app → todas as páginas acessíveis conforme perfil → reload mantém sessão → logout funciona → páginas mock continuam operando

#### Fase 6: Seeds e Validação

**Objetivo:** Criar usuários de teste e validar toda a implementação

**Ações:**
- [ ] Criar script de seed que usa Supabase Admin API (service_role) para criar usuários de teste
- [ ] Seed: 1 admin, 2 empresas, 3 candidatos (com dados representativos)
- [ ] Garantir idempotência do script (upsert ou check before insert)
- [ ] Documentar como executar o seed (README ou seção no script)
- [ ] Validar todos os critérios de aceitação
- [ ] Testar RLS: usuário A não consegue ler dados do usuário B
- [ ] Validar que nenhuma página existente quebrou

**Validação:** Executar seed → logar com cada usuário → navegar pelo app → confirmar que auth funciona e mocks coexistem

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-001 a PRD-062 | Todos os PRDs de frontend (mock) | ✅ Implementados |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Supabase (filackbesialiapjwijb) | BaaS — Auth + Database | ✅ Projeto criado, banco vazio |

### Decisões Pendentes

- Nenhuma — todas as decisões de design foram tomadas

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Migração Mock → Supabase"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| **1** | **PRD-063** | **Fundação Supabase + Auth** | **🔄 ATUAL** | **Base de tudo** |
| 2 | PRD-064 | Schema Core + Seeds Transacionais | ⏳ | Depende de 063 |
| 3 | PRD-065 | Dados de Referência + Seeds Permanentes | ⏳ | Depende de 063 |
| 4 | PRD-066 | Service Layer — Padrão e Módulos Core | ⏳ | Depende de 063, 064 |
| 5 | PRD-067 | Service Layer — Módulos Especializados | ⏳ | Depende de 065, 066 |
| 6 | PRD-068 | Migração — Auth + Perfis | ⏳ | Depende de 066 |
| 7 | PRD-069 | Migração — Vagas e Candidaturas | ⏳ | Depende de 066, 067 |
| 8 | PRD-070 | Migração — Comunicação + Avaliações | ⏳ | Depende de 067 |
| 9 | PRD-071 | Migração — Admin + Planos + RBAC | ⏳ | Depende de 067 |
| 10 | PRD-072 | Migração — Limpeza e Remoção dos Mocks | ⏳ | Depende de 068-071 |

> **Nota:** Implemente na ordem indicada. Este PRD (063) é pré-requisito de TODOS os demais.

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Senha do usuário | PII / Sensível | Gerenciado pelo Supabase Auth (bcrypt), nunca armazenado pela aplicação |
| Email do usuário | PII | Armazenado em auth.users + profiles, protegido por RLS |
| CNPJ da empresa | Sensível | Armazenado em companies, protegido por RLS |
| Tokens de sessão | Sensível | Gerenciado pelo Supabase Auth, armazenado em httpOnly cookies |
| service_role key | Crítica | Exclusivamente em variáveis de ambiente locais, nunca no repositório |
| anon key | Pública | Segura para uso no frontend, acessos controlados por RLS |

### Autenticação e Autorização

- Autenticação: Supabase Auth nativo (email/senha + magic link)
- Autorização (neste PRD): Apenas verificação de `user_type` para routing
- Autorização granular (RBAC): Será implementada nos PRDs 064-071 quando as tabelas de roles/permissions forem criadas

### Auditoria

- O Supabase Auth registra automaticamente: signups, logins, logouts, password resets
- Os timestamps `created_at` e `updated_at` em todas as tabelas registram histórico básico
- Auditoria granular (quem alterou o quê) será implementada em PRDs futuros

---

## Informações do Supabase

### Credenciais do Projeto

| Campo | Valor |
|-------|-------|
| **Project ID** | `filackbesialiapjwijb` |
| **URL** | `https://filackbesialiapjwijb.supabase.co` |
| **Anon Key** | Configurar via `VITE_SUPABASE_ANON_KEY` no `.env.local` |
| **Service Role Key** | Configurar via `SUPABASE_SERVICE_ROLE_KEY` no `.env.local` — **SOMENTE para scripts de seed** |

> ⚠️ **NUNCA** commitar credenciais reais no repositório. O `.env.local` deve estar no `.gitignore`.

### Estado Atual do Banco

O banco está **100% vazio** — nenhuma tabela, função, trigger, ou política existente. Este PRD cria tudo do zero.

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. CREDENCIAIS:**
> - NUNCA hardcodar credenciais no código
> - A anon key vai no `.env.local` como `VITE_SUPABASE_ANON_KEY`
> - A service_role key vai no `.env.local` como `SUPABASE_SERVICE_ROLE_KEY` — usada APENAS pelo script de seed
> - Verificar que `.env.local` está no `.gitignore`
> - O `.env.example` deve conter os nomes das variáveis sem valores reais

> **⚠️ 3. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/) — **MINOR +1** (nova funcionalidade)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — usar tipo **Added**
> - Gerar codinome para a nova versão MINOR (sugestão: "Foundation" ou "Keystone")
> - Renomear este arquivo adicionando `_DONE` ao final
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| **Nova funcionalidade** | **MINOR +1, PATCH = 0** | **0.53.0 → 0.54.0** |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

> **Nota:** A versão atual no CHANGELOG é 0.53.0 "Sentinel". A versão no package.json é 0.49.0 — **corrigir essa dessincronização** atualizando o package.json para a versão correta antes de incrementar.

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
| **Não bloquear fluxo principal** | Se Supabase falhar, mostrar erro amigável — nunca tela branca |
| **Fail gracefully** | Erros de auth devem ter mensagens claras e opção de retry |
| **Preservar compatibilidade** | O formato do `user` no useAuth deve manter campos que os componentes existentes usam |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir para a próxima |
| **Documentar decisões** | Registrar decisões técnicas tomadas durante implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Client Supabase** | Criar como singleton — um único client reutilizado em todo o app |
| **Migrations SQL** | Executar via Supabase Dashboard (SQL Editor) ou Supabase CLI. Manter os scripts SQL no repositório na pasta `supabase/migrations/` |
| **Trigger de signup** | Usar `SECURITY DEFINER` para que o trigger execute com permissões elevadas (necessário para inserir em tabelas com RLS) |
| **Formato do user** | O objeto user do useAuth deve expor pelo menos: `id`, `email`, `type` (= userType), `name` (= fullName), `avatarUrl`. Mapear do profile real para manter compatibilidade |
| **Loading state** | O AuthContext deve expor `isLoading: true` enquanto verifica sessão inicial. O ProtectedRoute deve aguardar esse loading antes de decidir redirecionar |
| **Magic Link callback** | Configurar a URL de callback no Supabase Dashboard: `https://[dominio]/auth/callback`. Para dev local: `http://localhost:8080/auth/callback` |
| **Email templates** | Supabase Auth tem templates padrão para confirmação e reset. Customização visual é opcional neste PRD |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Colocar a service_role key no código frontend ou em qualquer arquivo commitado |
| Alterar páginas/componentes que consomem dados mock (vagas, candidaturas, etc.) — isso é PRD-068+ |
| Implementar RBAC granular neste PRD — aqui é apenas user_type para routing |
| Criar tabelas além de profiles, companies, candidates — isso é PRD-064/065 |
| Desabilitar RLS "para facilitar" — RLS deve estar habilitado desde o dia zero |
| Remover arquivos mock — isso é PRD-072 |
| Implementar login social (Google, LinkedIn) — não faz parte do escopo |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Implementado por** | - |
| **Observações** | - |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 04/02/2026 | v1 | Criação inicial — Agente Arquiteto (Claude Opus 4.5, plataforma web) |

---

**AILA - Sistemas Inteligentes**
