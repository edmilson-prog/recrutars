# Guia de Criação de PRDs — AILA - Sistemas Inteligentes

> **Versão:** 1.4  
> **Data:** Janeiro/2026  
> **Autor:** AILA - Sistemas Inteligentes  
> **Aplicação:** Todos os projetos de desenvolvimento

---

## 📚 Documentos Relacionados

Este documento faz parte do sistema de documentação de PRDs da AILA - Sistemas Inteligentes.

| Documento | Descrição |
|-----------|-----------|
| **`GuiaPRD.md`** | ⬅ Você está aqui — Guia principal de criação de PRDs |
| `TEMPLATE-PRD-feature.md` | Template para novas funcionalidades |
| `TEMPLATE-PRD-correcao.md` | Template para correções de bugs |
| `TEMPLATE-PRD-integracao.md` | Template para integrações externas |
| `TEMPLATE-INDEX-prds.md` | Template do índice/catálogo de PRDs por projeto |

> **Nota:** Ao criar um PRD, escolha o template adequado ao tipo de demanda.

---

## 1. Introdução

Este documento estabelece a metodologia padrão para criação de Product Requirements Documents (PRDs) na AILA - Sistemas Inteligentes. O objetivo é garantir consistência, qualidade e eficiência na documentação de requisitos, independentemente do projeto ou equipe envolvida.

### 1.1 O que é um PRD

Um PRD é um documento que descreve **o que** um sistema ou funcionalidade deve fazer, **por que** é necessário e **quais critérios** definem seu sucesso — sem prescrever **como** deve ser implementado tecnicamente.

### 1.2 Papel do PRD no Workflow

```
┌─────────────────────────┐     ┌─────────────┐     ┌─────────────────────────┐
│       ARQUITETO         │────▶│     PRD     │────▶│     DESENVOLVEDOR       │
│  Claude Opus 4.5        │     │ (Documento) │     │  Claude Opus 4.5        │
│  Plataforma Web         │     │             │     │  Claude Code CLI v2.1.3 │
└─────────────────────────┘     └─────────────┘     └─────────────────────────┘
        Define                    Especifica              Implementa
      estratégia                 comportamento             solução
```

O PRD funciona como **contrato** entre a concepção arquitetural e a implementação. Ele permite que os agentes trabalhem de forma coordenada sem perda de contexto.

### Especificação dos Agentes

| Agente | Modelo | Ambiente | Responsabilidade |
|--------|--------|----------|------------------|
| **Arquiteto** | Claude Opus 4.5 (Anthropic) | Plataforma Web (claude.ai) | Criar e manter PRDs seguindo este guia |
| **Desenvolvedor** | Claude Opus 4.5 (Anthropic) | Claude Code CLI v2.1.3 | Implementar PRDs, atualizar versão e changelog |

### Contexto do Ambiente de Desenvolvimento

> **Nota:** A estrutura inicial dos projetos é tipicamente criada no **Lovable** para prototipagem rápida de UI e scaffold base. Após essa fase inicial, o repositório gerado pelo Lovable é clonado localmente e o desenvolvimento segue via **Claude Code CLI**. O Arquiteto deve considerar esse contexto ao elaborar PRDs, sabendo que a base do projeto já existe quando o Desenvolvedor recebe o PRD.

### 1.3 Público-Alvo do PRD

O PRD é direcionado para o **Agente Desenvolvedor** (Claude Opus 4.5 via Claude Code CLI v2.1.3). O **Agente Arquiteto** (Claude Opus 4.5 na plataforma web) escreve o PRD seguindo este guia, e o Agente Desenvolvedor o executa no ambiente CLI.

> **Nota:** Ambos os agentes são da Anthropic AI, modelo Opus 4.5, mas operam em ambientes diferentes com responsabilidades distintas.

### 1.4 Templates Disponíveis

Escolha o template adequado conforme o tipo de demanda:

| Tipo de Demanda | Template | Quando Usar |
|-----------------|----------|-------------|
| Nova funcionalidade | `TEMPLATE-PRD-feature.md` | Features, módulos, capacidades novas |
| Correção de bug | `TEMPLATE-PRD-correcao.md` | Bugs, fixes, ajustes de comportamento |
| Integração externa | `TEMPLATE-PRD-integracao.md` | APIs, webhooks, serviços terceiros |

---

## 2. Princípios Fundamentais

### 2.1 A Instrução-Chave

Todo PRD deve incluir, de forma explícita, a seguinte orientação:

