# PRD-022: Currículos Avançados

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Aprimorar o sistema de múltiplos currículos com funcionalidades avançadas |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | Múltiplas melhorias em várias seções, lógica de completude, preview |

---

## Contexto do Problema

O sistema atual de currículos funciona, mas está básico. Candidatos precisam de mais controle sobre seus currículos: duplicar para diferentes áreas, arquivar versões antigas, ver exatamente o que as empresas visualizam, e ter orientação clara sobre o que falta preencher.

### Problemas Atuais

- Não é possível duplicar um currículo existente
- Excluir é a única opção (não há arquivamento)
- Completude mostra só %, não indica O QUE falta
- Candidato não sabe como a empresa vê seu perfil
- Campos de experiência não indicam "trabalho atual"
- Formação não tem status (em andamento, completo)
- Habilidades não têm nível de proficiência
- Cursos não permitem upload de certificado

---

## Conceito da Solução

### Lista de Currículos (Melhorada)

```
┌──────────────────────────────────────────────────────────────────┐
│  Meus Currículos                                                 │
│  Gerencie seus currículos para diferentes oportunidades          │
│                                                                  │
│  [Ativos: 2]  [Arquivados: 1]                   [+ Novo Currículo]│
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                                              ⭐ Padrão    ⋮ │  │
│  │  Meu Currículo                                             │  │
│  │  Desenvolvedor Full Stack                                  │  │
│  │  📍 São Paulo, SP | ✉ joao@email.com                       │  │
│  │  ⏰ Disponibilidade: 30 dias                               │  │
│  │                                                            │  │
│  │  Completude                                          100%  │  │
│  │  ████████████████████████████████████████████████████████  │  │
│  │  ✅ Todas as seções preenchidas                            │  │
│  │                                                            │  │
│  │  Atualizado em 08 de jan de 2026                          │  │
│  │                                                            │  │
│  │  [✏️ Editar]  [👁️ Preview]                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                                                          ⋮ │  │
│  │  Currículo Tech                                            │  │
│  │  Sem título profissional                                   │  │
│  │  ⏰ Disponibilidade: A negociar                            │  │
│  │                                                            │  │
│  │  Completude                                           45%  │  │
│  │  ██████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│  │  ⚠️ Faltam: Experiência, Formação, Habilidades             │  │
│  │                                                            │  │
│  │  Atualizado em 11 de jan de 2026                          │  │
│  │                                                            │  │
│  │  [✏️ Editar]  [👁️ Preview]                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │                                                            │  │
│  │          +  Criar Novo Currículo                          │  │
│  │          Para outra área ou oportunidade                   │  │
│  │                                                            │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Menu de Ações do Currículo (⋮)

```
┌────────────────────────┐
│ ⭐ Definir como padrão │
│ 📋 Duplicar currículo  │
│ 📦 Arquivar            │
│ ─────────────────────  │
│ 🗑️ Excluir             │
└────────────────────────┘
```

### Completude Detalhada (Tooltip/Expandido)

```
┌──────────────────────────────────────────────────────────────────┐
│  Completude do Currículo                                    45%  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✅ Informações básicas                              Completo    │
│  ❌ Experiência profissional                         0 itens     │
│  ❌ Formação acadêmica                               0 itens     │
│  ⚠️ Cursos e certificações                          1 item      │
│  ❌ Habilidades                                      0 itens     │
│  ✅ Documentos                                       PDF enviado │
│                                                                  │
│  💡 Dica: Currículos completos têm 3x mais visualizações        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Preview "Como a Empresa Vê"

