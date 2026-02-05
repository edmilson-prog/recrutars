# TEMPLATE: Índice de PRDs do Projeto

> **AILA - Sistemas Inteligentes**  
> Template para catálogo centralizado de PRDs por projeto

---

## 📚 Documentos Relacionados

Este documento faz parte do sistema de documentação de PRDs da AILA - Sistemas Inteligentes.

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs — **consulte antes de criar PRDs** |
| `TEMPLATE-PRD-feature.md` | Template para novas funcionalidades |
| `TEMPLATE-PRD-correcao.md` | Template para correções de bugs |
| `TEMPLATE-PRD-integracao.md` | Template para integrações externas |
| **`TEMPLATE-INDEX-prds.md`** | ⬅ Você está aqui — Template do índice/catálogo de PRDs |

> **Propósito deste índice:** Manter visão consolidada de todos os PRDs do projeto, facilitando rastreabilidade, acompanhamento de status e identificação de dependências.

### Agentes do Workflow

| Agente | Modelo | Ambiente | Função |
|--------|--------|----------|--------|
| **Arquiteto** | Claude Opus 4.5 (Anthropic) | Plataforma Web (claude.ai) | Cria e mantém PRDs |
| **Desenvolvedor** | Claude Opus 4.5 (Anthropic) | Claude Code CLI v2.1.3 | Implementa PRDs |

---

## 📋 Como Usar Este Template

1. **Copie** este arquivo para a pasta raiz de PRDs do seu projeto
2. **Renomeie** para `INDEX-PRDs-[nome-projeto].md`
3. **Atualize** o cabeçalho com informações do projeto
4. **Mantenha atualizado** a cada novo PRD criado ou implementado
5. **Remova** esta seção de instruções após configurar

---

# Índice de PRDs — [Nome do Projeto]

## Informações do Projeto

| Campo | Valor |
|-------|-------|
| **Projeto** | [Nome do projeto] |
| **Repositório** | [URL do repositório Git] |
| **Início** | [Data de início] |
| **Versão Atual** | [X.Y.Z] |
| **Total de PRDs** | [N] |
| **PRDs Implementados** | [N] |
| **PRDs Pendentes** | [N] |

---

## Resumo de Status

| Status | Quantidade | Percentual |
|--------|------------|------------|
| ✅ Implementado | [N] | [X%] |
| 🔄 Em Andamento | [N] | [X%] |
| ⏳ Pendente | [N] | [X%] |
| ❌ Cancelado | [N] | [X%] |
| **Total** | **[N]** | **100%** |

---

## Catálogo de PRDs

### Por Status

#### ✅ Implementados

| PRD | Título | Tipo | Versão App | Data |
|-----|--------|------|------------|------|
| [PRD-001](./PRD-001-titulo_DONE.md) | [Título] | Feature | 1.0.0 | DD/MM/AA |
| [PRD-002](./PRD-002-titulo_DONE.md) | [Título] | Feature | 1.1.0 | DD/MM/AA |
| [PRD-003](./PRD-003-fix-titulo_DONE.md) | [Título] | Correção | 1.1.1 | DD/MM/AA |

#### 🔄 Em Andamento

| PRD | Título | Tipo | Responsável | Fase Atual |
|-----|--------|------|-------------|------------|
| [PRD-004](./PRD-004-titulo.md) | [Título] | Feature | [Nome] | Fase 2/4 |

#### ⏳ Pendentes

| PRD | Título | Tipo | Prioridade | Dependências |
|-----|--------|------|------------|--------------|
| [PRD-005](./PRD-005-titulo.md) | [Título] | Feature | Alta | PRD-004 |
| [PRD-006](./PRD-006-titulo.md) | [Título] | Integração | Média | - |

#### ❌ Cancelados

| PRD | Título | Motivo do Cancelamento | Data |
|-----|--------|------------------------|------|
| [PRD-007](./PRD-007-titulo_CANCELADO.md) | [Título] | [Motivo] | DD/MM/AA |

---

### Por Tipo

#### Features

| PRD | Título | Status | Complexidade |
|-----|--------|--------|--------------|
| [PRD-001](./PRD-001-titulo_DONE.md) | [Título] | ✅ | Média |
| [PRD-002](./PRD-002-titulo_DONE.md) | [Título] | ✅ | Alta |
| [PRD-004](./PRD-004-titulo.md) | [Título] | 🔄 | Média |
| [PRD-005](./PRD-005-titulo.md) | [Título] | ⏳ | Baixa |

#### Correções

| PRD | Título | Status | Severidade |
|-----|--------|--------|------------|
| [PRD-003](./PRD-003-fix-titulo_DONE.md) | [Título] | ✅ | Alta |

#### Integrações

| PRD | Título | Status | Serviço Externo |
|-----|--------|--------|-----------------|
| [PRD-006](./PRD-006-integracao-titulo.md) | [Título] | ⏳ | [Nome do serviço] |

---

### Por Módulo/Área

#### [Nome do Módulo 1]

