# PRD-038-ia-cand: Parser Inteligente de Currículo

> **AILA - Sistemas Inteligentes**  
> RecrutaRS — Plataforma de Recrutamento Inteligente

---

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar extração automática de dados de currículos (PDF/DOC) para pré-preencher perfil do candidato, reduzindo fricção no onboarding |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Média |
| **Épico** | Inteligência Artificial |
| **Perfil** | Candidato |
| **PRDs Relacionados** | PRD-005 (Perfil do Candidato) |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | Processamento de arquivos, extração de texto, NLP para parsing, normalização de dados, integração com perfil |

---

## Contexto do Problema

O processo de cadastro de candidatos no RecrutaRS requer preenchimento manual de muitos campos: dados pessoais, experiências profissionais, formação acadêmica, skills. Isso cria problemas:

| Problema | Impacto |
|----------|---------|
| **Alta fricção no onboarding** | Candidatos abandonam cadastro pela metade |
| **Perfis incompletos** | Apenas 30-40% completam 100% do perfil |
| **Dados inconsistentes** | Erros de digitação, formatos variados |
| **Tempo desperdiçado** | Candidato já tem CV pronto, por que digitar tudo de novo? |

Estudos de UX mostram que cada campo adicional reduz conversão em 5-10%. Permitir upload de CV e extração automática pode:

- Reduzir tempo de cadastro de 15-20 min para 3-5 min
- Aumentar taxa de perfis completos em 40-60%
- Melhorar qualidade dos dados (normalização)
- Criar experiência similar a LinkedIn ("Import from CV")

---

## Conceito da Solução

### Situação Atual (As-Is)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Cadastro do Candidato                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Complete seu perfil (0% completo)                              │
│                                                                 │
│  Dados Pessoais                                                 │
│  Nome: [________________]                                       │
│  Email: [________________]                                      │
│  Telefone: [________________]                                   │
│  Cidade: [________________]                                     │
│  ...                                                            │
│                                                                 │
│  Experiência Profissional                                       │
│  [+ Adicionar experiência]  ← preenchimento manual              │
│                                                                 │
│  Formação                                                       │
│  [+ Adicionar formação]  ← preenchimento manual                 │
│                                                                 │
│  Skills                                                         │
│  [+ Adicionar skill]  ← preenchimento manual                    │
│                                                                 │
│  😩 "Isso vai demorar muito..."                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Situação Desejada (To-Be)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Cadastro do Candidato                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🚀 COMECE RÁPIDO: Importe seu currículo                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │     📄 Arraste seu CV aqui ou clique para selecionar    │    │
│  │                                                         │    │
│  │         Formatos aceitos: PDF, DOC, DOCX                │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ou [Preencher manualmente]                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

                            ↓ Após upload

┌─────────────────────────────────────────────────────────────────┐
│                    Revisão dos Dados Extraídos                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ Encontramos as seguintes informações no seu CV:             │
│                                                                 │
│  DADOS PESSOAIS                                      [Editar]   │
│  Nome: João Silva                                               │
│  Email: joao@email.com                                          │
│  Telefone: (51) 99999-9999                                      │
│  Cidade: Porto Alegre, RS                                       │
│                                                                 │
│  EXPERIÊNCIA PROFISSIONAL                            [Editar]   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 💼 Desenvolvedor Full Stack                             │    │
│  │    TechCorp • 2020 - Atual                              │    │
│  │    Desenvolvimento de aplicações React e Node.js        │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 💼 Desenvolvedor Junior                                 │    │
│  │    StartupX • 2018 - 2020                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  SKILLS DETECTADAS                                   [Editar]   │
│  [React ✓] [Node.js ✓] [TypeScript ✓] [PostgreSQL ✓]           │
│  [JavaScript ✓] [Git ✓] [Docker ?]                              │
│                                         ? = baixa confiança     │
│                                                                 │
│  ⚠️ Revise os dados antes de confirmar                          │
│                                                                 │
│                    [Cancelar]  [Confirmar e Salvar]             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Integração com LinkedIn | Requer OAuth complexo, nem todos têm LinkedIn atualizado |
| Apenas anexar CV (sem parsing) | Não reduz fricção de preenchimento |
| Parsing 100% automático sem revisão | Erros de extração prejudicam experiência |

