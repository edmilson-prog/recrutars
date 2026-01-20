# PRD-048: Teste por Vaga (Empresa)

> **AILA - Sistemas Inteligentes**  
> RecrutaRS — Plataforma de Recrutamento Inteligente

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `PRD-046` | Banco de Perguntas e Estrutura (pré-requisito) |
| `PRD-047` | Teste Geral do Candidato (pré-requisito) |
| `Framework Avaliação` | Documento base com metodologia e matriz de competências |

---

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Painel Empresa |
| **Repositório** | github.com/aila-sistemas/recrutars |
| **Objetivo** | Permitir que empresas criem testes comportamentais customizados para vagas específicas, com link mágico para candidatos externos e análise por IA |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 6 |
| **Prioridade** | Alta |
| **Épico** | Gauge-Pro 2.0 — Sistema de Avaliação Comportamental |
| **PRDs Relacionados** | PRD-046, PRD-047 |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** ✅ | 15+ arquivos, múltiplos fluxos (interno/externo), link mágico, análise IA, integração com vagas |

---

## Contexto do Problema

Enquanto o **Teste Geral** (PRD-047) avalia o candidato de forma abrangente e voluntária, muitas empresas precisam avaliar competências **específicas** para cada vaga. 

Por exemplo:
- Vaga de **Líder de Equipe**: foco em Liderança, Comunicação, Gestão de Conflitos
- Vaga de **Analista**: foco em Pensamento Crítico, Resolução de Problemas, Atenção aos Detalhes
- Vaga de **Vendedor**: foco em Resiliência, Comunicação, Persuasão

Além disso, empresas frequentemente recebem candidatos de **fora da plataforma** (indicações, LinkedIn, etc.) que precisam ser avaliados antes de entrar no processo seletivo.

O **Teste por Vaga** permite:
- Empresa seleciona competências críticas para a vaga
- Sistema sugere perguntas do banco baseado na Matriz de Competências
- Empresa pode customizar o teste
- Candidatos **internos** (cadastrados) respondem dentro da plataforma
- Candidatos **externos** recebem **link mágico** e criam conta simplificada
- IA analisa respostas e sugere pontuação
- Recrutador vê relatório e pode ajustar (híbrido)

---

## Conceito da Solução

### Situação Atual (As-Is)

- Empresa não tem como avaliar competências específicas por vaga
- Candidatos externos não têm como ser avaliados antes do cadastro
- Avaliação comportamental é genérica, não customizada

### Situação Desejada (To-Be)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TESTE POR VAGA                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  EMPRESA                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 1. Cria vaga                                                        │   │
│  │ 2. Seleciona competências críticas (Liderança, Comunicação...)     │   │
│  │ 3. Sistema sugere perguntas da Matriz de Competências              │   │
│  │ 4. Empresa customiza se necessário (15-25 perguntas)               │   │
│  │ 5. Publica teste vinculado à vaga                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                          │                     │                            │
│                          ▼                     ▼                            │
│                                                                             │
│  CANDIDATO INTERNO                    CANDIDATO EXTERNO                     │
│  ┌─────────────────────────┐         ┌─────────────────────────┐           │
│  │ • Já cadastrado         │         │ • Recebe link mágico    │           │
│  │ • Aplica para vaga      │         │ • Preenche dados básicos│           │
│  │ • Responde teste        │         │ • Responde teste        │           │
│  │ • Resultado integrado   │         │ • Converte em cadastro  │           │
│  └─────────────────────────┘         └─────────────────────────┘           │
│                                                                             │
│                          │                     │                            │
│                          └──────────┬──────────┘                            │
│                                     ▼                                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        GAUGE-PRO IA                                 │   │
│  │  • Analisa respostas                                                │   │
│  │  • Calcula scores por competência                                   │   │
│  │  • Identifica red flags                                             │   │
│  │  • Sugere pontuação                                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                       │
│                                     ▼                                       │
│                                                                             │
│  RECRUTADOR                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ • Vê relatório com scores e insights                                │   │
│  │ • Pode ajustar pontuação (decisão final humana)                    │   │
│  │ • Compara candidatos lado a lado                                    │   │
│  │ • Decide próximas etapas                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Apenas teste geral | Não avalia competências específicas da vaga |
| Empresa cria perguntas do zero | Complexo, sem garantia de qualidade |
| Sem link mágico | Perde candidatos externos |
| IA decide sozinha | Risco legal, decisão deve ser humana |

---

## Escopo

