# PRD-004: Tipos e Interfaces TypeScript

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Criar contratos de dados tipados para todas as entidades do sistema |
| **Tipo** | Feature |
| **Complexidade** | Baixa |
| **Total de Fases** | 3 |
| **Prioridade** | Alta |
| **Padrão de código** | PascalCase para tipos/interfaces, camelCase para propriedades |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | Criação de arquivos de tipos, sem lógica de negócio, < 100 linhas por arquivo |

---

## Contexto do Problema

O projeto RecrutaRS utiliza dados mockados no arquivo `src/data/mockData.ts`. Atualmente:

- Os dados não possuem tipagem explícita (inferência automática do TypeScript)
- Não há contratos claros que definam a estrutura das entidades
- Componentes podem acessar propriedades inexistentes sem erro em dev
- Refatorações são arriscadas — não há validação de tipos em compile time
- A futura migração para banco de dados real não tem especificação clara

A criação de tipos e interfaces trará:
- Contratos claros para todas as entidades
- Erros detectados em tempo de desenvolvimento
- Autocompletar inteligente na IDE
- Documentação viva do modelo de dados
- Base sólida para migração futura para banco real

---

## Conceito da Solução

### Situação Atual (As-Is)

```typescript
// mockData.ts - sem tipagem explícita
export const users = [
  { id: "1", name: "João", email: "joao@email.com", type: "candidato" },
  // ...
];

// Componente - pode acessar propriedades erradas sem erro
const userName = user.nome; // deveria ser user.name - sem erro!
```

### Situação Desejada (To-Be)

```typescript
// types/user.ts
export type UserType = "admin" | "empresa" | "candidato";

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  avatar?: string;
}

// mockData.ts - com tipagem
import { User } from "@/types";

export const users: User[] = [
  { id: "1", name: "João", email: "joao@email.com", type: "candidato" },
];

// Componente - erro detectado em compile time
const userName = user.nome; // ERRO: Property 'nome' does not exist
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Usar `any` ou `unknown` | Perde benefícios do TypeScript |
| Gerar tipos automaticamente | Não há fonte de verdade (banco) ainda |
| Usar Zod para validação runtime | Adiciona complexidade desnecessária nesta fase |

---

## Escopo

### Incluído

- ✅ Criar pasta `src/types/` com estrutura organizada
- ✅ Interface `User` e tipo `UserType`
- ✅ Interface `Company`
- ✅ Interface `Candidate` com `Experience` e `Education`
- ✅ Interface `Job` com `JobStatus` e `JobType`
- ✅ Interface `Application` com `ApplicationStatus`
- ✅ Interface `BehavioralTest` com `TestResult` e `TestStatus`
- ✅ Interface `Message`
- ✅ Arquivo `index.ts` re-exportando todos os tipos
- ✅ Atualizar `mockData.ts` para usar os tipos criados
- ✅ Configurar path alias `@/types` se necessário

### Excluído

- ❌ Validação em runtime (Zod, Yup, io-ts)
- ❌ Alteração de componentes existentes
- ❌ Criação de novos campos além dos existentes
- ❌ Funções utilitárias ou helpers
- ❌ Testes unitários (fase futura)

---

## Requisitos Funcionais

### Estrutura de Arquivos

- **RF-001:** Deve existir pasta `src/types/` contendo todos os arquivos de tipos
- **RF-002:** Deve existir arquivo `src/types/index.ts` que re-exporta todos os tipos
- **RF-003:** Cada domínio deve ter seu próprio arquivo de tipos

### Tipos de Usuário

- **RF-004:** Deve existir tipo `UserType` com valores: `"admin"`, `"empresa"`, `"candidato"`
- **RF-005:** Deve existir interface `User` com campos: id, name, email, type, avatar (opcional)

### Tipos de Empresa

- **RF-006:** Deve existir interface `Company` com campos: id, name, industry, size, location, logo, description (opcional)

### Tipos de Candidato

- **RF-007:** Deve existir interface `Candidate` com campos: id, userId, name, title, skills, expectedSalary, hasTest, avatar, location
- **RF-008:** Deve existir interface `Experience` com campos: id, company, role, startDate, endDate (opcional), description
- **RF-009:** Deve existir interface `Education` com campos: id, institution, degree, field, startDate, endDate (opcional)

### Tipos de Vaga

- **RF-010:** Deve existir tipo `JobType` com valores: `"clt"`, `"pj"`, `"freelancer"`, `"estagio"`
- **RF-011:** Deve existir tipo `JobStatus` com valores: `"aberta"`, `"pausada"`, `"encerrada"`
- **RF-012:** Deve existir interface `Job` com campos: id, title, companyId, type, salary (min/max), status, description, requirements, benefits, location, createdAt

### Tipos de Candidatura

- **RF-013:** Deve existir tipo `ApplicationStatus` com valores: `"pendente"`, `"em_analise"`, `"aprovado"`, `"reprovado"`, `"desistencia"`
- **RF-014:** Deve existir interface `Application` com campos: id, jobId, candidateId, status, appliedAt, updatedAt

### Tipos de Teste Comportamental

- **RF-015:** Deve existir tipo `TestStatus` com valores: `"pendente"`, `"em_andamento"`, `"concluido"`, `"expirado"`
- **RF-016:** Deve existir interface `TestResult` com campos para perfil comportamental (a definir baseado no Gauge-Pro)
- **RF-017:** Deve existir interface `BehavioralTest` com campos: id, candidateId, status, result (opcional), startedAt, completedAt (opcional)

### Tipos de Mensagem

- **RF-018:** Deve existir interface `Message` com campos: id, senderId, receiverId, content, timestamp, read

### Integração com Mocks

- **RF-019:** O arquivo `mockData.ts` deve importar e usar os tipos criados
- **RF-020:** Todos os arrays de mock devem ter tipagem explícita (ex: `User[]`)

---

## Requisitos Não-Funcionais

- **RNF-001 (Manutenibilidade):** Cada arquivo de tipo deve ter menos de 100 linhas
- **RNF-002 (Organização):** Tipos relacionados devem estar no mesmo arquivo
- **RNF-003 (Documentação):** Tipos complexos devem ter comentários JSDoc
- **RNF-004 (Compatibilidade):** Tipos devem ser compatíveis com TypeScript 5.x

---

## Critérios de Aceitação

### RF-001/RF-002: Estrutura de Arquivos

```gherkin
DADO que o desenvolvedor precisa usar tipos
QUANDO ele importa de "@/types"
ENTÃO todos os tipos devem estar disponíveis
  E não deve haver erros de importação