> **"Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."**

Este princípio garante que a implementação seja precedida por análise completa, evitando retrabalho e soluções precipitadas.

### 2.2 Descritivo, Não Prescritivo

| ✅ Correto (Descritivo) | ❌ Incorreto (Prescritivo) |
|-------------------------|---------------------------|
| "O sistema deve validar a localização do usuário com precisão mínima de 50 metros" | "Use navigator.geolocation.getCurrentPosition() com enableHighAccuracy: true" |
| "A autenticação deve incluir segundo fator via aplicativo autenticador" | "Implemente com a biblioteca otplib usando TOTP de 6 dígitos" |
| "O registro deve ser auditável com timestamp e identificação do autor" | "Crie uma tabela audit_log com campos created_at TIMESTAMPTZ e user_id UUID" |

**Por quê?** PRDs descritivos permitem que o desenvolvedor escolha a melhor implementação para o contexto, mantenham flexibilidade tecnológica e sobrevivam a mudanças de stack.

### 2.3 Completude sem Redundância

Um PRD deve ser **completo o suficiente** para que o desenvolvedor não precise adivinhar intenções, mas **conciso o suficiente** para não enterrar informações críticas em texto desnecessário.

### 2.4 Rastreabilidade

Toda funcionalidade descrita deve poder ser:
- **Testada** — critérios de aceitação verificáveis
- **Auditada** — origem e justificativa documentadas
- **Versionada** — mudanças rastreáveis ao longo do tempo

---

## 3. Versionamento e Changelog

O versionamento e o registro de mudanças são **obrigatórios** em todo projeto. A cada PRD implementado, o agente desenvolvedor deve atualizar a versão do app e registrar as mudanças no changelog.

### 3.1 Padrão de Versionamento: SemVer

Seguir o padrão **Semantic Versioning 2.0.0** conforme especificado em:
- 🔗 https://semver.org/

#### Formato

```
MAJOR.MINOR.PATCH
```

| Componente | Quando Incrementar | Exemplo |
|------------|-------------------|---------|
| **MAJOR** | Mudanças incompatíveis com versões anteriores | 1.0.0 → 2.0.0 |
| **MINOR** | Nova funcionalidade compatível com versões anteriores | 1.0.0 → 1.1.0 |
| **PATCH** | Correção de bugs compatível com versões anteriores | 1.0.0 → 1.0.1 |

#### Regras SemVer

1. Uma vez que uma versão é lançada, o conteúdo NÃO pode ser modificado
2. MAJOR zero (0.x.x) é para desenvolvimento inicial — qualquer coisa pode mudar
3. Versão 1.0.0 define a API pública — a partir daí, incrementos seguem as regras
4. PATCH deve ser incrementado se apenas correções de bugs forem introduzidas
5. MINOR deve ser incrementado se nova funcionalidade for introduzida
6. MAJOR deve ser incrementado se qualquer mudança incompatível for introduzida

### 3.2 Codinomes de Versão

Cada versão MINOR ou MAJOR deve receber um **codinome em inglês** que represente a essência das mudanças.

#### Regra de Geração

| Incremento | Codinome |
|------------|----------|
| **MAJOR** | Novo codinome obrigatório |
| **MINOR** | Novo codinome obrigatório |
| **PATCH** | Mantém o codinome da versão MINOR |

#### Como Gerar o Codinome

1. Analise as mudanças registradas no changelog (Added, Changed, Fixed, etc.)
2. Identifique o **tema central** ou a **funcionalidade principal**
3. Escolha **1 palavra em inglês** que represente essa essência
4. O codinome deve ser **memorável, curto e relacionado ao contexto**

#### Exemplos de Codinomes Contextuais

| Versão | Mudanças Principais | Codinome |
|--------|---------------------|----------|
| 1.0.0 | Lançamento inicial | **Genesis** |
| 1.1.0 | Sistema de notificações push | **Bell** |
| 1.1.1 | Fix no envio de notificações | Bell (mantém) |
| 1.2.0 | Integração com WhatsApp | **Messenger** |
| 1.3.0 | Dashboard de métricas | **Radar** |
| 1.4.0 | Otimização de performance | **Boost** |
| 1.5.0 | Autenticação 2FA | **Shield** |
| 2.0.0 | Reescrita completa do core | **Phoenix** |
| 2.1.0 | Export de relatórios PDF | **Scribe** |
| 2.2.0 | Sistema de filas e jobs | **Stream** |

#### Formato no Changelog

