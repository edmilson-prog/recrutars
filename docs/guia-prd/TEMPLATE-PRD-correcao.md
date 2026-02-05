# TEMPLATE: PRD de Correção (Bug Fix)

> **AILA - Sistemas Inteligentes**  
> Template para documentação de correções de bugs

---

## 📚 Documentos Relacionados

Este documento faz parte do sistema de documentação de PRDs da AILA - Sistemas Inteligentes.

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs — **consulte antes de usar este template** |
| `TEMPLATE-PRD-feature.md` | Template para novas funcionalidades |
| **`TEMPLATE-PRD-correcao.md`** | ⬅ Você está aqui — Template para correções de bugs |
| `TEMPLATE-PRD-integracao.md` | Template para integrações externas |
| `TEMPLATE-INDEX-prds.md` | Template do índice/catálogo de PRDs por projeto |

> **Quando usar este template:** Para correções de bugs, fixes, ajustes de comportamento incorreto, ou problemas que precisam ser resolvidos em funcionalidades existentes.

---

## 📋 Como Usar Este Template

1. **Copie** este arquivo para a pasta de PRDs do seu projeto
2. **Renomeie** seguindo o padrão: `PRD-NNN-fix-titulo-descritivo.md`
3. **Substitua** todos os textos entre `[colchetes]` com informações reais
4. **Remova** esta seção de instruções após preencher
5. **Consulte** o `GuiaPRD.md` para orientações detalhadas

---

# PRD-NNN: [Fix] [Título Descritivo do Bug]

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | [Nome do projeto ou módulo] |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Corrigir: [descrição concisa do bug] |
| **Tipo** | Correção |
| **Complexidade** | [Baixa / Média / Alta] |
| **Total de Fases** | [N] |
| **Prioridade** | [Crítica / Alta / Média / Baixa] |
| **Severidade** | [Bloqueante / Alta / Média / Baixa] |
| **Épico** | [Nome da tarefa maior, se aplicável] |
| **PRDs Relacionados** | [PRD-NNN, PRD-NNN, se aplicável] |

### Critérios de Prioridade

| Prioridade | Critérios |
|------------|-----------|
| **Crítica** | Sistema inoperante, perda de dados, segurança comprometida |
| **Alta** | Funcionalidade principal quebrada, muitos usuários afetados |
| **Média** | Funcionalidade secundária com problema, workaround disponível |
| **Baixa** | Problema cosmético, edge case raro |

---

## Descrição do Bug

### Comportamento Atual (Errado)

[Descreva exatamente o que está acontecendo de errado]

### Comportamento Esperado (Correto)

[Descreva o que deveria acontecer]

### Passos para Reproduzir

1. [Passo 1]
2. [Passo 2]
3. [Passo 3]
4. **Resultado:** [O que acontece de errado]

### Evidências

| Tipo | Link/Descrição |
|------|----------------|
| Screenshot | [Link ou descrição] |
| Log de erro | [Mensagem de erro] |
| Vídeo | [Link se houver] |

---

## Análise da Causa Raiz

### Hipótese Principal

[Descreva a provável causa do bug]

### Arquivos/Componentes Suspeitos

| Arquivo | Motivo da Suspeita |
|---------|-------------------|
| [caminho/arquivo.js] | [Por que suspeita] |
| [caminho/outro.js] | [Por que suspeita] |

### Investigação Necessária

- [ ] [O que precisa ser investigado antes de corrigir]
- [ ] [Verificação adicional]

---

## Escopo da Correção

### Incluído

- ✅ [O que será corrigido]
- ✅ [Ajuste relacionado]

### Excluído

- ❌ [O que NÃO será alterado nesta correção]
- ❌ [Melhoria que será feita em PRD separado]

---

## Impacto da Correção

### Usuários Afetados

| Grupo | Quantidade Estimada | Impacto |
|-------|---------------------|---------|
| [Tipo de usuário] | [N] | [Descrição do impacto] |

