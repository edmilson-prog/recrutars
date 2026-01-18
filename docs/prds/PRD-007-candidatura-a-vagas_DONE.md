# PRD-007: Candidatura a Vagas

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar fluxo completo de candidatura do candidato a uma vaga |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 3-4 componentes, lógica de estado, validações |

---

## Contexto do Problema

O objetivo principal do candidato na plataforma é se candidatar a vagas. Este é o momento de conversão — quando o candidato decide investir seu tempo em uma oportunidade.

Atualmente:
- Não há fluxo de candidatura implementado
- Botão "Candidatar-se" não tem ação definida
- Não há registro de candidaturas do candidato
- Não há feedback do processo

Um fluxo de candidatura eficiente:
- Converte interesse em ação
- Registra intenção do candidato
- Alimenta o pipeline da empresa
- Gera dados para matching futuro

---

## Conceito da Solução

### Situação Atual (As-Is)

```
[Candidato vê vaga] ──▶ [Clica "Candidatar-se"] ──▶ [Nada acontece]
```

### Situação Desejada (To-Be)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Fluxo de Candidatura                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Candidato vê vaga] ──▶ [Clica "Candidatar-se"]               │
│                                   │                             │
│                                   ▼                             │
│                    ┌──────────────────────────┐                 │
│                    │   Modal de Confirmação   │                 │
│                    │                          │                 │
│                    │   Vaga: Dev React Sr     │                 │
│                    │   Empresa: TechCorp      │                 │
│                    │                          │                 │
│                    │   Seu perfil será        │                 │
│                    │   enviado para análise.  │                 │
│                    │                          │                 │
│                    │   □ Adicionar mensagem   │                 │
│                    │     ao recrutador        │                 │
│                    │                          │                 │
│                    │  [Cancelar] [Confirmar]  │                 │
│                    └──────────────────────────┘                 │
│                                   │                             │
│                                   ▼ (se confirmar)              │
│                    ┌──────────────────────────┐                 │
│                    │   ✅ Candidatura         │                 │
│                    │      Enviada!            │                 │
│                    │                          │                 │
│                    │   Acompanhe em           │                 │
│                    │   "Minhas Candidaturas"  │                 │
│                    │                          │                 │
│                    │   [Ver Candidaturas]     │                 │
│                    │   [Continuar Buscando]   │                 │
│                    └──────────────────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Candidatura em 1 clique | Pode gerar candidaturas acidentais |
| Formulário extenso | Fricção desnecessária, dados já estão no perfil |
| Sem confirmação | Usuário não tem certeza se funcionou |

---

## Escopo

### Incluído

- ✅ Modal de confirmação antes de candidatar
- ✅ Opção de adicionar mensagem personalizada ao recrutador
- ✅ Validação de perfil mínimo (nome, email preenchidos)
- ✅ Prevenção de candidatura duplicada
- ✅ Feedback visual de sucesso
- ✅ Registro da candidatura no mock de dados
- ✅ Redirecionamento para "Minhas Candidaturas" ou voltar à busca

### Excluído

- ❌ Anexar currículo (fase futura)
- ❌ Responder perguntas customizadas da empresa
- ❌ Teste comportamental obrigatório pré-candidatura
- ❌ Notificação por email (será mock)
- ❌ Chat com recrutador

---

## Requisitos Funcionais

### Iniciar Candidatura

- **RF-001:** O botão "Candidatar-se" deve estar presente na página de detalhes da vaga
- **RF-002:** Ao clicar, deve abrir modal de confirmação
- **RF-003:** O modal deve exibir resumo da vaga (título, empresa)
- **RF-004:** Se o candidato já se candidatou, botão deve mostrar "Já candidatado" (desabilitado)

### Validações

- **RF-005:** O sistema deve verificar se o perfil do candidato está minimamente completo
- **RF-006:** Se perfil incompleto, deve exibir aviso e link para completar perfil
- **RF-007:** O sistema deve impedir candidatura duplicada à mesma vaga

