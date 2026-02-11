# PRD-073: Perfil Profissional Unificado do Candidato

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Módulo Candidato |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Substituir o modelo de múltiplos currículos por um perfil profissional único (fonte de verdade) com candidaturas customizáveis por vaga |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Perfil Profissional Unificado |
| **PRDs Relacionados** | PRD-022 (gestão de currículos), PRD-023 (exportar PDF), PRD-038 (parser de currículo), PRD-064 (schema core Supabase) |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 5+ arquivos, impacta múltiplos módulos (candidato, empresa, Gauge-Pro), regras de negócio complexas (consolidação de dados, candidatura customizável), afeta modelo de dados existente |

---

## Contexto do Problema

O RecrutaRS permite atualmente que candidatos criem múltiplos currículos independentes. Cada currículo contém seu próprio conjunto de informações básicas, experiências profissionais, formação acadêmica, habilidades e cursos/certificações. Embora essa abordagem ofereça flexibilidade aparente, ela cria um problema estrutural para a plataforma.

O diferencial competitivo do RecrutaRS é o Gauge-Pro — sistema de análise comportamental e matching por IA que gera scores de compatibilidade entre candidatos e vagas. Para funcionar com precisão, o Gauge-Pro precisa de uma **fonte de verdade única** sobre cada candidato. Quando existem 3 currículos com dados potencialmente diferentes (experiências incluídas em um mas não em outro, habilidades com níveis divergentes), o sistema não tem como determinar qual representa o candidato real.

Este PRD é estratégico porque a plataforma está em desenvolvimento ativo e ainda não tem base de usuários em produção. É o momento ideal para corrigir a arquitetura antes que dados reais tornem a migração complexa. A reestruturação agora evita débito técnico futuro e garante que o Gauge-Pro, o parser de currículo (PRD-038) e todos os módulos de IA (PRDs 035-042) tenham uma base sólida para operar.

---

## Conceito da Solução

### Situação Atual (As-Is)

```
┌──────────────┐     ┌──────────────────────────────────────┐
│  CANDIDATO   │────▶│  MÚLTIPLOS CURRÍCULOS                │
│              │     │                                      │
│              │     │  ┌──────────┐ ┌──────────┐ ┌──────┐ │
│              │     │  │ CV Back  │ │ CV Front │ │CV Gen│ │
│              │     │  │ end      │ │ end      │ │eral  │ │
│              │     │  └──────────┘ └──────────┘ └──────┘ │
│              │     │       │            │           │     │
│              │     │  Cada um com seus próprios dados     │
│              │     └──────────────────────────────────────┘
│              │                    │
│              │                    ▼
│              │     ┌──────────────────────────────────────┐
│              │     │  GAUGE-PRO: Qual currículo analisar? │
│              │     │  ❓ Dados fragmentados                │
│              │     │  ❓ Score inconsistente               │
│              │     └──────────────────────────────────────┘
└──────────────┘
```

- Candidato pode criar N currículos independentes
- Cada currículo tem campo "Nome do Currículo" e conjunto completo de dados
- Ao se candidatar, escolhe qual currículo enviar
- Gauge-Pro não tem fonte de verdade clara
- Dados podem ser duplicados ou contraditórios entre currículos

### Situação Desejada (To-Be)

```
┌──────────────┐     ┌──────────────────────────────────────┐
│  CANDIDATO   │────▶│  PERFIL PROFISSIONAL ÚNICO           │
│              │     │  (fonte de verdade)                   │
│              │     │                                      │
│              │     │  📋 Informações Básicas               │
│              │     │  💼 Experiências (todas)              │
│              │     │  🎓 Formações (todas)                 │
│              │     │  💡 Habilidades (todas)               │
│              │     │  📜 Cursos (todos)                    │
│              │     └──────────────┬───────────────────────┘
│              │                    │
│              │         ┌──────────┴──────────┐
│              │         │                     │
│              │         ▼                     ▼
│              │  ┌─────────────┐    ┌──────────────────┐
│              │  │ GAUGE-PRO   │    │ CANDIDATURAS     │
│              │  │ Analisa o   │    │ Customizáveis    │
│              │  │ perfil      │    │                  │
│              │  │ COMPLETO    │    │ Vaga A: destaca  │
│              │  │ ✅ Confiável │    │ experiências X,Y │
│              │  └─────────────┘    │                  │
│              │                     │ Vaga B: destaca  │
│              │                     │ habilidades Z,W  │
│              │                     └──────────────────┘
└──────────────┘
```

