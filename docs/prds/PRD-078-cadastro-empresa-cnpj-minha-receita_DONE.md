# PRD-078: Cadastro de Empresa com Validação CNPJ via API Minha Receita

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Módulo de Cadastro (Empresa) |
| **Repositório** | RecrutaRS-NovaVersao |
| **Objetivo** | Reestruturar o fluxo de cadastro de empresa para exigir CNPJ válido, preencher dados oficiais via API Minha Receita e garantir identidade empresarial confiável desde o registro |
| **Tipo** | Feature + Integração |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Alta |
| **Épico** | Onboarding de Empresas |
| **PRDs Relacionados** | PRD-063 (Fundação Supabase + Auth), PRD-064 (Schema Core), PRD-075 (Integração Stripe) |
| **Padrão de código** | camelCase para novos campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 3-5 arquivos impactados, integração com API externa, alteração de schema existente, regras de validação e UX específicas |

---

## Contexto do Problema

O formulário atual de cadastro de empresa no RecrutaRS solicita apenas: nome da empresa, e-mail, telefone, senha e confirmação de senha. Faltam dados cruciais para identificar e validar a empresa — **razão social**, **nome fantasia** verificado e **CNPJ**.

Sem esses dados, a plataforma fica vulnerável a cadastros fraudulentos, empresas fictícias e dados inconsistentes. Para uma plataforma de recrutamento profissional, a verificação da identidade empresarial é fundamental tanto para a confiança dos candidatos quanto para a integridade do ecossistema.

