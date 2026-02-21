# PRD-084: Onboarding — Perfil Pessoal do Candidato

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Módulo de Onboarding (Candidato) |
| **Repositório** | RecrutaRS-NovaVersao |
| **Objetivo** | Coletar os dados pessoais complementares do candidato como segunda etapa obrigatória do onboarding, incluindo data de nascimento, gênero, localização, foto de perfil, estado civil e nacionalidade |
| **Tipo** | Feature |
| **Complexidade** | Baixa |
| **Total de Fases** | 3 |
| **Prioridade** | Alta |
| **Épico** | Onboarding de Candidatos |
| **PRDs Relacionados** | PRD-083 (Cadastro Básico — etapa anterior), PRD-085 (Perfil Profissional — próxima etapa), PRD-086 (Teste Gauge-Pro) |
| **Padrão de código** | camelCase para novos campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

> **Justificativa da complexidade Baixa:** Formulário simples com campos diretos, sem integração externa, sem regras de negócio complexas. A principal complexidade está na persistência dos dados e no controle de progresso do onboarding.

---

## Contexto do Problema

Após completar o cadastro básico (PRD-083), o candidato possui apenas: CPF, nome, e-mail, telefone e senha. Faltam informações pessoais fundamentais para que a plataforma funcione adequadamente — por exemplo, a data de nascimento é necessária para validar requisitos de idade de vagas, a localização permite matching geográfico, e a foto de perfil humaniza o candidato para os recrutadores.

Atualmente esses dados ou não são coletados, ou são coletados tardiamente e de forma opcional dentro do perfil, resultando em perfis incompletos que prejudicam a qualidade do matching e a experiência dos recrutadores.

Este PRD é a **segunda etapa** da cadeia de onboarding (083 → 084 → 085 → 086). O candidato chega aqui automaticamente após criar a conta no PRD-083.

> **Escopo:** Aplica-se apenas a **novos cadastros**. Candidatos existentes não são afetados.

---

## Conceito da Solução

### Situação Atual (As-Is)

Após criar a conta, o candidato acessa imediatamente a plataforma. Dados pessoais como data de nascimento, gênero e foto ficam dispersos ou simplesmente não são coletados. Não há etapa estruturada para completar essas informações.

### Situação Desejada (To-Be)

Após criar a conta (PRD-083), o candidato é direcionado para uma tela de perfil pessoal onde deve preencher seus dados complementares. Todos os campos desta etapa são obrigatórios. Ao completar, o candidato avança automaticamente para a próxima etapa (PRD-085 — Perfil Profissional).

O candidato pode sair a qualquer momento e retornar de onde parou — os dados preenchidos são salvos progressivamente. Ao fazer login novamente, o sistema detecta que o onboarding está incompleto e redireciona para a etapa pendente.

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Coletar todos os dados pessoais junto com o cadastro básico (PRD-083) | Formulário ficaria muito longo para mobile; aumenta abandono |
| Tornar dados pessoais opcionais | Prejudica qualidade do matching e experiência dos recrutadores |
| Coletar apenas dentro do perfil profissional existente | Mistura dados pessoais com profissionais; não garante preenchimento |

---

## Escopo

### Incluído

- ✅ Tela de preenchimento de perfil pessoal como etapa obrigatória do onboarding
- ✅ Campos: data de nascimento, gênero, cidade, estado, foto de perfil, estado civil, nacionalidade
- ✅ Todos os campos obrigatórios para avançar
- ✅ Persistência progressiva — dados salvos à medida que o candidato preenche
- ✅ Indicador visual de progresso no onboarding (em qual etapa está)
- ✅ Redirecionamento automático para PRD-085 ao completar
- ✅ Ao retornar (login), redirecionar para esta etapa se estiver pendente

### Excluído

- ❌ Dados profissionais (cobertos pelo PRD-085)
- ❌ Teste comportamental (coberto pelo PRD-086)
- ❌ Migração de candidatos existentes (PRD futuro)
- ❌ Edição do perfil pessoal após o onboarding (o candidato poderá editar via "Meu Perfil", mas esse fluxo já existe)

---

## Requisitos Funcionais

### Tela de Perfil Pessoal

- **RF-001:** Após criar a conta (PRD-083), o candidato deve ser direcionado automaticamente para a tela de perfil pessoal
- **RF-002:** A tela deve apresentar os seguintes campos, todos obrigatórios:
  - **Data de nascimento** — campo de data
  - **Gênero** — opções: Masculino, Feminino, Outro, Prefiro não informar
  - **Estado** — dropdown com estados brasileiros
  - **Cidade** — dropdown dependente do estado selecionado
  - **Foto de perfil** — upload de imagem
  - **Estado civil** — opções adequadas (Solteiro, Casado, Divorciado, Viúvo, União Estável, Outro)
  - **Nacionalidade** — campo de texto ou dropdown