### Incluído

- ✅ Criação de teste vinculado a vaga
- ✅ Seleção de competências críticas (checkboxes)
- ✅ Sistema sugere perguntas baseado na Matriz de Competências
- ✅ Empresa pode adicionar/remover perguntas sugeridas
- ✅ Limite de 15-25 perguntas por teste
- ✅ Preview do teste antes de publicar
- ✅ Envio para candidatos internos (já cadastrados)
- ✅ Geração de link mágico para candidatos externos
- ✅ Landing page do link mágico (dados básicos)
- ✅ Conversão automática em candidato cadastrado
- ✅ Interface de resposta (igual ao teste geral)
- ✅ Análise por IA com sugestão de scoring
- ✅ Relatório para recrutador
- ✅ Possibilidade de ajustar pontuação (híbrido)
- ✅ Comparação de candidatos lado a lado
- ✅ Alertas de red flags (não bloqueantes)
- ✅ Teste ADICIONAL ao teste geral (candidato pode ter ambos)

### Excluído

- ❌ Empresa criar perguntas próprias (usa apenas banco existente)
- ❌ Perguntas abertas/dissertativas (apenas Likert e Situacional)
- ❌ Bloqueio automático por red flags
- ❌ Integração com ATS externos
- ❌ Envio em massa de links (limite por vaga)
- ❌ Personalização visual do link mágico

---

## Fluxo da Empresa: Criar Teste

```
[Empresa acessa detalhes da vaga]
                │
                ▼
[Clica em "Criar Teste Comportamental"]
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASSO 1: SELECIONAR COMPETÊNCIAS                               │
│                                                                 │
│  Selecione as competências críticas para esta vaga:            │
│                                                                 │
│  💼 COMPETÊNCIAS                                                │
│  ☑️ Liderança                    ☐ Pensamento Crítico           │
│  ☑️ Comunicação                  ☐ Orientação a Resultados      │
│  ☐ Trabalho em Equipe           ☐ Iniciativa                   │
│  ☑️ Resiliência                  ☐ Gestão de Tempo              │
│  ☐ Resolução de Problemas       ☐ Adaptabilidade               │
│                                                                 │
│  💎 CARÁTER                                                     │
│  ☑️ Integridade                  ☐ Ética Profissional           │
│  ☐ Responsabilidade             ☐ Confiabilidade               │
│  ☐ Honestidade                                                 │
│                                                                 │
│  🎭 PERSONALIDADE (opcional)                                    │
│  ☐ Abertura                     ☐ Conscienciosidade            │
│  ☐ Extroversão                  ☐ Amabilidade                  │
│  ☐ Estabilidade Emocional                                      │
│                                                                 │
│  Selecionadas: 4 competências                                   │
│                                                                 │
│                                          [Próximo: Perguntas →] │
└─────────────────────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASSO 2: REVISAR PERGUNTAS SUGERIDAS                           │
│                                                                 │
│  Baseado nas competências selecionadas, sugerimos 20 perguntas: │
│                                                                 │
│  💼 Liderança (5 perguntas)                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ☑️ "Descreva uma situação em que você teve que motivar  │   │
│  │    uma equipe desmotivada..."               [⭐⭐] [✕]   │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ ☑️ "Como você lida com conflitos entre membros da sua   │   │
│  │    equipe?"                                 [⭐⭐⭐] [✕]  │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ ☑️ "Conte sobre uma decisão difícil que você tomou..."  │   │
│  │                                             [⭐⭐] [✕]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  💬 Comunicação (5 perguntas)                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ☑️ "Como você adapta sua comunicação para diferentes    │   │
│  │    públicos?"                               [⭐⭐] [✕]   │   │
│  │ ...                                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [+ Adicionar mais perguntas do banco]                          │
│                                                                 │
│  Total: 20 perguntas | Tempo estimado: 15-20 min               │
│                                                                 │
│  [← Voltar]                              [Próximo: Preview →]   │
└─────────────────────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASSO 3: PREVIEW E PUBLICAR                                    │
│                                                                 │
│  Teste para: Líder de Equipe - Operações                       │
│                                                                 │
│  📊 Resumo                                                      │
│  • 20 perguntas (4 competências)                               │
│  • Tempo estimado: 15-20 min                                   │
│  • Níveis: 5 básicas, 10 intermediárias, 5 avançadas           │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  📋 Preview da Primeira Pergunta:                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ "Descreva uma situação em que você teve que motivar     │   │
│  │  uma equipe desmotivada. O que você fez?"               │   │
│  │                                                         │   │
│  │  ○ Discordo totalmente                                  │   │
│  │  ○ Discordo                                             │   │
│  │  ○ Neutro                                               │   │
│  │  ○ Concordo                                             │   │
│  │  ○ Concordo totalmente                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [👁️ Preview Completo]                                          │
│                                                                 │
│  [← Voltar]                              [✅ Publicar Teste]    │
└─────────────────────────────────────────────────────────────────┘
                │
                ▼
[Teste publicado e vinculado à vaga]
```