```

### RF-004/RF-005: Tipos de Usuário

```gherkin
DADO que existe a interface User
QUANDO um objeto é tipado como User
ENTÃO o TypeScript deve validar os campos obrigatórios (id, name, email, type)
  E deve aceitar campos opcionais (avatar)
  E deve rejeitar campos inexistentes
```

### RF-019/RF-020: Integração com Mocks

```gherkin
DADO que mockData.ts usa os tipos criados
QUANDO o projeto é compilado (npm run build)
ENTÃO não deve haver erros de tipo
  E os mocks devem estar corretamente tipados
```

### Validação Geral

```gherkin
DADO que todos os tipos foram criados
QUANDO executar "npx tsc --noEmit"
ENTÃO não deve haver erros de compilação
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Análise do mockData.ts e criação da estrutura | 1 |
| 2 | Criação dos arquivos de tipos | 8 |
| 3 | Integração com mockData.ts e validação | 1 |

### Detalhamento das Fases

#### Fase 1: Análise e Estrutura

**Objetivo:** Mapear entidades existentes e criar estrutura de pastas

**Ações:**
- [ ] Analisar `src/data/mockData.ts` e listar todas as entidades
- [ ] Identificar campos de cada entidade
- [ ] Identificar relacionamentos entre entidades
- [ ] Criar pasta `src/types/`
- [ ] Verificar/configurar path alias `@/types` no tsconfig.json

**Validação:** Pasta criada, mapeamento completo das entidades

#### Fase 2: Criação dos Tipos

**Objetivo:** Implementar todos os tipos e interfaces

**Ações:**
- [ ] Criar `src/types/user.ts` (User, UserType)
- [ ] Criar `src/types/company.ts` (Company)
- [ ] Criar `src/types/candidate.ts` (Candidate, Experience, Education)
- [ ] Criar `src/types/job.ts` (Job, JobType, JobStatus)
- [ ] Criar `src/types/application.ts` (Application, ApplicationStatus)
- [ ] Criar `src/types/test.ts` (BehavioralTest, TestResult, TestStatus)
- [ ] Criar `src/types/message.ts` (Message)
- [ ] Criar `src/types/index.ts` (re-exporta tudo)

**Validação:** Todos os arquivos criados, sem erros de TypeScript

#### Fase 3: Integração e Validação

**Objetivo:** Aplicar tipos ao mockData e validar compilação

**Ações:**
- [ ] Atualizar imports em `src/data/mockData.ts`
- [ ] Adicionar tipagem explícita a todos os arrays de mock
- [ ] Executar `npx tsc --noEmit` para validar
- [ ] Executar `npm run build` para garantir build funcional
- [ ] Corrigir eventuais inconsistências entre mock e tipos

**Validação:** Build passa sem erros, tipos aplicados corretamente