A API **Minha Receita** (https://minhareceita.org) disponibiliza dados públicos da Receita Federal via CNPJ, permitindo validação automática e preenchimento de dados oficiais sem custo — eliminando a necessidade de digitação manual e os erros associados.

---

## Conceito da Solução

### Situação Atual (As-Is)

O cadastro de empresa é um formulário simples em etapa única:

```
Seleciona "Empresa" → Preenche: Nome, E-mail, Telefone, Senha, Confirmar Senha → Cria conta
```

- Campo "Nome da empresa" é texto livre (não verificado)
- CNPJ é opcional e não validado contra base oficial
- Razão social não é coletada
- Endereço não é coletado no cadastro

### Situação Desejada (To-Be)

Cadastro em **fluxo progressivo** com validação por CNPJ:

```
Seleciona "Empresa" → Informa CNPJ → Sistema consulta API → 
Exibe dados oficiais (somente leitura) → Usuário confirma → 
Preenche: E-mail, Telefone, Senha, Confirmar Senha → Cria conta
```

- CNPJ é **obrigatório** e validado contra a Receita Federal
- Razão social e nome fantasia preenchidos automaticamente (somente leitura)
- Endereço preenchido automaticamente (somente leitura)
- Proteção anti-spam com cooldown de 15 segundos entre consultas
- Só é possível prosseguir com CNPJ válido e ativo

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| CNPJ opcional com preenchimento manual | Não garante dados confiáveis; abre margem para fraude |
| Validação de CNPJ apenas por algoritmo de dígitos | Confirma formato, mas não garante que a empresa existe ou está ativa |
| Usar API paga (ReceitaWS, CNPJ.ws) | Custo desnecessário; a API Minha Receita é gratuita e pública |
| Campos editáveis pós-consulta da API | Contradiz o propósito de dados oficiais verificados |

---

## Escopo

### Incluído

- ✅ Reestruturação do formulário de cadastro de empresa (fluxo progressivo baseado em CNPJ)
- ✅ Integração com API Minha Receita para consulta de CNPJ
- ✅ Exibição de dados oficiais em modo somente leitura (razão social, nome fantasia, endereço)
- ✅ Mecanismo de cooldown de 15 segundos entre consultas (anti-spam)
- ✅ Ampliação do schema da tabela `companies` com novos campos
- ✅ Preenchimento automático dos dados da empresa no banco ao criar a conta
- ✅ Tratamento de CNPJ inválido, inexistente ou empresa inativa
- ✅ Impedimento de cadastro duplicado por CNPJ (unicidade)

### Excluído

- ❌ Reestruturação do cadastro de candidato (PRD futuro)
- ❌ Edição posterior dos dados da empresa via perfil (já existe no painel da empresa)
- ❌ Consulta de dados adicionais da API (quadro societário, CNAEs secundários)
- ❌ Validação de e-mail corporativo vs. domínio da empresa
- ❌ Upload de documentos comprobatórios
- ❌ Aprovação manual de cadastro por admin

---

## Informações do Serviço Externo

### Dados do Provedor

| Campo | Valor |
|-------|-------|
| **Nome do Serviço** | Minha Receita |
| **Documentação** | https://docs.minhareceita.org/como-usar/ |
| **Tipo de API** | REST (GET) |
| **Autenticação** | Nenhuma (API pública) |
| **Base URL** | `https://minhareceita.org` |
| **Endpoint** | `GET /{cnpj}` |
| **Formato do CNPJ** | Aceita com ou sem pontuação (ex: `33683111000280` ou `33.683.111/0002-80`) |

### Códigos de Resposta

| Código | Significado | Ação no sistema |
|--------|-------------|-----------------|
| 200 | CNPJ encontrado | Exibir dados para confirmação |
| 400 | CNPJ com formato inválido | Informar que o CNPJ está incorreto |
| 404 | CNPJ não encontrado na base | Informar que o CNPJ não existe na Receita Federal |
| 429 | Rate limit excedido | Informar que o serviço está temporariamente indisponível |
| 5xx | Erro no servidor da API | Informar indisponibilidade temporária e orientar a tentar novamente |

### Campos Relevantes da Resposta

Dos dados retornados pela API, os seguintes são relevantes para o cadastro:

| Campo da API | Uso no RecrutaRS |
|-------------|------------------|
| `razao_social` | Razão social da empresa |
| `nome_fantasia` | Nome fantasia da empresa |
| `cnpj` | CNPJ formatado |
| `situacao_cadastral` | Validar se empresa está ativa (código 2 = ATIVA) |
| `descricao_situacao_cadastral` | Exibir status para o usuário |
| `descricao_tipo_de_logradouro` | Compor endereço completo |
| `logradouro` | Logradouro |
| `numero` | Número |
| `complemento` | Complemento |
| `bairro` | Bairro |
| `cep` | CEP |
| `municipio` | Cidade |
| `uf` | Estado |
| `codigo_porte` / `porte` | Porte da empresa |
| `cnae_fiscal_descricao` | Atividade econômica principal (setor) |

---

## Requisitos Funcionais

### Schema — Ampliação da Tabela `companies`

- **RF-001:** O sistema deve armazenar a **razão social** da empresa como campo dedicado, separado do nome fantasia
- **RF-002:** O sistema deve armazenar o **nome fantasia** da empresa como campo dedicado. O campo `name` existente deve ser mantido e sincronizado com o nome fantasia para compatibilidade
- **RF-003:** O sistema deve armazenar os componentes do endereço de forma granular: CEP, tipo de logradouro, logradouro, número, complemento e bairro — além dos campos `city` e `state` já existentes
- **RF-004:** O campo `cnpj` deve ter restrição de unicidade — duas empresas não podem ter o mesmo CNPJ
- **RF-005:** O sistema deve armazenar a **situação cadastral** da empresa conforme retornada pela Receita Federal
- **RF-006:** O sistema deve armazenar o **porte** e a **atividade econômica principal** (CNAE) da empresa

### Fluxo de Cadastro — Etapa 1: Informar CNPJ

- **RF-007:** Ao selecionar "Empresa" na tela de cadastro, o sistema deve apresentar **apenas o campo de CNPJ** como primeiro passo, com máscara de formatação (`XX.XXX.XXX/XXXX-XX`)
- **RF-008:** O sistema deve validar o formato do CNPJ localmente (14 dígitos, algoritmo de verificação) antes de consultar a API
- **RF-009:** Ao informar um CNPJ com formato válido, o sistema deve consultar automaticamente a API Minha Receita
- **RF-010:** Durante a consulta à API, o sistema deve exibir um indicador de carregamento
- **RF-011:** Se o CNPJ já estiver cadastrado no RecrutaRS por outra empresa, o sistema deve informar que o CNPJ já está em uso e impedir o prosseguimento

### Fluxo de Cadastro — Etapa 2: Confirmação dos Dados

- **RF-012:** Quando a API retornar dados válidos, o formulário deve expandir na mesma tela exibindo um bloco com os dados da empresa em **modo somente leitura**: razão social, nome fantasia e endereço completo
- **RF-013:** Se o campo `nome_fantasia` retornado pela API estiver vazio, o sistema deve exibir a razão social no lugar do nome fantasia
- **RF-014:** O sistema deve exibir a **situação cadastral** da empresa. Apenas empresas com situação "ATIVA" (código 2) podem prosseguir com o cadastro
- **RF-015:** Se a empresa não estiver ativa, o sistema deve informar a situação atual (ex: "Baixada", "Inapta", "Suspensa") e bloquear o prosseguimento com mensagem explicativa
- **RF-016:** O bloco de dados deve conter um botão para confirmar que os dados estão corretos e prosseguir para a etapa de credenciais

### Fluxo de Cadastro — Etapa 3: Credenciais

- **RF-017:** Após confirmar os dados da empresa, o formulário deve expandir (ou avançar) para os campos de credenciais: e-mail, telefone, senha e confirmação de senha
- **RF-018:** O sistema deve permitir que o usuário volte para a etapa anterior (CNPJ) caso tenha informado o CNPJ errado — respeitando o cooldown
- **RF-019:** Ao submeter o formulário completo, o sistema deve criar a conta vinculando todos os dados: dados da empresa (da API) + credenciais (do formulário)

### Proteção Anti-Spam (Cooldown)

- **RF-020:** Após cada consulta à API (bem-sucedida ou não), o sistema deve impor um **cooldown de 15 segundos** antes de permitir uma nova consulta
- **RF-021:** Durante o cooldown, o campo de CNPJ deve ficar desabilitado e o sistema deve exibir um **contador regressivo** visível indicando o tempo restante
- **RF-022:** O cooldown não precisa ser sofisticado — basta impedir consultas consecutivas dentro do período de 15 segundos

### Tratamento de Erros

- **RF-023:** Se a API retornar CNPJ inválido ou inexistente (400/404), o sistema deve exibir mensagem clara informando que o CNPJ não foi encontrado na base da Receita Federal, e o campo deve ser limpo para nova tentativa (após cooldown)
- **RF-024:** Se a API estiver indisponível (429/5xx/timeout), o sistema deve informar que o serviço de consulta está temporariamente indisponível e sugerir tentar novamente em alguns minutos
- **RF-025:** O cadastro de empresa **não deve** ter fallback para preenchimento manual — o CNPJ válido e ativo é pré-requisito obrigatório

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** A consulta à API deve ter timeout máximo de 10 segundos. Se exceder, tratar como indisponibilidade
- **RNF-002 (UX):** A transição entre etapas (CNPJ → Dados → Credenciais) deve ser fluida e na mesma página, sem recarregamento
- **RNF-003 (Responsividade):** O fluxo deve funcionar adequadamente em dispositivos móveis
- **RNF-004 (Acessibilidade):** O contador regressivo deve ser acessível via leitores de tela (atributo aria adequado)
- **RNF-005 (Compatibilidade):** O fluxo existente de cadastro de candidato não deve ser afetado por esta mudança

---

## Critérios de Aceitação

### RF-007/RF-009: Consulta de CNPJ

```gherkin
DADO que o usuário selecionou "Empresa" na tela de cadastro
QUANDO ele informa um CNPJ com formato válido (14 dígitos)
ENTÃO o sistema deve consultar a API Minha Receita automaticamente
  E exibir indicador de carregamento durante a consulta
```

### RF-012/RF-014: Exibição dos Dados da Empresa

```gherkin
DADO que a API retornou dados de uma empresa com situação "ATIVA"
QUANDO os dados são exibidos na tela
ENTÃO o sistema deve mostrar razão social, nome fantasia e endereço completo em modo somente leitura
  E deve exibir a situação cadastral como "Ativa"
  E deve apresentar botão para confirmar e prosseguir
```

### RF-015: Empresa Inativa

```gherkin
DADO que a API retornou dados de uma empresa com situação diferente de "ATIVA"
QUANDO os dados são processados
ENTÃO o sistema deve exibir a situação cadastral retornada (ex: "Baixada", "Inapta")
  E deve bloquear o botão de prosseguir
  E deve exibir mensagem explicando que apenas empresas ativas podem se cadastrar
```

### RF-020/RF-021: Cooldown Anti-Spam

```gherkin
DADO que o usuário acabou de realizar uma consulta de CNPJ
QUANDO ele tenta consultar outro CNPJ imediatamente
ENTÃO o campo de CNPJ deve estar desabilitado
  E um contador regressivo de 15 segundos deve ser exibido
  E o campo deve ser reabilitado apenas quando o contador chegar a zero
```

### RF-023: CNPJ Inválido

```gherkin
DADO que o usuário informou um CNPJ que não existe na Receita Federal
QUANDO a API retorna 404
ENTÃO o sistema deve exibir mensagem informando que o CNPJ não foi encontrado
  E o campo deve ser limpo para nova tentativa após o cooldown
  E o bloco de dados da empresa não deve ser exibido
```

### RF-011: CNPJ Duplicado

```gherkin
DADO que o usuário informou um CNPJ que já está cadastrado no RecrutaRS
QUANDO o sistema verifica unicidade
ENTÃO deve exibir mensagem informando que este CNPJ já está vinculado a uma conta existente
  E deve bloquear o prosseguimento
  E pode sugerir realizar login ou entrar em contato com o suporte
```

### RF-019: Criação Completa da Conta

```gherkin
DADO que o usuário confirmou os dados da empresa e preencheu as credenciais
QUANDO ele submete o formulário
ENTÃO o sistema deve criar a conta com todos os dados: CNPJ, razão social, nome fantasia, endereço (da API) e e-mail, telefone, senha (do formulário)
  E o campo `name` da tabela companies deve ser preenchido com o nome fantasia (ou razão social se nome fantasia estiver vazio)
  E o registro deve estar completo com os campos granulares de endereço
```

### Cenários de Erro

```gherkin
DADO que a API Minha Receita está indisponível
QUANDO o usuário tenta consultar um CNPJ
ENTÃO o sistema deve exibir mensagem de indisponibilidade temporária
  E não deve oferecer opção de cadastro manual como alternativa
  E deve sugerir tentar novamente em alguns minutos
```

```gherkin
DADO que o CNPJ informado tem formato inválido (menos de 14 dígitos ou dígitos verificadores incorretos)
QUANDO o sistema valida localmente
ENTÃO deve exibir erro de formato sem consultar a API
  E o cooldown não deve ser acionado (pois não houve consulta)
```

---

## Mapeamento de Dados — API Minha Receita → Tabela `companies`

| Campo da API | Campo no RecrutaRS | Novo campo? | Observação |
|-------------|-------------------|-------------|------------|
| `razao_social` | `razao_social` | ✅ Sim | Novo campo dedicado |
| `nome_fantasia` | `nome_fantasia` | ✅ Sim | Novo campo dedicado. Se vazio, usar razão social |
| `nome_fantasia` (ou razão social) | `name` | Não (existente) | Manter sincronizado para compatibilidade |
| `cnpj` | `cnpj` | Não (existente) | Adicionar constraint UNIQUE |
| `cep` | `cep` | ✅ Sim | Novo campo |
| `descricao_tipo_de_logradouro` + `logradouro` | `logradouro` | ✅ Sim | Compor tipo + nome |
| `numero` | `numero` | ✅ Sim | Novo campo |
| `complemento` | `complemento` | ✅ Sim | Novo campo |
| `bairro` | `bairro` | ✅ Sim | Novo campo |
| `municipio` | `city` | Não (existente) | Já existe |
| `uf` | `state` | Não (existente) | Já existe |
| Endereço completo formatado | `address` | Não (existente) | Compor a partir dos componentes |
| `descricao_situacao_cadastral` | `situacao_cadastral` | ✅ Sim | Novo campo |
| `porte` | `size` | Não (existente) | Mapear para campo existente |
| `cnae_fiscal_descricao` | `industry` | Não (existente) | Mapear para campo existente |

### Resumo dos Novos Campos na Tabela `companies`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `razao_social` | texto | Sim | Razão social oficial da Receita Federal |
| `nome_fantasia` | texto | Não | Nome fantasia oficial. Pode ser vazio na RF |
| `cep` | texto | Não | CEP do endereço |
| `logradouro` | texto | Não | Tipo + nome do logradouro |
| `numero` | texto | Não | Número do endereço |
| `complemento` | texto | Não | Complemento do endereço |
| `bairro` | texto | Não | Bairro |
| `situacao_cadastral` | texto | Não | Situação cadastral na Receita Federal |

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
1. Visitante acessa /cadastro
2. Seleciona "Empresa"
3. Sistema exibe apenas o campo de CNPJ com máscara
4. Usuário digita o CNPJ (ex: 33.683.111/0002-80)
5. Sistema valida formato localmente → OK
6. Sistema consulta API Minha Receita (exibe loading)
7. API retorna dados → empresa ATIVA
8. Formulário expande exibindo bloco de dados em leitura:
   - Razão Social: SERVICO FEDERAL DE PROCESSAMENTO DE DADOS (SERPRO)
   - Nome Fantasia: REGIONAL BRASILIA-DF
   - Endereço: Avenida L2 SGAN, 601, Módulo G - Asa Norte, Brasília/DF - CEP 70836-900
   - Situação: ✅ Ativa
9. Usuário clica "Confirmar dados e continuar"
10. Formulário expande campos: E-mail, Telefone, Senha, Confirmar Senha
11. Usuário preenche e submete
12. Sistema cria conta → redirect para dashboard da empresa
```

### Fluxo de Exceção: CNPJ Errado

```
1-6. (mesmo do fluxo principal)
7. Usuário percebe que os dados não são da empresa dele
8. Clica "Tentar outro CNPJ"
9. Cooldown de 15 segundos é iniciado (contador visível)
10. Após cooldown, campo CNPJ é reabilitado
11. Usuário digita novo CNPJ
12. (volta ao passo 5)
```

### Fluxo de Exceção: CNPJ Não Encontrado

```
1-6. (mesmo do fluxo principal)
7. API retorna 404
8. Sistema exibe: "CNPJ não encontrado na base da Receita Federal. Verifique o número e tente novamente."
9. Cooldown de 15 segundos é iniciado
10. (volta ao passo 3 após cooldown)
```

### Fluxo de Exceção: Empresa Inativa

```
1-7. (mesmo do fluxo principal)
8. API retorna dados, mas situação cadastral = "BAIXADA"
9. Sistema exibe dados + mensagem: "Esta empresa consta como BAIXADA na Receita Federal. Apenas empresas com situação ATIVA podem se cadastrar."
10. Botão de prosseguir fica desabilitado
11. Usuário pode tentar outro CNPJ (após cooldown)
```

### Fluxo de Erro: API Indisponível

```
1-6. (mesmo do fluxo principal)
7. API retorna erro 5xx ou timeout
8. Sistema exibe: "O serviço de consulta de CNPJ está temporariamente indisponível. Por favor, tente novamente em alguns minutos."
9. Cooldown é iniciado normalmente
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Ampliação do schema (migration) | 1 |
| 2 | Serviço de consulta CNPJ (integração API) | 2 |
| 3 | Refatoração do formulário de cadastro | 3-4 |
| 4 | Validação, testes e ajustes | - |

### Detalhamento das Fases

#### Fase 1: Ampliação do Schema

**Objetivo:** Adicionar os novos campos na tabela `companies` e a constraint de unicidade no CNPJ

**Ações:**
- [ ] Adicionar campos: `razao_social`, `nome_fantasia`, `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `situacao_cadastral`
- [ ] Adicionar constraint UNIQUE no campo `cnpj`
- [ ] Garantir que os novos campos são nullable (empresas existentes não têm esses dados)

**Validação:** Os novos campos devem estar disponíveis na tabela `companies` sem afetar registros existentes

#### Fase 2: Serviço de Consulta CNPJ

**Objetivo:** Implementar a camada que consulta a API Minha Receita e trata as respostas

**Ações:**
- [ ] Criar serviço/função para consulta de CNPJ na API Minha Receita
- [ ] Implementar tratamento dos códigos de resposta (200, 400, 404, 429, 5xx)
- [ ] Implementar timeout de 10 segundos
- [ ] Criar verificação de unicidade do CNPJ no banco antes de consultar a API
- [ ] Mapear os campos da resposta para o formato esperado pelo formulário

**Validação:** Consulta retorna dados formatados para CNPJ válido, e erros tratados para casos inválidos

#### Fase 3: Refatoração do Formulário de Cadastro

**Objetivo:** Implementar o novo fluxo progressivo no formulário de cadastro de empresa

**Ações:**
- [ ] Reestruturar o formulário para o fluxo em 3 etapas (CNPJ → Dados → Credenciais)
- [ ] Implementar campo de CNPJ com máscara de formatação
- [ ] Implementar validação local do CNPJ (algoritmo de dígitos verificadores)
- [ ] Implementar bloco de exibição de dados em modo somente leitura
- [ ] Implementar mecanismo de cooldown com contador regressivo visual
- [ ] Implementar tratamento visual para empresa inativa
- [ ] Garantir que o formulário de candidato não foi afetado
- [ ] Integrar a submissão com os dados da API + credenciais

**Validação:** Fluxo completo funcional — do CNPJ à criação da conta

#### Fase 4: Validação e Ajustes

**Objetivo:** Garantir qualidade e cobrir edge cases

**Ações:**
- [ ] Testar todos os cenários de sucesso e erro documentados nos critérios de aceitação
- [ ] Testar responsividade em dispositivos móveis
- [ ] Testar que o cadastro de candidato continua funcionando normalmente
- [ ] Testar com CNPJs reais (ex: SERPRO `33683111000280`)
- [ ] Verificar que a constraint UNIQUE do CNPJ funciona corretamente
- [ ] Verificar que empresas existentes no banco não foram afetadas pela migration

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-063 | Fundação Supabase + Auth | ✅ Implementado |
| PRD-064 | Schema Core + Seeds Transacionais | ✅ Implementado |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| API Minha Receita | REST (GET) pública | Disponível |

### Decisões Pendentes

- Nenhuma. Todas as decisões foram tomadas durante a concepção.

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| CNPJ | Dado público (Receita Federal) | Armazenado no banco, protegido por RLS |
| Razão Social | Dado público | Armazenado no banco, protegido por RLS |
| Endereço da empresa | Dado público | Armazenado no banco, protegido por RLS |

### Autenticação e Autorização

- A API Minha Receita não requer autenticação
- A consulta ao CNPJ ocorre **antes** da criação da conta (usuário anônimo)
- A verificação de unicidade do CNPJ no banco deve usar acesso público (anon) com política RLS adequada para leitura restrita (apenas verificar existência, sem expor dados)

### Auditoria

- O sistema deve registrar o CNPJ consultado, a data/hora e o resultado (sucesso/erro) nos metadados do registro da empresa
- Os timestamps `created_at` e `updated_at` existentes cobrem rastreabilidade básica

### Proteção contra Abuso

- O cooldown de 15 segundos entre consultas mitiga uso excessivo da API pública
- A validação local do formato do CNPJ evita consultas desnecessárias à API
- A constraint UNIQUE no CNPJ impede cadastros duplicados

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
>   Ex: `PRD-078-cadastro-empresa-cnpj-minha-receita_DONE.md`
> - Atualizar a seção "Status de Implementação" com:
>   - Status: ✅ IMPLEMENTADO
>   - Data de Implementação
>   - Versão do App após implementação
>   - Observações relevantes

### Informações do Supabase

| Campo | Valor |
|-------|-------|
| **Project ID** | `filackbesialiapjwijb` |
| **Projeto** | RecrutaRS-NovaVersao |
| **Tabela principal** | `companies` |

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| **Nova funcionalidade** | **MINOR +1, PATCH = 0** | **1.0.1 → 1.1.0** |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Para MINOR ou MAJOR, gerar codinome em inglês baseado no contexto das mudanças. Sugestão para este PRD: algo relacionado a verificação/identidade empresarial (ex: "Verify", "Registry", "Seal").

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
| **Não bloquear fluxo principal** | Se a API falhar, exibir erro claro — não travar a tela |
| **Fail gracefully** | Timeout, erros de rede e respostas inesperadas devem ter tratamento visual |
| **Preservar compatibilidade** | O campo `name` deve continuar funcionando para todo o sistema existente |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas durante implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Migration** | Novos campos devem ser nullable para não quebrar registros existentes |
| **Campo `name`** | Manter sincronizado com `nome_fantasia` (ou `razao_social` se fantasia vazio) |
| **Cooldown** | Neste momento, o cooldown pode ser simples — sem necessidade de controle sofisticado no servidor |
| **Máscara CNPJ** | O campo deve exibir o CNPJ formatado para o usuário, mas a consulta à API aceita apenas dígitos |
| **Formulário de candidato** | Não deve ser alterado por este PRD |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Permitir cadastro manual sem CNPJ válido (sem fallback) |
| Tornar campos da API editáveis pelo usuário |
| Alterar o fluxo de cadastro de candidato |
| Remover ou renomear o campo `name` existente |
| Criar campos obrigatórios que quebrem registros existentes na tabela `companies` |
| Armazenar toda a resposta da API (apenas os campos mapeados) |
| Implementar rate limiting server-side neste momento |

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
| 16/02/2026 | v1 | Criação inicial — Agente Arquiteto (Claude Opus 4.5, plataforma web) |

---

**AILA - Sistemas Inteligentes**