```markdown
## [1.2.0] - 2026-01-15 - Messenger

### Added
- Integração com WhatsApp via Evolution API
- Envio de mensagens automáticas
```

#### Formato na Tabela de Versões

| Versão | Codinome | Data | Descrição |
|--------|----------|------|-----------|
| 1.2.0 | Messenger | 2026-01-15 | Integração WhatsApp |
| 1.1.0 | Bell | 2026-01-10 | Sistema de notificações |
| 1.0.0 | Genesis | 2026-01-01 | Lançamento inicial |

### 3.3 Padrão de Changelog: Keep a Changelog

Seguir o padrão **Keep a Changelog 1.1.0** conforme especificado em:
- 🔗 https://keepachangelog.com/en/1.1.0/

#### Princípios

- Changelogs são para **humanos**, não para máquinas
- Deve haver uma entrada para **cada versão**
- Mudanças do mesmo tipo devem ser **agrupadas**
- Versões devem ser **linkáveis**
- A versão mais recente vem **primeiro**
- A data de release de cada versão deve ser **exibida**

#### Tipos de Mudança

| Tipo | Descrição |
|------|-----------|
| **Added** | Novas funcionalidades |
| **Changed** | Mudanças em funcionalidades existentes |
| **Deprecated** | Funcionalidades que serão removidas em breve |
| **Removed** | Funcionalidades removidas |
| **Fixed** | Correções de bugs |
| **Security** | Correções de vulnerabilidades |

#### Formato do Changelog

```markdown
# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-01-10

### Added
- Nova funcionalidade de check-in com GPS
- Validação anti-fraude de selfie

### Changed
- Melhoria no fluxo de autenticação

### Fixed
- Correção do cálculo de horas do ciclo mensal

## [1.0.0] - 2026-01-01

### Added
- Versão inicial do sistema
```

### 3.4 Obrigatoriedade a Cada PRD

**A cada PRD implementado, o agente desenvolvedor DEVE:**

| Ação | Descrição |
|------|-----------|
| 1. Incrementar versão | Seguindo SemVer (MAJOR/MINOR/PATCH) |
| 2. Atualizar changelog | Seguindo Keep a Changelog |
| 3. Atualizar banco (se aplicável) | Tabela de versões do app |
| 4. Commitar junto | Versão e changelog no mesmo commit da implementação |

---

## 4. Convenções de Nomenclatura

### 4.1 Nome do Arquivo

O nome do arquivo deve seguir o padrão:

```
PRD-NNN-titulo-descritivo.md
```

| Componente | Descrição | Exemplo |
|------------|-----------|---------|
| `PRD` | Prefixo fixo | PRD |
| `NNN` | Número sequencial (3 dígitos) | 001, 017, 042 |
| `titulo-descritivo` | Slug em minúsculas, separado por hífen | modelo-dados-ciclo-mensal |
| `.md` | Extensão Markdown | .md |

**Exemplos válidos:**
- `PRD-001-modelo-dados-ciclo-mensal.md`
- `PRD-017-registro-attempts.md`
- `PRD-042-integracao-api-externa.md`

**Exemplos inválidos:**
- `PRD-modelo-dados.md` — falta número
- `PRD-1-modelo.md` — número deve ter 3 dígitos
- `PRD-001-Modelo-Dados.md` — deve ser minúsculo
- `prd-001-modelo.md` — prefixo deve ser maiúsculo

### 4.2 Título Interno do Documento

O título interno (H1) deve **coincidir** com o nome do arquivo:

```markdown
# PRD-NNN: Título Descritivo
```

| Nome do Arquivo | Título Interno |
|-----------------|----------------|
| `PRD-001-modelo-dados-ciclo-mensal.md` | `# PRD-001: Modelo de Dados - Ciclo Mensal` |
| `PRD-017-registro-attempts.md` | `# PRD-017: Registro de Attempts` |

**Regra:** O número e o conceito central devem ser idênticos. O título interno pode ter formatação mais legível (capitalização, travessões), mas deve ser reconhecível como o mesmo documento.

### 4.3 Sufixo de Status

Quando um PRD for implementado, o arquivo deve ser renomeado adicionando `_DONE`:

```
PRD-001-modelo-dados-ciclo-mensal.md
                    ↓
PRD-001-modelo-dados-ciclo-mensal_DONE.md
```

| Status | Sufixo | Exemplo |
|--------|--------|---------|
| Pendente | (nenhum) | `PRD-017-feature.md` |
| Implementado | `_DONE` | `PRD-017-feature_DONE.md` |

