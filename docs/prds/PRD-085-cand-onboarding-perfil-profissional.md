# PRD-085: Onboarding — Perfil Profissional do Candidato

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Módulo de Onboarding (Candidato) |
| **Repositório** | RecrutaRS-NovaVersao |
| **Objetivo** | Garantir que o candidato preencha as informações profissionais essenciais como terceira etapa obrigatória do onboarding, utilizando a estrutura de perfil profissional já existente na plataforma, com campos obrigatórios e opcionais definidos por aba |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Alta |
| **Épico** | Onboarding de Candidatos |
| **PRDs Relacionados** | PRD-083 (Cadastro Básico), PRD-084 (Perfil Pessoal — etapa anterior), PRD-086 (Teste Gauge-Pro — próxima etapa) |
| **Padrão de código** | camelCase para novos campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

> **Justificativa da complexidade Média:** O perfil profissional já existe com 9 abas implementadas. Este PRD adiciona a camada de obrigatoriedade por campo durante o onboarding, persistência de progresso entre abas, e integração com o controle de fluxo do onboarding. Não cria telas do zero, mas precisa adaptar telas existentes.

---

## Contexto do Problema

A plataforma RecrutaRS já possui um perfil profissional completo com 9 abas (Informações, Localização, Salário, Interesses, Experiência, Formação, Habilidades, Cursos, Documentos). Porém, atualmente esse preenchimento é totalmente opcional e acessado livremente após o cadastro. O resultado é que a maioria dos candidatos fica com perfis incompletos, prejudicando diretamente a qualidade do matching com vagas, a confiabilidade das análises do Gauge-Pro e a experiência dos recrutadores.

O diferencial competitivo do RecrutaRS está na análise comportamental e no matching inteligente — mas esses recursos dependem de dados completos para funcionar adequadamente. Informações como título profissional, localização de trabalho, pretensão salarial, áreas de interesse, experiências e habilidades são insumos diretos para os algoritmos de recomendação.

Este PRD é a **terceira etapa** da cadeia de onboarding (083 → 084 → 085 → 086). O candidato chega aqui após completar o perfil pessoal (PRD-084).

> **Escopo:** Aplica-se apenas a **novos cadastros**. Candidatos existentes não são afetados.

---

## Conceito da Solução

### Situação Atual (As-Is)

O perfil profissional com 9 abas existe e funciona, mas é totalmente opcional. O candidato pode usar a plataforma sem preencher nada. Não há distinção entre campos obrigatórios e opcionais — tudo é tratado da mesma forma.

### Situação Desejada (To-Be)

Durante o onboarding, o candidato é direcionado para o perfil profissional onde determinados campos são obrigatórios para avançar. O candidato navega entre as abas existentes, preenche o que é exigido, e pode opcionalmente completar o restante. O progresso é salvo por aba, e o candidato pode sair e voltar de onde parou.

Somente após preencher todos os campos obrigatórios em todas as abas exigidas, o candidato avança para o teste comportamental (PRD-086).

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Criar um formulário de onboarding separado do perfil profissional existente | Duplicidade de código e dados; o perfil já existe e funciona bem |
| Tornar todas as 9 abas inteiramente obrigatórias | Muito extenso para mobile; Cursos e Documentos não são essenciais para matching |
| Permitir pular o perfil profissional no onboarding | Compromete a qualidade do matching e a proposta de valor da plataforma |

---

## Escopo

### Incluído

- ✅ Direcionamento do candidato para o perfil profissional como etapa 3 do onboarding
- ✅ Definição de campos obrigatórios e opcionais por aba (conforme mapeamento abaixo)
- ✅ Indicação visual de quais abas/campos estão pendentes
- ✅ Persistência de progresso por aba — candidato pode sair e voltar
- ✅ Indicador visual de progresso no onboarding (etapa 3 de 4)
- ✅ Bloqueio de avanço até que todos os campos obrigatórios estejam preenchidos
- ✅ Redirecionamento para PRD-086 ao completar
- ✅ Pré-preenchimento do campo de localização com dados do PRD-084 (cidade/estado onde mora)

### Excluído

- ❌ Criação de telas novas para o perfil profissional — as abas já existem
- ❌ Alteração na estrutura das abas ou reorganização de campos
- ❌ Migração de candidatos existentes (PRD futuro)
- ❌ Tornar campos opcionais em obrigatórios fora do contexto de onboarding (o perfil continua editável depois)

---

## Mapa de Obrigatoriedade por Aba

### Abas com campos obrigatórios no onboarding

