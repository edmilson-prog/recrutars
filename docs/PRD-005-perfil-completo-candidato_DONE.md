# PRD-005: Perfil Completo do Candidato

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar página completa de perfil do candidato com edição de dados |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 5+ componentes, múltiplos formulários, estado complexo |

---

## Contexto do Problema

O candidato é a base do marketplace RecrutaRS. Para que empresas encontrem talentos adequados, os candidatos precisam ter perfis completos e atualizados.

Atualmente:
- A página de perfil (`/candidato/perfil`) existe mas está básica
- Não há como editar informações detalhadas
- Experiências e formações não podem ser gerenciadas
- Skills não estão estruturadas

Um perfil completo permite:
- Melhor matching com vagas
- Maior visibilidade no banco de talentos
- Informações precisas para empresas
- Base para testes comportamentais

---

## Conceito da Solução

### Situação Atual (As-Is)

```
┌─────────────────────────────────────┐
│         Perfil Básico               │
│  ┌─────────┐                        │
│  │  Foto   │  Nome                  │
│  └─────────┘  Email                 │
│               Cargo                 │
│                                     │
│  [Informações limitadas]            │
└─────────────────────────────────────┘
```

### Situação Desejada (To-Be)

```
┌─────────────────────────────────────────────────┐
│              Perfil Completo                    │
│  ┌─────────┐                                    │
│  │  Foto   │  Nome Completo         [Editar]   │
│  │ [Trocar]│  Título Profissional              │
│  └─────────┘  Localização | Pretensão Salarial │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Sobre Mim                        [Edit] │   │
│  │ "Descrição profissional..."             │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Experiência Profissional    [+ Adicionar]│   │
│  │ • Empresa X | Cargo | 2020-2023  [Edit] │   │
│  │ • Empresa Y | Cargo | 2018-2020  [Edit] │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Formação Acadêmica          [+ Adicionar]│   │
│  │ • Universidade | Curso | 2014-2018      │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Skills                      [+ Adicionar]│   │
│  │ [React] [TypeScript] [Node.js] [SQL]    │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Perfil em múltiplas páginas | UX fragmentada, mais cliques |
| Wizard de preenchimento | Complexidade desnecessária nesta fase |
| Integração LinkedIn | Dependência externa, fase futura |

---

## Escopo

### Incluído

- ✅ Seção de dados pessoais (nome, título, localização, pretensão salarial)
- ✅ Seção "Sobre Mim" com descrição profissional
- ✅ Seção de experiências profissionais (listar, adicionar, editar, remover)
- ✅ Seção de formação acadêmica (listar, adicionar, editar, remover)
- ✅ Seção de skills/competências (adicionar, remover)
- ✅ Upload de foto de perfil (mock — apenas preview local)
- ✅ Modo visualização e modo edição
- ✅ Validação de campos obrigatórios
- ✅ Feedback visual de salvamento (toast)

### Excluído

- ❌ Upload real de arquivos (será mock)
- ❌ Integração com LinkedIn ou outras redes
- ❌ Currículo em PDF (fase futura)
- ❌ Vídeo de apresentação
- ❌ Certificações (fase futura)
- ❌ Idiomas (fase futura)

---

## Requisitos Funcionais

### Dados Pessoais

- **RF-001:** O candidato deve poder visualizar seus dados pessoais (nome, email, título, localização, pretensão salarial)
- **RF-002:** O candidato deve poder editar seus dados pessoais através de modal ou formulário inline
- **RF-003:** O email não deve ser editável (vinculado à conta)
- **RF-004:** A pretensão salarial deve aceitar valor mínimo e máximo

### Foto de Perfil

- **RF-005:** O candidato deve poder visualizar sua foto de perfil atual
- **RF-006:** O candidato deve poder trocar a foto de perfil (upload mock — apenas preview)
- **RF-007:** Deve haver uma foto padrão (avatar) quando não houver foto cadastrada

### Sobre Mim

- **RF-008:** O candidato deve poder adicionar/editar uma descrição profissional
- **RF-009:** A descrição deve ter limite de caracteres (ex: 500 caracteres)
- **RF-010:** Deve exibir contador de caracteres durante edição

### Experiência Profissional

- **RF-011:** O candidato deve poder visualizar lista de experiências profissionais
- **RF-012:** O candidato deve poder adicionar nova experiência (empresa, cargo, período, descrição)
- **RF-013:** O candidato deve poder editar experiência existente
- **RF-014:** O candidato deve poder remover experiência (com confirmação)
- **RF-015:** Experiências devem ser ordenadas por data (mais recente primeiro)
- **RF-016:** Campo "até hoje" para emprego atual

### Formação Acadêmica

- **RF-017:** O candidato deve poder visualizar lista de formações
- **RF-018:** O candidato deve poder adicionar nova formação (instituição, curso, grau, período)
- **RF-019:** O candidato deve poder editar formação existente
- **RF-020:** O candidato deve poder remover formação (com confirmação)
- **RF-021:** Formações devem ser ordenadas por data (mais recente primeiro)

### Skills/Competências

- **RF-022:** O candidato deve poder visualizar suas skills como tags
- **RF-023:** O candidato deve poder adicionar nova skill (texto livre)
- **RF-024:** O candidato deve poder remover skill (clique no X)
- **RF-025:** Não deve permitir skills duplicadas
- **RF-026:** Skills devem ser exibidas em ordem alfabética

### Persistência

- **RF-027:** Alterações devem ser salvas no estado local (mock)
- **RF-028:** Deve exibir toast de confirmação ao salvar
- **RF-029:** Deve exibir toast de erro se falhar (simulado)

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Formulários devem responder em menos de 100ms
- **RNF-002 (UX):** Transições entre modo visualização e edição devem ser suaves
- **RNF-003 (Acessibilidade):** Formulários devem ser navegáveis por teclado
- **RNF-004 (Responsividade):** Layout deve funcionar de 320px a 1920px
- **RNF-005 (Validação):** Feedback de erro deve ser inline (abaixo do campo)

---

## Critérios de Aceitação

### RF-001/RF-002: Dados Pessoais

```gherkin
DADO que o candidato está na página de perfil
QUANDO ele clica em "Editar" nos dados pessoais
ENTÃO deve abrir formulário de edição
  E os campos devem estar preenchidos com valores atuais
  E deve haver botões "Salvar" e "Cancelar"
