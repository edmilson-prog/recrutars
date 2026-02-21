# PRD-083: Cadastro Básico do Candidato com Validação de CPF

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Módulo de Cadastro (Candidato) |
| **Repositório** | RecrutaRS-NovaVersao |
| **Objetivo** | Reestruturar o fluxo de cadastro de candidato para validar CPF com verificação de unicidade, coletar dados básicos de forma progressiva, exigir senha forte com medidor visual de força, e incluir aceite obrigatório de Termos de Uso, Política de Privacidade e consentimento LGPD |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Alta |
| **Épico** | Onboarding de Candidatos |
| **PRDs Relacionados** | PRD-063 (Fundação Supabase + Auth), PRD-064 (Schema Core), PRD-078 (Cadastro Empresa CNPJ — referência de padrão de fluxo), PRD-084, PRD-085, PRD-086 (cadeia de onboarding) |
| **Padrão de código** | camelCase para novos campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

> **Justificativa da complexidade Média:** Afeta 3-5 arquivos (formulário de cadastro, validação, schema), envolve regras de validação de CPF e senha, alteração de UX com fluxo progressivo e integração com estrutura de consentimento legal. Não requer APIs externas.

---

## Contexto do Problema

O formulário atual de cadastro de candidato no RecrutaRS solicita apenas: nome completo, e-mail, telefone, senha e confirmação de senha. Não há validação de identidade do candidato — qualquer pessoa pode criar múltiplas contas sem verificação. Além disso, a senha atual exige apenas 6 caracteres mínimos sem critérios de complexidade, e não há aceite formal de termos legais.

Para uma plataforma de recrutamento que processa dados pessoais sensíveis e realiza análises comportamentais, a ausência de identificação por CPF compromete a integridade dos dados, permite duplicidade de cadastros e fraude. A falta de aceite de Termos de Uso, Política de Privacidade e consentimento LGPD expõe a plataforma a riscos jurídicos significativos, especialmente considerando que o Gauge-Pro coleta e processa perfis comportamentais — classificados como dados sensíveis pela LGPD.

Este PRD é a **primeira etapa** de uma cadeia de 4 PRDs que compõem o onboarding completo do candidato (083 → 084 → 085 → 086). Após completar o cadastro básico aqui descrito, o candidato será direcionado automaticamente para o preenchimento do perfil pessoal (PRD-084).

> **Escopo:** Este PRD aplica-se apenas a **novos cadastros**. Candidatos já existentes na plataforma não serão afetados por este fluxo — a migração deles será tratada em PRD futuro.

---

## Conceito da Solução

### Situação Atual (As-Is)

O cadastro de candidato é um formulário único e plano:

```
Seleciona "Candidato" → Preenche: Nome, E-mail, Telefone, Senha (mín. 6 chars), Confirmar Senha → Cria conta → Acessa a plataforma imediatamente
```

- Sem validação de identidade (CPF)
- Sem verificação de duplicidade de pessoa
- Senha com critério fraco (apenas 6 caracteres mínimos)
- Sem medidor de força de senha
- Sem aceite de termos legais ou consentimento LGPD

### Situação Desejada (To-Be)

Cadastro em fluxo progressivo com validação por CPF, inspirado no padrão estabelecido pelo PRD-078 (cadastro de empresa):

```
Seleciona "Candidato" →
  Etapa 1: Informa CPF → Validação local + unicidade no banco →
  Etapa 2: Nome completo, E-mail, Telefone celular →
  Etapa 3: Senha forte (com medidor) + Confirmação →
  Etapa 4: Aceita Termos + Privacidade + LGPD →
  Conta criada → Redireciona para PRD-084 (Perfil Pessoal)
```

- CPF obrigatório, validado por algoritmo e verificado no banco
- Dados coletados de forma progressiva na mesma tela (expansão de etapas)
- Senha com critérios rigorosos e medidor visual de força
- Aceite explícito de documentos legais como pré-condição para criar conta
- Após criar conta, candidato NÃO acessa a plataforma — segue para o onboarding (PRD-084)

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Manter cadastro sem CPF e adicionar depois | Não resolve a duplicidade de contas; gera retrabalho de migração |
| Validar CPF via API externa (Receita Federal/Serpro) | Custo desnecessário para pessoa física; o algoritmo de dígitos verificadores + unicidade no banco é suficiente |
| Aceite de termos como etapa separada pós-cadastro | Risco jurídico — consentimento deve ser coletado ANTES de processar dados pessoais |
| Senha com critérios moderados (sem caractere especial) | Não atende boas práticas de segurança para plataforma que processa dados sensíveis |