### 4.4 Versionamento de PRDs

Se um PRD precisar de revisão significativa antes da implementação:

```
PRD-001-modelo-dados-ciclo-mensal.md
                    ↓
PRD-001-modelo-dados-ciclo-mensal-v2.md
```

Manter ambas as versões permite rastrear a evolução do requisito.

### 4.5 Numeração por Contexto

Cada contexto/aplicação mantém sua própria sequência:

| Contexto | Prefixo de Numeração | Exemplo |
|----------|---------------------|---------|
| Painel Admin | PRD-001 a PRD-099 | `PRD-015-detalhamento-apenado.md` |
| PWA Apenado | PRD-001 a PRD-099 | `PRD-012-firebase-push.md` |
| PWA Supervisor | PRD-001 a PRD-099 | `PRD-004-gps-antifake.md` |

**Nota:** A numeração reinicia para cada aplicação/módulo do sistema.

---

## 5. Estrutura Padrão de um PRD

### 5.1 Cabeçalho Obrigatório

Todo PRD deve começar com título padronizado e tabela de informações gerais:

```markdown
# PRD-NNN: Título Descritivo

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Nome do projeto ou módulo |
| **Repositório** | URL do repositório Git |
| **Objetivo** | Descrição concisa do objetivo (1-2 linhas) |
| **Tipo** | Feature / Correção / Integração |
| **Complexidade** | Baixa / Média / Alta |
| **Total de Fases** | Número de fases de implementação |
| **Prioridade** | Alta / Média / Baixa |
| **Épico** | Nome da tarefa maior (se aplicável) |
| **PRDs Relacionados** | Lista de PRDs do mesmo épico (se aplicável) |
| **Padrão de código** | Ex: camelCase para novos campos/tabelas |
```

### 5.2 Critérios de Complexidade

Use os seguintes critérios objetivos para classificar a complexidade:

| Complexidade | Critérios | Fases Típicas |
|--------------|-----------|---------------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas | 1-2 fases |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada | 3-4 fases |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas | 5+ fases |

**Indicadores adicionais de Alta complexidade:**
- Impacta código existente em produção
- Requer migração de dados
- Envolve múltiplos sistemas/serviços
- Tem dependências entre fases

### 5.3 Seções de Conteúdo

```markdown
## Contexto do Problema
## Conceito da Solução
## Escopo
## Requisitos Funcionais
## Requisitos Não-Funcionais
## Critérios de Aceitação
## Fases de Implementação
## Dependências
## Cadeia de PRDs (se parte de um épico)
## Considerações de Segurança
## Fluxos de Usuário
```

### 5.4 Seção de Notas para o Agente (Obrigatória)

Ver **Seção 6** deste guia para o conteúdo completo.

### 5.5 Rodapé Obrigatório

Todo PRD deve terminar com seção de status e histórico:

```markdown
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
| DD/MM/AAAA | v1 | Criação inicial |
```

### 5.6 Seções Opcionais (conforme necessidade)

```markdown
## Integrações Externas
## Modelo de Dados (conceitual)
## Mockups/Wireframes
## Métricas de Sucesso
## Plano de Rollout
## Riscos e Mitigações
## Glossário
## Referências
```

### 5.7 Detalhamento das Seções de Conteúdo

#### Contexto do Problema
Descrição em 2-3 parágrafos do problema que está sendo resolvido. Deve responder: "Por que este PRD existe? Qual dor está sendo endereçada?"

#### Conceito da Solução
- Qual a situação atual (as-is)?
- Qual a situação desejada (to-be)?
- Quais alternativas foram consideradas e descartadas?

#### Escopo
Duas listas claras:
- **Incluído:** O que FAZ parte desta entrega
- **Excluído:** O que NÃO faz parte (mas poderia gerar dúvida)

#### Requisitos Funcionais
Organizados por área ou fluxo, cada requisito deve:
- Ter identificador único (RF-001, RF-002...)
- Ser atômico (um requisito = uma capacidade)
- Usar verbos no infinitivo ou imperativo
- Ser verificável

**Exemplo:**
> **RF-012:** O sistema deve registrar cada tentativa de check-in, incluindo: timestamp, coordenadas GPS, precisão reportada, resultado (sucesso/falha) e motivo da falha quando aplicável.