- Candidato tem **1 perfil profissional** com todos os dados
- Campo "Nome do Currículo" é removido — o perfil é do candidato
- Ao se candidatar, pode criar uma **visão customizada** (destacar/priorizar itens)
- Gauge-Pro sempre analisa o perfil completo
- Empresa vê a candidatura customizada, mas o score reflete o perfil real

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Manter múltiplos currículos e escolher "principal" | Não resolve o problema — dados continuam fragmentados, candidato pode ter perfil principal incompleto |
| Currículo único sem customização por vaga | Resolve métricas, mas empobrece a experiência do candidato que quer adequar sua apresentação |
| Consolidar automaticamente por IA | Complexidade desnecessária neste momento — plataforma em dev, poucos dados reais |

---

## Escopo

### Incluído

- ✅ Reestruturação do modelo de dados: de múltiplos currículos para perfil profissional único
- ✅ Manutenção das 5 seções existentes: Informações Básicas, Experiência, Formação, Habilidades, Cursos
- ✅ Remoção do campo "Nome do Currículo" e do conceito de múltiplos currículos
- ✅ Mecanismo de candidatura customizável: ao se candidatar, o candidato pode selecionar quais experiências, formações, habilidades e cursos destacar
- ✅ Indicação para o Gauge-Pro de que deve consumir sempre o perfil completo
- ✅ Adaptação da página "Meus Currículos" para "Meu Perfil Profissional"
- ✅ Atualização da barra de completude para refletir o perfil único
- ✅ Consolidação de dados existentes (currículos de desenvolvimento/teste)
- ✅ Atualização da visão da empresa sobre candidatos (perfil completo + destaque da candidatura)

### Excluído

- ❌ Alteração do layout visual das 5 abas (Informações, Experiência, Formação, Habilidades, Cursos) — permanecem como estão
- ❌ Implementação do parser de currículo (PRD-038 — projeto separado)
- ❌ Implementação do Gauge-Pro em si (PRDs de IA separados)
- ❌ Migração para Supabase (PRDs 063-072 — cadeia separada)
- ❌ Exportação de PDF (PRD-023 — será adaptado depois)
- ❌ Alteração nos campos existentes das 5 abas (sem adicionar ou remover campos)

---

## Requisitos Funcionais

### Perfil Profissional Único

- **RF-001:** O sistema deve permitir que cada candidato tenha exatamente **1 perfil profissional**, substituindo o modelo de múltiplos currículos
- **RF-002:** O campo "Nome do Currículo" deve ser removido da interface e do modelo de dados
- **RF-003:** O "Título Profissional" (já existente na aba Informações Básicas) deve ser promovido como identificador principal do perfil
- **RF-004:** As 5 seções existentes devem ser mantidas com os mesmos campos:
  - Informações Básicas: e-mail, telefone, localização, LinkedIn, sobre você, disponibilidade, pretensão salarial (mín/máx)
  - Experiência Profissional: cargo, empresa, período, descrição, flag "Atual"
  - Formação Acadêmica: grau, curso, instituição, status (Cursando, Completo, etc.)
  - Habilidades: nome, nível (Básico, Intermediário, Avançado, Expert), tipo (Técnica, Comportamental)
  - Cursos e Certificações: nome, instituição, ano
- **RF-005:** A barra de completude deve calcular o percentual com base no perfil único, considerando todas as seções
- **RF-006:** O botão "Importar CV" deve continuar funcional, alimentando o perfil único

### Navegação e Interface

- **RF-007:** O menu lateral do candidato deve exibir "Meu Perfil" em vez de "Meus Currículos"
- **RF-008:** A página de edição deve manter o título "Editar Perfil Profissional" (substituindo "Editar Currículo")
- **RF-009:** A rota deve ser atualizada de `/candidato/curriculos` para `/candidato/perfil`
- **RF-010:** A página de listagem de currículos deve ser substituída por acesso direto à edição do perfil único
- **RF-011:** Se o candidato acessar a rota antiga (`/candidato/curriculos`), deve ser redirecionado para `/candidato/perfil`