---

## Escopo

### Incluído

- ✅ Reestruturação do formulário de cadastro de candidato com fluxo progressivo em etapas
- ✅ Campo de CPF com máscara de formatação (000.000.000-00) como primeira etapa
- ✅ Validação local do CPF por algoritmo de dígitos verificadores
- ✅ Verificação de unicidade do CPF no banco de dados
- ✅ Mensagem informativa com link para login/recuperação quando CPF já cadastrado
- ✅ Campos de nome completo, e-mail e telefone celular com máscara
- ✅ Campo de senha com medidor visual de força (fraca → média → forte → muito forte)
- ✅ Critérios obrigatórios de senha forte: mínimo 8 caracteres, maiúscula, minúscula, número e caractere especial
- ✅ Campo de confirmação de senha
- ✅ Checkboxes obrigatórios: Termos de Uso, Política de Privacidade e consentimento LGPD
- ✅ Links clicáveis nos checkboxes abrindo os documentos legais reais
- ✅ Botão "Criar conta" habilitado somente quando todas as etapas e consentimentos estiverem completos
- ✅ Redirecionamento automático para o onboarding (PRD-084) após criação da conta

### Excluído

- ❌ Validação de CPF via API externa (Receita Federal, Serpro, etc.)
- ❌ Redação dos documentos legais (Termos de Uso, Política de Privacidade, LGPD)
- ❌ Alteração no fluxo de cadastro de empresa (coberto pelo PRD-078)
- ❌ Verificação de nome real associado ao CPF
- ❌ Autenticação por CPF (o login continua sendo por e-mail + senha)
- ❌ Migração de candidatos existentes (PRD futuro)
- ❌ Preenchimento de perfil pessoal ou profissional (PRDs 084 e 085)

---

## Requisitos Funcionais

### Etapa 1: Validação de CPF

- **RF-001:** O formulário de cadastro de candidato deve iniciar apresentando apenas o campo de CPF como primeiro e único campo visível
- **RF-002:** O campo de CPF deve exibir máscara de formatação no padrão brasileiro (000.000.000-00)
- **RF-003:** O sistema deve validar o CPF localmente utilizando o algoritmo de dígitos verificadores antes de consultar o banco de dados
- **RF-004:** Caso o CPF seja inválido pelo algoritmo, o sistema deve exibir mensagem de erro inline e não prosseguir
- **RF-005:** Caso o CPF seja válido pelo algoritmo, o sistema deve verificar se já existe um candidato com esse CPF no banco de dados
- **RF-006:** Caso o CPF já exista no banco, o sistema deve bloquear o avanço e exibir a mensagem: "CPF já cadastrado. Faça login ou recupere sua senha", com links clicáveis para a tela de login e para recuperação de senha
- **RF-007:** Caso o CPF seja válido e único, o formulário deve expandir para exibir a Etapa 2

### Etapa 2: Dados Básicos

- **RF-008:** A Etapa 2 deve apresentar os campos: nome completo, e-mail e telefone celular
- **RF-009:** O campo de nome completo deve exigir no mínimo nome e sobrenome (pelo menos um espaço entre palavras)
- **RF-010:** O campo de e-mail deve validar formato de e-mail válido
- **RF-011:** O campo de telefone celular deve exibir máscara no padrão brasileiro: (00) 00000-0000
- **RF-012:** Todos os campos da Etapa 2 são obrigatórios
- **RF-013:** O CPF informado na Etapa 1 deve permanecer visível (em modo leitura ou com indicador de confirmação) enquanto o candidato preenche a Etapa 2

### Etapa 3: Senha Forte

- **RF-014:** O campo de senha deve exibir um medidor visual de força que classifique a senha em níveis progressivos (ex: fraca, média, forte, muito forte) conforme o candidato digita
- **RF-015:** Os critérios obrigatórios para a senha ser considerada válida são: mínimo de 8 caracteres, pelo menos uma letra maiúscula, pelo menos uma letra minúscula, pelo menos um número e pelo menos um caractere especial
- **RF-016:** O medidor de força deve refletir visualmente o atendimento progressivo dos critérios (cor e/ou barra de progresso)
- **RF-017:** Os critérios individuais de senha devem ser exibidos ao candidato como uma lista de verificação, indicando quais já foram atendidos e quais ainda faltam
- **RF-018:** O botão de prosseguir para a etapa seguinte deve ficar desabilitado enquanto a senha não atingir o nível mínimo de "forte"
- **RF-019:** O campo de confirmação de senha deve validar que é idêntico ao campo de senha
- **RF-020:** Deve haver opção de alternar a visibilidade da senha (mostrar/ocultar) em ambos os campos

