# PRD-002: Proteção e Correção de Rotas

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar proteção de rotas por tipo de usuário e corrigir rotas duplicadas |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 2-5 arquivos, funcionalidade isolada, afeta estrutura de navegação |

---

## Contexto do Problema

Atualmente o projeto RecrutaRS possui dois problemas estruturais relacionados às rotas:

**Problema 1: Rotas Duplicadas**
No arquivo `App.tsx`, existem rotas duplicadas para a área do candidato:
- `/candidato/candidaturas` — aparece 2x
- `/candidato/testes` — aparece 2x
- `/candidato/mensagens` — aparece 2x
- `/candidato/configuracoes` — aparece 2x

Isso pode causar comportamento imprevisível na navegação.

**Problema 2: Ausência de Proteção de Rotas**
Qualquer pessoa pode acessar qualquer área da plataforma digitando a URL diretamente:
- Usuário não logado acessa `/admin/dashboard`
- Candidato acessa `/empresa/vagas`
- Empresa acessa `/candidato/perfil`

Isso compromete a segurança e a experiência do usuário.

---

## Conceito da Solução

### Situação Atual (As-Is)

```
┌─────────────┐     ┌─────────────┐
│   Usuário   │────▶│  Qualquer   │
│  (qualquer) │     │    Rota     │
└─────────────┘     └─────────────┘
        Sem verificação de autenticação ou permissão
```

- Rotas definidas sem wrapper de proteção
- AuthContext existe mas não é usado para bloquear acesso
- Usuário pode navegar livremente entre áreas

### Situação Desejada (To-Be)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Usuário   │────▶│ Protected   │────▶│    Rota     │
│             │     │   Route     │     │  Permitida  │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                          │ Se não autorizado
                          ▼
                   ┌─────────────┐
                   │  Redirect   │
                   │ Login/Home  │
                   └─────────────┘
