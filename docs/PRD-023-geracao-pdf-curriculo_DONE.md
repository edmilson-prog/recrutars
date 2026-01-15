# PRD-023: Geração de PDF do Currículo

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Permitir exportação do currículo em PDF formatado |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | Geração de documento, templates, formatação |

---

## Contexto do Problema

O candidato já pode fazer upload de um PDF externo, mas muitos preferem gerar um currículo formatado diretamente a partir dos dados cadastrados na plataforma. Isso garante consistência, atualização automática e visual profissional.

### Benefícios

- Currículo sempre atualizado (gerado dos dados)
- Visual profissional padronizado
- Opções de templates
- Sem necessidade de ferramentas externas
- Pode usar para candidaturas fora da plataforma

---

## Conceito da Solução

### Botão de Exportação

```
┌──────────────────────────────────────────────────────────────────┐
│  Meu Currículo  ⭐ Padrão                               100% ████│
│  Desenvolvedor Full Stack                                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [✏️ Editar]  [👁️ Preview]  [📄 Exportar PDF]                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Modal de Exportação

```
┌──────────────────────────────────────────────────────────────────┐
│  📄 Exportar Currículo em PDF                              [✕]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Escolha o template:                                             │
│                                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│  │   ┌─────────┐   │ │   ┌─────────┐   │ │   ┌─────────┐   │    │
│  │   │░░░░░░░░░│   │ │   │▓▓▓▓▓▓▓▓▓│   │ │   │█████████│   │    │
│  │   │─────────│   │ │   │─────────│   │ │   │    ○    │   │    │
│  │   │░░░░░░░░░│   │ │   │▓▓▓▓▓▓▓▓▓│   │ │   │─────────│   │    │
│  │   │░░░░░░░░░│   │ │   │▓▓▓▓▓▓▓▓▓│   │ │   │█████████│   │    │
│  │   └─────────┘   │ │   └─────────┘   │ │   └─────────┘   │    │
│  │                 │ │                 │ │                 │    │
│  │   Clássico      │ │   Moderno       │ │   Minimalista   │    │
│  │   ○ Selecionar  │ │   ● Selecionado │ │   ○ Selecionar  │    │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Seções a incluir:                                               │
│                                                                  │
│  [✓] Informações pessoais         [✓] Experiência profissional  │
│  [✓] Resumo profissional          [✓] Formação acadêmica        │
│  [✓] Habilidades técnicas         [✓] Cursos e certificações    │
│  [✓] Habilidades comportamentais  [ ] Pretensão salarial        │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Opções:                                                         │
│                                                                  │
│  [✓] Incluir foto                                               │
│  [ ] Incluir links profissionais (LinkedIn, GitHub, etc.)       │
│  [ ] Incluir QR Code do perfil na plataforma                    │
│                                                                  │
│                                                                  │
│               [👁️ Pré-visualizar]  [📄 Baixar PDF]               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Preview do PDF (Modal Expandido)