---

## Fluxo da Empresa: Enviar para Candidatos

```
[Empresa acessa página da vaga com teste]
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Teste Comportamental - Líder de Equipe                        │
│                                                                 │
│  📊 Status: Publicado                                          │
│  📝 20 perguntas | ⏱️ 15-20 min                                 │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ENVIAR PARA CANDIDATOS                                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📋 Candidatos Internos (já cadastrados)                 │   │
│  │                                                         │   │
│  │ Selecione candidatos que aplicaram para esta vaga:      │   │
│  │                                                         │   │
│  │ ☑️ Maria Silva - 85% match - ⏳ Aguardando teste        │   │
│  │ ☑️ João Santos - 78% match - ⏳ Aguardando teste        │   │
│  │ ☐ Ana Costa - 82% match - ✅ Teste concluído           │   │
│  │                                                         │   │
│  │                            [📩 Enviar Convite]          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔗 Candidatos Externos (link mágico)                    │   │
│  │                                                         │   │
│  │ Gere um link para candidatos que não estão cadastrados: │   │
│  │                                                         │   │
│  │ Nome do candidato (opcional): [José Pereira          ]  │   │
│  │ Email do candidato:           [jose@email.com        ]  │   │
│  │                                                         │   │
│  │ Ou gere link genérico para compartilhar:                │   │
│  │                                                         │   │
│  │ [🔗 Gerar Link Mágico]   [📧 Enviar por Email]         │   │
│  │                                                         │   │
│  │ Links gerados:                                          │   │
│  │ • José Pereira - recrutars.com/t/abc123 - Pendente     │   │
│  │ • Link genérico - recrutars.com/t/xyz789 - 2 acessos   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fluxo do Candidato Externo (Link Mágico)

```
[Candidato recebe link: recrutars.com/t/abc123]
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      🧠 RecrutaRS                               │
│                                                                 │
│        Você foi convidado para uma avaliação!                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  🏢 TechCorp Soluções                                   │   │
│  │  📋 Vaga: Líder de Equipe - Operações                   │   │
│  │  📍 Porto Alegre, RS                                    │   │
│  │                                                         │   │
│  │  Esta avaliação comportamental faz parte do processo   │   │
│  │  seletivo. Suas respostas serão analisadas pela         │   │
│  │  equipe de recrutamento.                                │   │
│  │                                                         │   │
│  │  ⏱️ Tempo estimado: 15-20 minutos                       │   │
│  │  📊 20 perguntas                                        │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Para continuar, preencha seus dados:                          │
│                                                                 │
│  Nome completo *                                                │
│  [José Pereira da Silva                                    ]   │
│                                                                 │
│  Email *                                                        │
│  [jose.pereira@email.com                                   ]   │
│                                                                 │
│  Telefone (opcional)                                            │
│  [(51) 99999-9999                                          ]   │
│                                                                 │
│  ☑️ Concordo com os Termos de Uso e Política de Privacidade   │
│                                                                 │
│                    [🚀 Iniciar Avaliação]                       │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Já tem cadastro? [Fazer login]                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                │
                ▼
[Cria conta simplificada automaticamente]
                │
                ▼
[Redireciona para interface de teste (igual PRD-047)]
                │
                ▼
[Ao finalizar, candidato tem conta completa]
                │
                ▼
[Pode explorar outras vagas na plataforma]
```

---

## Fluxo do Recrutador: Análise de Resultados

```
[Recrutador acessa candidaturas da vaga]
                │
                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Candidaturas - Líder de Equipe                          [📊 Comparar]      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Filtros: [Todos ▼] [Com teste ▼] [Score mínimo: ___ ]                     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Maria Silva                                        Match: 85%      │   │
