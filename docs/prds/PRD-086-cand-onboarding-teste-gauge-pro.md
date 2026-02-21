# PRD-086: Onboarding — Teste Comportamental Gauge-Pro

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Módulo de Onboarding (Candidato) |
| **Repositório** | RecrutaRS-NovaVersao |
| **Objetivo** | Garantir que o candidato realize o teste comportamental Gauge-Pro (baseado em PI — Predictive Index) como quarta e última etapa obrigatória do onboarding, gerando seu perfil comportamental antes de acessar a plataforma |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Alta |
| **Épico** | Onboarding de Candidatos |
| **PRDs Relacionados** | PRD-083 (Cadastro Básico), PRD-084 (Perfil Pessoal), PRD-085 (Perfil Profissional — etapa anterior) |
| **Padrão de código** | camelCase para novos campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

> **Justificativa da complexidade Média:** O teste Gauge-Pro já existe na plataforma. Este PRD integra o teste ao fluxo de onboarding como etapa obrigatória, adicionando o controle de progresso e a liberação de acesso à plataforma após conclusão. Não cria o teste do zero.

---

## Contexto do Problema

O teste comportamental Gauge-Pro é o diferencial competitivo central do RecrutaRS. Ele utiliza a metodologia PI (Predictive Index) para mapear o perfil comportamental do candidato em múltiplas dimensões, gerando insights que alimentam os algoritmos de matching (Test Fit para compatibilidade com vagas e Cultural Fit para alinhamento organizacional).

Atualmente, o teste é opcional ou depende de convite da empresa. O resultado é que muitos candidatos na plataforma não possuem perfil comportamental, o que inviabiliza o uso dos recursos mais valiosos do sistema — o matching inteligente e as análises de compatibilidade.

Ao tornar o teste obrigatório durante o onboarding, todo novo candidato entra na plataforma já com seu perfil comportamental completo, garantindo que o matching funcione desde a primeira busca e que as empresas tenham dados comportamentais de 100% dos novos candidatos.

Este PRD é a **quarta e última etapa** da cadeia de onboarding (083 → 084 → 085 → 086). Após completar o teste, o candidato finalmente acessa a plataforma.

> **Escopo:** Aplica-se apenas a **novos cadastros**. Candidatos existentes não são afetados.

---

## Conceito da Solução

### Situação Atual (As-Is)

O teste Gauge-Pro existe na plataforma, mas é acessado de forma avulsa — via convite de empresa ou por iniciativa do candidato. Não faz parte do fluxo de entrada. Muitos candidatos nunca realizam o teste, ficando sem perfil comportamental e limitando o potencial do matching.

### Situação Desejada (To-Be)

Após completar o perfil profissional (PRD-085), o candidato é direcionado para realizar o teste Gauge-Pro como última etapa obrigatória do onboarding. Ao concluir o teste, o perfil comportamental é gerado automaticamente e o acesso à plataforma é liberado.

O candidato pode sair durante o teste e retornar de onde parou, desde que o teste suporte essa funcionalidade. Ao fazer login, o sistema detecta que o onboarding está na etapa 4 e redireciona para o teste.

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Manter o teste como opcional | Compromete a proposta de valor — matching sem perfil comportamental é incompleto |
| Permitir acesso à plataforma e solicitar o teste depois | O candidato perde o incentivo de completar; perfis ficam incompletos |
| Aplicar o teste antes do perfil profissional | O perfil profissional fornece contexto que pode ser útil para a análise comportamental |

---

## Escopo

### Incluído

- ✅ Direcionamento do candidato para o teste Gauge-Pro como etapa 4 do onboarding
- ✅ Indicador visual de progresso (etapa 4 de 4)
- ✅ Integração com o teste Gauge-Pro já existente na plataforma
- ✅ Tela de introdução/orientação antes do início do teste
- ✅ Persistência de progresso (se o teste suportar retomada parcial)
- ✅ Processamento do resultado e geração do perfil comportamental
- ✅ Liberação do acesso à plataforma após conclusão do teste
- ✅ Tela de conclusão do onboarding com feedback positivo