### Funcionalidades Relacionadas

| Funcionalidade | Risco de Regressão |
|----------------|-------------------|
| [Funcionalidade 1] | [Baixo / Médio / Alto] |
| [Funcionalidade 2] | [Baixo / Médio / Alto] |

---

## Plano de Correção

### Fases de Implementação

| Fase | Objetivo | Arquivos |
|------|----------|----------|
| 1 | [Investigação e confirmação da causa] | - |
| 2 | [Implementação da correção] | [N] |
| 3 | [Testes e validação] | - |

### Detalhamento

#### Fase 1: Investigação

**Objetivo:** Confirmar a causa raiz antes de alterar código

**Ações:**
- [ ] [Verificação 1]
- [ ] [Verificação 2]

#### Fase 2: Correção

**Objetivo:** Implementar a correção

**Ações:**
- [ ] [Alteração 1]
- [ ] [Alteração 2]

#### Fase 3: Validação

**Objetivo:** Garantir que o bug foi corrigido e não houve regressão

**Ações:**
- [ ] Testar cenário original do bug
- [ ] Testar funcionalidades relacionadas
- [ ] Verificar logs de erro

---

## Critérios de Aceitação

### Bug Corrigido

```gherkin
DADO [o cenário que causava o bug]
QUANDO [ação que disparava o bug]
ENTÃO [comportamento correto esperado]
  E [não deve mais apresentar o erro]
```

### Sem Regressão

```gherkin
DADO [cenário de funcionalidade relacionada]
QUANDO [ação normal]
ENTÃO [comportamento deve permanecer correto]
```

---

## Cadeia de PRDs (se aplicável)

> **Preencher apenas se esta correção faz parte de um conjunto de correções relacionadas.**

Este PRD faz parte do épico **"[Nome do Épico]"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | [PRD-NNN] | [Título] | [✅/⏳] | Base |
| **N** | **[Este PRD]** | **[Título]** | **🔄 ATUAL** | Depende de [...] |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Testes de Regressão

| Cenário | Resultado Esperado | Prioridade |
|---------|-------------------|------------|
| [Cenário original do bug] | [Comportamento correto] | Alta |
| [Funcionalidade relacionada 1] | [Continua funcionando] | Média |
| [Funcionalidade relacionada 2] | [Continua funcionando] | Média |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. INVESTIGAÇÃO OBRIGATÓRIA:**
> - Confirme a causa raiz ANTES de alterar código
> - Reproduza o bug localmente
> - Identifique TODOS os pontos que podem ser afetados

> **⚠️ 3. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/) — **PATCH +1** para correções
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — usar tipo **Fixed**
> - Renomear este arquivo adicionando `_DONE` ao final
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| **Correção de bug** | **PATCH +1** | **1.0.0 → 1.0.1** |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** PATCH mantém o codinome da versão MINOR atual. Não gerar novo codinome para correções.

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

Para correções, usar o tipo **Fixed**:

```markdown
## [1.0.1] - 2026-01-10

### Fixed
- Corrigido [descrição do bug que foi corrigido]
```

🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Mínima alteração** | Alterar apenas o necessário para corrigir |
| **Não adicionar features** | Correção não é momento de adicionar funcionalidades |
| **Testar regressão** | Garantir que nada mais quebrou |
| **Documentar causa** | Registrar o que causou o bug para evitar recorrência |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Alterar código além do necessário para a correção |
| Adicionar novas funcionalidades junto com o fix |
| Corrigir sem entender a causa raiz |
| Pular testes de regressão |
| Fazer refatoração junto com correção |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Implementado por** | - |
| **Causa Raiz Confirmada** | [Sim/Não] |
| **Observações** | - |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| [DD/MM/AAAA] | v1 | Criação inicial - Bug reportado |

---

**AILA - Sistemas Inteligentes**