│  │  📍 Porto Alegre | 5 anos exp.                                      │   │
│  │                                                                     │   │
│  │  🧠 Teste Comportamental: ✅ Concluído                              │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ Score Geral: 82/100                                         │   │   │
│  │  │                                                             │   │   │
│  │  │ Liderança        ████████████████░░░░  85%                  │   │   │
│  │  │ Comunicação      ██████████████░░░░░░  74%                  │   │   │
│  │  │ Resiliência      █████████████████░░░  88%                  │   │   │
│  │  │ Integridade      ██████████████████░░  92%                  │   │   │
│  │  │                                                             │   │   │
│  │  │ ⚠️ Ponto de atenção: Comunicação abaixo da média           │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │  [👁️ Ver Relatório Completo]  [✏️ Ajustar Score]  [📊 Comparar]    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  João Santos                                        Match: 78%      │   │
│  │  📍 São Paulo | 7 anos exp.                                         │   │
│  │                                                                     │   │
│  │  🧠 Teste Comportamental: ⏳ Em andamento (15/20 perguntas)         │   │
│  │                                                                     │   │
│  │  [📩 Enviar Lembrete]                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  José Pereira (via link mágico)                    Match: --        │   │
│  │  📍 Porto Alegre | Perfil novo                                      │   │
│  │                                                                     │   │
│  │  🧠 Teste Comportamental: ✅ Concluído                              │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ Score Geral: 71/100                                         │   │   │
│  │  │                                                             │   │   │
│  │  │ Liderança        ██████████████░░░░░░  72%                  │   │   │
│  │  │ Comunicação      █████████████████░░░  86%                  │   │   │
│  │  │ Resiliência      ████████████░░░░░░░░  62%  ⚠️              │   │   │
│  │  │ Integridade      ██████████████░░░░░░  70%                  │   │   │
│  │  │                                                             │   │   │
│  │  │ 🚩 RED FLAG: Resiliência baixa (possível risco)            │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │  [👁️ Ver Relatório Completo]  [✏️ Ajustar Score]  [📊 Comparar]    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tela: Relatório Detalhado do Candidato

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [← Voltar]  Relatório Comportamental - Maria Silva                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📊 RESUMO GERAL                                    Score: 82/100    │   │
│  │                                                                     │   │
│  │ Maria demonstrou forte perfil de liderança com destaque para       │   │
│  │ resiliência e integridade. Área de atenção: comunicação.           │   │
│  │                                                                     │   │
│  │ ✅ Recomendação IA: APROVAR para próxima fase                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  📈 SCORES POR COMPETÊNCIA                                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  💼 Liderança           ████████████████░░░░  85%                   │   │
│  │     → Demonstra capacidade de influenciar e motivar equipes        │   │
│  │                                                                     │   │
│  │  💬 Comunicação         ██████████████░░░░░░  74%   ⚠️             │   │
│  │     → Pode melhorar clareza em situações de conflito               │   │
│  │                                                                     │   │
│  │  💪 Resiliência         █████████████████░░░  88%   ⭐              │   │
│  │     → Forte capacidade de lidar com pressão e adversidades        │   │
│  │                                                                     │   │
│  │  💎 Integridade         ██████████████████░░  92%   ⭐              │   │
│  │     → Alto padrão ético e transparência nas decisões              │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  📝 ANÁLISE DAS RESPOSTAS                                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Pergunta 3 - Liderança [⭐⭐]                                        │   │
│  │                                                                     │   │
│  │ "Como você lida com conflitos entre membros da sua equipe?"        │   │
│  │                                                                     │   │
│  │ Resposta: B) Converso individualmente primeiro, depois reúno      │   │
│  │                                                                     │   │
│  │ 🤖 Análise IA:                                                     │   │
│  │ Score sugerido: 4/5                                                │   │
│  │ Justificativa: Abordagem equilibrada que demonstra empatia e      │   │
│  │ habilidade de mediação. Poderia ser mais proativa na prevenção.   │   │
│  │                                                                     │   │
│  │ 👤 Ajuste do recrutador: [4 ▼]  [💬 Adicionar nota]               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Pergunta 7 - Comunicação [⭐⭐⭐]                                    │   │
│  │                                                                     │   │
│  │ "Descreva uma situação em que você teve que dar feedback          │   │
│  │  negativo a alguém..."                                             │   │
│  │                                                                     │   │
│  │ Resposta: C) Evito quando possível para não criar conflito        │   │
│  │                                                                     │   │
│  │ 🤖 Análise IA:                                                     │   │
│  │ Score sugerido: 2/5  ⚠️                                           │   │
│  │ Justificativa: Evitar feedback pode indicar dificuldade com       │   │
│  │ conversas difíceis. Ponto de atenção para cargo de liderança.     │   │
│  │                                                                     │   │
│  │ 👤 Ajuste do recrutador: [2 ▼]  [💬 Adicionar nota]               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [Ver todas as 20 respostas ▼]                                             │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  🚩 RED FLAGS IDENTIFICADOS                                                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ✅ Nenhum red flag crítico identificado                            │   │
│  │                                                                     │   │
│  │ ⚠️ Pontos de atenção:                                              │   │
│  │ • Comunicação: Pode ter dificuldade com feedback difícil          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  💡 RECOMENDAÇÕES                                                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 🤖 Sugestão da IA:                                                  │   │
│  │                                                                     │   │
│  │ Maria tem perfil compatível com a vaga. Recomendamos:              │   │
│  │ • ✅ Avançar para entrevista presencial                            │   │
│  │ • 💬 Explorar experiências de feedback na entrevista               │   │
│  │ • 📋 Considerar plano de desenvolvimento em comunicação           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  DECISÃO DO RECRUTADOR                                                      │
│                                                                             │
│  [✅ Aprovar]  [⏸️ Aguardar]  [❌ Reprovar]                                 │
│                                                                             │
│  Nota interna (opcional):                                                   │
│  [Candidata forte, agendar entrevista para semana que vem.          ]      │
│                                                                             │
│  [💾 Salvar Decisão]                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tela: Comparação de Candidatos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [← Voltar]  Comparar Candidatos - Líder de Equipe                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Selecionados: Maria Silva, José Pereira                                   │
│                                                                             │
│  ┌─────────────────────────────┬─────────────────────────────┐             │
│  │       Maria Silva          │       José Pereira          │             │
│  │       Score: 82/100        │       Score: 71/100         │             │
│  ├─────────────────────────────┼─────────────────────────────┤             │
│  │                             │                             │             │
│  │  Liderança        85%  ██▓ │  Liderança        72%  █▓░ │             │
│  │  Comunicação      74%  █▓░ │  Comunicação      86%  ███ │             │
│  │  Resiliência      88%  ███ │  Resiliência      62%  █░░ │             │
│  │  Integridade      92%  ███ │  Integridade      70%  █▓░ │             │
│  │                             │                             │             │
│  ├─────────────────────────────┼─────────────────────────────┤             │
│  │ ⭐ Pontos Fortes:          │ ⭐ Pontos Fortes:           │             │
│  │ • Resiliência              │ • Comunicação               │             │
│  │ • Integridade              │                             │             │
│  │                             │                             │             │
│  │ ⚠️ Atenção:                │ ⚠️ Atenção:                 │             │
│  │ • Comunicação              │ • Resiliência               │             │
│  │                             │ • Integridade               │             │
│  │                             │                             │             │
│  │ 🚩 Red Flags: 0            │ 🚩 Red Flags: 1             │             │
│  │                             │ (Resiliência baixa)         │             │
│  │                             │                             │             │
│  ├─────────────────────────────┼─────────────────────────────┤             │
│  │ 🤖 Recomendação:           │ 🤖 Recomendação:            │             │
│  │ ✅ APROVAR                 │ ⚠️ AVALIAR COM CAUTELA      │             │
│  └─────────────────────────────┴─────────────────────────────┘             │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  📊 GRÁFICO COMPARATIVO (Radar)                                            │
│                                                                             │
│              Liderança                                                      │
│                 ▲                                                           │
│                /|\                                                          │
│               / | \                                                         │
│  Integridade ●──┼──● Comunicação                                           │
│               \ | /                                                         │
│                \|/                                                          │
│                 ▼                                                           │
│             Resiliência                                                     │
│                                                                             │
│  ── Maria (azul)  ── José (verde)                                          │
│                                                                             │
│  [📥 Exportar Comparação]    [📩 Enviar para Gestor]                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Modelo de Dados