### Candidatura Customizável

- **RF-012:** Ao se candidatar a uma vaga, o candidato deve poder criar uma **visão customizada** do seu perfil
- **RF-013:** A customização deve permitir:
  - Selecionar quais experiências profissionais destacar para aquela vaga
  - Selecionar quais formações destacar
  - Selecionar quais habilidades destacar
  - Selecionar quais cursos/certificações destacar
- **RF-014:** Itens não selecionados **não são omitidos** do perfil — apenas não recebem destaque visual na visualização da empresa
- **RF-015:** Se o candidato não customizar, todos os itens do perfil são enviados sem destaque específico (comportamento padrão)
- **RF-016:** A customização deve ser armazenada por candidatura (cada candidatura pode ter sua própria seleção de destaques)
- **RF-017:** O candidato deve poder editar a customização enquanto a candidatura estiver em status "Enviada" ou "Em análise"

### Visão da Empresa

- **RF-018:** Ao visualizar um candidato, a empresa deve ver o perfil completo
- **RF-019:** Itens que o candidato destacou na candidatura devem receber indicação visual (ex: ícone de estrela, badge "Destaque do candidato")
- **RF-020:** O score de matching (Gauge-Pro) exibido para a empresa deve ser calculado com base no perfil completo, não apenas nos itens destacados

### Integração com Gauge-Pro

- **RF-021:** O Gauge-Pro deve consumir exclusivamente o perfil profissional completo do candidato para cálculo de scores
- **RF-022:** Todas as experiências, formações, habilidades e cursos devem ser considerados no matching, independentemente de destaques em candidaturas específicas
- **RF-023:** A remoção do modelo de múltiplos currículos deve eliminar qualquer ambiguidade sobre qual fonte de dados o Gauge-Pro utiliza

### Consolidação de Dados Existentes

- **RF-024:** Se um candidato possuir mais de um currículo, o sistema deve consolidar os dados no perfil único utilizando o currículo com maior completude como base
- **RF-025:** Experiências, formações, habilidades e cursos de outros currículos que não existam no currículo base devem ser adicionados ao perfil único
- **RF-026:** Duplicatas exatas devem ser eliminadas automaticamente
- **RF-027:** Em caso de conflito em informações básicas (ex: telefones diferentes), os dados do currículo mais recente devem prevalecer

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** A transição entre abas do perfil deve ocorrer em menos de 500ms
- **RNF-002 (Performance):** O cálculo de completude deve ser instantâneo (< 100ms) ao salvar alterações
- **RNF-003 (UX):** O fluxo de candidatura customizável deve adicionar no máximo 1 etapa ao processo atual de candidatura
- **RNF-004 (Compatibilidade):** Chrome, Firefox, Safari, Edge (versões recentes)
- **RNF-005 (Responsividade):** Perfil e customização devem funcionar em dispositivos móveis (320px+)

---

## Critérios de Aceitação

### RF-001 / RF-002: Perfil Único

```gherkin
DADO que o candidato está logado
QUANDO acessa a área de perfil profissional
ENTÃO deve visualizar um único perfil editável
  E não deve existir opção de "criar novo currículo"
  E não deve existir campo "Nome do Currículo"
```

### RF-007 / RF-009: Navegação Atualizada

```gherkin
DADO que o candidato está logado
QUANDO visualiza o menu lateral
ENTÃO deve ver "Meu Perfil" onde antes havia "Meus Currículos"
  E ao clicar deve ser redirecionado para /candidato/perfil
```

### RF-011: Redirecionamento de Rota Antiga

```gherkin
DADO que o candidato acessa /candidato/curriculos
QUANDO a página carrega
ENTÃO deve ser redirecionado para /candidato/perfil
  E a transição deve ser transparente (sem tela de erro)
```

### RF-012 / RF-013: Candidatura Customizável

```gherkin
DADO que o candidato está se candidatando a uma vaga
QUANDO chega na etapa de customização
ENTÃO deve ver a lista de suas experiências, formações, habilidades e cursos
  E deve poder marcar/desmarcar itens para destaque
  E itens marcados devem receber indicação visual de "destacado"
```