| Aba | Campos Obrigatórios | Campos Opcionais |
|-----|---------------------|------------------|
| **Informações** | Título Profissional, E-mail (leitura — vindo do cadastro), Telefone (leitura — vindo do cadastro), Disponibilidade | LinkedIn, Sobre você |
| **Localização** | Estado, Cidade | Disponível para Mudança (toggle) |
| **Salário** | Salário Mínimo (R$), Salário Máximo (R$) | Aceita Negociar (toggle) |
| **Interesses** | Setores Preferidos (mín. 1), Funções Desejadas (mín. 1), Modalidade, Tipo de Contrato | — |
| **Experiência** | Pelo menos 1 experiência profissional cadastrada | — |
| **Formação** | Pelo menos 1 formação acadêmica cadastrada | — |
| **Habilidades** | Pelo menos 1 habilidade cadastrada | — |

### Abas inteiramente opcionais no onboarding

| Aba | Campos |
|-----|--------|
| **Cursos** | Cursos e Certificações — candidato pode preencher depois |
| **Documentos** | Currículo PDF, Vídeo de Apresentação — candidato pode preencher depois |

---

## Requisitos Funcionais

### Fluxo de Onboarding no Perfil Profissional

- **RF-001:** Após completar o perfil pessoal (PRD-084), o candidato deve ser direcionado automaticamente para o perfil profissional
- **RF-002:** A tela deve exibir o indicador de progresso do onboarding (etapa 3 de 4)
- **RF-003:** O candidato deve navegar livremente entre as abas do perfil profissional durante o onboarding
- **RF-004:** O candidato não deve conseguir acessar a plataforma principal enquanto esta etapa estiver pendente

### Obrigatoriedade de Campos

- **RF-005:** Na aba Informações, os campos Título Profissional e Disponibilidade são obrigatórios. E-mail e Telefone devem aparecer pré-preenchidos em modo leitura (vindos do cadastro)
- **RF-006:** Na aba Localização, Estado e Cidade são obrigatórios. Esses campos devem vir pré-preenchidos com os dados informados no perfil pessoal (PRD-084), mas o candidato pode alterá-los (pois o local onde mora pode ser diferente de onde aceita trabalhar)
- **RF-007:** Na aba Salário, Salário Mínimo e Salário Máximo são obrigatórios
- **RF-008:** Na aba Interesses, todos os campos são obrigatórios: pelo menos 1 Setor Preferido, pelo menos 1 Função Desejada, Modalidade e Tipo de Contrato
- **RF-009:** Na aba Experiência, o candidato deve cadastrar pelo menos 1 experiência profissional
- **RF-010:** Na aba Formação, o candidato deve cadastrar pelo menos 1 formação acadêmica
- **RF-011:** Na aba Habilidades, o candidato deve cadastrar pelo menos 1 habilidade (técnica ou comportamental)
- **RF-012:** As abas Cursos e Documentos são inteiramente opcionais — o candidato pode avançar sem preenchê-las

### Indicação Visual de Completude

- **RF-013:** Cada aba deve indicar visualmente se está completa (campos obrigatórios preenchidos) ou pendente
- **RF-014:** O botão de avançar para o teste comportamental (PRD-086) deve ficar disponível somente quando todas as abas obrigatórias estiverem completas
- **RF-015:** O sistema deve exibir de forma clara quais abas ainda estão pendentes para o candidato saber o que falta

### Persistência e Progresso

- **RF-016:** Os dados de cada aba devem ser salvos ao navegar entre abas ou ao clicar em "Salvar"
- **RF-017:** Ao sair e retornar (login), o sistema deve detectar que o onboarding está na etapa 3 e redirecionar para o perfil profissional com dados preservados
- **RF-018:** O progresso de completude por aba deve ser persistido

### UX Mobile

- **RF-019:** A navegação entre abas deve ser otimizada para mobile (a maioria dos candidatos acessa pelo celular). Considerar que a barra de 9 abas pode não caber na tela — scroll horizontal ou outra solução adequada
- **RF-020:** Os formulários de cadastro de experiência, formação e habilidades (modais ou inline) devem funcionar bem em telas pequenas

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** O salvamento por aba deve ser rápido e com feedback visual
- **RNF-002 (Responsividade):** Layout mobile-first, funcional em telas a partir de 320px. Atenção especial à navegação entre 9 abas em mobile
- **RNF-003 (Persistência):** Dados parciais devem sobreviver a fechamento de aba, logout ou queda de conexão

---

## Critérios de Aceitação

### RF-001/RF-002: Direcionamento e Indicador

```gherkin
DADO que o candidato completou o perfil pessoal (PRD-084)
QUANDO é redirecionado para o onboarding etapa 3
ENTÃO a tela do perfil profissional é exibida
  E o indicador mostra "Etapa 3 de 4"
  E as abas do perfil profissional estão acessíveis
```