---

## Escopo

### Incluído

- ✅ Upload de arquivo (PDF, DOC, DOCX)
- ✅ Extração de texto do arquivo
- ✅ Parsing inteligente para identificar seções
- ✅ Extração de dados pessoais (nome, email, telefone, cidade)
- ✅ Extração de experiências profissionais
- ✅ Extração de formação acadêmica
- ✅ Extração e normalização de skills
- ✅ Tela de revisão antes de salvar
- ✅ Indicador de confiança por campo
- ✅ Edição manual dos dados extraídos
- ✅ Pré-preenchimento do perfil após confirmação
- ✅ Opção de preencher manualmente (skip)

### Excluído

- ❌ OCR de currículos escaneados (imagem)
- ❌ Parsing de currículos em idiomas além de português/inglês
- ❌ Extração de foto do currículo
- ❌ Validação de veracidade dos dados
- ❌ Integração com LinkedIn/Indeed
- ❌ Armazenamento permanente do arquivo original
- ❌ Parsing de portfólios/links externos

---

## Requisitos Funcionais

### Upload de Arquivo

- **RF-001:** Deve aceitar arquivos PDF, DOC, DOCX
- **RF-002:** Limite de tamanho: 5MB
- **RF-003:** Interface drag-and-drop + botão de seleção
- **RF-004:** Feedback visual durante upload (progress bar)
- **RF-005:** Validação de formato antes de processar
- **RF-006:** Mensagem de erro clara se formato inválido

### Extração de Texto

- **RF-007:** Extrair texto de PDF usando biblioteca adequada
- **RF-008:** Extrair texto de DOC/DOCX usando biblioteca adequada
- **RF-009:** Preservar estrutura básica (parágrafos, listas)
- **RF-010:** Tratar caracteres especiais e encoding

### Parsing Inteligente

- **RF-011:** Identificar seções do currículo por padrões
- **RF-012:** Seções a identificar: Dados Pessoais, Objetivo, Experiência, Formação, Skills, Idiomas
- **RF-013:** Usar heurísticas + regex para extração
- **RF-014:** Calcular score de confiança para cada dado extraído

### Extração de Dados Pessoais

- **RF-015:** Extrair nome completo (primeira linha ou após "Nome:")
- **RF-016:** Extrair email usando regex de email
- **RF-017:** Extrair telefone usando regex de telefone BR
- **RF-018:** Extrair cidade/estado por padrões ou lista conhecida
- **RF-019:** Extrair LinkedIn URL se presente

### Extração de Experiências

- **RF-020:** Identificar blocos de experiência profissional
- **RF-021:** Para cada experiência extrair: cargo, empresa, período, descrição
- **RF-022:** Interpretar formatos de data variados (MM/YYYY, YYYY, "Atual", "Presente")
- **RF-023:** Ordenar experiências por data (mais recente primeiro)
- **RF-024:** Limitar a 10 experiências (evitar CVs muito longos)

### Extração de Formação

- **RF-025:** Identificar blocos de formação acadêmica
- **RF-026:** Para cada formação extrair: curso, instituição, período, nível (graduação, pós, etc.)
- **RF-027:** Interpretar abreviações comuns (Bach., Grad., MBA, etc.)
- **RF-028:** Ordenar por data (mais recente primeiro)

### Extração de Skills

- **RF-029:** Identificar seção de skills/competências
- **RF-030:** Extrair skills individuais (separadas por vírgula, bullet, etc.)
- **RF-031:** Normalizar skills para formato padrão (ex: "ReactJS" → "React")
- **RF-032:** Usar dicionário de skills conhecidas para normalização
- **RF-033:** Marcar skills não reconhecidas com baixa confiança
- **RF-034:** Detectar skills mencionadas nas descrições de experiência