#### Requisitos Não-Funcionais
Aspectos de qualidade do sistema:
- **Performance:** tempos de resposta, throughput
- **Disponibilidade:** uptime esperado
- **Escalabilidade:** volumes projetados
- **Usabilidade:** padrões de acessibilidade
- **Compatibilidade:** navegadores, dispositivos, versões

#### Critérios de Aceitação
Para cada requisito funcional principal, definir cenários no formato:

```gherkin
DADO [contexto inicial]
QUANDO [ação executada]
ENTÃO [resultado esperado]
```

**Exemplo:**
```gherkin
DADO que o sentenciado está dentro do raio de 100m da entidade
  E a precisão do GPS é menor que 50m
QUANDO ele realiza o check-in com selfie válida
ENTÃO o sistema deve registrar a entrada
  E iniciar a contagem de horas
  E exibir confirmação visual com horário registrado
```

#### Fases de Implementação
Sequência ordenada de implementação, cada fase com objetivo claro:

| Fase | Objetivo |
|------|----------|
| 1 | Preparação e análise |
| 2 | Infraestrutura base |
| 3 | Implementação core |
| 4 | Integração |
| 5 | Validação |

**Tamanho ideal de fase:**
- 1-5 arquivos por fase
- Testável independentemente
- Pode ser concluída em tempo razoável

#### Dependências
- Outros módulos/PRDs que devem estar prontos
- Serviços externos necessários
- Decisões pendentes que bloqueiam implementação

#### Cadeia de PRDs (quando parte de um Épico)

Quando o PRD faz parte de uma tarefa maior dividida em múltiplos PRDs:

```markdown
## Cadeia de PRDs

Este PRD faz parte do épico **"[Nome do Épico]"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-010 | [Título] | ✅ | Base |
| 2 | PRD-011 | [Título] | ✅ | Depende de 010 |
| **3** | **PRD-012** | **[Título]** | **🔄 ATUAL** | Depende de 010, 011 |
| 4 | PRD-013 | [Título] | ⏳ | Depende de 010-012 |

> **Nota:** Implemente na ordem indicada. PRDs anteriores devem estar ✅ antes de iniciar este.
```

**Legenda de Status:**
- ✅ Implementado
- 🔄 Atual (este PRD)
- ⏳ Pendente

#### Considerações de Segurança
- Dados sensíveis envolvidos e como protegê-los
- Requisitos de autenticação/autorização
- Medidas anti-fraude específicas
- Requisitos de auditoria e logging

#### Fluxos de Usuário
Diagramas ou descrições passo-a-passo dos caminhos principais e alternativos. Incluir:
- Fluxo feliz (happy path)
- Fluxos de exceção
- Fluxos de erro e recuperação

---

## 6. Notas Fixas para o Agente Desenvolvedor

**Esta seção define o conteúdo OBRIGATÓRIO que deve aparecer em TODOS os PRDs.** O agente arquiteto que escreve o PRD deve incluir estas notas para orientar o agente desenvolvedor.

### 6.1 Estrutura da Seção no PRD

```markdown
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
> - Atualizar a seção "Status de Implementação" no final deste documento

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
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
| **Não bloquear fluxo principal** | Operações secundárias não devem impedir o core |
| **Fail gracefully** | Se captura opcional falhar, prosseguir com dados parciais |
| **Preservar evidências** | Dados parciais ainda são valiosos para auditoria |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas durante implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| [Aspecto específico do PRD] | [Orientação correspondente] |
| [Aspecto específico do PRD] | [Orientação correspondente] |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| [Anti-padrão específico do PRD] |
| [Anti-padrão específico do PRD] |
| [Anti-padrão específico do PRD] |
```

### 6.2 Conteúdo Fixo (copiar para todo PRD)

As seguintes instruções são **fixas** e devem aparecer em **todo PRD**:

#### Esclarecimento de Dúvidas (OBRIGATÓRIO)

```markdown
### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**
```

#### Instrução ANTES DE IMPLEMENTAR (OBRIGATÓRIA)

```markdown
> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."
```

#### Instrução APÓS IMPLEMENTAR (OBRIGATÓRIA)

```markdown
> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Atualizar o registro de versão no banco de dados (se aplicável)
> - Renomear este arquivo adicionando `_DONE` ao final
>   Ex: `PRD-017-feature.md` → `PRD-017-feature_DONE.md`
> - Atualizar a seção "Status de Implementação" com:
>   - Status: ✅ IMPLEMENTADO
>   - Data de Implementação
>   - Versão do App após implementação
>   - Observações relevantes
```

#### Guia de Versionamento SemVer (OBRIGATÓRIO)