### Tabela: `job_assessments` (Teste por Vaga)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `jobId` | UUID | FK → jobs |
| `companyId` | UUID | FK → companies |
| `title` | VARCHAR(200) | Título do teste |
| `status` | ENUM | 'draft', 'published', 'archived' |
| `competencies` | JSONB | Competências selecionadas |
| `questionsIds` | JSONB | IDs das perguntas selecionadas |
| `totalQuestions` | INT | Total de perguntas |
| `estimatedMinutes` | INT | Tempo estimado |
| `expirationDays` | INT | Dias para expirar convite (default 7) |
| `createdBy` | UUID | FK → users |
| `createdAt` | TIMESTAMP | Data de criação |
| `updatedAt` | TIMESTAMP | Data de atualização |

### Tabela: `job_assessment_invites` (Convites)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `jobAssessmentId` | UUID | FK → job_assessments |
| `type` | ENUM | 'internal', 'magic_link' |
| `candidateId` | UUID | FK → candidates (se interno) |
| `externalName` | VARCHAR(200) | Nome do externo (se link mágico) |
| `externalEmail` | VARCHAR(200) | Email do externo |
| `magicToken` | VARCHAR(100) | Token único do link mágico |
| `status` | ENUM | 'pending', 'started', 'completed', 'expired' |
| `sentAt` | TIMESTAMP | Quando foi enviado |
| `startedAt` | TIMESTAMP | Quando iniciou |
| `completedAt` | TIMESTAMP | Quando completou |
| `expiresAt` | TIMESTAMP | Data de expiração |
| `createdAt` | TIMESTAMP | Data de criação |