```
┌──────────────────────────────────────────────────────────────────┐
│  👁️ Preview do Currículo                               [✕ Fechar]│
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Este é o preview de como as empresas visualizam           │  │
│  │  seu currículo no Banco de Talentos e nas candidaturas.    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ ┌──────┐                                                 │    │
│  │ │ Foto │  João Silva                                     │    │
│  │ └──────┘  Desenvolvedor Full Stack                       │    │
│  │           📍 São Paulo, SP | 💼 Disponível em 30 dias    │    │
│  │                                                          │    │
│  │  📊 Perfil: Analítico (DISC)                             │    │
│  │                                                          │    │
│  │  ─────────────────────────────────────────────────────   │    │
│  │                                                          │    │
│  │  Sobre                                                   │    │
│  │  Desenvolvedor apaixonado por tecnologia com 5 anos...   │    │
│  │                                                          │    │
│  │  Habilidades                                             │    │
│  │  [React ●●●●○] [Node.js ●●●●●] [TypeScript ●●●●○]       │    │
│  │                                                          │    │
│  │  Experiência                                             │    │
│  │  • Tech Lead @ TechCorp (2022 - atual)                  │    │
│  │  • Senior Dev @ StartupXYZ (2019 - 2022)                │    │
│  │                                                          │    │
│  │  Formação                                                │    │
│  │  • Ciência da Computação - USP (2015 - 2019)            │    │
│  │                                                          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│                                              [✏️ Editar Currículo]│
└──────────────────────────────────────────────────────────────────┘
```

### Tab Experiência (Melhorada)

```
┌──────────────────────────────────────────────────────────────────┐
│  💼 Experiência Profissional                        [+ Adicionar]│
│  Seu histórico de trabalho e experiências                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Tech Lead                                    🟢 Atual    ⋮ │  │
│  │  🏢 TechCorp Soluções                                      │  │
│  │  📍 São Paulo, SP                                          │  │
│  │  📅 jan. 2022 - atual (3 anos e 1 mês)                    │  │
│  │                                                            │  │
│  │  Liderança técnica de equipe de 8 desenvolvedores,        │  │
│  │  definição de arquitetura e code review...                │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Senior Developer                                        ⋮ │  │
│  │  🏢 StartupXYZ                                             │  │
│  │  📍 Remoto                                                 │  │
│  │  📅 mar. 2019 - dez. 2021 (2 anos e 10 meses)             │  │
│  │                                                            │  │
│  │  Desenvolvimento full stack com React e Node.js...        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  💡 Dica: Ordene da mais recente para a mais antiga             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Modal de Experiência (com "Trabalho Atual")

```
┌──────────────────────────────────────────────────────────────────┐
│  Adicionar Experiência                                     [✕]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Cargo *                                                         │
│  [Tech Lead                                                 ]    │
│                                                                  │
│  Empresa *                                                       │
│  [TechCorp Soluções                                         ]    │
│                                                                  │
│  Localização                                                     │
│  [São Paulo, SP                                             ]    │
│                                                                  │
│  Data de Início *                      Data de Término           │
│  [Janeiro    ▼] [2022 ▼]              [           ▼] [     ▼]   │
│                                                                  │
│  [✓] Trabalho atual (ainda estou nesta empresa)                 │
│                                                                  │
│  Descrição das atividades                                        │
│  [Liderança técnica de equipe de 8 desenvolvedores,         ]   │
│  [definição de arquitetura, code review, mentoria...        ]   │
│  [                                                          ]   │
│                                                   150/2000 car   │
│                                                                  │
│                                    [Cancelar]  [💾 Salvar]       │
└──────────────────────────────────────────────────────────────────┘
```

### Tab Formação (com Status)

```
┌──────────────────────────────────────────────────────────────────┐
│  🎓 Formação Acadêmica                              [+ Adicionar]│
│  Sua formação educacional                                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Graduação  Ciência da Computação           ✅ Completo  ⋮ │  │
│  │  🏫 Universidade de São Paulo (USP)                        │  │
│  │  📅 2015 - 2019                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Pós-graduação  MBA em Gestão de Projetos   🔄 Cursando  ⋮ │  │
│  │  🏫 FGV                                                    │  │
│  │  📅 2024 - atual                                           │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Tab Habilidades (com Nível)

