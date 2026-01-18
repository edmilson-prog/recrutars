# PRD-032: Exportar Candidatos (Empresa)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Permitir exportação de listas de candidatos em Excel e PDF |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Média |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | Geração de arquivos, múltiplos formatos, seleção de campos |

---

## Contexto do Problema

Empresas precisam compartilhar listas de candidatos com gestores, diretores ou equipes de RH que não têm acesso à plataforma. Também precisam arquivar informações para compliance ou análise offline. Atualmente não há forma de extrair dados da plataforma.

### Casos de Uso

| Cenário | Necessidade |
|---------|-------------|
| Apresentação para diretoria | PDF formatado com candidatos finalistas |
| Análise em planilha | Excel com dados para filtrar/ordenar |
| Arquivo de processo seletivo | Documentação para compliance |
| Reunião de alinhamento | Lista impressa para discussão |

---

## Conceito da Solução

### Botão de Exportar

Disponível em:
- Banco de Talentos (após aplicar filtros)
- Candidatos Salvos
- Candidaturas de uma vaga

```
┌──────────────────────────────────────────────────────────────────┐
│  Banco de Talentos                                               │
│                                                                  │
│  [🔍 Filtrar]  [📊 Comparar (2)]  [📥 Exportar]                 │
│                                    ↑                             │
│                              Novo botão                          │
├──────────────────────────────────────────────────────────────────┤
│  Mostrando 45 candidatos                                        │
│  ...                                                             │
└──────────────────────────────────────────────────────────────────┘
```

### Modal de Exportação

```
┌──────────────────────────────────────────────────────────────────┐
│  📥 Exportar Candidatos                                    [✕]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Exportar 45 candidatos do Banco de Talentos                    │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Formato de Exportação                                          │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │                     │  │                     │               │
│  │    📊              │  │    📄              │               │
│  │   XLSX             │  │    PDF             │               │
│  │                     │  │                     │               │
│  │   Excel            │  │   Documento        │               │
│  │   Para análise     │  │   Para apresentar  │               │
│  │                     │  │                     │               │
│  │   ● Selecionado    │  │   ○ Selecionar     │               │
│  └─────────────────────┘  └─────────────────────┘               │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Campos a Incluir                                               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ☑️ Informações Básicas                                   │    │
│  │    Nome, Localização, Contato                           │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ ☑️ Experiência Profissional                              │    │
│  │    Cargo atual, Empresa, Anos de experiência            │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ ☑️ Formação                                              │    │
│  │    Graduação, Instituição, Status                       │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ ☑️ Habilidades                                           │    │
│  │    Top 5 habilidades com nível                          │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ ☑️ Perfil DISC                                           │    │
│  │    Perfil primário e características                    │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ ☑️ Match                                                 │    │
│  │    Percentual de compatibilidade                        │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ ☐ Pretensão Salarial                                    │    │
│  │    Valor pretendido                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Ordenar por: [Match (maior primeiro)                       ▼]  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  💡 Candidatos em modo anônimo serão exportados como            │
│     "Perfil Anônimo #XXXX"                                      │
│                                                                  │
│                                  [Cancelar]  [📥 Exportar]      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Preview do Excel (XLSX)

```
┌──────────────────────────────────────────────────────────────────┐
│  📊 Candidatos_BancoTalentos_2026-01-15.xlsx                    │
├────┬────────────────┬─────────────┬──────────┬─────────┬────────┤
│ #  │ Nome           │ Cargo       │ Exp.     │ DISC    │ Match  │
├────┼────────────────┼─────────────┼──────────┼─────────┼────────┤
│ 1  │ Maria Santos   │ Product Des │ 7 anos   │ I       │ 96%    │
│ 2  │ João Silva     │ Dev Senior  │ 5 anos   │ D       │ 94%    │
│ 3  │ Pedro Lima     │ Dev Pleno   │ 3 anos   │ S       │ 88%    │
│ 4  │ Ana Costa      │ UX Designer │ 4 anos   │ C       │ 85%    │
│ 5  │ Perfil #4721   │ Dev Full    │ 6 anos   │ D       │ 82%    │
│... │ ...            │ ...         │ ...      │ ...     │ ...    │
└────┴────────────────┴─────────────┴──────────┴─────────┴────────┘
```

### Preview do PDF

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  🏢 TECHCORP SOLUÇÕES                                     │  │
│  │                                                            │  │
│  │  ═══════════════════════════════════════════════════════  │  │
│  │                                                            │  │
│  │  RELATÓRIO DE CANDIDATOS                                  │  │
│  │  Banco de Talentos • 15/01/2026                          │  │
│  │                                                            │  │
│  │  ───────────────────────────────────────────────────────  │  │
│  │                                                            │  │
│  │  Total: 45 candidatos                                     │  │
│  │  Ordenado por: Match (maior primeiro)                    │  │
│  │                                                            │  │
│  │  ═══════════════════════════════════════════════════════  │  │
│  │                                                            │  │
│  │  1. MARIA SANTOS                              ⭐ 96%      │  │
│  │  ─────────────────────────────────────────────────────── │  │
│  │  📍 São Paulo, SP                                        │  │
│  │  💼 Product Designer Lead • StartupXYZ • 7 anos          │  │
│  │  🎓 Design Digital • ESPM • Completo                     │  │
│  │  📊 DISC: Influente (I) - Comunicativo, Entusiasta       │  │
│  │                                                            │  │
│  │  Habilidades:                                             │  │
│  │  Figma ●●●●● | UX ●●●●● | CSS ●●●●○ | Prototyping ●●●●○ │  │
│  │                                                            │  │
│  │  ───────────────────────────────────────────────────────  │  │
│  │                                                            │  │
│  │  2. JOÃO SILVA                                ⭐ 94%      │  │
│  │  ─────────────────────────────────────────────────────── │  │
│  │  📍 Porto Alegre, RS                                     │  │
│  │  💼 Desenvolvedor Senior • TechCorp • 5 anos             │  │
│  │  ...                                                      │  │
│  │                                                            │  │
│  │  ───────────────────────────────────────────────────────  │  │
│  │                                                            │  │
│  │                                     Página 1 de 5         │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Exportar da Página de Candidaturas

```
┌──────────────────────────────────────────────────────────────────┐
│  Candidaturas • Desenvolvedor React Senior                      │
│                                                                  │
│  [Todos (23)]  [Em análise (15)]  [Entrevista (5)]  [Finalistas]│
│                                                                  │
│  Filtros: [Status ▼]  [DISC ▼]           [📥 Exportar Lista]   │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  ...lista de candidatos...                                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Botão de exportar no Banco de Talentos
- ✅ Botão de exportar em Candidatos Salvos
- ✅ Botão de exportar nas Candidaturas de uma vaga
- ✅ Modal de configuração de exportação
- ✅ Formato Excel (XLSX)
- ✅ Formato PDF
- ✅ Seleção de campos a incluir
- ✅ Ordenação configurável
- ✅ Respeito ao modo de visibilidade (anônimos)
- ✅ Nome do arquivo com contexto e data
- ✅ Header com informações da empresa no PDF