### Excluído

- ❌ Criação ou redesenho do teste Gauge-Pro em si (já existe)
- ❌ Alteração na metodologia PI ou nos algoritmos de avaliação
- ❌ Migração de candidatos existentes sem teste (PRD futuro)
- ❌ Envio de resultados do teste por e-mail neste PRD
- ❌ Exibição detalhada do resultado comportamental neste PRD (o candidato verá isso no dashboard após entrar)

---

## Requisitos Funcionais

### Direcionamento e Introdução

- **RF-001:** Após completar o perfil profissional (PRD-085), o candidato deve ser direcionado automaticamente para a etapa do teste comportamental
- **RF-002:** A tela deve exibir o indicador de progresso do onboarding (etapa 4 de 4)
- **RF-003:** Antes de iniciar o teste, o candidato deve ver uma tela de introdução que explique:
  - O que é o teste Gauge-Pro e por que é importante
  - Tempo estimado de duração
  - Que não existem respostas certas ou erradas
  - Orientações básicas para realizar o teste (ambiente tranquilo, responder com honestidade)
- **RF-004:** O candidato deve iniciar o teste através de um botão claro na tela de introdução

### Realização do Teste

- **RF-005:** O teste Gauge-Pro deve ser apresentado ao candidato utilizando a estrutura já existente na plataforma
- **RF-006:** O candidato não deve conseguir acessar a plataforma principal enquanto o teste não for concluído
- **RF-007:** Se o teste suportar retomada parcial, o candidato deve poder sair e voltar de onde parou. Se não suportar, o candidato deve ser informado de que precisa completar o teste em uma única sessão antes de iniciar
- **RF-008:** O progresso dentro do teste deve ter feedback visual (ex: barra de progresso ou indicador de questões respondidas)

### Conclusão e Liberação

- **RF-009:** Ao concluir o teste, o sistema deve processar as respostas e gerar o perfil comportamental do candidato
- **RF-010:** Após a geração do perfil, o onboarding deve ser marcado como completo
- **RF-011:** O candidato deve ver uma tela de conclusão do onboarding com:
  - Mensagem de parabéns/boas-vindas
  - Indicação de que o perfil está completo
  - Botão para acessar a plataforma (dashboard)
- **RF-012:** A partir deste momento, o candidato acessa a plataforma normalmente, sem mais redirecionamentos de onboarding
- **RF-013:** Ao fazer login, se o candidato não completou o teste, o sistema deve redirecioná-lo para esta etapa

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** O processamento do resultado do teste deve acontecer de forma que o candidato não precise esperar mais do que alguns segundos para ver a tela de conclusão
- **RNF-002 (Responsividade):** O teste deve funcionar adequadamente em dispositivos móveis, considerando que a maioria dos candidatos acessa pelo celular
- **RNF-003 (Disponibilidade):** Se o serviço de processamento do teste estiver indisponível, o candidato deve ser informado e orientado a tentar novamente mais tarde, sem perder as respostas já dadas

---

## Critérios de Aceitação

### RF-001/RF-002: Direcionamento

```gherkin
DADO que o candidato completou o perfil profissional (PRD-085)
QUANDO é redirecionado para a etapa 4
ENTÃO a tela de introdução do teste Gauge-Pro é exibida
  E o indicador mostra "Etapa 4 de 4"
```

### RF-003/RF-004: Tela de Introdução

```gherkin
DADO que o candidato está na tela de introdução do teste
QUANDO visualiza a tela
ENTÃO vê explicações sobre o teste, tempo estimado e orientações
  E há um botão claro para iniciar o teste
QUANDO clica em iniciar
ENTÃO o teste Gauge-Pro é carregado
```

### RF-009 a RF-012: Conclusão do Onboarding

```gherkin
DADO que o candidato completou todas as questões do teste Gauge-Pro
QUANDO o sistema processa as respostas
ENTÃO o perfil comportamental é gerado
  E o onboarding é marcado como completo
  E o candidato vê a tela de conclusão com mensagem de boas-vindas
  E há um botão para acessar a plataforma
QUANDO clica para acessar a plataforma
ENTÃO é redirecionado para o dashboard
  E pode navegar livremente pela plataforma
```