```
┌──────────────────────────────────────────────────────────────────┐
│  Pré-visualização do PDF                      [← Voltar] [✕]    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ┌──────────────────────────────────────────────────────┐   │  │
│  │ │                                                      │   │  │
│  │ │  ┌──────┐  JOÃO SILVA                               │   │  │
│  │ │  │ Foto │  Desenvolvedor Full Stack                 │   │  │
│  │ │  └──────┘  📍 São Paulo, SP                         │   │  │
│  │ │            ✉ joao@email.com | 📱 (11) 99999-9999    │   │  │
│  │ │                                                      │   │  │
│  │ │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │   │  │
│  │ │                                                      │   │  │
│  │ │  RESUMO PROFISSIONAL                                │   │  │
│  │ │  Desenvolvedor apaixonado por tecnologia com 5     │   │  │
│  │ │  anos de experiência em React e Node.js...         │   │  │
│  │ │                                                      │   │  │
│  │ │  HABILIDADES                                        │   │  │
│  │ │  • React (Avançado)    • Node.js (Expert)          │   │  │
│  │ │  • TypeScript (Avanç.) • PostgreSQL (Intermed.)    │   │  │
│  │ │                                                      │   │  │
│  │ │  EXPERIÊNCIA PROFISSIONAL                           │   │  │
│  │ │                                                      │   │  │
│  │ │  Tech Lead                           Jan/2022 - Atual│   │  │
│  │ │  TechCorp Soluções | São Paulo, SP                  │   │  │
│  │ │  Liderança técnica de equipe de 8 desenvolvedores...│   │  │
│  │ │                                                      │   │  │
│  │ │  Senior Developer                    Mar/2019 - Dez/2021│  │  │
│  │ │  StartupXYZ | Remoto                                │   │  │
│  │ │  Desenvolvimento full stack com React e Node.js...  │   │  │
│  │ │                                                      │   │  │
│  │ │  FORMAÇÃO ACADÊMICA                                 │   │  │
│  │ │                                                      │   │  │
│  │ │  Ciência da Computação              2015 - 2019    │   │  │
│  │ │  Universidade de São Paulo (USP)                    │   │  │
│  │ │                                                      │   │  │
│  │ └──────────────────────────────────────────────────────┘   │  │
│  │                                                    Página 1│  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│                               [📄 Baixar PDF]                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Templates de PDF

#### Template Clássico

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌──────┐                                                        │
│  │ FOTO │  NOME COMPLETO                                         │
│  └──────┘  Título Profissional                                   │
│            contato@email.com | (00) 00000-0000                   │
│            Cidade, Estado                                        │
│                                                                  │
│  ════════════════════════════════════════════════════════════   │
│                                                                  │
│  RESUMO PROFISSIONAL                                             │
│  ────────────────────                                            │
│  Texto do resumo...                                              │
│                                                                  │
│  EXPERIÊNCIA PROFISSIONAL                                        │
│  ────────────────────────                                        │
│  Cargo | Empresa                               Período           │
│  Descrição das atividades...                                     │
│                                                                  │
│  FORMAÇÃO ACADÊMICA                                              │
│  ──────────────────                                              │
│  Curso | Instituição                           Período           │
│                                                                  │
│  HABILIDADES                                                     │
│  ───────────                                                     │
│  • Habilidade 1  • Habilidade 2  • Habilidade 3                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Template Moderno

```
┌──────────────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓                                                              ▓ │
│ ▓  ┌──────┐  NOME COMPLETO                                    ▓ │
│ ▓  │ FOTO │  Título Profissional                              ▓ │
│ ▓  └──────┘                                                    ▓ │
│ ▓                                                              ▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                                                  │
│  ┌─────────────────────────┐  ┌──────────────────────────────┐  │
│  │ CONTATO                 │  │ RESUMO                       │  │
│  │                         │  │                              │  │
│  │ ✉ email@email.com      │  │ Texto do resumo profissional │  │
│  │ 📱 (00) 00000-0000     │  │ descrevendo experiência e    │  │
│  │ 📍 Cidade, Estado      │  │ objetivos de carreira...     │  │
│  │                         │  │                              │  │
│  │ HABILIDADES             │  └──────────────────────────────┘  │
│  │                         │                                    │
│  │ React      ●●●●○       │  EXPERIÊNCIA                       │
│  │ Node.js    ●●●●●       │  ────────────                       │
│  │ TypeScript ●●●●○       │  Cargo | Empresa        Período    │
│  │                         │  Descrição...                      │
│  └─────────────────────────┘                                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Template Minimalista

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                           NOME COMPLETO                          │
│                        Título Profissional                       │
│                                                                  │
│          email@email.com • (00) 00000-0000 • Cidade, UF         │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│                              SOBRE                               │
│                                                                  │
│  Texto do resumo profissional centralizado e clean...           │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│                           EXPERIÊNCIA                            │
│                                                                  │
│  Tech Lead                                         2022 - Atual  │
│  TechCorp Soluções                                               │
│                                                                  │
│  Senior Developer                                  2019 - 2021   │
│  StartupXYZ                                                      │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│                            FORMAÇÃO                              │
│                                                                  │
│  Ciência da Computação                             2015 - 2019   │
│  Universidade de São Paulo                                       │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│             React • Node.js • TypeScript • PostgreSQL            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Botão "Exportar PDF" na lista de currículos
- ✅ Modal de configuração de exportação
- ✅ 3 templates: Clássico, Moderno, Minimalista
- ✅ Seleção de seções a incluir
- ✅ Opção de incluir/excluir foto
- ✅ Opção de incluir links profissionais
- ✅ Pré-visualização antes de baixar
- ✅ Download do PDF gerado
- ✅ Nome do arquivo: "Curriculo_[Nome]_[Data].pdf"

### Excluído

- ❌ Templates personalizáveis (cores, fontes)
- ❌ Salvar configuração de template preferido
- ❌ Enviar PDF por email
- ❌ Mais de 3 templates (futuro)
- ❌ Edição direta no preview

---

## Requisitos Funcionais

### Botão e Modal

- **RF-001:** Botão "Exportar PDF" no card do currículo
- **RF-002:** Ao clicar, abre modal de configuração
- **RF-003:** Modal deve ter seleção de template visual
- **RF-004:** Checkboxes para seções a incluir
- **RF-005:** Opções extras (foto, links, QR code)

### Templates

- **RF-006:** 3 templates disponíveis: Clássico, Moderno, Minimalista
- **RF-007:** Seleção visual com preview miniatura
- **RF-008:** Apenas um template selecionado por vez
- **RF-009:** Template padrão: Moderno