```
┌──────────────────────────────────────────────────────────────────┐
│  🔧 Habilidades                                                  │
│  Suas competências técnicas e comportamentais                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Habilidades Técnicas                                            │
│  [Digite uma habilidade e pressione Enter...              ] [+] │
│                                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│  │ React           │ │ Node.js         │ │ TypeScript      │    │
│  │ ●●●●○ Avançado  │ │ ●●●●● Expert    │ │ ●●●●○ Avançado  │    │
│  │            [✕]  │ │            [✕]  │ │            [✕]  │    │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│                                                                  │
│  ┌─────────────────┐ ┌─────────────────┐                        │
│  │ PostgreSQL      │ │ Docker          │                        │
│  │ ●●●○○ Intermed. │ │ ●●●○○ Intermed. │                        │
│  │            [✕]  │ │            [✕]  │                        │
│  └─────────────────┘ └─────────────────┘                        │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Habilidades Comportamentais                                     │
│  [Digite uma habilidade e pressione Enter...              ] [+] │
│                                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│  │ Liderança       │ │ Comunicação     │ │ Trabalho equipe │    │
│  │ ●●●●○ Avançado  │ │ ●●●●● Expert    │ │ ●●●●○ Avançado  │    │
│  │            [✕]  │ │            [✕]  │ │            [✕]  │    │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│                                                                  │
│  💡 Clique na habilidade para alterar o nível                   │
│                                                                  │
│  Níveis: ●○○○○ Básico | ●●○○○ Iniciante | ●●●○○ Intermediário  │
│          ●●●●○ Avançado | ●●●●● Expert                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Tab Cursos (com Certificado)

```
┌──────────────────────────────────────────────────────────────────┐
│  📜 Cursos e Certificações                          [+ Adicionar]│
│  Cursos complementares e certificações                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  React Avançado                                          ⋮ │  │
│  │  🏫 Udemy | 📅 2024 | ⏱️ 40h                               │  │
│  │  📎 Certificado anexado                    [👁️ Visualizar] │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  AWS Solutions Architect                                 ⋮ │  │
│  │  🏫 Amazon Web Services | 📅 2023 | ⏱️ 60h                 │  │
│  │  🔗 Link de verificação                          [🔗 Abrir] │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Scrum Master                                            ⋮ │  │
│  │  🏫 Scrum.org | 📅 2022 | ⏱️ 16h                           │  │
│  │  ⚠️ Sem certificado anexado                  [📎 Adicionar] │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Modal de Curso (com Upload)