### RF-013: Retorno com Teste Pendente

```gherkin
DADO que o candidato iniciou o teste mas não concluiu
QUANDO faz login novamente
ENTÃO o sistema detecta onboarding na etapa 4
  E redireciona para o teste (tela de introdução ou retomada, conforme suporte)
```

### RF-006: Bloqueio de Acesso

```gherkin
DADO que o candidato não completou o teste comportamental
QUANDO tenta acessar qualquer página da plataforma
ENTÃO é redirecionado para a etapa do teste
```

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
1. Candidato completa perfil profissional (PRD-085) → redirecionado para teste
2. Vê indicador "Etapa 4 de 4"
3. Lê a tela de introdução com orientações
4. Clica em "Iniciar Teste"
5. Responde às questões do Gauge-Pro
6. Progresso visível durante o teste
7. Completa todas as questões
8. Sistema processa → perfil comportamental gerado
9. Tela de conclusão: "Parabéns! Seu perfil está completo."
10. Clica em "Acessar Plataforma" → dashboard
11. Navega livremente — onboarding concluído ✓
```

### Fluxo Alternativo: Sai Durante o Teste

```
1-5. (inicia o teste)
6. Candidato fecha o navegador durante o teste
7. Faz login novamente
8. Sistema detecta onboarding na etapa 4
9. Se teste suporta retomada → retorna de onde parou
   Se teste NÃO suporta retomada → volta à tela de introdução para reiniciar
10. Completa o teste → fluxo normal de conclusão
```

### Fluxo de Erro: Falha no Processamento

```
1-7. (completa as questões)
8. Sistema tenta processar → falha temporária
9. Mensagem: "Não foi possível processar seu teste. Tente novamente em alguns instantes."
10. Candidato tenta novamente → processamento OK → fluxo normal
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Investigação do teste existente | - |
| 2 | Integração ao onboarding + telas de introdução e conclusão | 3-5 |
| 3 | Validação, testes e ajustes | - |

### Detalhamento das Fases

#### Fase 1: Investigação e Preparação

**Objetivo:** Mapear a implementação atual do teste Gauge-Pro e entender como integrá-lo ao onboarding

**Ações:**
- [ ] Investigar como o teste Gauge-Pro está implementado atualmente — componentes, fluxo, tabelas no Supabase
- [ ] Verificar se o teste suporta retomada parcial (sair e voltar) ou se exige sessão única
- [ ] Verificar como o resultado é processado e onde o perfil comportamental é armazenado
- [ ] Verificar o mecanismo de controle de etapa do onboarding criado nos PRDs anteriores (083/084/085)
- [ ] Identificar se o teste já é invocado em outros contextos (convite de empresa) e como reutilizar

**Validação:** Relatório completo do teste existente, capacidade de retomada e pontos de integração

#### Fase 2: Implementação

**Objetivo:** Integrar o teste ao fluxo de onboarding com telas de introdução e conclusão

**Ações:**
- [ ] Implementar a tela de introdução do teste com explicações e orientações
- [ ] Integrar o teste Gauge-Pro existente como etapa 4 do onboarding
- [ ] Implementar o controle de bloqueio de acesso (candidato não acessa plataforma sem completar)
- [ ] Implementar o redirecionamento ao fazer login com teste pendente
- [ ] Implementar a tela de conclusão do onboarding (parabéns + acesso à plataforma)
- [ ] Marcar o onboarding como completo após conclusão do teste
- [ ] Garantir que o candidato navega livremente após conclusão

**Validação:** Fluxo completo end-to-end — da introdução à liberação da plataforma

#### Fase 3: Validação e Ajustes

**Objetivo:** Garantir qualidade e cobertura de edge cases