| PRD | Título | Tipo | Status |
|-----|--------|------|--------|
| [PRD-001](./PRD-001-titulo_DONE.md) | [Título] | Feature | ✅ |
| [PRD-003](./PRD-003-fix-titulo_DONE.md) | [Título] | Correção | ✅ |

#### [Nome do Módulo 2]

| PRD | Título | Tipo | Status |
|-----|--------|------|--------|
| [PRD-002](./PRD-002-titulo_DONE.md) | [Título] | Feature | ✅ |
| [PRD-004](./PRD-004-titulo.md) | [Título] | Feature | 🔄 |

---

## Mapa de Dependências

```
PRD-001 (Base)
    │
    ├──▶ PRD-002 (depende de 001)
    │       │
    │       └──▶ PRD-004 (depende de 002)
    │               │
    │               └──▶ PRD-005 (depende de 004)
    │
    └──▶ PRD-003 (depende de 001)

PRD-006 (independente)
```

### Tabela de Dependências

| PRD | Depende de | Bloqueia |
|-----|-----------|----------|
| PRD-001 | - | PRD-002, PRD-003 |
| PRD-002 | PRD-001 | PRD-004 |
| PRD-003 | PRD-001 | - |
| PRD-004 | PRD-002 | PRD-005 |
| PRD-005 | PRD-004 | - |
| PRD-006 | - | - |

---

## Linha do Tempo

### Timeline de Implementação

```
Jan/2026  ────────────────────────────────────────────────────────▶
          │
          ├─ PRD-001 ✅ (v1.0.0)
          │
          ├─ PRD-002 ✅ (v1.1.0)
          │
          ├─ PRD-003 ✅ (v1.1.1)
          │
          └─ PRD-004 🔄 (em andamento)

Fev/2025  ────────────────────────────────────────────────────────▶
          │
          ├─ PRD-004 (conclusão prevista)
          │
          ├─ PRD-005 (início previsto)
          │
          └─ PRD-006 (início previsto)
```

### Histórico de Versões do App

| Versão | Data | PRDs Incluídos | Tipo |
|--------|------|----------------|------|
| 1.0.0 | DD/MM/AA | PRD-001 | Inicial |
| 1.1.0 | DD/MM/AA | PRD-002 | Minor |
| 1.1.1 | DD/MM/AA | PRD-003 | Patch |
| 1.2.0 | (previsto) | PRD-004 | Minor |

---

## Métricas

### Velocidade de Implementação

| Período | PRDs Criados | PRDs Implementados | Lead Time Médio |
|---------|--------------|-------------------|-----------------|
| [Mês/Ano] | [N] | [N] | [N dias] |
| [Mês/Ano] | [N] | [N] | [N dias] |

### Distribuição por Tipo

| Tipo | Total | Implementados | Taxa de Conclusão |
|------|-------|---------------|-------------------|
| Feature | [N] | [N] | [X%] |
| Correção | [N] | [N] | [X%] |
| Integração | [N] | [N] | [X%] |

### Distribuição por Complexidade

| Complexidade | Total | Implementados | Tempo Médio |
|--------------|-------|---------------|-------------|
| Baixa | [N] | [N] | [N dias] |
| Média | [N] | [N] | [N dias] |
| Alta | [N] | [N] | [N dias] |

---

## Próximos PRDs Planejados

| # | Título Provisório | Tipo | Prioridade | Estimativa |
|---|-------------------|------|------------|------------|
| [NNN] | [Descrição breve] | [Tipo] | [Alta/Média/Baixa] | [N dias] |
| [NNN] | [Descrição breve] | [Tipo] | [Alta/Média/Baixa] | [N dias] |

---

## Notas e Observações

### Decisões Importantes

| Data | Decisão | Impacto |
|------|---------|---------|
| [DD/MM/AA] | [Descrição da decisão] | [PRDs afetados] |

### Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| [Descrição] | [Alta/Média/Baixa] | [Alto/Médio/Baixo] | [Ação] |

### Lições Aprendidas

| PRD | Lição | Ação Futura |
|-----|-------|-------------|
| [PRD-NNN] | [O que aprendemos] | [O que fazer diferente] |

---

## Como Manter Este Índice

### Quando Atualizar

| Evento | Ação no Índice |
|--------|----------------|
| Novo PRD criado | Adicionar na seção "Pendentes" |
| PRD iniciado | Mover para "Em Andamento" |
| PRD implementado | Mover para "Implementados", atualizar versão |
| PRD cancelado | Mover para "Cancelados", documentar motivo |
| Nova versão do app | Atualizar "Histórico de Versões" |

### Checklist de Atualização

- [ ] Status do PRD atualizado
- [ ] Link do arquivo correto (com ou sem _DONE)
- [ ] Versão do app atualizada (se implementado)
- [ ] Dependências atualizadas
- [ ] Métricas recalculadas
- [ ] Timeline atualizada

---

## Última Atualização

| Campo | Valor |
|-------|-------|
| **Data** | [DD/MM/AAAA] |
| **Atualizado por** | [Nome] |
| **Motivo** | [Breve descrição da atualização] |

---

**AILA - Sistemas Inteligentes**