```

```gherkin
DADO que o candidato editou seus dados
QUANDO ele clica em "Salvar"
ENTÃO os dados devem ser atualizados
  E deve exibir toast "Dados atualizados com sucesso"
  E deve voltar ao modo visualização
```

### RF-011 a RF-016: Experiência Profissional

```gherkin
DADO que o candidato está na seção de experiências
QUANDO ele clica em "+ Adicionar"
ENTÃO deve abrir modal/formulário de nova experiência
  E deve ter campos: empresa, cargo, data início, data fim, descrição
  E deve ter checkbox "Trabalho atual"
```

```gherkin
DADO que o candidato preencheu uma nova experiência
QUANDO ele clica em "Salvar"
ENTÃO a experiência deve aparecer na lista
  E deve estar ordenada por data
  E deve exibir toast de confirmação
```

```gherkin
DADO que o candidato quer remover uma experiência
QUANDO ele clica no botão de remover
ENTÃO deve exibir confirmação "Tem certeza?"
  E se confirmar, deve remover da lista
  E deve exibir toast "Experiência removida"
```

### RF-022 a RF-026: Skills

```gherkin
DADO que o candidato está na seção de skills
QUANDO ele digita uma skill e pressiona Enter
ENTÃO a skill deve ser adicionada como tag
  E deve aparecer em ordem alfabética
  E o campo de input deve ser limpo
```

```gherkin
DADO que o candidato tenta adicionar skill duplicada
QUANDO ele digita uma skill já existente
ENTÃO deve exibir aviso "Skill já adicionada"
  E não deve duplicar a skill
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Análise e estrutura base | 2 |
| 2 | Dados pessoais e foto | 3 |
| 3 | Experiência profissional | 3 |
| 4 | Formação e Skills | 3 |
| 5 | Integração e validação | 2 |

### Detalhamento das Fases

#### Fase 1: Análise e Estrutura

**Objetivo:** Analisar página atual e definir estrutura de componentes

**Ações:**
- [ ] Analisar `src/pages/candidato/Profile.tsx` atual
- [ ] Verificar tipos em `src/types/candidate.ts`
- [ ] Definir estrutura de componentes (ProfileHeader, ExperienceSection, etc.)
- [ ] Criar componentes base/containers

**Validação:** Estrutura de componentes definida, tipos adequados

#### Fase 2: Dados Pessoais e Foto

**Objetivo:** Implementar seção de dados pessoais e foto de perfil

**Ações:**
- [ ] Criar componente `ProfileHeader` com foto e dados básicos
- [ ] Implementar modal/form de edição de dados pessoais
- [ ] Implementar upload de foto (preview local)
- [ ] Adicionar validação de campos

**Validação:** Dados pessoais editáveis, foto com preview

#### Fase 3: Experiência Profissional

**Objetivo:** Implementar CRUD de experiências

**Ações:**
- [ ] Criar componente `ExperienceSection`
- [ ] Criar componente `ExperienceCard`
- [ ] Criar modal `ExperienceForm` (add/edit)
- [ ] Implementar lógica de ordenação por data
- [ ] Implementar confirmação de remoção

**Validação:** CRUD completo de experiências funcionando