**Ações:**
- [ ] Testar todos os cenários dos critérios de aceitação
- [ ] Testar em dispositivos móveis
- [ ] Testar cenário de saída e retorno (com e sem suporte a retomada)
- [ ] Testar cenário de falha no processamento
- [ ] Verificar que o perfil comportamental é gerado corretamente
- [ ] Verificar que após conclusão, o candidato acessa todas as funcionalidades normalmente
- [ ] Verificar que candidatos existentes não são afetados

**Validação:** Todos os critérios passando; onboarding completo funcional de ponta a ponta

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-083 | Cadastro Básico com Validação CPF | ⏳ Pendente |
| PRD-084 | Perfil Pessoal | ⏳ Pendente |
| PRD-085 | Perfil Profissional | ⏳ Pendente |

### Decisões Pendentes

- [ ] Verificar se o teste Gauge-Pro atual suporta retomada parcial — isso afeta o RF-007 e o fluxo alternativo

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Onboarding de Candidatos"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-083 | Cadastro Básico com Validação CPF | ⏳ Pendente | Base |
| 2 | PRD-084 | Perfil Pessoal | ⏳ Pendente | Depende de 083 |
| 3 | PRD-085 | Perfil Profissional | ⏳ Pendente | Depende de 084 |
| **4** | **PRD-086** | **Teste Comportamental Gauge-Pro** | **🔄 ATUAL** | Depende de 085 |

> **Nota:** Esta é a última etapa. Após completar, o candidato acessa a plataforma livremente.

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Respostas do teste comportamental | Dado sensível (LGPD) | Protegido por RLS, acesso restrito |
| Perfil comportamental gerado | Dado sensível (LGPD) | Protegido por RLS, visível apenas em contextos autorizados |

### Autenticação e Autorização

- Candidato já autenticado (conta criada no PRD-083)
- As respostas e o perfil comportamental são vinculados ao candidato autenticado via RLS
- O perfil comportamental é visível para empresas apenas nos contextos autorizados pelo sistema (vagas com matching, processos seletivos)

### Auditoria

- O timestamp de início e conclusão do teste deve ser registrado
- O perfil comportamental gerado deve ter registro de quando foi criado

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."
>
> **IMPORTANTE:** Investigue o que já existe no banco de dados do Supabase e nos componentes do teste Gauge-Pro. O teste já existe na plataforma — o objetivo NÃO é recriar o teste, mas integrá-lo ao fluxo de onboarding como etapa obrigatória. Verifique como o teste é invocado, onde os resultados são armazenados, e se suporta retomada parcial.

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo SemVer
> - Atualizar o CHANGELOG.md
> - Renomear este arquivo adicionando `_DONE` ao final
> - Atualizar a seção "Status de Implementação"

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Não recriar** | O teste Gauge-Pro já existe. Este PRD integra o teste existente ao onboarding como etapa obrigatória |
| **Metodologia** | O Gauge-Pro utiliza PI (Predictive Index), NÃO DISC. Manter consistência na nomenclatura e referências |
| **Retomada parcial** | Investigar se o teste permite que o candidato saia no meio e volte. Se não permitir, informar o candidato na tela de introdução que precisa completar em sessão única |
| **Tela de conclusão** | A tela de conclusão do onboarding é o último ponto de contato antes da plataforma. Deve transmitir uma experiência positiva e acolhedora |
| **Liberação de acesso** | Após conclusão, o mecanismo de onboarding deve parar de redirecionar o candidato. Ele acessa a plataforma normalmente |
| **Candidatos existentes** | Este fluxo aplica-se apenas a novos cadastros |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Recriar o teste Gauge-Pro do zero |
| Referir-se ao teste como "DISC" — a metodologia é PI (Predictive Index) |
| Permitir acesso à plataforma sem conclusão do teste |
| Permitir que o candidato pule o teste |
| Afetar candidatos já cadastrados |
| Exibir resultados detalhados do teste na tela de conclusão do onboarding (o candidato verá isso no dashboard) |

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
| 21/02/2026 | v1 | Criação inicial — Teste comportamental Gauge-Pro como etapa 4 (final) do onboarding de candidatos |

---

**AILA - Sistemas Inteligentes**