```
┌──────────────────────────────────────────────────────────────────┐
│  Adicionar Curso/Certificação                              [✕]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Nome do Curso *                                                 │
│  [React Avançado                                            ]    │
│                                                                  │
│  Instituição/Plataforma *                                        │
│  [Udemy                                                     ]    │
│                                                                  │
│  Ano de Conclusão *              Carga Horária (opcional)        │
│  [2024                    ▼]     [40        ] horas              │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Comprovante (opcional)                                          │
│                                                                  │
│  ( ) Upload de arquivo    ( ) Link de verificação               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                                                            │  │
│  │     📄 Arraste o certificado aqui ou clique para enviar   │  │
│  │                                                            │  │
│  │     PDF, PNG ou JPG - máximo 5MB                          │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│                                    [Cancelar]  [💾 Salvar]       │
└──────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Duplicar currículo existente
- ✅ Arquivar currículo (com aba separada)
- ✅ Desarquivar currículo
- ✅ Definir currículo como padrão
- ✅ Completude detalhada (mostra O QUE falta)
- ✅ Preview "como a empresa vê"
- ✅ Experiência: checkbox "trabalho atual"
- ✅ Experiência: badge "Atual" verde
- ✅ Formação: status (Completo, Cursando, Trancado, Incompleto)
- ✅ Habilidades: nível de proficiência (5 níveis)
- ✅ Cursos: upload de certificado (imagem/PDF)
- ✅ Cursos: link de verificação alternativo
- ✅ Dicas contextuais nas seções

### Excluído

- ❌ Reordenação drag-and-drop (futuro)
- ❌ Sugestões automáticas de habilidades (futuro)
- ❌ Importar de LinkedIn (futuro)
- ❌ Versionamento de currículo (futuro)

---

## Requisitos Funcionais

### Lista de Currículos

- **RF-001:** Exibir currículos em duas abas: "Ativos" e "Arquivados"
- **RF-002:** Menu de ações (⋮) com: Definir padrão, Duplicar, Arquivar, Excluir
- **RF-003:** Ao duplicar, criar cópia com nome "[Original] - Cópia"
- **RF-004:** Ao arquivar, mover para aba "Arquivados"
- **RF-005:** Apenas um currículo pode ser "Padrão" por vez
- **RF-006:** Currículo padrão usado automaticamente em candidaturas

### Completude Detalhada

- **RF-007:** Calcular % baseado em seções preenchidas
- **RF-008:** Exibir lista de seções faltantes no card
- **RF-009:** Seções: Informações, Experiência, Formação, Cursos, Habilidades, Documentos
- **RF-010:** Mostrar dica "Currículos completos têm 3x mais visualizações"

### Preview

- **RF-011:** Botão "Preview" abre modal/drawer
- **RF-012:** Preview mostra exatamente o que empresa vê
- **RF-013:** Incluir: foto, nome, título, localização, sobre, habilidades, experiências, formação
- **RF-014:** Mostrar nível das habilidades no preview

### Experiência

- **RF-015:** Checkbox "Trabalho atual" no formulário
- **RF-016:** Se marcado, esconder campo "Data de término"
- **RF-017:** Badge "🟢 Atual" no card da experiência
- **RF-018:** Calcular duração automaticamente (X anos e Y meses)

### Formação

- **RF-019:** Campo select "Status": Completo, Cursando, Trancado, Incompleto
- **RF-020:** Badge de status no card (✅ Completo, 🔄 Cursando, etc.)
- **RF-021:** Se "Cursando", ano de término pode ficar vazio

### Habilidades

- **RF-022:** Ao adicionar habilidade, definir nível (padrão: Intermediário)
- **RF-023:** Níveis: Básico, Iniciante, Intermediário, Avançado, Expert
- **RF-024:** Exibir nível visual (●●●○○)
- **RF-025:** Clicar na habilidade abre popover para alterar nível

### Cursos

- **RF-026:** Opção de upload de certificado (PDF, PNG, JPG, max 5MB)
- **RF-027:** Opção alternativa de link de verificação
- **RF-028:** Preview do certificado (se imagem) ou link para abrir (se PDF)
- **RF-029:** Indicar visualmente se tem ou não comprovante

---

## Requisitos Não-Funcionais

- **RNF-001 (UX):** Ações destrutivas (excluir) pedem confirmação
- **RNF-002 (UX):** Feedback visual em todas as ações (toast)
- **RNF-003 (Performance):** Upload de certificado com preview instantâneo
- **RNF-004 (Acessibilidade):** Níveis de habilidade legíveis (não só visual)

---

## Critérios de Aceitação

### RF-002/RF-003: Duplicar Currículo

```gherkin
DADO que o candidato tem um currículo
QUANDO ele clica em "Duplicar currículo" no menu
ENTÃO deve criar uma cópia com nome "[Original] - Cópia"
  E a cópia deve ter todos os dados do original
  E deve exibir toast "Currículo duplicado com sucesso"
```

### RF-007 a RF-010: Completude

```gherkin
DADO que o candidato tem um currículo incompleto
QUANDO ele visualiza o card do currículo
ENTÃO deve ver a porcentagem de completude
  E deve ver lista das seções que faltam preencher
  E deve ver dica sobre importância de completar