```markdown
### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Para MINOR ou MAJOR, gerar codinome em inglês baseado no contexto das mudanças.

🔗 Referência: https://semver.org/
```

#### Guia de Changelog (OBRIGATÓRIO)

```markdown
### Guia de Changelog (Keep a Changelog)

Tipos de mudança a documentar:
- **Added** — novas funcionalidades
- **Changed** — mudanças em funcionalidades existentes
- **Deprecated** — funcionalidades que serão removidas
- **Removed** — funcionalidades removidas
- **Fixed** — correções de bugs
- **Security** — correções de vulnerabilidades

🔗 Referência: https://keepachangelog.com/en/1.1.0/
```

#### Princípios de Implementação (OBRIGATÓRIO)

```markdown
### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | Operações secundárias não devem impedir o core |
| **Fail gracefully** | Se captura opcional falhar, prosseguir com dados parciais |
| **Preservar evidências** | Dados parciais ainda são valiosos para auditoria |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas durante implementação |
```

### 6.3 Conteúdo Variável (específico de cada PRD)

O arquiteto deve adicionar orientações e anti-padrões específicos do contexto:

#### Orientações Gerais (VARIÁVEL)

```markdown
### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **[Aspecto 1]** | [Orientação específica para este PRD] |
| **[Aspecto 2]** | [Orientação específica para este PRD] |
```

**Exemplos de aspectos comuns:**
- Bibliotecas sugeridas (sem impor)
- Padrões de nomenclatura específicos
- Considerações de performance
- Integrações a observar

#### O que NÃO Fazer (VARIÁVEL)

```markdown
### O que NÃO Fazer

| ❌ Evitar |
|----------|
| [Anti-padrão específico] |
| [Anti-padrão específico] |
```

**Exemplos de anti-padrões comuns:**
- Cache de dados sensíveis sem criptografia
- Hardcodar valores em múltiplos lugares
- Ignorar tratamento de erros
- Bloquear usuário se validação opcional falhar

### 6.4 Avisos Críticos (quando aplicável)

Para PRDs que envolvem bancos de produção ou sistemas críticos:

```markdown
## ⚠️ AVISO CRÍTICO - LEIA PRIMEIRO

### Ambiente de Produção

O banco/sistema está em **PRODUÇÃO** com dados reais.

### Regras Obrigatórias

| ❌ NUNCA fazer | ✅ SEMPRE fazer |
|----------------|-----------------|
| ALTER TABLE | Usar tabelas existentes |
| DROP/TRUNCATE | Apenas SELECT, UPDATE, INSERT |
| Modificar triggers | Respeitar automações |
| Alterar RLS policies | Confiar nas políticas existentes |
| Testar em produção | Testar com dados de teste primeiro |
```

---

## 7. Diretrizes de Escrita

### 7.1 Tom e Linguagem

- **Voz ativa:** "O sistema valida..." em vez de "A validação é feita pelo sistema..."
- **Específico:** "máximo de 5 segundos" em vez de "rapidamente"
- **Sem ambiguidade:** evitar "pode", "deveria", "talvez"
- **Consistente:** usar os mesmos termos para os mesmos conceitos ao longo do documento

### 7.2 Nível de Detalhe

| Contexto | Nível de Detalhe |
|----------|------------------|
| Regras de negócio | Alto — sem margem para interpretação |
| Comportamento de UI | Médio — descrever o quê, não o como visual |
| Implementação técnica | Baixo — apenas restrições arquiteturais |
| Design visual | Referência a design system ou protótipos externos |

### 7.3 Formatação

- Use **negrito** para termos-chave e conceitos importantes
- Use `código inline` para valores específicos, estados, ou identificadores
- Use tabelas para comparações e mapeamentos
- Use diagramas para fluxos complexos (Mermaid, ASCII, ou imagens)
- Numere requisitos para referência cruzada

---

## 8. Workflow de Criação

### 8.1 Fases do Processo

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  DISCOVERY   │──▶│   DRAFT      │──▶│   REVIEW     │──▶│  APROVAÇÃO   │
│              │   │              │   │              │   │              │
│ • Entender   │   │ • Estruturar │   │ • Validar    │   │ • Formalizar │
│   problema   │   │ • Detalhar   │   │ • Ajustar    │   │ • Versionar  │
│ • Levantar   │   │ • Exemplifi- │   │ • Completar  │   │ • Comunicar  │
│   contexto   │   │   car        │   │   gaps       │   │              │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