### Excluído

- ❌ Exportação em CSV
- ❌ Exportação em JSON
- ❌ Agendamento de exportação automática
- ❌ Envio por email
- ❌ Customização visual do PDF

---

## Requisitos Funcionais

### Botão e Acesso

- **RF-001:** Botão "📥 Exportar" no Banco de Talentos
- **RF-002:** Botão "📥 Exportar" em Candidatos Salvos
- **RF-003:** Botão "📥 Exportar Lista" nas Candidaturas
- **RF-004:** Ao clicar, abrir modal de configuração

### Modal de Configuração

- **RF-005:** Exibir quantidade de candidatos a exportar
- **RF-006:** Seleção de formato: XLSX ou PDF
- **RF-007:** Checkboxes para selecionar seções
- **RF-008:** Seções: Info Básica, Experiência, Formação, Habilidades, DISC, Match, Salário
- **RF-009:** Pelo menos 1 seção deve estar marcada
- **RF-010:** Dropdown de ordenação

### Exportação Excel

- **RF-011:** Gerar arquivo .xlsx válido
- **RF-012:** Uma linha por candidato
- **RF-013:** Colunas conforme seções selecionadas
- **RF-014:** Cabeçalho na primeira linha
- **RF-015:** Formatação básica (negrito no header)

### Exportação PDF

- **RF-016:** Gerar PDF formatado
- **RF-017:** Header com logo/nome da empresa
- **RF-018:** Subtítulo com origem (Banco de Talentos, Vaga X, etc)
- **RF-019:** Data de geração
- **RF-020:** Um bloco por candidato
- **RF-021:** Paginação
- **RF-022:** Match destacado

### Regras de Privacidade

- **RF-023:** Candidatos anônimos exportados como "Perfil Anônimo #XXXX"
- **RF-024:** Aviso no modal sobre candidatos anônimos
- **RF-025:** Não exportar dados ocultos (modo privado não aparece)

### Download