### Tabela: `job_assessment_results` (Resultados)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `inviteId` | UUID | FK → job_assessment_invites |
| `jobAssessmentId` | UUID | FK → job_assessments |
| `candidateId` | UUID | FK → candidates |
| `sessionId` | UUID | FK → assessment_sessions |
| `overallScore` | INT | Score geral (0-100) |
| `competencyScores` | JSONB | Scores por competência |
| `aiAnalysis` | JSONB | Análise completa da IA |
| `aiRecommendation` | ENUM | 'approve', 'evaluate', 'reject' |
| `recruiterAdjustments` | JSONB | Ajustes feitos pelo recrutador |
| `recruiterDecision` | ENUM | 'approved', 'pending', 'rejected' |
| `recruiterNotes` | TEXT | Notas do recrutador |
| `redFlags` | JSONB | Red flags identificados |
| `createdAt` | TIMESTAMP | Data de criação |
| `updatedAt` | TIMESTAMP | Data de atualização |

### Estrutura de `competencies` (JSONB)

```typescript
interface SelectedCompetencies {
  critical: string[];  // IDs das competências críticas
  important: string[]; // IDs das competências importantes
  weights: {
    [competencyId: string]: number; // Peso de 1-5
  };
}
```

### Estrutura de `recruiterAdjustments` (JSONB)

```typescript
interface RecruiterAdjustments {
  adjustedScores: {
    questionId: string;
    aiScore: number;
    recruiterScore: number;
    note?: string;
  }[];
  overallAdjustment?: number; // Se recrutador ajustou score geral
  adjustmentReason?: string;
}
```

---

## Requisitos Funcionais

### Criar Teste (Empresa)

- **RF-001:** Empresa pode criar teste na página da vaga
- **RF-002:** Passo 1: Selecionar competências (checkboxes por categoria)
- **RF-003:** Mínimo 2 competências, máximo 8
- **RF-004:** Sistema sugere perguntas baseado na Matriz de Competências
- **RF-005:** 4-5 perguntas por competência crítica, 2-3 por importante
- **RF-006:** Balancear níveis (básico, intermediário, avançado)
- **RF-007:** Empresa pode remover perguntas sugeridas
- **RF-008:** Empresa pode adicionar mais perguntas do banco
- **RF-009:** Limite: 15-25 perguntas por teste
- **RF-010:** Preview do teste antes de publicar
- **RF-011:** Salvar como rascunho
- **RF-012:** Publicar teste (vincula à vaga)

### Enviar para Candidatos Internos

- **RF-013:** Listar candidatos que aplicaram para a vaga
- **RF-014:** Mostrar status do teste de cada candidato
- **RF-015:** Selecionar múltiplos candidatos
- **RF-016:** Enviar convite (notificação + email)
- **RF-017:** Candidato recebe notificação na plataforma
- **RF-018:** Candidato pode responder do painel próprio

### Link Mágico (Candidatos Externos)

- **RF-019:** Gerar link único com token
- **RF-020:** Opção de gerar link personalizado (com nome/email)
- **RF-021:** Opção de gerar link genérico (para compartilhar)
- **RF-022:** Link expira em N dias (configurável, default 7)
- **RF-023:** Landing page com informações da vaga/empresa
- **RF-024:** Formulário de dados básicos: nome, email, telefone (opcional)
- **RF-025:** Checkbox de aceite de termos
- **RF-026:** Se já tem conta, opção de fazer login
- **RF-027:** Criar conta simplificada automaticamente
- **RF-028:** Redirecionar para interface de teste