### RF-005 a RF-012: Campos Obrigatórios

```gherkin
DADO que o candidato está no perfil profissional durante o onboarding
QUANDO tenta avançar para o teste comportamental
  E a aba Informações não tem Título Profissional preenchido
ENTÃO o sistema indica que a aba Informações está pendente
  E não permite avançar

DADO que o candidato preencheu todos os campos obrigatórios em todas as abas obrigatórias
  E as abas Cursos e Documentos estão vazias
QUANDO tenta avançar
ENTÃO o sistema permite avançar para o PRD-086 (Cursos e Documentos são opcionais)
```

### RF-006: Pré-preenchimento de Localização

```gherkin
DADO que o candidato informou Estado = "Rio Grande do Sul" e Cidade = "Frederico Westphalen" no perfil pessoal (PRD-084)
QUANDO acessa a aba Localização do perfil profissional
ENTÃO os campos Estado e Cidade estão pré-preenchidos com "Rio Grande do Sul" e "Frederico Westphalen"
  E o candidato pode alterar esses valores se desejar
```

### RF-013/RF-014: Indicação de Completude

```gherkin
DADO que o candidato preencheu as abas Informações, Localização e Salário
  E as abas Interesses, Experiência, Formação e Habilidades estão vazias
QUANDO visualiza a navegação por abas
ENTÃO as abas completas possuem indicador visual de "concluída"
  E as abas pendentes possuem indicador visual de "pendente"
  E o botão de avançar para o teste está desabilitado
```

### RF-016/RF-017: Persistência

```gherkin
DADO que o candidato preencheu 4 das 7 abas obrigatórias
QUANDO fecha a aba do navegador e faz login novamente
ENTÃO o sistema detecta onboarding na etapa 3
  E redireciona para o perfil profissional
  E as 4 abas previamente preenchidas mantêm seus dados
  E as 3 abas pendentes continuam indicadas como pendentes
```

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
1. Candidato completa perfil pessoal (PRD-084) → redirecionado para perfil profissional
2. Vê indicador "Etapa 3 de 4"
3. Aba Informações: preenche Título Profissional, vê E-mail/Telefone em leitura, seleciona Disponibilidade → Salva
4. Aba Localização: vê Estado/Cidade pré-preenchidos do PRD-084, confirma ou ajusta → Salva
5. Aba Salário: informa faixa salarial (mín/máx) → Salva
6. Aba Interesses: seleciona setores, funções, modalidade, tipo contrato → Salva
7. Aba Experiência: adiciona pelo menos 1 experiência → Salva
8. Aba Formação: adiciona pelo menos 1 formação → Salva
9. Aba Habilidades: adiciona pelo menos 1 habilidade → Salva
10. (Opcional) Aba Cursos: pode pular
11. (Opcional) Aba Documentos: pode pular
12. Todas as abas obrigatórias com indicador verde → botão "Próximo" habilitado
13. Clica em avançar → redirecionado para PRD-086 (Teste Comportamental)
```

### Fluxo Alternativo: Preenche em Várias Sessões

```
1-5. (preenche 3 abas na primeira sessão)
6. Candidato fecha o navegador
7. Dia seguinte, faz login
8. Sistema detecta onboarding na etapa 3 → redireciona para perfil profissional
9. Abas previamente preenchidas mantêm indicador verde
10. Candidato preenche as abas restantes
11. Avança para PRD-086
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Investigação da estrutura existente | - |
| 2 | Camada de obrigatoriedade + persistência + controle de onboarding | 4-6 |
| 3 | Validação, testes e ajustes mobile | - |

### Detalhamento das Fases

#### Fase 1: Investigação e Preparação

**Objetivo:** Mapear a implementação atual do perfil profissional e identificar como adicionar a camada de onboarding

**Ações:**
- [ ] Investigar a estrutura das tabelas no Supabase que suportam o perfil profissional — verificar quais tabelas armazenam experiências, formações, habilidades, interesses, etc.
- [ ] Mapear os componentes/arquivos que implementam as 9 abas do perfil profissional
- [ ] Verificar se já existe algum mecanismo de completude (a barra de 100% já existente no perfil)
- [ ] Verificar o campo ou mecanismo de controle de etapa do onboarding criado no PRD-084
- [ ] Identificar como os dados de localização do PRD-084 podem ser acessados para pré-popular a aba Localização

**Validação:** Mapeamento completo dos componentes, tabelas e mecanismos existentes

#### Fase 2: Implementação

**Objetivo:** Adicionar a camada de obrigatoriedade e integrar o perfil profissional ao fluxo de onboarding