### Mensagem Opcional

- **RF-008:** O candidato pode adicionar mensagem personalizada (opcional)
- **RF-009:** A mensagem deve ter limite de caracteres (ex: 500)
- **RF-010:** Deve exibir contador de caracteres

### Confirmação

- **RF-011:** Ao confirmar, deve registrar a candidatura com status "pendente"
- **RF-012:** Deve registrar timestamp da candidatura
- **RF-013:** Deve exibir tela/modal de sucesso
- **RF-014:** Tela de sucesso deve ter opções: "Ver Minhas Candidaturas" ou "Continuar Buscando"

### Feedback

- **RF-015:** Deve exibir toast de confirmação "Candidatura enviada com sucesso!"
- **RF-016:** Na listagem de vagas, vagas já candidatadas devem ter indicador visual

---

## Requisitos Não-Funcionais

- **RNF-001 (UX):** Fluxo deve ter no máximo 2 cliques (botão → confirmar)
- **RNF-002 (Feedback):** Ações devem ter feedback em menos de 200ms
- **RNF-003 (Acessibilidade):** Modal deve ser acessível por teclado (ESC para fechar)
- **RNF-004 (Responsividade):** Modal deve funcionar em mobile

---

## Critérios de Aceitação

### RF-001 a RF-003: Iniciar Candidatura

```gherkin
DADO que o candidato está na página de detalhes de uma vaga
QUANDO ele clica em "Candidatar-se"
ENTÃO deve abrir modal de confirmação
  E deve exibir título da vaga
  E deve exibir nome da empresa
  E deve ter botões "Cancelar" e "Confirmar"
```

### RF-004/RF-007: Prevenção de Duplicata

```gherkin
DADO que o candidato já se candidatou a uma vaga
QUANDO ele acessa a página de detalhes dessa vaga
ENTÃO o botão deve mostrar "Já candidatado"
  E o botão deve estar desabilitado
  E não deve abrir modal ao clicar
```

### RF-005/RF-006: Validação de Perfil

```gherkin
DADO que o candidato tem perfil incompleto (sem nome ou email)
QUANDO ele tenta se candidatar
ENTÃO deve exibir mensagem "Complete seu perfil para se candidatar"
  E deve ter link para página de perfil
  E não deve permitir prosseguir
```

### RF-011 a RF-014: Confirmação

```gherkin
DADO que o candidato confirmou a candidatura
QUANDO o sistema registra com sucesso
ENTÃO deve fechar o modal de confirmação
  E deve exibir tela/modal de sucesso
  E deve ter opção "Ver Minhas Candidaturas"
  E deve ter opção "Continuar Buscando"
```

### RF-008 a RF-010: Mensagem Opcional

```gherkin
DADO que o modal de confirmação está aberto
QUANDO o candidato marca "Adicionar mensagem ao recrutador"
ENTÃO deve expandir campo de texto
  E deve exibir contador de caracteres (0/500)
  E a mensagem deve ser salva junto com a candidatura
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Modal de confirmação | 2 |
| 2 | Lógica de candidatura | 2 |
| 3 | Feedback e integrações | 2 |

### Detalhamento das Fases

#### Fase 1: Modal de Confirmação

**Objetivo:** Criar modal de confirmação de candidatura

**Ações:**
- [ ] Criar componente `ApplicationModal`
- [ ] Implementar exibição de resumo da vaga
- [ ] Implementar campo de mensagem opcional
- [ ] Implementar botões Cancelar/Confirmar

**Validação:** Modal abre e fecha corretamente

#### Fase 2: Lógica de Candidatura

**Objetivo:** Implementar registro e validações

**Ações:**
- [ ] Criar função de registro de candidatura no mock
- [ ] Implementar validação de perfil mínimo
- [ ] Implementar verificação de duplicata
- [ ] Atualizar estado global/context com nova candidatura

**Validação:** Candidatura é registrada, duplicatas são impedidas

#### Fase 3: Feedback e Integrações

**Objetivo:** Implementar feedback e integrar com outras páginas

**Ações:**
- [ ] Criar tela/modal de sucesso
- [ ] Implementar toast de confirmação
- [ ] Atualizar botão na página de detalhes (já candidatado)
- [ ] Adicionar indicador visual na listagem de vagas
- [ ] Implementar navegação pós-candidatura

**Validação:** Fluxo completo funcionando com feedback visual

---

## Modelo de Dados

### Candidatura (Application)

```typescript
interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus; // "pendente"
  message?: string; // mensagem opcional
  appliedAt: string; // ISO timestamp
  updatedAt: string;
}