- **RF-003:** O campo de data de nascimento deve validar que o candidato tem pelo menos 16 anos
- **RF-004:** O upload de foto de perfil deve aceitar formatos de imagem comuns (JPG, PNG, WebP) com tamanho máximo adequado
- **RF-005:** O botão de avançar para a próxima etapa deve ficar desabilitado até que todos os campos obrigatórios estejam preenchidos

### Persistência e Progresso

- **RF-006:** Os dados preenchidos devem ser salvos progressivamente, permitindo que o candidato saia e volte sem perder o progresso
- **RF-007:** Ao fazer login, se o candidato não completou esta etapa, o sistema deve redirecioná-lo automaticamente para esta tela
- **RF-008:** A tela deve exibir um indicador visual de progresso que mostre em qual etapa do onboarding o candidato está (etapa 2 de 4)
- **RF-009:** Ao completar todos os campos e avançar, o candidato deve ser redirecionado para a próxima etapa do onboarding (PRD-085 — Perfil Profissional)
- **RF-010:** O candidato não deve conseguir acessar a plataforma principal (dashboard, vagas, etc.) enquanto esta etapa estiver pendente

### UX Mobile

- **RF-011:** O formulário deve ser otimizado para dispositivos móveis, considerando que a maioria dos candidatos acessa pelo celular
- **RF-012:** O upload de foto deve funcionar adequadamente em dispositivos móveis (câmera e galeria)

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** O upload de foto deve ter feedback visual de progresso
- **RNF-002 (Responsividade):** Layout mobile-first, funcional em telas a partir de 320px
- **RNF-003 (Persistência):** Dados parciais devem ser persistidos de forma que sobrevivam a fechamento de aba, logout ou queda de conexão

---

## Critérios de Aceitação

### RF-001/RF-002: Tela de Perfil Pessoal

```gherkin
DADO que o candidato acabou de criar sua conta (PRD-083)
QUANDO é redirecionado para o onboarding
ENTÃO a tela de perfil pessoal é exibida com todos os 7 campos
  E um indicador mostra "Etapa 2 de 4"
  E o botão de avançar está desabilitado
```

### RF-005/RF-009: Preenchimento Completo

```gherkin
DADO que o candidato está na tela de perfil pessoal
QUANDO preenche todos os campos obrigatórios
ENTÃO o botão de avançar é habilitado
QUANDO clica no botão de avançar
ENTÃO os dados são salvos
  E o candidato é redirecionado para o PRD-085 (Perfil Profissional)
```

### RF-006/RF-007: Persistência de Progresso

```gherkin
DADO que o candidato preencheu parcialmente o perfil pessoal (ex: data de nascimento e gênero)
QUANDO fecha a aba ou faz logout
  E depois faz login novamente
ENTÃO o sistema detecta que o onboarding está na etapa 2
  E redireciona para a tela de perfil pessoal
  E os campos previamente preenchidos estão preservados
```

### RF-010: Bloqueio de Acesso

```gherkin
DADO que o candidato não completou o perfil pessoal
QUANDO tenta acessar qualquer página da plataforma (dashboard, vagas, perfil profissional)
ENTÃO é redirecionado de volta para a tela de perfil pessoal do onboarding
```

### Cenário: Data de Nascimento Inválida

```gherkin
DADO que o candidato está preenchendo a data de nascimento
QUANDO informa uma data que resulta em idade inferior a 16 anos
ENTÃO uma mensagem de validação é exibida
  E o campo é marcado como inválido
```

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
1. Candidato cria conta (PRD-083) → redirecionado para perfil pessoal
2. Vê indicador "Etapa 2 de 4"
3. Preenche data de nascimento
4. Seleciona gênero
5. Seleciona estado → cidade carrega dinamicamente
6. Seleciona cidade
7. Faz upload da foto de perfil
8. Seleciona estado civil
9. Informa nacionalidade
10. Botão "Próximo" habilitado → clica
11. Dados salvos → redirecionado para PRD-085 (Perfil Profissional)
```

### Fluxo Alternativo: Sai e Volta

```
1-5. (preenche parcialmente)
6. Candidato fecha a aba / faz logout
7. Depois faz login novamente
8. Sistema detecta onboarding na etapa 2
9. Redireciona para perfil pessoal com dados parciais preservados
10. Candidato completa os campos restantes → avança
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Investigação da estrutura existente | - |
| 2 | Tela de perfil pessoal + persistência + controle de onboarding | 3-5 |
| 3 | Validação, testes e ajustes mobile | - |

### Detalhamento das Fases

#### Fase 1: Investigação e Preparação

**Objetivo:** Mapear o que já existe no banco de dados e na estrutura de perfil do candidato