### Tela de Revisão

- **RF-035:** Exibir todos os dados extraídos organizados por seção
- **RF-036:** Indicar visualmente confiança: ✓ alta, ? média/baixa
- **RF-037:** Permitir editar qualquer campo inline
- **RF-038:** Permitir remover dados incorretos
- **RF-039:** Permitir adicionar dados não detectados
- **RF-040:** Botão "Confirmar e Salvar" para aplicar ao perfil
- **RF-041:** Botão "Cancelar" para descartar e voltar

### Integração com Perfil

- **RF-042:** Ao confirmar, preencher campos do perfil do candidato
- **RF-043:** Não sobrescrever dados já preenchidos (perguntar)
- **RF-044:** Redirecionar para página de perfil após salvar
- **RF-045:** Mostrar toast de sucesso com % do perfil preenchido

### Fallbacks e Erros

- **RF-046:** Se extração falhar completamente, mostrar mensagem amigável
- **RF-047:** Oferecer opção de preencher manualmente se parsing falhar
- **RF-048:** Logar erros para análise e melhoria do algoritmo

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Extração deve completar em < 10 segundos
- **RNF-002 (Performance):** Upload deve ter feedback em tempo real
- **RNF-003 (Segurança):** Arquivo deve ser deletado após processamento
- **RNF-004 (Privacidade):** Não armazenar CV original permanentemente
- **RNF-005 (Compatibilidade):** Funcionar em mobile (upload via câmera/arquivos)
- **RNF-006 (Precisão):** Acurácia mínima de 80% em dados pessoais

---

## Critérios de Aceitação

### RF-001 a RF-006: Upload

```gherkin
DADO que o candidato está na tela de cadastro
QUANDO arrasta um arquivo PDF de 2MB
ENTÃO deve exibir progress bar de upload
  E ao completar deve iniciar processamento
  E deve exibir feedback de "Analisando seu currículo..."

DADO que o candidato seleciona um arquivo .txt
QUANDO tenta fazer upload
ENTÃO deve exibir mensagem "Formato não suportado. Use PDF, DOC ou DOCX"
  E não deve iniciar processamento
```

### RF-015 a RF-019: Dados Pessoais

```gherkin
DADO um CV com dados pessoais no início
QUANDO o parsing é executado
ENTÃO deve extrair nome completo
  E deve extrair email válido
  E deve extrair telefone no formato brasileiro
  E deve extrair cidade/estado
```

### RF-035 a RF-041: Tela de Revisão

```gherkin
DADO que o parsing foi concluído
QUANDO a tela de revisão é exibida
ENTÃO deve mostrar todos os dados extraídos organizados
  E deve indicar confiança de cada dado
  E deve permitir editar qualquer campo
  E deve ter botões "Confirmar" e "Cancelar"
```

### RF-042 a RF-045: Integração