type ApplicationStatus = "pendente" | "em_analise" | "aprovado" | "reprovado" | "desistencia";
```

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-004 | Tipos TypeScript | ⏳ Pendente |
| PRD-005 | Perfil do Candidato | ⏳ Pendente |
| PRD-006 | Busca de Vagas | ⏳ Pendente |

> **Dependência crítica:** PRD-006 implementa a página de detalhes onde o botão existe.

### PRDs Seguintes

| PRD | Descrição |
|-----|-----------|
| PRD-008 | Minhas Candidaturas (acompanhamento) |

---

## Fluxos de Usuário

### Fluxo Principal: Candidatura com Sucesso

```
[Detalhes da Vaga] ──▶ [Clica "Candidatar-se"]
                              │
                              ▼
                    [Modal de Confirmação]
                              │
                              ▼
                    [Clica "Confirmar"]
                              │
                              ▼
                    [Candidatura Registrada]
                              │
                              ▼
                    [Modal de Sucesso]
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
    [Ver Minhas Candidaturas]      [Continuar Buscando]
```

### Fluxo Alternativo: Perfil Incompleto

```
[Detalhes da Vaga] ──▶ [Clica "Candidatar-se"]
                              │
                              ▼
                    [Validação de Perfil]
                              │
                              ▼ (perfil incompleto)
                    [Aviso: Complete seu perfil]
                              │
                              ▼
                    [Link para /candidato/perfil]
```

### Fluxo Alternativo: Já Candidatado

```
[Detalhes da Vaga]
        │
        ▼
[Botão: "Já candidatado" (desabilitado)]
        │
        ▼
[Nenhuma ação ao clicar]
```

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."
>
> **Especificamente:**
> - Verifique se PRD-006 já implementou a página de detalhes
> - Verifique estrutura do mockData para candidaturas
> - Verifique tipos em `src/types/application.ts`

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.6.0 → 0.7.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 0.6.0 → 0.6.1 |
| **Nova funcionalidade** | **MINOR +1** | **0.6.0 → 0.7.0** |

### Changelog

```markdown
## [0.7.0] - 2026-01-XX

### Added
- Fluxo de candidatura a vagas
- Modal de confirmação com resumo da vaga
- Campo opcional de mensagem ao recrutador
- Validação de perfil mínimo
- Prevenção de candidatura duplicada
- Tela de sucesso pós-candidatura
- Indicador visual de "já candidatado"
```

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Mínima fricção** | 2 cliques no máximo |
| **Feedback claro** | Usuário sempre sabe o que aconteceu |
| **Prevenção de erros** | Validar antes de permitir ação |
| **Reversibilidade** | Cancelar deve ser fácil |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Modal** | Usar Dialog do shadcn/ui |
| **Toast** | Usar toast do shadcn/ui |
| **Estado** | Considerar context ou estado local |
| **Mock** | Adicionar candidatura ao array de applications |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Enviar dados para backend real |
| Fluxo com mais de 2 cliques |
| Candidatura sem confirmação |
| Permitir duplicatas |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Observações** | Depende de PRD-004, PRD-005, PRD-006 |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 10/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