### RF-015: Candidatura sem Customização

```gherkin
DADO que o candidato está se candidatando a uma vaga
QUANDO pula a etapa de customização (ou não altera nada)
ENTÃO a candidatura deve ser enviada com o perfil completo sem destaques
  E a candidatura deve ser processada normalmente
```

### RF-018 / RF-019: Visão da Empresa

```gherkin
DADO que o recrutador está visualizando um candidato que se candidatou à vaga
QUANDO abre o perfil do candidato
ENTÃO deve ver o perfil profissional completo
  E itens destacados pelo candidato devem ter indicação visual sutil
  E o score de matching deve refletir o perfil completo
```

### RF-024 a RF-027: Consolidação

```gherkin
DADO que existem candidatos com múltiplos currículos no banco de desenvolvimento
QUANDO o processo de consolidação é executado
ENTÃO cada candidato deve ter exatamente 1 perfil profissional
  E nenhuma experiência, formação, habilidade ou curso deve ser perdido
  E duplicatas exatas devem ser removidas
```

### Cenários de Erro

```gherkin
DADO que o candidato está editando o perfil
QUANDO tenta salvar e ocorre erro de conexão
ENTÃO o sistema deve exibir mensagem de erro amigável
  E os dados preenchidos não devem ser perdidos (manter no formulário)
  E deve oferecer opção de "Tentar novamente"
```