### Seções

- **RF-010:** Seções selecionáveis individualmente
- **RF-011:** Mínimo: Informações pessoais (sempre incluída)
- **RF-012:** Seções: Informações, Resumo, Habilidades técnicas, Habilidades comportamentais, Experiência, Formação, Cursos
- **RF-013:** Opção para incluir/excluir pretensão salarial

### Pré-visualização

- **RF-014:** Botão "Pré-visualizar" gera preview
- **RF-015:** Preview em modal expandido com scroll
- **RF-016:** Preview reflete template e seções selecionadas
- **RF-017:** Paginação se conteúdo exceder 1 página

### Download

- **RF-018:** Botão "Baixar PDF" gera e baixa arquivo
- **RF-019:** Nome: "Curriculo_[NomeSobrenome]_[DDMMAAAA].pdf"
- **RF-020:** Exibir loading durante geração
- **RF-021:** Toast de sucesso após download

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Geração do PDF em menos de 3 segundos
- **RNF-002 (Qualidade):** PDF deve ser legível e bem formatado
- **RNF-003 (Compatibilidade):** PDF válido em todos os leitores
- **RNF-004 (Tamanho):** PDF não deve exceder 2MB

---

## Critérios de Aceitação

### RF-001 a RF-005: Modal

```gherkin
DADO que o candidato clica em "Exportar PDF"
QUANDO o modal abre
ENTÃO deve ver 3 opções de template
  E deve ver checkboxes das seções
  E deve ver opções extras
  E template "Moderno" deve estar pré-selecionado
```

### RF-014 a RF-017: Preview

```gherkin
DADO que o candidato configurou a exportação
QUANDO ele clica em "Pré-visualizar"
ENTÃO deve ver o PDF renderizado na tela
  E deve refletir o template escolhido
  E deve incluir apenas seções selecionadas
  E deve ter paginação se necessário
```

### RF-018 a RF-021: Download

```gherkin
DADO que o candidato está satisfeito com o preview
QUANDO ele clica em "Baixar PDF"
ENTÃO deve ver loading durante geração
  E arquivo deve ser baixado automaticamente
  E nome deve seguir padrão "Curriculo_Nome_Data.pdf"
  E deve exibir toast "PDF gerado com sucesso"
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Modal e seleção | 2 |
| 2 | Templates de PDF | 3 |
| 3 | Preview e download | 2 |

### Detalhamento das Fases

#### Fase 1: Modal e Seleção

**Objetivo:** Interface de configuração

**Ações:**
- [ ] Criar componente `ExportPDFModal`
- [ ] Implementar seleção de template
- [ ] Implementar checkboxes de seções
- [ ] Implementar opções extras

**Validação:** Modal funcional com todas as opções

#### Fase 2: Templates de PDF

**Objetivo:** Criar os 3 templates

**Ações:**
- [ ] Criar componente `PDFTemplateClassic`
- [ ] Criar componente `PDFTemplateModern`
- [ ] Criar componente `PDFTemplateMinimal`
- [ ] Configurar estilos de cada template

**Validação:** Templates renderizam corretamente

#### Fase 3: Preview e Download

**Objetivo:** Gerar e baixar PDF

**Ações:**
- [ ] Integrar biblioteca de PDF (react-pdf ou jspdf)
- [ ] Implementar preview no modal
- [ ] Implementar download do arquivo
- [ ] Adicionar loading e feedback

**Validação:** PDF é gerado e baixado corretamente

---

## Tecnologias Sugeridas

| Opção | Biblioteca | Prós | Contras |
|-------|------------|------|---------|
| **A** | @react-pdf/renderer | React nativo, componentes | Bundle maior |
| **B** | jsPDF + html2canvas | Leve, screenshot | Menos controle |
| **C** | pdfmake | Declarativo, leve | Sintaxe própria |

**Recomendação:** @react-pdf/renderer (mais controle sobre layout)

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-005 | Perfil Completo do Candidato | ✅ Implementado |
| PRD-022 | Currículos Avançados | ⏳ Pendente |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.22.0 → 0.23.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.23.0] - 2026-01-XX

### Added
- Exportação de currículo em PDF
- 3 templates: Clássico, Moderno, Minimalista
- Seleção de seções a incluir
- Pré-visualização antes do download
- Opções de incluir foto e links
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Biblioteca** | Avaliar @react-pdf/renderer ou jsPDF |
| **Fonte** | Usar fontes padrão (Helvetica, Times) |
| **Foto** | Se incluída, redimensionar para 150x150 |
| **Paginação** | Quebrar experiências por página se necessário |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| PDF maior que 2MB |
| Fontes customizadas que podem não renderizar |
| Preview que trava a UI |
| Download sem feedback de loading |

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