```

- Componente `ProtectedRoute` envolve rotas privadas
- Verifica autenticação e tipo de usuário
- Redireciona automaticamente se não autorizado
- Rotas duplicadas removidas

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Verificação em cada página | Código duplicado, difícil manutenção |
| Middleware no servidor | Não há servidor, é SPA com mocks |
| HOC (Higher Order Component) | ProtectedRoute como wrapper é mais idiomático em React Router |

---

## Escopo

### Incluído

- ✅ Criação do componente `ProtectedRoute`
- ✅ Verificação de autenticação (usuário logado)
- ✅ Verificação de autorização (tipo de usuário correto)
- ✅ Redirecionamento para `/login` se não autenticado
- ✅ Redirecionamento para dashboard correto se tipo não permitido
- ✅ Remoção das rotas duplicadas no `App.tsx`
- ✅ Página 404 para rotas inexistentes
- ✅ Reorganização limpa das rotas por área

### Excluído

- ❌ Autenticação real (permanece mockada)
- ❌ Criação de novas páginas
- ❌ Alterações no fluxo de login/logout
- ❌ Persistência de sessão (localStorage/cookies)
- ❌ Refresh token ou expiração de sessão

---

## Requisitos Funcionais

### Proteção de Rotas

- **RF-001:** O sistema deve verificar se o usuário está autenticado antes de permitir acesso a rotas privadas
- **RF-002:** O sistema deve verificar se o tipo do usuário corresponde à área acessada (admin, empresa, candidato)
- **RF-003:** Usuários não autenticados devem ser redirecionados para `/login` ao tentar acessar rotas privadas
- **RF-004:** Usuários autenticados mas sem permissão devem ser redirecionados para seu dashboard correspondente
- **RF-005:** O sistema deve preservar a URL original para redirect após login (opcional, nice-to-have)

### Correção de Rotas

- **RF-006:** Cada rota deve aparecer apenas uma vez no arquivo de configuração
- **RF-007:** O sistema deve exibir página 404 para rotas não definidas
- **RF-008:** A navegação entre páginas da mesma área deve funcionar sem recarregar a página

### Estrutura de Permissões

- **RF-009:** Rotas sob `/admin/*` só podem ser acessadas por usuários do tipo `admin`
- **RF-010:** Rotas sob `/empresa/*` só podem ser acessadas por usuários do tipo `empresa`
- **RF-011:** Rotas sob `/candidato/*` só podem ser acessadas por usuários do tipo `candidato`
- **RF-012:** Rotas públicas (landing, login, register, etc.) devem ser acessíveis por qualquer pessoa

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Verificação de rota deve ocorrer em menos de 50ms
- **RNF-002 (UX):** Redirecionamento deve ser instantâneo, sem flash de conteúdo não autorizado
- **RNF-003 (Manutenibilidade):** Estrutura de rotas deve ser clara e fácil de estender
- **RNF-004 (Compatibilidade):** Deve funcionar com React Router DOM v6+

---

## Critérios de Aceitação

### RF-001/RF-003: Usuário Não Autenticado

```gherkin
DADO que o usuário não está logado
QUANDO ele tenta acessar "/admin/dashboard"
ENTÃO deve ser redirecionado para "/login"
  E a URL "/admin/dashboard" não deve carregar
```

```gherkin
DADO que o usuário não está logado
QUANDO ele tenta acessar "/empresa/vagas"
ENTÃO deve ser redirecionado para "/login"
```

```gherkin
DADO que o usuário não está logado
QUANDO ele tenta acessar "/candidato/perfil"
ENTÃO deve ser redirecionado para "/login"
```

### RF-002/RF-004: Usuário Sem Permissão

```gherkin
DADO que o usuário está logado como "candidato"
QUANDO ele tenta acessar "/admin/dashboard"
ENTÃO deve ser redirecionado para "/candidato/dashboard"
  E não deve ver conteúdo da área admin
```

```gherkin
DADO que o usuário está logado como "empresa"
QUANDO ele tenta acessar "/candidato/perfil"
ENTÃO deve ser redirecionado para "/empresa/dashboard"
```

```gherkin
DADO que o usuário está logado como "admin"
QUANDO ele tenta acessar "/empresa/vagas"
ENTÃO deve ser redirecionado para "/admin/dashboard"
```

### RF-006: Rotas Únicas

```gherkin
DADO que o arquivo App.tsx foi corrigido
QUANDO analisar as definições de rotas
ENTÃO cada path deve aparecer exatamente uma vez
  E não deve haver rotas duplicadas
```

### RF-007: Página 404

```gherkin
DADO que o usuário está navegando
QUANDO ele acessa uma URL inexistente como "/pagina-que-nao-existe"
ENTÃO deve ver uma página 404 amigável
  E deve haver link para voltar à home
```

### RF-012: Rotas Públicas

```gherkin
DADO que o usuário não está logado
QUANDO ele acessa "/" (landing page)
ENTÃO a página deve carregar normalmente
  E não deve haver redirecionamento
```

```gherkin
DADO que o usuário não está logado
QUANDO ele acessa "/como-funciona"
ENTÃO a página deve carregar normalmente
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Análise e planejamento | 0 |
| 2 | Criar componente ProtectedRoute | 1 |
| 3 | Corrigir e reorganizar rotas | 2 |
| 4 | Criar página 404 e validar | 2 |

### Detalhamento das Fases

#### Fase 1: Análise

**Objetivo:** Mapear estrutura atual e planejar alterações

**Ações:**
- [ ] Analisar `App.tsx` e listar todas as rotas atuais
- [ ] Identificar rotas duplicadas exatas
- [ ] Verificar estrutura do `AuthContext` (campos disponíveis)
- [ ] Mapear tipos de usuário existentes nos mocks

**Validação:** Documento mental/lista clara do que alterar

#### Fase 2: Componente ProtectedRoute

**Objetivo:** Criar o componente de proteção de rotas

**Ações:**
- [ ] Criar arquivo `src/components/auth/ProtectedRoute.tsx`
- [ ] Implementar verificação de autenticação
- [ ] Implementar verificação de tipo de usuário
- [ ] Implementar lógica de redirecionamento
- [ ] Tipar corretamente com TypeScript

**Validação:** Componente criado e importável, sem erros de TypeScript

#### Fase 3: Reorganização de Rotas

**Objetivo:** Aplicar proteção e corrigir duplicatas

**Ações:**
- [ ] Remover rotas duplicadas do `App.tsx`
- [ ] Envolver rotas privadas com `ProtectedRoute`
- [ ] Organizar rotas por área (públicas, admin, empresa, candidato)
- [ ] Garantir que rotas públicas permanecem acessíveis

**Validação:** 
- Nenhuma rota duplicada
- Rotas privadas protegidas
- Navegação funcionando

#### Fase 4: Página 404 e Validação Final

**Objetivo:** Completar a implementação e validar todos os cenários

**Ações:**
- [ ] Criar `src/pages/NotFound.tsx` (página 404)
- [ ] Adicionar rota catch-all para 404
- [ ] Testar todos os cenários de aceitação
- [ ] Verificar que não há flash de conteúdo

**Validação:** Todos os critérios de aceitação passando

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-001 | Remover referências Lovable | ⏳ Pendente |

> **Nota:** Este PRD pode ser implementado em paralelo ou após PRD-001, não há dependência bloqueante.

### Serviços Externos

Nenhum — a autenticação permanece mockada.

### Decisões Pendentes

- [ ] Definir comportamento exato quando usuário logado acessa `/login` (redirecionar para dashboard?)

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Tipo de usuário | Público (no contexto) | Verificação client-side |
| Estado de autenticação | Público (no contexto) | Verificação client-side |

> **Nota:** Esta é proteção de UX/navegação, não segurança real. Segurança real virá com autenticação de backend.

### Autenticação e Autorização

- Autenticação: mockada via `AuthContext`
- Autorização: verificação de `user.type` no client

### Auditoria

Não aplicável nesta fase (mocks).

---

## Fluxos de Usuário

### Fluxo 1: Usuário Não Autenticado Tenta Acessar Área Privada

```
[Usuário] ──▶ [Digita /admin/dashboard] ──▶ [ProtectedRoute]
                                                    │
                                                    ▼
                                            [Não autenticado?]
                                                    │ Sim
                                                    ▼
                                            [Redirect /login]
```

### Fluxo 2: Usuário Autenticado Acessa Área Errada

```
[Candidato logado] ──▶ [Digita /empresa/vagas] ──▶ [ProtectedRoute]
                                                          │
                                                          ▼
                                                  [Tipo != empresa?]
                                                          │ Sim
                                                          ▼
                                                  [Redirect /candidato/dashboard]
```

### Fluxo 3: Usuário Autenticado Acessa Área Correta

```
[Candidato logado] ──▶ [Digita /candidato/perfil] ──▶ [ProtectedRoute]
                                                             │
                                                             ▼
                                                     [Autenticado? ✓]
                                                     [Tipo correto? ✓]
                                                             │
                                                             ▼
                                                     [Renderiza página]
```

### Fluxo 4: Rota Inexistente

```
[Usuário] ──▶ [Digita /xyz] ──▶ [React Router]
                                      │
                                      ▼
                              [Nenhuma rota match]
                                      │
                                      ▼
                              [Renderiza NotFound]
```

---

## Estrutura de Rotas Esperada

Após implementação, o `App.tsx` deve ter estrutura similar a:

```
Rotas Públicas (sem proteção):
  /                     → Landing
  /login                → Login
  /cadastro             → Register
  /como-funciona        → HowItWorks
  /planos               → Plans

Rotas Admin (ProtectedRoute type="admin"):
  /admin/dashboard      → AdminDashboard
  /admin/empresas       → AdminEmpresas
  /admin/candidatos     → AdminCandidatos
  /admin/configuracoes  → AdminConfiguracoes

Rotas Empresa (ProtectedRoute type="empresa"):
  /empresa/dashboard    → EmpresaDashboard
  /empresa/vagas        → EmpresaJobs
  /empresa/candidatos   → EmpresaCandidatos
  /empresa/testes       → EmpresaTestes
  /empresa/mensagens    → EmpresaMessages
  /empresa/configuracoes→ EmpresaConfiguracoes

Rotas Candidato (ProtectedRoute type="candidato"):
  /candidato/dashboard    → CandidatoDashboard
  /candidato/perfil       → CandidatoProfile
  /candidato/vagas        → CandidatoJobSearch
  /candidato/candidaturas → CandidatoCandidaturas
  /candidato/testes       → CandidatoTests
  /candidato/mensagens    → CandidatoMessages
  /candidato/configuracoes→ CandidatoConfiguracoes

Rota Catch-all:
  *                     → NotFound (404)
```

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/) — **MINOR +1** (0.1.x → 0.2.0)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Atualizar o registro de versão no banco de dados (se aplicável)
> - Renomear este arquivo adicionando `_DONE` ao final
>   Ex: `PRD-002-protecao-e-correcao-rotas_DONE.md`
> - Atualizar a seção "Status de Implementação" com:
>   - Status: ✅ IMPLEMENTADO
>   - Data de Implementação
>   - Versão do App após implementação
>   - Observações relevantes

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 0.1.0 → 0.1.1 |
| **Nova funcionalidade** | **MINOR +1, PATCH = 0** | **0.1.1 → 0.2.0** |
| Mudança incompatível | MAJOR +1, outros = 0 | 0.2.0 → 1.0.0 |

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

```markdown
## [0.2.0] - 2025-01-XX

### Added
- Componente ProtectedRoute para proteção de rotas por tipo de usuário
- Página 404 (NotFound) para rotas inexistentes
- Redirecionamento automático baseado em autenticação e permissão

### Fixed
- Removidas rotas duplicadas no App.tsx
- Reorganizada estrutura de rotas por área

### Changed
- Rotas privadas agora exigem autenticação e tipo de usuário correto
```

🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | Se AuthContext falhar, assumir não autenticado |
| **Fail gracefully** | Redirecionar em caso de dúvida, nunca mostrar conteúdo indevido |
| **Preservar evidências** | Manter console.log em dev para debug de rotas |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas durante implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Localização do componente** | `src/components/auth/ProtectedRoute.tsx` |
| **Tipagem** | Usar TypeScript strict, tipar props do ProtectedRoute |
| **React Router** | Usar `<Navigate>` para redirecionamentos, não `useNavigate` em render |
| **AuthContext** | Consumir via `useAuth()` hook existente |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Alterar lógica do AuthContext (apenas consumir) |
| Criar autenticação real (permanece mock) |
| Usar `window.location` para redirect (usar React Router) |
| Mostrar flash de conteúdo antes de redirecionar |
| Criar rotas novas além da 404 |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 10/01/2025 |
| **Versão do App** | 0.2.0 |
| **Implementado por** | Claude Opus 4.5 via Claude Code CLI |
| **Observações** | Rotas duplicadas removidas. ProtectedRoute e RedirectIfAuthenticated criados. Todas as rotas privadas protegidas. |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 10/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