```gherkin
DADO que o candidato está customizando uma candidatura
QUANDO desmarca todos os itens de todas as seções
ENTÃO o sistema deve permitir enviar (perfil completo vai sem destaques)
  E não deve bloquear a candidatura
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Reestruturação do modelo de dados e consolidação | 3-5 |
| 2 | Atualização da interface do perfil (remoção de múltiplos, renomeações) | 5-8 |
| 3 | Mecanismo de candidatura customizável | 4-6 |
| 4 | Adaptação da visão da empresa e integração Gauge-Pro | 3-5 |
| 5 | Validação, redirecionamentos e limpeza | 2-3 |

### Detalhamento das Fases

#### Fase 1: Reestruturação do Modelo de Dados

**Objetivo:** Transformar a estrutura de múltiplos currículos em perfil único

**Ações:**
- [ ] Analisar o modelo de dados atual de currículos (estrutura, relações, campos)
- [ ] Reestruturar o modelo para perfil único por candidato (1:1 em vez de 1:N)
- [ ] Remover o campo "Nome do Currículo" do modelo
- [ ] Criar estrutura de dados para "destaques de candidatura" (relação entre candidatura e itens destacados)
- [ ] Implementar script de consolidação para dados existentes (RF-024 a RF-027)

**Validação:** Cada candidato no sistema tem exatamente 1 perfil. Dados não foram perdidos.

#### Fase 2: Atualização da Interface do Perfil

**Objetivo:** Adaptar todas as telas do candidato para o conceito de perfil único

**Ações:**
- [ ] Substituir página de listagem de currículos por acesso direto ao perfil
- [ ] Remover botão "Criar novo currículo"
- [ ] Remover campo "Nome do Currículo" da aba Informações Básicas
- [ ] Atualizar título da página: "Editar Perfil Profissional"
- [ ] Atualizar menu lateral: "Meu Perfil" em vez de "Meus Currículos"
- [ ] Atualizar rota para `/candidato/perfil`
- [ ] Manter inalteradas as 5 abas e seus campos
- [ ] Recalcular barra de completude para contexto de perfil único

**Validação:** Candidato acessa, edita e salva o perfil profissional sem referências a "currículo" ou opção de criar múltiplos.

#### Fase 3: Candidatura Customizável

**Objetivo:** Implementar o mecanismo de destaque de itens por candidatura

**Ações:**
- [ ] Adicionar etapa de customização no fluxo de candidatura
- [ ] Criar interface de seleção de destaques (experiências, formações, habilidades, cursos)
- [ ] Implementar persistência dos destaques por candidatura
- [ ] Permitir que o candidato pule a customização (envio padrão sem destaques)
- [ ] Permitir edição de destaques em candidaturas com status "Enviada" ou "Em análise"

**Validação:** Candidato se candidata a 2 vagas diferentes com destaques diferentes. Ambas as candidaturas mantêm suas customizações independentes.

#### Fase 4: Visão da Empresa e Gauge-Pro

**Objetivo:** Adaptar o que a empresa vê e garantir que o Gauge-Pro consome o perfil completo

**Ações:**
- [ ] Atualizar a visualização do candidato pela empresa para exibir perfil completo
- [ ] Adicionar indicação visual sutil para itens destacados pelo candidato
- [ ] Garantir que o endpoint/fonte de dados do Gauge-Pro consome o perfil completo
- [ ] Remover qualquer lógica que referencie "currículo selecionado" no matching

**Validação:** Empresa vê perfil completo com destaques sinalizados. Score de matching é idêntico independentemente dos destaques escolhidos.

#### Fase 5: Validação, Redirecionamentos e Limpeza

**Objetivo:** Garantir transição completa e limpar resquícios

**Ações:**
- [ ] Implementar redirecionamento de rotas antigas (`/candidato/curriculos` → `/candidato/perfil`)
- [ ] Remover código morto relacionado a múltiplos currículos (listagem, criação, seleção)
- [ ] Verificar todos os pontos do sistema que referenciavam "currículo" e atualizar para "perfil"
- [ ] Testar fluxos completos: edição de perfil → candidatura customizada → visão da empresa → matching

**Validação:** Nenhuma referência a "múltiplos currículos" permanece no código. Todas as rotas antigas redirecionam corretamente. Fluxo end-to-end funciona.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-022 | Gestão de Currículos (duplicar, arquivar, completude) | ⚠️ Parcialmente substituído por este PRD |
| PRD-023 | Exportar PDF de currículo | ⏳ Será adaptado após este PRD |
| PRD-038 | Parser de Currículo com IA | ⏳ Alimentará o perfil único |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Nenhum | - | - |

### Decisões Pendentes

- [ ] Nenhuma — todas as decisões foram tomadas durante o planejamento

---

## PRDs Impactados

Este PRD altera o comportamento esperado de PRDs anteriores:

| PRD | Impacto | Ação Necessária |
|-----|---------|-----------------|
| **PRD-022** | Funcionalidades "duplicar currículo" e "arquivar currículo" perdem sentido com perfil único | Considerar substituído parcialmente. Manter apenas: completude detalhada, preview "como empresa vê", experiência com "trabalho atual", formação com status, habilidades com níveis, cursos com certificado |
| **PRD-023** | Exportação de PDF agora parte do perfil único em vez de currículo selecionado | Adaptar para exportar perfil profissional. Templates permanecem válidos |
| **PRD-038** | Parser de currículo agora alimenta perfil único em vez de criar novo currículo | Ajustar destino do parsing para o perfil profissional único |
| **PRD-064** | Schema core do Supabase precisa refletir modelo de perfil único | Revisar tabela de currículos no schema para refletir relação 1:1 candidato-perfil |

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Informações pessoais (e-mail, telefone, localização) | PII | Protegido por autenticação e autorização |
| Histórico profissional | Sensível | Acessível apenas pelo candidato e empresas com candidatura ativa |
| Pretensão salarial | Sensível | Visível apenas para empresas às quais o candidato se candidatou |

### Autenticação e Autorização

- Apenas o próprio candidato pode editar seu perfil profissional
- Empresas só visualizam perfis de candidatos que se candidataram às suas vagas (ou que estão no banco de talentos, conforme configuração de visibilidade)
- Destaques de candidatura são editáveis apenas pelo candidato e somente em candidaturas com status permitido

### Auditoria

- Registrar timestamp de cada alteração no perfil profissional
- Registrar quando e quais destaques foram definidos por candidatura
- Manter log de consolidação de dados (se múltiplos currículos existirem)

---

## Fluxos de Usuário

### Fluxo 1: Editar Perfil Profissional (Happy Path)

1. Candidato clica em "Meu Perfil" no menu lateral
2. Sistema exibe o perfil profissional com as 5 abas
3. Candidato edita informações em qualquer aba
4. Candidato clica em "Salvar"
5. Sistema salva e atualiza a barra de completude
6. Sistema exibe confirmação de salvamento

### Fluxo 2: Candidatura com Customização (Happy Path)

1. Candidato visualiza uma vaga e clica em "Candidatar-se"
2. Sistema exibe etapa de customização: "Destaque seus pontos fortes para esta vaga"
3. Sistema lista experiências, formações, habilidades e cursos do perfil com checkboxes
4. Candidato marca os itens que quer destacar
5. Candidato clica em "Enviar Candidatura"
6. Sistema armazena a candidatura com os destaques selecionados
7. Sistema confirma envio

### Fluxo 3: Candidatura sem Customização (Alternativo)

1. Candidato visualiza uma vaga e clica em "Candidatar-se"
2. Sistema exibe etapa de customização
3. Candidato clica em "Pular" ou "Enviar sem destaques"
4. Sistema envia candidatura com perfil completo sem destaques
5. Sistema confirma envio

### Fluxo 4: Empresa Visualiza Candidato (Happy Path)

1. Recrutador abre lista de candidatos de uma vaga
2. Clica em um candidato
3. Sistema exibe perfil profissional completo
4. Itens destacados pelo candidato aparecem com indicação visual sutil
5. Score de matching exibido reflete análise do perfil completo

### Fluxo de Erro: Perfil Incompleto ao Candidatar

```
Candidato tenta se candidatar com perfil < 50% completo
  → Sistema exibe alerta: "Complete seu perfil para se candidatar"
  → Oferece link direto para edição do perfil
  → Não bloqueia a candidatura, mas recomenda completar