---

## Especificação Técnica

### Estrutura de Arquivos Final

```
src/
├── types/
│   ├── index.ts           # Re-exporta tudo
│   ├── user.ts            # User, UserType
│   ├── company.ts         # Company
│   ├── candidate.ts       # Candidate, Experience, Education
│   ├── job.ts             # Job, JobType, JobStatus
│   ├── application.ts     # Application, ApplicationStatus
│   ├── test.ts            # BehavioralTest, TestResult, TestStatus
│   └── message.ts         # Message
└── data/
    └── mockData.ts        # Atualizado com imports de tipos
```

### Exemplos de Tipos (Referência)

```typescript
// types/user.ts
export type UserType = "admin" | "empresa" | "candidato";

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  avatar?: string;
}

// types/job.ts
export type JobType = "clt" | "pj" | "freelancer" | "estagio";
export type JobStatus = "aberta" | "pausada" | "encerrada";

export interface Job {
  id: string;
  title: string;
  companyId: string;
  type: JobType;
  salary: {
    min: number;
    max: number;
  };
  status: JobStatus;
  description: string;
  requirements: string[];
  benefits?: string[];
  location: string;
  createdAt: string; // ISO date string
}

// types/index.ts
export * from "./user";
export * from "./company";
export * from "./candidate";
export * from "./job";
export * from "./application";
export * from "./test";
export * from "./message";
```

> **Nota:** Esta é apenas referência. O desenvolvedor deve analisar o `mockData.ts` real e ajustar conforme necessário.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-001 | Remover referências Lovable | ✅ Implementado |
| PRD-002 | Proteção e Correção de Rotas | ✅ Implementado |
| PRD-003 | Header e Footer com Glassmorphism | ⏳ Pendente |

> **Nota:** Este PRD pode ser implementado em paralelo com PRD-003, não há dependência bloqueante.

### Serviços Externos

Nenhum.

### Decisões Pendentes

- [ ] Estrutura exata do `TestResult` (depende da especificação do Gauge-Pro)

---

## Considerações de Segurança

Não aplicável — PRD de estruturação de código, sem dados sensíveis.

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."
>
> **Especificamente para este PRD:**
> - Analise o `mockData.ts` COMPLETO antes de criar qualquer tipo
> - Identifique TODOS os campos de cada entidade
> - Identifique campos opcionais vs obrigatórios
> - Verifique relacionamentos entre entidades (ex: Job tem companyId)

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/) — **MINOR +1** (0.3.0 → 0.4.0)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Renomear este arquivo adicionando `_DONE` ao final
>   Ex: `PRD-004-tipos-interfaces-typescript_DONE.md`
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 0.3.0 → 0.3.1 |
| **Nova funcionalidade** | **MINOR +1, PATCH = 0** | **0.3.0 → 0.4.0** |
| Mudança incompatível | MAJOR +1, outros = 0 | 0.4.0 → 1.0.0 |

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

```markdown
## [0.4.0] - 2026-01-XX

### Added
- Pasta src/types/ com tipos TypeScript para todas as entidades
- Interface User e tipo UserType
- Interface Company
- Interface Candidate com Experience e Education
- Interface Job com JobType e JobStatus
- Interface Application com ApplicationStatus
- Interface BehavioralTest com TestResult e TestStatus
- Interface Message
- Arquivo index.ts com re-exportação centralizada

### Changed
- mockData.ts atualizado para usar tipos explícitos
```

🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Fidelidade ao mock** | Tipos devem refletir exatamente o que existe no mock |
| **Campos opcionais** | Usar `?` para campos que podem não existir |
| **Union types** | Preferir union types (`"a" \| "b"`) a enums para status |
| **Consistência** | Manter padrão de nomenclatura em todos os arquivos |
| **Documentar decisões** | Comentar decisões não óbvias com JSDoc |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Nomenclatura** | PascalCase para tipos/interfaces, camelCase para propriedades |
| **Datas** | Usar `string` (ISO format) — conversão para Date fica nos componentes |
| **IDs** | Usar `string` — compatível com UUID futuro |
| **Arrays** | Usar `Type[]` em vez de `Array<Type>` |
| **Exportação** | Usar named exports, não default |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Criar campos que não existem no mock |
| Usar `any` ou `unknown` |
| Usar `enum` (preferir union types) |
| Criar lógica de validação (apenas tipos) |
| Alterar componentes existentes |
| Usar default exports |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 11/01/2026 |
| **Versão do App** | 0.4.0 |
| **Implementado por** | Claude Opus 4.5 (Claude Code CLI) |
| **Observações** | Valores mantidos em inglês para fidelidade ao mock existente |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 10/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