### Conversão de Candidato Externo

- **RF-029:** Após teste, candidato tem conta ativa
- **RF-030:** Candidatura automática para a vaga do teste
- **RF-031:** Resultado vinculado ao perfil
- **RF-032:** Candidato pode explorar outras vagas
- **RF-033:** Email de boas-vindas com credenciais

### Interface de Resposta

- **RF-034:** Usar mesma interface do teste geral (PRD-047)
- **RF-035:** Mostrar que é teste específico para vaga X
- **RF-036:** Progresso salvo automaticamente
- **RF-037:** Pode pausar e continuar

### Análise por IA

- **RF-038:** Calcular score por competência selecionada
- **RF-039:** Gerar análise de cada resposta
- **RF-040:** Identificar red flags
- **RF-041:** Gerar recomendação: aprovar/avaliar/rejeitar
- **RF-042:** Gerar insights e sugestões para entrevista

### Relatório para Recrutador

- **RF-043:** Exibir score geral e por competência
- **RF-044:** Exibir análise de cada resposta
- **RF-045:** Destacar pontos fortes e fracos
- **RF-046:** Alertar red flags (visual destacado)
- **RF-047:** Permitir ajustar score de cada pergunta
- **RF-048:** Permitir adicionar notas
- **RF-049:** Exibir recomendação da IA
- **RF-050:** Botões de decisão: aprovar/aguardar/reprovar

### Comparação de Candidatos

- **RF-051:** Selecionar 2-4 candidatos para comparar
- **RF-052:** Exibir scores lado a lado
- **RF-053:** Gráfico radar comparativo
- **RF-054:** Destacar diferenças significativas

### Gestão de Convites

- **RF-055:** Listar todos os convites enviados
- **RF-056:** Status: pendente, em andamento, concluído, expirado
- **RF-057:** Enviar lembrete para pendentes
- **RF-058:** Revogar link mágico se necessário
- **RF-059:** Ver quantos acessos cada link teve

---

## Requisitos Não-Funcionais

- **RNF-001 (Segurança):** Link mágico com token seguro (UUID + hash)
- **RNF-002 (Expiração):** Links expiram automaticamente
- **RNF-003 (Rate Limit):** Máximo 50 links por vaga
- **RNF-004 (Performance):** Análise IA em menos de 15 segundos
- **RNF-005 (Mobile):** Landing page responsiva

---

## Critérios de Aceitação

### RF-001 a RF-012: Criar Teste

```gherkin
DADO que o recrutador acessa uma vaga
QUANDO clica em "Criar Teste Comportamental"
ENTÃO deve exibir wizard de 3 passos
  E deve permitir selecionar competências
  E deve sugerir perguntas automaticamente
  E deve permitir publicar o teste
```

### RF-019 a RF-028: Link Mágico

```gherkin
DADO que o recrutador gera um link mágico
QUANDO o candidato externo acessa o link
ENTÃO deve ver landing page com informações da vaga
  E deve preencher dados básicos
  E deve iniciar o teste após aceitar termos
  E deve ter conta criada automaticamente
```

### RF-047 a RF-050: Ajuste pelo Recrutador