- **RF-026:** Nome do arquivo: `[Origem]_[Data].xlsx` ou `.pdf`
- **RF-027:** Exemplos: `BancoTalentos_2026-01-15.xlsx`, `Candidaturas_DevReact_2026-01-15.pdf`
- **RF-028:** Loading durante geração
- **RF-029:** Toast de sucesso ao concluir

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Exportar até 100 candidatos em menos de 5 segundos
- **RNF-002 (Tamanho):** PDF máximo 5MB
- **RNF-003 (Compatibilidade):** Excel compatível com Microsoft Excel e Google Sheets

---

## Critérios de Aceitação

### RF-005 a RF-010: Modal

```gherkin
DADO que a empresa clica em Exportar
QUANDO o modal abre
ENTÃO deve mostrar quantidade de candidatos
  E deve ter opção XLSX e PDF
  E deve ter checkboxes de seções
  E pelo menos 1 seção deve estar marcada por padrão
```

### RF-011 a RF-015: Excel

```gherkin
DADO que a empresa selecionou XLSX e algumas seções
QUANDO ela clica em Exportar
ENTÃO deve baixar arquivo .xlsx
  E o arquivo deve ter uma linha por candidato
  E deve ter colunas conforme seções selecionadas
  E deve abrir corretamente no Excel
```

### RF-016 a RF-022: PDF

```gherkin
DADO que a empresa selecionou PDF
QUANDO ela clica em Exportar
ENTÃO deve baixar arquivo .pdf
  E o PDF deve ter header com nome da empresa
  E deve ter um bloco formatado por candidato
  E deve ter paginação
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Modal e configuração | 2 |
| 2 | Exportação Excel | 2 |
| 3 | Exportação PDF | 2 |

### Detalhamento das Fases

#### Fase 1: Modal e Configuração

**Objetivo:** Interface de configuração

**Ações:**
- [ ] Adicionar botão Exportar nas páginas
- [ ] Criar componente `ExportModal`
- [ ] Implementar seleção de formato e campos
- [ ] Implementar validação (mínimo 1 campo)

**Validação:** Modal funciona com todas as opções

#### Fase 2: Exportação Excel

**Objetivo:** Gerar arquivo XLSX

**Ações:**
- [ ] Instalar biblioteca (xlsx ou exceljs)
- [ ] Implementar geração de planilha
- [ ] Implementar download do arquivo
- [ ] Testar com diferentes quantidades

**Validação:** Excel gerado abre corretamente

#### Fase 3: Exportação PDF

**Objetivo:** Gerar arquivo PDF formatado

**Ações:**
- [ ] Usar @react-pdf/renderer ou jspdf
- [ ] Criar template do PDF
- [ ] Implementar paginação
- [ ] Implementar download

**Validação:** PDF formatado gerado corretamente

---

## Modelo de Dados

### ExportConfig

```typescript
type ExportFormat = 'xlsx' | 'pdf';

type ExportSection = 
  | 'basicInfo'
  | 'experience'
  | 'education'
  | 'skills'
  | 'disc'
  | 'match'
  | 'salary';

type ExportOrder = 
  | 'match_desc'
  | 'match_asc'
  | 'name_asc'
  | 'experience_desc'
  | 'recent';

interface ExportConfig {
  format: ExportFormat;
  sections: ExportSection[];
  orderBy: ExportOrder;
}

// Contexto da exportação
interface ExportContext {
  source: 'talent_bank' | 'saved_candidates' | 'job_applications';
  jobId?: string;
  jobTitle?: string;
  candidateIds: string[];
  filters?: Record<string, string>;
}
```

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-014 | Banco de Talentos | ✅ Implementado |
| PRD-015 | Candidaturas (Pipeline) | ✅ Implementado |
| PRD-030 | Candidatos Favoritos | ⏳ Pendente |

### Bibliotecas Sugeridas

| Biblioteca | Uso |
|------------|-----|
| xlsx ou exceljs | Geração de Excel |
| @react-pdf/renderer ou jspdf | Geração de PDF |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.31.0 → 0.32.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.32.0] - 2026-01-XX

### Added
- Exportação de candidatos em Excel (XLSX)
- Exportação de candidatos em PDF
- Modal de configuração com seleção de campos
- Suporte a exportar do Banco de Talentos
- Suporte a exportar de Candidatos Salvos
- Suporte a exportar de Candidaturas por vaga
- Respeito ao modo de visibilidade (anônimos)
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Excel** | xlsx é mais leve, exceljs tem mais recursos |
| **PDF** | @react-pdf/renderer para React, jspdf para vanilla |
| **Tamanho** | Limitar a 100 candidatos por exportação |
| **Anônimos** | Manter como "Perfil Anônimo #XXXX" |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Exportar dados de candidatos em modo privado |
| Revelar dados de anônimos na exportação |
| Gerar arquivos muito grandes (>5MB) |
| Exportar sem loading/feedback |

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