```gherkin
DADO que o candidato revisou os dados
QUANDO clica em "Confirmar e Salvar"
ENTÃO deve preencher os campos correspondentes no perfil
  E deve redirecionar para página de perfil
  E deve mostrar toast "Perfil atualizado! 75% completo"
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Upload e extração de texto | 4 |
| 2 | Parsing de seções | 4 |
| 3 | Extração de dados específicos | 5 |
| 4 | Tela de revisão | 4 |
| 5 | Integração e refinamentos | 3 |

### Detalhamento das Fases

#### Fase 1: Upload e Extração de Texto

**Objetivo:** Permitir upload e extrair texto bruto do arquivo

**Ações:**
- [ ] Criar componente `CVUploader` com drag-and-drop
- [ ] Implementar validação de formato e tamanho
- [ ] Integrar biblioteca para extração de PDF (pdf-parse ou similar)
- [ ] Integrar biblioteca para extração de DOC/DOCX (mammoth ou similar)
- [ ] Implementar feedback de progresso

**Validação:** Upload funciona e retorna texto extraído

#### Fase 2: Parsing de Seções

**Objetivo:** Identificar e separar seções do currículo

**Ações:**
- [ ] Criar função `identifySections(text)` com heurísticas
- [ ] Implementar regex para detectar cabeçalhos de seção
- [ ] Criar mapeamento de sinônimos ("Experiência", "Histórico Profissional", etc.)
- [ ] Separar texto em blocos por seção

**Validação:** CV é dividido corretamente em seções

#### Fase 3: Extração de Dados Específicos

**Objetivo:** Extrair dados estruturados de cada seção

**Ações:**
- [ ] Implementar `extractPersonalData(section)` com regex
- [ ] Implementar `extractExperiences(section)` com parsing de datas
- [ ] Implementar `extractEducation(section)`
- [ ] Implementar `extractSkills(section)` com normalização
- [ ] Criar dicionário de skills conhecidas para normalização
- [ ] Calcular score de confiança

**Validação:** Dados são extraídos corretamente de CV de teste

#### Fase 4: Tela de Revisão

**Objetivo:** Interface para revisar e confirmar dados

**Ações:**
- [ ] Criar página `/candidato/importar-cv`
- [ ] Criar componente `CVReviewForm`
- [ ] Implementar edição inline de campos
- [ ] Implementar indicadores de confiança
- [ ] Criar componentes para cada seção (experiências, formação, skills)

**Validação:** Usuário consegue revisar e editar dados

#### Fase 5: Integração e Refinamentos

**Objetivo:** Salvar dados no perfil e ajustar UX

**Ações:**
- [ ] Integrar com modelo de dados do perfil
- [ ] Implementar lógica de merge (não sobrescrever existentes)
- [ ] Adicionar opção na tela de cadastro
- [ ] Refinar regex e heurísticas baseado em testes
- [ ] Limpar arquivo após processamento

**Validação:** Dados são salvos corretamente no perfil

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-004 | Tipos TypeScript | ⏳ Pendente |
| PRD-005 | Perfil do Candidato | ⏳ Pendente |

### Bibliotecas Sugeridas

| Biblioteca | Propósito | Licença |
|------------|-----------|---------|
| pdf-parse | Extração de texto de PDF | MIT |
| mammoth | Extração de texto de DOCX | BSD |
| react-dropzone | Interface de upload drag-and-drop | MIT |

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Inteligência Artificial"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-035-ia-all | Transparência do Matching | ⏳ | Base |
| 2 | PRD-036-ia-cand | Recomendação de Vagas | ⏳ | - |
| 3 | PRD-037-ia-emp | Recomendação de Candidatos | ⏳ | - |
| **4** | **PRD-038-ia-cand** | **Parser de Currículo** | **🔄 ATUAL** | Independente |
| 5 | PRD-039-ia-emp | Assistente de Redação | ⏳ | - |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Arquivo CV | PII | Deletar após processamento |
| Dados extraídos | PII | Criptografar em trânsito |
| Texto bruto | Temporário | Não persistir |

### Privacidade

- Arquivo original NÃO é armazenado permanentemente
- Processamento ocorre e arquivo é deletado
- Dados extraídos vão apenas para o perfil do próprio candidato
- Não compartilhar dados com terceiros

### Segurança

- Validar tipo MIME do arquivo (não confiar apenas na extensão)
- Limitar tamanho para evitar DoS
- Sanitizar dados extraídos antes de salvar
- Não executar código do arquivo (PDF pode ter scripts)

---

## Fluxos de Usuário

### Fluxo Principal (Upload)

```
[Candidato] ──▶ [Cadastro/Perfil] ──▶ [Arrasta CV]
                                           │
                                           ▼
                                    [Upload + Processamento]
                                           │
                                           ▼
                                    [Tela de Revisão]
                                           │
                                           ▼
                                    [Edita se necessário]
                                           │
                                           ▼
                                    [Confirma]
                                           │
                                           ▼
                                    [Perfil preenchido!]