```

### RF-015 a RF-017: Trabalho Atual

```gherkin
DADO que o candidato está adicionando experiência
QUANDO ele marca "Trabalho atual"
ENTÃO o campo "Data de término" deve ser ocultado
  E ao salvar, o card deve exibir badge "🟢 Atual"
  E a duração deve calcular até a data presente
```

### RF-022 a RF-025: Nível de Habilidade

```gherkin
DADO que o candidato adiciona uma habilidade
QUANDO ele clica na habilidade
ENTÃO deve abrir popover com opções de nível
  E ao selecionar, deve atualizar o visual (●●●○○)
  E o nível deve aparecer por extenso (Avançado)
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Lista e ações básicas | 3 |
| 2 | Completude detalhada | 2 |
| 3 | Preview do currículo | 2 |
| 4 | Melhorias nas seções | 4 |
| 5 | Upload de certificado | 2 |

### Detalhamento das Fases

#### Fase 1: Lista e Ações

**Objetivo:** Implementar duplicar, arquivar, definir padrão

**Ações:**
- [ ] Adicionar abas "Ativos" e "Arquivados"
- [ ] Criar menu de ações (dropdown)
- [ ] Implementar duplicar currículo
- [ ] Implementar arquivar/desarquivar
- [ ] Implementar definir como padrão

**Validação:** Todas as ações funcionam com feedback

#### Fase 2: Completude Detalhada

**Objetivo:** Mostrar O QUE falta preencher

**Ações:**
- [ ] Criar lógica de cálculo de completude por seção
- [ ] Criar componente `CompletudeDetail`
- [ ] Exibir seções faltantes no card
- [ ] Adicionar dicas

**Validação:** Card mostra seções faltantes corretamente

#### Fase 3: Preview

**Objetivo:** "Ver como a empresa vê"

**Ações:**
- [ ] Criar componente `CurriculumPreview`
- [ ] Criar modal/drawer de preview
- [ ] Renderizar dados formatados
- [ ] Incluir todas as seções

**Validação:** Preview mostra dados completos formatados

#### Fase 4: Melhorias nas Seções

**Objetivo:** Experiência, Formação, Habilidades aprimoradas

**Ações:**
- [ ] Experiência: checkbox "trabalho atual" + badge
- [ ] Formação: select de status + badge
- [ ] Habilidades: níveis de proficiência
- [ ] Popover para alterar nível

**Validação:** Todas as melhorias funcionais

#### Fase 5: Upload de Certificado

**Objetivo:** Comprovante nos cursos

**Ações:**
- [ ] Criar componente de upload
- [ ] Validar tipo e tamanho
- [ ] Preview de imagem ou link para PDF
- [ ] Alternativa de link de verificação

**Validação:** Upload e visualização funcionam

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-005 | Perfil Completo do Candidato | ✅ Implementado |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.21.0 → 0.22.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.22.0] - 2026-01-XX

### Added
- Duplicar currículo existente
- Arquivar/desarquivar currículos
- Completude detalhada (mostra seções faltantes)
- Preview "como a empresa vê"
- Experiência: checkbox "trabalho atual" e badge
- Formação: status (Completo, Cursando, etc.)
- Habilidades: níveis de proficiência (5 níveis)
- Cursos: upload de certificado e link de verificação
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Duplicar** | Copiar todos os dados, gerar novo ID |
| **Arquivar** | Soft delete (flag `archived: true`) |
| **Níveis** | Array ou enum: basic, beginner, intermediate, advanced, expert |
| **Upload** | FileReader para preview, armazenar base64 (mock) |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Excluir dados reais ao arquivar |
| Permitir múltiplos currículos "padrão" |
| Upload sem validação de tipo/tamanho |
| Níveis de habilidade apenas visuais (incluir texto) |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 15/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