### Etapa 4: Termos e Consentimento

- **RF-021:** A etapa final deve apresentar três checkboxes obrigatórios e independentes:
  - Aceite dos **Termos de Uso**
  - Aceite da **Política de Privacidade**
  - Consentimento para **tratamento de dados pessoais conforme LGPD**
- **RF-022:** Cada checkbox deve conter um link clicável que abre o documento legal correspondente em uma nova aba ou modal
- **RF-023:** Os links devem apontar para páginas/documentos reais publicados na plataforma
- **RF-024:** O botão "Criar conta" deve ficar desabilitado até que todos os três checkboxes estejam marcados
- **RF-025:** O sistema deve registrar o aceite de cada termo com timestamp no momento da criação da conta

### Comportamento Geral do Formulário

- **RF-026:** O fluxo progressivo deve acontecer na mesma tela/página, com as etapas expandindo à medida que o candidato avança (sem navegação entre páginas)
- **RF-027:** O candidato deve poder voltar e editar etapas anteriores sem perder os dados já preenchidos (exceto o CPF, que ao ser alterado deve reiniciar o fluxo de validação)
- **RF-028:** O formulário de cadastro de empresa não deve ser afetado por este PRD
- **RF-029:** Após a criação da conta com sucesso, o candidato deve ser redirecionado automaticamente para a próxima etapa do onboarding (PRD-084 — Perfil Pessoal), sem acesso à plataforma principal

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** A validação local do CPF deve ser instantânea (client-side). A verificação de unicidade no banco deve responder em menos de 2 segundos
- **RNF-002 (Responsividade):** O formulário progressivo, incluindo o medidor de força de senha, deve funcionar adequadamente em dispositivos móveis (telas a partir de 320px de largura). A maioria dos candidatos acessa pelo celular
- **RNF-003 (Acessibilidade):** Os critérios de senha e mensagens de erro devem ser legíveis por leitores de tela. O medidor de força não deve depender exclusivamente de cor para comunicar o nível
- **RNF-004 (Compatibilidade):** Chrome, Firefox, Safari e Edge em suas últimas 2 versões

---

## Critérios de Aceitação

### RF-001/RF-002: Campo CPF com Máscara

```gherkin
DADO que o candidato selecionou "Candidato" na tela de cadastro
QUANDO a tela de cadastro é carregada
ENTÃO apenas o campo de CPF é exibido, com máscara de formatação 000.000.000-00
  E nenhum outro campo do formulário está visível
```

### RF-003/RF-004: Validação Local do CPF

```gherkin
DADO que o candidato informou um CPF com formato completo (11 dígitos)
QUANDO o sistema executa a validação por algoritmo de dígitos verificadores
  E o CPF é inválido (ex: 000.000.000-00, 111.111.111-11, dígitos verificadores incorretos)
ENTÃO uma mensagem de erro inline é exibida junto ao campo
  E o formulário não avança para a próxima etapa
```

### RF-005/RF-006: CPF Já Cadastrado

```gherkin
DADO que o candidato informou um CPF válido pelo algoritmo
QUANDO o sistema verifica a unicidade no banco de dados
  E já existe um candidato com esse CPF
ENTÃO o sistema exibe a mensagem "CPF já cadastrado. Faça login ou recupere sua senha"
  E a mensagem contém links clicáveis para a tela de login e para recuperação de senha
  E o formulário não avança para a próxima etapa
```

### RF-007/RF-008: Expansão para Etapa 2

```gherkin
DADO que o candidato informou um CPF válido e único
QUANDO a validação é concluída com sucesso
ENTÃO o formulário expande para exibir os campos de nome completo, e-mail e telefone celular
  E o CPF permanece visível em modo de confirmação
```

### RF-014 a RF-018: Medidor de Força de Senha

```gherkin
DADO que o candidato está na etapa de criação de senha
QUANDO digita caracteres no campo de senha
ENTÃO o medidor de força atualiza em tempo real, refletindo o nível atual
  E a lista de critérios indica visualmente quais foram atendidos
  E o botão de prosseguir fica habilitado somente quando a senha atinge nível "forte" ou superior
```

### RF-021 a RF-025: Aceite de Termos

