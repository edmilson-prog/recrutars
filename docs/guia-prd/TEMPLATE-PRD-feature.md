# TEMPLATE: PRD de Feature (Nova Funcionalidade)

> **AILA - Sistemas Inteligentes**  
> Template para documentação de novas funcionalidades

---

## 📚 Documentos Relacionados

Este documento faz parte do sistema de documentação de PRDs da AILA - Sistemas Inteligentes.

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs — **consulte antes de usar este template** |
| **`TEMPLATE-PRD-feature.md`** | ⬅ Você está aqui — Template para novas funcionalidades |
| `TEMPLATE-PRD-correcao.md` | Template para correções de bugs |
| `TEMPLATE-PRD-integracao.md` | Template para integrações externas |
| `TEMPLATE-INDEX-prds.md` | Template do índice/catálogo de PRDs por projeto |

> **Quando usar este template:** Para novas funcionalidades, módulos, capacidades ou features que ainda não existem no sistema.

---

## 📋 Como Usar Este Template

1. **Copie** este arquivo para a pasta de PRDs do seu projeto
2. **Renomeie** seguindo o padrão: `PRD-NNN-titulo-descritivo.md`
3. **Substitua** todos os textos entre `[colchetes]` com informações reais
4. **Remova** esta seção de instruções após preencher
5. **Consulte** o `GuiaPRD.md` para orientações detalhadas

---

# PRD-NNN: [Título Descritivo da Feature]

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | [Nome do projeto ou módulo] |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | [Descrição concisa do objetivo em 1-2 linhas] |
| **Tipo** | Feature |
| **Complexidade** | [Baixa / Média / Alta] |
| **Total de Fases** | [N] |
| **Prioridade** | [Alta / Média / Baixa] |
| **Épico** | [Nome da tarefa maior, se aplicável] |
| **PRDs Relacionados** | [PRD-NNN, PRD-NNN, se aplicável] |
| **Padrão de código** | [Ex: camelCase para novos campos/tabelas] |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

---

## Contexto do Problema

[Descreva em 2-3 parágrafos:]
- Qual problema este PRD resolve?
- Qual a dor do usuário ou do negócio?
- Por que isso é importante agora?

---

## Conceito da Solução

### Situação Atual (As-Is)

[Descreva como funciona hoje, ou indique que não existe]

### Situação Desejada (To-Be)

[Descreva como deve funcionar após a implementação]

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| [Alternativa 1] | [Motivo] |
| [Alternativa 2] | [Motivo] |

---

## Escopo

### Incluído

- ✅ [Funcionalidade/capacidade 1]
- ✅ [Funcionalidade/capacidade 2]
- ✅ [Funcionalidade/capacidade 3]

### Excluído

- ❌ [O que NÃO faz parte desta entrega]
- ❌ [Funcionalidade futura]
- ❌ [Limitação explícita]

---

## Requisitos Funcionais

### [Área/Módulo 1]

- **RF-001:** [Descrição do requisito verificável]
- **RF-002:** [Descrição do requisito verificável]

### [Área/Módulo 2]

- **RF-003:** [Descrição do requisito verificável]
- **RF-004:** [Descrição do requisito verificável]

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** [Ex: Tempo de resposta < 3 segundos]
- **RNF-002 (Disponibilidade):** [Ex: Uptime de 99.5%]
- **RNF-003 (Escalabilidade):** [Ex: Suportar 1000 usuários simultâneos]
- **RNF-004 (Compatibilidade):** [Ex: Chrome, Firefox, Safari, Edge]

---

## Critérios de Aceitação

### RF-001: [Nome do Requisito]

```gherkin
DADO [contexto inicial]
QUANDO [ação executada]
ENTÃO [resultado esperado]
```

### RF-002: [Nome do Requisito]

```gherkin
DADO [contexto inicial]
QUANDO [ação executada]
ENTÃO [resultado esperado]
```

### Cenários de Erro

```gherkin
DADO [contexto com dados inválidos ou falha]
QUANDO [ação executada]
ENTÃO [comportamento de erro esperado]
  E [feedback ao usuário]
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | [Preparação e análise] | [N] |
| 2 | [Infraestrutura base] | [N] |
| 3 | [Implementação core] | [N] |
| 4 | [Integração] | [N] |
| 5 | [Validação e ajustes] | [N] |

### Detalhamento das Fases

#### Fase 1: [Nome]

**Objetivo:** [O que essa fase entrega]

**Ações:**
- [ ] [Ação 1]
- [ ] [Ação 2]

**Validação:** [Como verificar que a fase está completa]

#### Fase 2: [Nome]

**Objetivo:** [O que essa fase entrega]

**Ações:**
- [ ] [Ação 1]
- [ ] [Ação 2]

**Validação:** [Como verificar que a fase está completa]

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| [PRD-NNN] | [Descrição] | [✅ Concluído / ⏳ Pendente] |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| [Nome do serviço] | [API / Webhook / etc] | [Disponível / A configurar] |

### Decisões Pendentes

- [ ] [Decisão que precisa ser tomada antes de implementar]

---

## Cadeia de PRDs

> **Preencher se este PRD faz parte de um épico (tarefa maior dividida em múltiplos PRDs).**

Este PRD faz parte do épico **"[Nome do Épico]"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | [PRD-NNN] | [Título] | [✅/⏳] | Base |
| **N** | **[Este PRD]** | **[Título]** | **🔄 ATUAL** | Depende de [...] |
| N+1 | [PRD-NNN] | [Título] | ⏳ | Depende de [...] |

> **Nota:** Implemente na ordem indicada. PRDs anteriores devem estar ✅ antes de iniciar este.

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| [Tipo de dado] | [PII / Sensível / Público] | [Como proteger] |

### Autenticação e Autorização

[Descreva requisitos de auth]

### Auditoria

[Descreva o que deve ser logado/auditado]

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
[Usuário] ──▶ [Ação 1] ──▶ [Ação 2] ──▶ [Resultado]
```

Ou descreva passo a passo:
1. Usuário [ação]
2. Sistema [resposta]
3. Usuário [ação]
4. Sistema [resultado final]

### Fluxos de Exceção

[Descreva o que acontece em casos alternativos]

### Fluxos de Erro

[Descreva o que acontece quando algo falha]

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Atualizar o registro de versão no banco de dados (se aplicável)
> - Renomear este arquivo adicionando `_DONE` ao final
>   Ex: `PRD-NNN-titulo_DONE.md`
> - Atualizar a seção "Status de Implementação" com:
>   - Status: ✅ IMPLEMENTADO
>   - Data de Implementação
>   - Versão do App após implementação
>   - Observações relevantes

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Para MINOR ou MAJOR, gerar codinome em inglês baseado no contexto das mudanças (ex: "Shield" para autenticação, "Messenger" para integração WhatsApp). PATCH mantém o codinome anterior.

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
| **Não bloquear fluxo principal** | Operações secundárias não devem impedir o core |
| **Fail gracefully** | Se captura opcional falhar, prosseguir com dados parciais |
| **Preservar evidências** | Dados parciais ainda são valiosos para auditoria |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas durante implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **[Aspecto 1]** | [Orientação específica para este PRD] |
| **[Aspecto 2]** | [Orientação específica para este PRD] |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| [Anti-padrão específico deste PRD] |
| [Anti-padrão específico deste PRD] |
| [Anti-padrão específico deste PRD] |

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
| [DD/MM/AAAA] | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