```gherkin
DADO que o recrutador visualiza relatório de um candidato
QUANDO discorda do score sugerido pela IA
ENTÃO deve poder ajustar o score de cada pergunta
  E deve poder adicionar nota justificando
  E o score geral deve ser recalculado
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Modelo de dados | 4 |
| 2 | Criar teste (empresa) | 5 |
| 3 | Envio para internos | 3 |
| 4 | Link mágico | 5 |
| 5 | Análise e relatório | 4 |
| 6 | Comparação e ajustes | 3 |

### Detalhamento das Fases

#### Fase 1: Modelo de Dados

**Objetivo:** Estrutura para testes por vaga

**Ações:**
- [ ] Criar tabela `job_assessments`
- [ ] Criar tabela `job_assessment_invites`
- [ ] Criar tabela `job_assessment_results`
- [ ] Criar tipos TypeScript
- [ ] Relacionar com tabelas existentes

**Validação:** Migrations executam sem erro

#### Fase 2: Criar Teste

**Objetivo:** Wizard de criação de teste

**Ações:**
- [ ] Criar página `/empresa/vagas/[id]/criar-teste`
- [ ] Implementar Passo 1: Seleção de competências
- [ ] Implementar Passo 2: Sugestão e edição de perguntas
- [ ] Implementar Passo 3: Preview e publicação
- [ ] Lógica de sugestão baseada na Matriz de Competências

**Validação:** Empresa consegue criar e publicar teste

#### Fase 3: Envio para Internos

**Objetivo:** Convidar candidatos cadastrados

**Ações:**
- [ ] Listar candidatos da vaga
- [ ] Implementar seleção múltipla
- [ ] Enviar notificação na plataforma
- [ ] Enviar email de convite
- [ ] Atualizar status do convite

**Validação:** Candidato interno recebe e responde teste

#### Fase 4: Link Mágico

**Objetivo:** Fluxo completo para externos

**Ações:**
- [ ] Gerar token seguro
- [ ] Criar landing page `/t/[token]`
- [ ] Formulário de dados básicos
- [ ] Criação automática de conta
- [ ] Redirecionamento para teste
- [ ] Email de boas-vindas

**Validação:** Candidato externo completa fluxo

#### Fase 5: Análise e Relatório

**Objetivo:** Análise IA e relatório detalhado

**Ações:**
- [ ] Adaptar análise do PRD-047 para teste por vaga
- [ ] Gerar recomendação (aprovar/avaliar/rejeitar)
- [ ] Criar página de relatório detalhado
- [ ] Exibir análise por resposta
- [ ] Destacar red flags

**Validação:** Recrutador vê relatório completo

#### Fase 6: Comparação e Ajustes

**Objetivo:** Ferramentas avançadas de análise

**Ações:**
- [ ] Implementar ajuste de scores
- [ ] Implementar notas do recrutador
- [ ] Criar tela de comparação
- [ ] Gráfico radar comparativo
- [ ] Botões de decisão

**Validação:** Recrutador consegue comparar e decidir

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-046 | Banco de Perguntas | ⏳ Pendente (pré-requisito) |
| PRD-047 | Teste Geral do Candidato | ⏳ Pendente (pré-requisito) |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Email (Resend/SendGrid) | Envio de convites | Verificar |
| OpenAI / Claude API | Análise IA | Verificar |

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Gauge-Pro 2.0 — Sistema de Avaliação Comportamental"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-046 | Banco de Perguntas | ⏳ | Base |
| 2 | PRD-047 | Teste Geral do Candidato | ⏳ | Depende de 046 |
| **3** | **PRD-048** | **Teste por Vaga (Empresa)** | **🔄 ATUAL** | Depende de 046, 047 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Link mágico | Sensível | Token UUID + hash, expira |
| Dados do candidato externo | PII | Criptografar, LGPD |
| Respostas | Sensível | Apenas empresa da vaga acessa |
| Análise IA | Interno | Não compartilhar com candidato |

### Autenticação e Autorização

- Empresa só vê testes das suas vagas
- Recrutador precisa permissão para ver resultados
- Link mágico é público mas tokenizado
- Candidato externo não acessa plataforma até criar conta

### Auditoria

- Logar quem criou/editou teste
- Logar quem ajustou scores
- Logar decisões (aprovar/reprovar)

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. REUTILIZAR COMPONENTES:**
> A interface de resposta do teste deve reutilizar componentes do PRD-047 (Teste Geral).

> **⚠️ 3. SEGURANÇA DO LINK MÁGICO:**
> - Token deve ser UUID v4 + hash adicional
> - Implementar rate limit de acessos
> - Link deve expirar automaticamente
> - Não expor dados sensíveis na URL

> **⚠️ 4. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Renomear este arquivo adicionando `_DONE` ao final
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Este épico pode usar "Gauge" ou "Assessment".

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
| **Reutilizar** | Usar componentes do PRD-047 |
| **Segurança** | Link mágico com token forte |
| **Híbrido** | IA sugere, humano decide |
| **Auditoria** | Logar todas as decisões |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Wizard** | Usar Stepper/Progress para criação |
| **Gráficos** | Recharts para radar comparativo |
| **Email** | Usar template bonito para convites |
| **Landing** | Mobile-first, carregamento rápido |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Bloquear candidato por red flags (apenas alertar) |
| Expor análise da IA para o candidato |
| Permitir empresa criar perguntas próprias (só banco) |
| Link mágico sem expiração |
| Mais de 25 perguntas por teste |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Implementado por** | - |
| **Observações** | Depende de PRD-046 e PRD-047 |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 20/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