**Ações:**
- [ ] Investigar a tabela `candidates` (e tabelas relacionadas) no Supabase — verificar quais campos de perfil pessoal já existem (data de nascimento, gênero, cidade, estado, foto, estado civil, nacionalidade)
- [ ] Verificar se já existe mecanismo de controle de etapas de onboarding ou campo de status de completude
- [ ] Mapear o storage do Supabase para upload de fotos (bucket existente ou necessidade de criar)
- [ ] Identificar como o dropdown de estados/cidades é implementado atualmente na aba Localização do perfil profissional

**Validação:** Relatório da estrutura existente, campos disponíveis e gaps identificados

#### Fase 2: Implementação

**Objetivo:** Criar a tela de perfil pessoal com persistência e controle de fluxo

**Ações:**
- [ ] Criar (ou ajustar) os campos necessários no banco de dados
- [ ] Implementar a tela de perfil pessoal com os 7 campos obrigatórios
- [ ] Implementar persistência progressiva dos dados
- [ ] Implementar o controle de onboarding que redireciona o candidato para a etapa pendente ao fazer login
- [ ] Implementar o indicador visual de progresso (etapa 2 de 4)
- [ ] Implementar o bloqueio de acesso à plataforma enquanto etapa estiver pendente
- [ ] Implementar o redirecionamento para PRD-085 ao completar

**Validação:** Fluxo completo funcional — do redirecionamento pós-cadastro até o avanço para o perfil profissional

#### Fase 3: Validação e Ajustes

**Objetivo:** Garantir qualidade, responsividade mobile e cobertura de edge cases

**Ações:**
- [ ] Testar todos os cenários dos critérios de aceitação
- [ ] Testar em dispositivos móveis (upload de foto via câmera e galeria)
- [ ] Testar persistência (sair e voltar com dados preservados)
- [ ] Testar bloqueio de acesso (tentar acessar dashboard com onboarding pendente)
- [ ] Verificar que candidatos existentes não são afetados

**Validação:** Todos os critérios passando; experiência mobile fluida

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-083 | Cadastro Básico com Validação CPF | ⏳ Pendente |

### Decisões Pendentes

- Nenhuma. Todas as decisões foram tomadas durante a concepção.

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Onboarding de Candidatos"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-083 | Cadastro Básico com Validação CPF | ⏳ Pendente | Base |
| **2** | **PRD-084** | **Perfil Pessoal** | **🔄 ATUAL** | Depende de 083 |
| 3 | PRD-085 | Perfil Profissional | ⏳ Pendente | Depende de 084 |
| 4 | PRD-086 | Teste Comportamental Gauge-Pro | ⏳ Pendente | Depende de 085 |

> **Nota:** O candidato só acessa a plataforma após completar todas as 4 etapas.

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Data de nascimento | PII | Protegido por RLS |
| Gênero | Dado sensível (LGPD) | Protegido por RLS |
| Foto de perfil | PII | Storage protegido, acesso controlado |
| CPF (já coletado) | PII | Referência do PRD-083 |

### Autenticação e Autorização

- O candidato já está autenticado neste ponto (conta criada no PRD-083)
- Os dados devem ser salvos apenas para o candidato autenticado (RLS por user_id)

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."
>
> **IMPORTANTE:** Investigue o que já existe no banco de dados do Supabase antes de criar qualquer migration ou estrutura. Verifique tabelas, campos, constraints e dados existentes para evitar duplicidade ou conflito. Preste atenção especial à tabela `candidates` e ao storage de imagens.

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo SemVer
> - Atualizar o CHANGELOG.md
> - Renomear este arquivo adicionando `_DONE` ao final
> - Atualizar a seção "Status de Implementação"

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Dados de localização** | Cidade/Estado coletados aqui representam onde o candidato mora. No PRD-085, a aba Localização do perfil profissional pode representar onde aceita trabalhar. Os dados deste PRD podem pré-popular os campos do PRD-085, mas são independentes |
| **Controle de onboarding** | É necessário um mecanismo que identifique em qual etapa do onboarding o candidato está (1-4) e redirecione adequadamente ao fazer login |
| **Mobile-first** | A maioria dos candidatos acessa pelo celular. O formulário e o upload de foto devem funcionar perfeitamente em mobile |
| **Candidatos existentes** | Este fluxo aplica-se apenas a novos cadastros. Candidatos existentes não devem ser afetados |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Permitir que o candidato acesse a plataforma sem completar esta etapa |
| Criar campos duplicados se já existirem no banco |
| Ignorar a experiência mobile no upload de foto |
| Afetar candidatos já cadastrados |
| Perder dados parciais quando o candidato sai e volta |

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
| 21/02/2026 | v1 | Criação inicial — Perfil pessoal como etapa 2 do onboarding de candidatos |

---

**AILA - Sistemas Inteligentes**