```gherkin
DADO que o candidato está na etapa de termos e consentimento
QUANDO visualiza os três checkboxes
ENTÃO cada checkbox possui texto descritivo e link clicável para o documento legal
  E o botão "Criar conta" está desabilitado
QUANDO marca todos os três checkboxes
ENTÃO o botão "Criar conta" é habilitado
QUANDO clica em "Criar conta"
ENTÃO o sistema registra o aceite de cada termo com timestamp
  E a conta é criada com sucesso
  E o candidato é redirecionado para o onboarding (PRD-084)
```

### Cenário de Erro: E-mail Já em Uso

```gherkin
DADO que o candidato preencheu todos os campos e tentou criar a conta
QUANDO o e-mail informado já está associado a outra conta
ENTÃO o sistema exibe mensagem de erro informando que o e-mail já está em uso
  E sugere fazer login ou recuperar a senha
```

### Cenário de Erro: Senhas Não Coincidem

```gherkin
DADO que o candidato preencheu o campo de senha e o campo de confirmação
QUANDO os valores dos dois campos são diferentes
ENTÃO uma mensagem de erro inline é exibida junto ao campo de confirmação
  E o formulário não permite prosseguir
```

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
1. Candidato acessa a tela de cadastro
2. Seleciona "Candidato"
3. Campo de CPF é exibido como único campo
4. Digita o CPF → máscara formata automaticamente
5. Sistema valida localmente (algoritmo) → OK
6. Sistema verifica unicidade no banco → CPF não existe
7. Formulário expande: campos Nome, E-mail, Telefone aparecem
8. Candidato preenche os dados básicos
9. Formulário expande: campo Senha com medidor de força + Confirmar Senha
10. Candidato digita senha → medidor atualiza em tempo real
11. Senha atinge nível "forte" → critérios todos verdes
12. Confirma a senha → match OK
13. Formulário expande: 3 checkboxes de termos
14. Candidato clica nos links, lê os documentos
15. Marca os 3 checkboxes
16. Botão "Criar conta" é habilitado → clica
17. Conta criada → redirecionado para PRD-084 (Perfil Pessoal)
```

### Fluxo Alternativo: CPF Já Cadastrado

```
1-5. (mesmo do fluxo principal)
6. Sistema verifica unicidade → CPF já existe no banco
7. Mensagem: "CPF já cadastrado. Faça login ou recupere sua senha" (com links)
8. Candidato clica em "Fazer login" → redirecionado para tela de login
   OU clica em "Recuperar senha" → redirecionado para fluxo de recuperação
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Investigação da estrutura existente | - |
| 2 | Fluxo progressivo com validação de CPF | 3-4 |
| 3 | Medidor de força de senha e termos legais | 2-3 |
| 4 | Validação, testes e ajustes | - |

### Detalhamento das Fases

#### Fase 1: Investigação e Preparação

**Objetivo:** Mapear a estrutura atual do formulário de candidato e do banco de dados

**Ações:**
- [ ] Investigar a estrutura da tabela `candidates` no Supabase — verificar se o campo `cpf` já existe, se possui constraint UNIQUE, e quais campos já estão disponíveis
- [ ] Mapear os arquivos que compõem o formulário de cadastro atual
- [ ] Verificar que as páginas dos documentos legais (Termos de Uso, Política de Privacidade, LGPD) estão publicadas e acessíveis via URL

**Validação:** Relatório completo da estrutura existente e gaps identificados

#### Fase 2: Fluxo Progressivo com Validação de CPF

**Objetivo:** Reestruturar o formulário para o fluxo em etapas, começando pelo CPF

**Ações:**
- [ ] Reestruturar o formulário de candidato para o fluxo progressivo
- [ ] Implementar campo de CPF com máscara e validação local por algoritmo
- [ ] Implementar verificação de unicidade do CPF no banco
- [ ] Implementar mensagem de bloqueio com links para login e recuperação de senha
- [ ] Implementar a expansão do formulário para os dados básicos após CPF válido
- [ ] Garantir que o formulário de cadastro de empresa continua funcionando normalmente

**Validação:** Fluxo CPF → Dados básicos funcional com validações e bloqueios

#### Fase 3: Senha Forte e Termos Legais

**Objetivo:** Implementar o medidor de força de senha e o bloco de aceite de termos

**Ações:**
- [ ] Implementar campo de senha com medidor visual de força em tempo real
- [ ] Implementar lista de critérios de senha com verificação visual
- [ ] Implementar toggle de visibilidade da senha
- [ ] Implementar os três checkboxes de termos com links clicáveis para documentos reais
- [ ] Implementar registro do aceite com timestamp no banco
- [ ] Implementar redirecionamento para PRD-084 após criação da conta