### 8.2 Discovery

Antes de escrever qualquer linha do PRD:

1. **Entenda o problema real** — Qual dor está sendo resolvida? Para quem?
2. **Mapeie o contexto** — O que já existe? O que será afetado?
3. **Identifique stakeholders** — Quem precisa aprovar? Quem será impactado?
4. **Defina limites** — O que está fora do escopo desta iniciativa?

### 8.3 Draft

1. Comece pelo Contexto do Problema — se não conseguir resumir em 3 parágrafos, o escopo está mal definido
2. Escolha o template adequado (`TEMPLATE-PRD-feature.md`, `TEMPLATE-PRD-correcao.md`, ou `TEMPLATE-PRD-integracao.md`)
3. Liste requisitos funcionais em formato de brainstorm
4. Organize e agrupe por área/fluxo
5. Adicione critérios de aceitação para cada requisito crítico
6. Preencha seções de suporte (segurança, dependências, etc.)
7. **Adicione as Notas Fixas para o Agente Desenvolvedor (Seção 6)**

### 8.4 Review

Checklist de revisão:
- [ ] Cada requisito é verificável?
- [ ] Há contradições entre requisitos?
- [ ] As dependências estão identificadas?
- [ ] Os critérios de aceitação cobrem casos de erro?
- [ ] Um desenvolvedor conseguiria implementar sem perguntas?
- [ ] **As Notas Fixas para o Agente estão completas?**

### 8.5 Aprovação e Versionamento

- PRDs aprovados devem ser versionados (v1.0, v1.1, v2.0)
- Mudanças significativas geram nova versão major
- Manter changelog no próprio documento ou em sistema de controle

---

## 9. Anti-Padrões — O Que Evitar

### 9.1 Código Literal no PRD

❌ **Errado:**
```markdown
Implementar validação assim:
```javascript
if (distance <= 100 && accuracy < 50) {
  allowCheckIn();
}
```
```

✅ **Correto:**
```markdown
O check-in deve ser permitido quando:
- A distância até a entidade for ≤ 100 metros
- A precisão do GPS for < 50 metros
```

### 9.2 Requisitos Vagos

❌ **Errado:** "O sistema deve ser rápido e fácil de usar"

✅ **Correto:** "O tempo de resposta para operações de check-in deve ser inferior a 3 segundos em conexões 4G. A interface deve seguir as diretrizes WCAG 2.1 nível AA."

### 9.3 Escopo Infinito

❌ **Errado:** "O sistema deve atender todas as necessidades do usuário"

✅ **Correto:** Lista específica de funcionalidades incluídas e excluídas

### 9.4 Misturar Requisitos e Soluções

❌ **Errado:** "Usar Firebase para notificações push porque é gratuito"

✅ **Correto:** "O sistema deve enviar notificações push para dispositivos móveis, mesmo quando o app estiver em background. A solução deve suportar Android e iOS."

### 9.5 Ignorar Casos de Erro

❌ **Errado:** Documentar apenas o fluxo feliz

✅ **Correto:** Para cada fluxo principal, documentar: o que acontece se falhar? Como o usuário é informado? Como recuperar?

### 9.6 Esquecer as Notas para o Agente

❌ **Errado:** Criar PRD sem a seção de Notas para o Agente Desenvolvedor

✅ **Correto:** Todo PRD deve incluir as notas fixas (Seção 6) + orientações específicas

### 9.7 Não Atualizar Versão e Changelog

❌ **Errado:** Implementar PRD sem incrementar versão do app e sem registrar no changelog

✅ **Correto:** A cada PRD implementado, seguir SemVer e Keep a Changelog

---

## 10. Checklist de Qualidade

Antes de considerar um PRD "pronto para implementação", verifique:

### Completude
- [ ] Título coincide com nome do arquivo (PRD-NNN)
- [ ] Tabela de Informações Gerais preenchida
- [ ] Tipo e Complexidade definidos corretamente
- [ ] Contexto e justificativa documentados
- [ ] Escopo com inclusões E exclusões explícitas
- [ ] Todos os requisitos funcionais identificados
- [ ] Requisitos não-funcionais especificados
- [ ] Dependências mapeadas

### Qualidade dos Requisitos
- [ ] Cada requisito tem ID único
- [ ] Requisitos são atômicos (1 capacidade cada)
- [ ] Requisitos são verificáveis/testáveis
- [ ] Sem ambiguidades ("pode", "deveria", "às vezes")
- [ ] Termos consistentes ao longo do documento