```

### Fluxo de Erro

```
[Candidato] ──▶ [Arrasta arquivo inválido] ──▶ [Mensagem de erro]
                                                      │
                                                      ▼
                                            [Tenta novamente ou preenche manual]
```

---

## Mockups Conceituais

### Tela de Upload

```
┌─────────────────────────────────────────────────────────────────┐
│                    Complete seu Perfil                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🚀 Importe seu currículo e preencha em segundos!               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │              📄                                         │    │
│  │                                                         │    │
│  │     Arraste seu CV aqui ou clique para selecionar       │    │
│  │                                                         │    │
│  │         Formatos: PDF, DOC, DOCX (máx. 5MB)             │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│                    ou                                           │
│                                                                 │
│              [Preencher manualmente →]                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tela de Processamento

```
┌─────────────────────────────────────────────────────────────────┐
│                    Analisando seu currículo...                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                         📄                                      │
│                    curriculo.pdf                                │
│                                                                 │
│         ████████████████████░░░░░░░░░░░░  60%                   │
│                                                                 │
│         🔍 Extraindo informações de contato...                  │
│                                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tela de Revisão

```
┌─────────────────────────────────────────────────────────────────┐
│                    Revise seus dados                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ Encontramos as seguintes informações:                       │
│                                                                 │
│  DADOS PESSOAIS                                      [✏️ Editar]│
│  ├─ Nome: João Silva                                     ✓     │
│  ├─ Email: joao@email.com                                ✓     │
│  ├─ Telefone: (51) 99999-9999                            ✓     │
│  └─ Cidade: Porto Alegre, RS                             ✓     │
│                                                                 │
│  EXPERIÊNCIA PROFISSIONAL (2)                        [✏️ Editar]│
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ✓ Desenvolvedor Full Stack                              │    │
│  │   TechCorp • Jan/2020 - Atual                           │    │
│  │   Desenvolvimento de aplicações web com React e Node    │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ✓ Desenvolvedor Junior                                  │    │
│  │   StartupX • Mar/2018 - Dez/2019                        │    │
│  │   Manutenção de sistemas legados                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  SKILLS (8 detectadas)                               [✏️ Editar]│
│  [React ✓] [Node.js ✓] [TypeScript ✓] [PostgreSQL ✓]           │
│  [JavaScript ✓] [Git ✓] [Docker ?] [AWS ?]                      │
│                                                                 │
│  ✓ = alta confiança   ? = verificar                             │
│                                                                 │
│  ⚠️ Revise os dados antes de confirmar                          │
│                                                                 │
│                    [Cancelar]  [✓ Confirmar e Salvar]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Renomear este arquivo adicionando `_DONE` ao final
> - Atualizar a seção "Status de Implementação"

**Codinome sugerido:** `Scribe` (representa extração e transcrição de dados)

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Sempre revisar** | Nunca salvar dados automaticamente, sempre mostrar revisão |
| **Fail gracefully** | Se parsing falhar, oferecer preenchimento manual |
| **Privacidade** | Deletar arquivo após processamento |
| **Feedback constante** | Mostrar progresso durante processamento |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **PDF** | Usar pdf-parse para extração simples |
| **DOCX** | Usar mammoth.js para extração |
| **Regex** | Testar com diversos formatos de CV brasileiros |
| **Skills** | Criar dicionário de normalização (ReactJS → React) |
| **Datas** | Aceitar MM/YYYY, YYYY, "Atual", "Presente", "até o momento" |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Salvar arquivo original permanentemente |
| Salvar dados sem revisão do usuário |
| Confiar apenas na extensão do arquivo |
| Parsing de CVs em imagem (OCR) |
| Blocos try-catch vazios (logar erros) |
| Regex muito rígidos (CVs têm formatos variados) |

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
| 16/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