```

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. INVESTIGAÇÃO CRÍTICA:**
> - Mapeie TODOS os arquivos que referenciam "currículo" ou "curriculum" no codebase
> - Identifique o modelo de dados atual (mock ou Supabase) e como os currículos são armazenados
> - Verifique quantos candidatos de teste possuem múltiplos currículos
> - Entenda o fluxo de candidatura atual antes de adicionar a etapa de customização

> **⚠️ 3. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/) — **MINOR +1** (nova funcionalidade)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — usar tipos **Changed** e **Removed**
> - Atualizar o registro de versão no banco de dados (se aplicável)
> - Renomear este arquivo adicionando `_DONE` ao final
>   Ex: `PRD-073-cand-perfil-profissional-unificado_DONE.md`
> - Atualizar a seção "Status de Implementação" com:
>   - Status: ✅ IMPLEMENTADO
>   - Data de Implementação
>   - Versão do App após implementação
>   - Observações relevantes

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| **Nova funcionalidade** | **MINOR +1, PATCH = 0** | **1.0.1 → 1.1.0** |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Codinome sugerido: **"Monolith"** — representa a consolidação de múltiplos em um.

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
| **Dados existentes** | A plataforma está em desenvolvimento — se houver candidatos com múltiplos currículos, são dados de teste. Consolidar usando o mais completo como base |
| **Abas do perfil** | As 5 abas (Informações, Experiência, Formação, Habilidades, Cursos) devem permanecer visualmente idênticas ao estado atual |
| **Candidatura customizável** | A etapa de customização deve ser opcional e rápida — checkboxes simples, sem arrastar/soltar ou reordenação |
| **Gauge-Pro** | Atualmente mockado — apenas garantir que o ponto de consumo de dados referencia o perfil único. A lógica real do Gauge-Pro será implementada nos PRDs de IA |
| **Terminologia** | Substituir "currículo" por "perfil profissional" em toda a interface do candidato. Na visão da empresa, pode usar "perfil do candidato" |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Alterar os campos das 5 abas existentes (não adicionar nem remover campos) |
| Criar lógica complexa de merge/consolidação — é ambiente de desenvolvimento, consolidação simples basta |
| Bloquear candidatura por falta de customização — a etapa deve ser sempre opcional |
| Mostrar para a empresa apenas os itens destacados — o perfil completo deve estar sempre visível |
| Implementar lógica real do Gauge-Pro — apenas garantir que o ponto de consumo referencia o perfil único |
| Fazer refatoração geral das páginas do candidato — focar apenas nas mudanças deste PRD |

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
| 10/02/2026 | v1 | Criação inicial — reestruturação de múltiplos currículos para perfil profissional unificado |

---

**AILA - Sistemas Inteligentes**