### Critérios de Aceitação
- [ ] Cobrem o fluxo feliz
- [ ] Cobrem fluxos de exceção
- [ ] Cobrem tratamento de erros
- [ ] Formato DADO/QUANDO/ENTÃO consistente

### Segurança e Compliance
- [ ] Dados sensíveis identificados
- [ ] Requisitos de autenticação/autorização definidos
- [ ] Necessidades de auditoria especificadas
- [ ] Medidas anti-fraude documentadas (se aplicável)

### Notas para o Agente (OBRIGATÓRIO)
- [ ] Instrução "ANTES DE IMPLEMENTAR" presente (com texto atualizado)
- [ ] Instrução "APÓS IMPLEMENTAR" presente (com referências SemVer e Keep a Changelog)
- [ ] Guia de Versionamento SemVer presente (com link)
- [ ] Guia de Changelog presente (com link)
- [ ] Princípios de Implementação presentes
- [ ] Orientações Gerais específicas do PRD
- [ ] Lista de "O que NÃO fazer" específica do PRD
- [ ] Aviso Crítico (se aplicável a banco/sistema em produção)

### Rodapé
- [ ] Seção "Status de Implementação" presente
- [ ] Seção "Histórico" presente

### Viabilidade
- [ ] Dependências técnicas verificadas como possíveis
- [ ] Não há contradições entre requisitos
- [ ] Escopo é realizável no prazo previsto
- [ ] Riscos identificados têm mitigação

---

## 11. Glossário

| Termo | Definição |
|-------|-----------|
| **PRD** | Product Requirements Document — documento que especifica requisitos de produto |
| **Requisito Funcional** | O que o sistema deve fazer (comportamento) |
| **Requisito Não-Funcional** | Como o sistema deve ser (qualidade) |
| **Critério de Aceitação** | Condição verificável que define quando um requisito está atendido |
| **Stakeholder** | Pessoa ou grupo com interesse no resultado do projeto |
| **Happy Path** | Fluxo principal onde tudo funciona como esperado |
| **Edge Case** | Situação limite ou incomum que deve ser tratada |
| **Agente Arquiteto** | Claude Opus 4.5 (Anthropic) operando na plataforma web (claude.ai) — responsável por criar PRDs |
| **Agente Desenvolvedor** | Claude Opus 4.5 (Anthropic) operando via Claude Code CLI v2.1.3 — responsável por implementar PRDs |
| **Claude Code CLI** | Interface de linha de comando da Anthropic para desenvolvimento de código com IA |
| **Lovable** | Plataforma de prototipagem rápida usada para criar estrutura inicial (scaffold) dos projetos |
| **SemVer** | Semantic Versioning — padrão de versionamento (MAJOR.MINOR.PATCH) |
| **Changelog** | Registro cronológico de mudanças do projeto |

---

## 12. Referências

| Recurso | URL |
|---------|-----|
| **Semantic Versioning 2.0.0** | https://semver.org/ |
| **Keep a Changelog 1.1.0** | https://keepachangelog.com/en/1.1.0/ |

---

## 13. Controle de Versões deste Documento

| Versão | Data | Autor | Alterações |
|--------|------|-------|------------|
| 1.0 | Dez/2025 | AILA | Versão inicial |
| 1.1 | Dez/2025 | AILA | Adição de Convenções de Nomenclatura, Notas para o Agente, padronização de cabeçalho e rodapé |
| 1.2 | Dez/2025 | AILA | Reestruturação da Seção 5 (Notas Fixas), Template Completo atualizado, Checklist expandido |
| 1.3 | Dez/2025 | AILA | Nome da empresa atualizado para "AILA - Sistemas Inteligentes", nova Seção 3 (Versionamento e Changelog) com referências SemVer e Keep a Changelog, instrução-chave atualizada |
| 1.4 | Jan/2026 | AILA | Adição de Documentos Relacionados (referências cruzadas), Critérios de Complexidade objetivos, Campo "Tipo" no cabeçalho, Princípio "Documentar decisões", Referência aos templates por tipo, Especificação dos Agentes (Claude Opus 4.5: Arquiteto na web, Desenvolvedor no CLI v2.1.3), Codinomes contextuais em inglês para versões MINOR/MAJOR |

---

> **Nota Final:** Este guia é um documento vivo. Conforme a equipe ganha experiência e identifica melhorias, ele deve ser atualizado para refletir as melhores práticas consolidadas.

---

**AILA - Sistemas Inteligentes**