#### Fase 4: Formação e Skills

**Objetivo:** Implementar formação acadêmica e skills

**Ações:**
- [ ] Criar componente `EducationSection`
- [ ] Criar componente `EducationCard`
- [ ] Criar modal `EducationForm` (add/edit)
- [ ] Criar componente `SkillsSection` com tags
- [ ] Implementar adição/remoção de skills
- [ ] Validar duplicatas de skills

**Validação:** CRUD de formação e gestão de skills funcionando

#### Fase 5: Integração e Validação

**Objetivo:** Integrar todas as seções e validar

**Ações:**
- [ ] Integrar todos os componentes na página Profile
- [ ] Implementar toasts de feedback
- [ ] Testar responsividade
- [ ] Testar fluxo completo de edição
- [ ] Verificar acessibilidade básica (teclado)

**Validação:** Página completa funcionando em todos os cenários

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-002 | Proteção de Rotas | ✅ Implementado |
| PRD-003 | Header/Footer Glassmorphism | ✅ Implementado |
| PRD-004 | Tipos TypeScript | ✅ Implementado |

> **Dependência:** PRD-004 (Tipos) deve estar implementado para usar as interfaces `Candidate`, `Experience`, `Education`.

### Serviços Externos

Nenhum — dados em mock.

### Decisões Pendentes

Nenhuma.

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Nome, email | PII | Apenas visualização própria |
| Pretensão salarial | Sensível | Visível apenas para empresas interessadas (futuro) |

### Validação

- Sanitizar inputs de texto (prevenir XSS)
- Validar tamanho máximo de campos

---

## Fluxos de Usuário

### Fluxo: Editar Dados Pessoais

```
[Candidato] ──▶ [Clica "Editar"] ──▶ [Modal abre]
                                          │
                                          ▼
                                    [Edita campos]
                                          │
                                          ▼
                                    [Clica "Salvar"]
                                          │
                                          ▼
                               [Toast: "Dados atualizados"]
                                          │
                                          ▼
                               [Modal fecha, dados atualizados]
```

### Fluxo: Adicionar Experiência

```
[Candidato] ──▶ [Clica "+ Adicionar"] ──▶ [Modal abre]
                                               │
                                               ▼
                                     [Preenche formulário]
                                               │
                                               ▼
                                     [Clica "Salvar"]
                                               │
                                               ▼
                                    [Experiência na lista]
                                               │
                                               ▼
                                  [Toast: "Experiência adicionada"]
```

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."
>
> **Especificamente:**
> - Verifique se PRD-004 (Tipos) já foi implementado
> - Analise a página Profile.tsx atual
> - Verifique componentes de UI disponíveis (shadcn/ui)

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/) — **MINOR +1** (0.4.0 → 0.5.0)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Renomear este arquivo adicionando `_DONE` ao final
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 0.4.0 → 0.4.1 |
| **Nova funcionalidade** | **MINOR +1, PATCH = 0** | **0.4.0 → 0.5.0** |
| Mudança incompatível | MAJOR +1, outros = 0 | 0.5.0 → 1.0.0 |

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

```markdown
## [0.5.0] - 2026-01-XX

### Added
- Página de perfil completo do candidato
- Edição de dados pessoais com validação
- CRUD de experiências profissionais
- CRUD de formação acadêmica
- Gestão de skills com tags
- Upload de foto de perfil (preview local)
```

🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Componentes reutilizáveis** | ExperienceCard, EducationCard podem ser usados em outros contextos |
| **Estado local** | Usar useState/useReducer para formulários |
| **Feedback imediato** | Toast em toda ação de salvar/remover |
| **Validação inline** | Erros abaixo dos campos, não em alert |
| **Documentar decisões** | Comentar escolhas não óbvias |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Modais** | Usar Dialog do shadcn/ui |
| **Forms** | Usar react-hook-form se disponível, ou controlled components |
| **Toast** | Usar toast do shadcn/ui (já configurado) |
| **Ícones** | Usar Lucide React |
| **Datas** | Inputs tipo month (YYYY-MM) para simplicidade |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Upload real de arquivos (usar FileReader para preview) |
| Integração com APIs externas |
| Lógica de backend/persistência real |
| Validação complexa (CPF, etc.) nesta fase |
| Componentes muito acoplados |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 11/01/2026 |
| **Versão do App** | 0.5.0 |
| **Implementado por** | Agente Desenvolvedor (Claude Opus 4.5 via Claude Code CLI) |
| **Observações** | Implementado na página Profile.tsx existente. Tipos Experience e Education adicionados em candidate.ts. |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 10/01/2026 | v1 | Criação inicial |
| 11/01/2026 | v2 | Implementação concluída (v0.5.0) |

---

**AILA - Sistemas Inteligentes**