**Validação:** Fluxo completo end-to-end funcional — do CPF à criação da conta com redirecionamento

#### Fase 4: Validação e Ajustes

**Objetivo:** Garantir qualidade e cobrir edge cases

**Ações:**
- [ ] Testar todos os cenários documentados nos critérios de aceitação
- [ ] Testar responsividade em dispositivos móveis
- [ ] Testar que o cadastro de empresa continua funcionando
- [ ] Verificar que candidatos existentes não foram afetados

**Validação:** Todos os critérios de aceitação passando; nenhuma regressão

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-063 | Fundação Supabase + Auth | ✅ Implementado |
| PRD-064 | Schema Core + Seeds Transacionais | ✅ Implementado |
| PRD-078 | Cadastro Empresa CNPJ (referência de padrão) | ✅ Implementado |

### Decisões Pendentes

- [ ] URLs definitivas dos documentos legais (Termos de Uso, Política de Privacidade, LGPD) — devem estar publicados antes da Fase 3

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Onboarding de Candidatos"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| **1** | **PRD-083** | **Cadastro Básico com Validação CPF** | **🔄 ATUAL** | Base |
| 2 | PRD-084 | Perfil Pessoal | ⏳ Pendente | Depende de 083 |
| 3 | PRD-085 | Perfil Profissional | ⏳ Pendente | Depende de 084 |
| 4 | PRD-086 | Teste Comportamental Gauge-Pro | ⏳ Pendente | Depende de 085 |

> **Nota:** O candidato só acessa a plataforma após completar todas as 4 etapas. Implemente na ordem indicada.

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| CPF | PII (dado pessoal identificável) | Armazenado no banco, protegido por RLS, transmitido via HTTPS |
| Senha | Credencial | Hash gerenciado pelo Supabase Auth (bcrypt), nunca armazenada em texto claro |
| Aceite de termos | Registro legal | Timestamp imutável, protegido contra alteração |

### Autenticação e Autorização

- A verificação de unicidade do CPF ocorre antes da criação da conta (usuário anônimo)
- A consulta ao banco para verificar CPF deve permitir apenas verificar existência (retornar true/false), sem expor dados do candidato

### Auditoria

- O sistema deve registrar o timestamp do aceite de cada documento legal de forma imutável
- Os campos `created_at` e `updated_at` cobrem rastreabilidade básica do cadastro

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."
>
> **IMPORTANTE:** Investigue o que já existe no banco de dados do Supabase antes de criar qualquer migration ou estrutura. Verifique tabelas, campos, constraints e dados existentes para evitar duplicidade ou conflito.

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Renomear este arquivo adicionando `_DONE` ao final
> - Atualizar a seção "Status de Implementação"

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Referência visual** | O cadastro de empresa (PRD-078) serve como referência de padrão visual e de fluxo progressivo |
| **Validação de CPF** | A validação é local (algoritmo de dígitos verificadores) + unicidade no banco. NÃO há consulta a API externa |
| **Medidor de senha** | O medidor deve ser visual e em tempo real. A classificação dos níveis e os critérios individuais devem ser ambos visíveis |
| **Termos legais** | Os links dos documentos devem apontar para URLs reais e configuráveis |
| **Registro de aceite** | O timestamp do aceite de cada termo deve ser registrado de forma independente para rastreabilidade legal |
| **Redirecionamento pós-cadastro** | Após criar a conta, o candidato NÃO acessa a plataforma. Deve ser redirecionado para o fluxo de onboarding (PRD-084) |
| **Candidatos existentes** | Este PRD aplica-se apenas a novos cadastros. Candidatos existentes não são afetados |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Consultar API externa para validar CPF |
| Permitir que o candidato prossiga sem CPF válido e único |
| Permitir criação de conta sem os 3 aceites de termos marcados |
| Afetar o fluxo de cadastro de empresa ao modificar o formulário |
| Usar apenas cor como indicador de força de senha (acessibilidade) |
| Permitir que o candidato acesse a plataforma logo após criar a conta (deve seguir para onboarding) |
| Afetar candidatos já cadastrados na plataforma |

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
| 21/02/2026 | v1 | Criação inicial |
| 21/02/2026 | v2 | Atualizado como parte da cadeia de onboarding (083→086). Adicionado: redirecionamento pós-cadastro, escopo limitado a novos cadastros, cadeia de PRDs, orientação para investigar banco existente |

---

**AILA - Sistemas Inteligentes**