**Ações:**
- [ ] Implementar a lógica de campos obrigatórios por aba conforme o mapa de obrigatoriedade
- [ ] Implementar indicadores visuais de aba completa/pendente
- [ ] Implementar pré-preenchimento da aba Localização com dados do PRD-084
- [ ] Implementar E-mail e Telefone em modo leitura na aba Informações
- [ ] Implementar o botão de avanço para o teste (habilitado somente com abas obrigatórias completas)
- [ ] Integrar com o controle de onboarding (etapa 3, redirecionamento, bloqueio de acesso)
- [ ] Implementar persistência de progresso por aba

**Validação:** Onboarding funcional com todas as regras de obrigatoriedade, persistência e avanço

#### Fase 3: Validação e Ajustes

**Objetivo:** Garantir qualidade, responsividade mobile e cobertura de edge cases

**Ações:**
- [ ] Testar todos os cenários dos critérios de aceitação
- [ ] Testar navegação de 9 abas em dispositivos móveis
- [ ] Testar persistência (sair e voltar com progresso preservado por aba)
- [ ] Testar que candidatos existentes não são afetados
- [ ] Testar que o perfil profissional continua funcionando normalmente fora do contexto de onboarding (para candidatos que já completaram)

**Validação:** Todos os critérios passando; experiência mobile fluida na navegação entre abas

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-083 | Cadastro Básico com Validação CPF | ⏳ Pendente |
| PRD-084 | Perfil Pessoal | ⏳ Pendente |

### Decisões Pendentes

- Nenhuma. Todas as decisões foram tomadas durante a concepção.

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Onboarding de Candidatos"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-083 | Cadastro Básico com Validação CPF | ⏳ Pendente | Base |
| 2 | PRD-084 | Perfil Pessoal | ⏳ Pendente | Depende de 083 |
| **3** | **PRD-085** | **Perfil Profissional** | **🔄 ATUAL** | Depende de 084 |
| 4 | PRD-086 | Teste Comportamental Gauge-Pro | ⏳ Pendente | Depende de 085 |

> **Nota:** O candidato só acessa a plataforma após completar todas as 4 etapas.

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Experiências profissionais | PII | Protegido por RLS |
| Pretensão salarial | Dado sensível | Protegido por RLS, visível apenas para empresas em contextos autorizados |
| Habilidades e formações | PII | Protegido por RLS |

### Autenticação e Autorização

- Candidato já autenticado (conta criada no PRD-083)
- Dados salvos apenas para o candidato autenticado (RLS por user_id)

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."
>
> **IMPORTANTE:** Investigue o que já existe no banco de dados do Supabase e nos componentes do perfil profissional. As 9 abas já estão implementadas — o objetivo NÃO é recriar, mas adicionar a camada de obrigatoriedade e integrá-las ao fluxo de onboarding. Verifique tabelas, campos, componentes e lógica existentes antes de implementar qualquer coisa.

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo SemVer
> - Atualizar o CHANGELOG.md
> - Renomear este arquivo adicionando `_DONE` ao final
> - Atualizar a seção "Status de Implementação"

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Não recriar** | As abas do perfil profissional já existem. Este PRD adiciona uma camada de obrigatoriedade durante o onboarding, não recria as telas |
| **Barra de completude** | O perfil já possui uma barra de completude (100% visível nos prints). Avaliar se esse mecanismo pode ser reutilizado ou adaptado para o controle de obrigatoriedade do onboarding |
| **Pré-preenchimento** | E-mail e Telefone vêm do cadastro (PRD-083). Localização vem do perfil pessoal (PRD-084). Esses dados devem ser pré-populados automaticamente |
| **Mobile** | A barra de 9 abas pode não caber em mobile. O perfil já tem alguma solução para isso (scroll horizontal visível nos prints). Manter o que funciona |
| **Pós-onboarding** | Após completar o onboarding, o perfil profissional volta a funcionar normalmente (tudo editável, sem bloqueios) |
| **Candidatos existentes** | Este fluxo aplica-se apenas a novos cadastros |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Recriar as abas do perfil profissional do zero |
| Tornar campos opcionais em obrigatórios permanentemente (a obrigatoriedade é durante o onboarding) |
| Permitir avanço para o teste sem todas as abas obrigatórias completas |
| Afetar candidatos já cadastrados |
| Perder dados parciais quando o candidato troca de aba ou sai |
| Bloquear abas opcionais (Cursos, Documentos) — elas devem estar acessíveis, apenas não são exigidas |

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
| 21/02/2026 | v1 | Criação inicial — Perfil profissional como etapa 3 do onboarding de candidatos, com mapa de obrigatoriedade por aba |

---

**AILA - Sistemas Inteligentes**
