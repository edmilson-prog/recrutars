# PRD-081: Fluxo de Convite, Semi-Cadastro e Vinculação de Colaboradores

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Plataforma de Recrutamento Inteligente |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Permitir que empresas convidem colaboradores já contratados para realizarem a avaliação Gauge-Pro, vinculando-os automaticamente à equipe da empresa e criando um semi-cadastro que garante acesso futuro ao resultado do teste |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Gauge-Pro / Gestão de Equipes |
| **PRDs Relacionados** | PRD-052 (Hub de Testes Gauge-Pro), PRD-055 (Gestão de Equipes Core), PRD-063 (Supabase Auth) |
| **Padrão de código** | camelCase para novos campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

> **Justificativa da complexidade Alta:** O fluxo atravessa múltiplos contextos — empresa enviando convite, colaborador acessando link externo, realização do teste sem conta ativa, criação de pré-cadastro, vínculo automático à equipe, tela de conclusão com ativação de conta e fallback por email. Envolve regras de negócio que impactam autenticação, gestão de equipes, módulo de testes e comunicação.

---

## Contexto do Problema

A funcionalidade de "Convite para Teste" no RecrutaRS foi concebida originalmente para convidar candidatos externos. Contudo, o caso de uso primário identificado é diferente: empresas que acabam de se cadastrar na plataforma já possuem equipes formadas — às vezes dezenas de colaboradores contratados — que nunca passaram por uma avaliação comportamental científica. Para essas empresas, o valor imediato da plataforma está em mapear quem já trabalha nelas, não em recrutar novos talentos.

O fluxo atual não suporta esse caso adequadamente. Quando um colaborador recebe um convite por link ou email, preenche nome e email e realiza o teste, mas ao término não há nenhum mecanismo que o vincule à empresa, registre seu departamento ou garanta que ele terá acesso ao próprio resultado posteriormente. O colaborador termina o teste e simplesmente "desaparece" do sistema.

Este PRD resolve essa lacuna criando um fluxo estruturado de convite que transforma o teste em porta de entrada para a plataforma: o colaborador fornece seus dados de identificação, realiza a avaliação, e ao concluir é convidado a criar uma senha — ativando sua conta e garantindo acesso permanente ao seu perfil Gauge-Pro.

---

## Conceito da Solução

### Situação Atual (As-Is)

O colaborador recebe um link ou email de convite. Ao acessar, preenche nome e email em uma tela simples e inicia o teste. Ao concluir, não há próximos passos definidos. Não existe vínculo automático com a empresa, não há registro de departamento e o colaborador não tem como acessar seu resultado depois.

### Situação Desejada (To-Be)

O colaborador recebe um convite (por link público, email direto ou seleção da base da empresa). Ao acessar a tela de identificação, preenche nome, email e departamento. Com esses dados, o sistema cria um **pré-cadastro** com status "convidado" e vincula esse registro à empresa que enviou o convite. O colaborador realiza o teste normalmente. Ao concluir, é exibida uma tela de conclusão que exibe nome e email já preenchidos (somente leitura), solicita criação de senha e, ao confirmar, ativa a conta — permitindo acesso imediato ao resultado Gauge-Pro. Caso o colaborador feche sem ativar, o sistema envia um email com link de ativação.

O colaborador ativado passa a constar em **"Minha Equipe"** da empresa que enviou o convite, associado ao departamento informado durante o teste.

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Exigir cadastro completo antes do teste | Cria fricção excessiva e reduz a taxa de conclusão — o colaborador não tem motivação para criar conta antes de entender o valor |
| Não criar conta, apenas armazenar resultado | O colaborador nunca conseguiria acessar seu próprio resultado, perdendo um dos diferenciais da plataforma |
| Cadastro completo na tela de conclusão | Coletar mais dados depois do teste aumenta o abandono — o momento ideal para conversão é imediatamente após a conclusão |

---

## Escopo

### Incluído

- ✅ Tela de identificação do convite com coleta de nome, email e departamento
- ✅ Criação de pré-cadastro (semi-cadastro) com status `invited` ao iniciar o teste
- ✅ Vínculo automático do colaborador à empresa que enviou o convite
- ✅ Lista de departamentos disponíveis proveniente da configuração de "Minha Equipe" da empresa
- ✅ Suporte ao campo departamento como nulo quando a empresa não possui departamentos cadastrados
- ✅ Tela de conclusão do teste com campos de identificação em modo somente leitura, campo de criação de senha e CTA de ativação de conta
- ✅ Ativação da conta na tela de conclusão com transição de status `invited → active`
- ✅ Envio de email de ativação como fallback quando o colaborador fecha sem criar senha
- ✅ Exibição do colaborador em "Minha Equipe" mesmo antes da ativação da conta
- ✅ Aplicação do fluxo para os três canais de convite: link público, email direto e seleção da base

### Excluído

- ❌ Alteração do fluxo de candidatos que se aplicam a vagas (contexto diferente)
- ❌ Edição de departamento pelo colaborador após o teste (responsabilidade da empresa)
- ❌ Visualização do resultado Gauge-Pro antes da ativação da conta
- ❌ Login social (Google, LinkedIn) como método de ativação neste PRD
- ❌ Notificação para a empresa quando um colaborador ativa a conta (PRD futuro)
- ❌ Gestão de re-envio de convites expirados (PRD futuro)

---

## Requisitos Funcionais

### Tela de Identificação do Convite

- **RF-001:** Quando um colaborador acessa um link de convite (público ou por email), o sistema deve exibir uma tela de identificação solicitando nome completo, email e departamento antes de iniciar o teste.

- **RF-002:** O campo de departamento deve ser um seletor preenchido com os departamentos cadastrados pela empresa em "Minha Equipe". Quando não houver departamentos cadastrados, o campo deve ser ocultado ou exibido desabilitado, e o valor deve ser armazenado como nulo.

- **RF-003:** O sistema deve validar que o email informado possui formato válido antes de permitir o avanço para o teste.

- **RF-004:** Quando o email informado já possuir uma conta ativa na plataforma, o sistema deve reconhecer o colaborador e prosseguir normalmente, sem criar um novo registro duplicado, atualizando apenas o vínculo com a empresa caso ainda não exista.

- **RF-005:** O sistema deve criar um pré-cadastro com status `invited` a partir dos dados informados na tela de identificação, antes de iniciar o teste. Esse registro deve conter: nome, email, departamento (ou nulo), referência à empresa que enviou o convite e canal de origem do convite (link público, email ou base).

### Vínculo Automático à Empresa

- **RF-006:** Ao criar o pré-cadastro, o sistema deve vincular automaticamente o colaborador à empresa que enviou o convite, registrando esse vínculo com origem identificada (`invite_link`, `invite_email` ou `invite_base`).

- **RF-007:** O colaborador vinculado deve aparecer na seção "Minha Equipe" da empresa imediatamente após a criação do pré-cadastro, mesmo antes de ativar a conta. Sua condição deve ser claramente identificada como "Convite Pendente" enquanto a conta não for ativada.

- **RF-008:** O departamento informado durante o teste deve ser associado ao vínculo empresa-colaborador. Se for nulo, o registro deve ser criado sem departamento, para ajuste posterior pela empresa.

### Tela de Conclusão do Teste

- **RF-009:** Ao concluir o teste Gauge-Pro, o colaborador deve ser direcionado para uma tela de conclusão que confirme o término da avaliação, indique que o resultado está sendo processado e apresente o formulário de ativação de conta.

- **RF-010:** A tela de conclusão deve exibir o nome completo e o email do colaborador em campos somente leitura, pré-preenchidos com os dados informados na tela de identificação. Esses campos não devem ser editáveis.

- **RF-011:** A tela de conclusão deve solicitar a criação de uma senha, com campo de confirmação. A senha deve atender aos critérios mínimos de segurança da plataforma. A força da senha deve ser indicada visualmente ao colaborador durante a digitação.

- **RF-012:** Ao confirmar a senha e clicar em ativar, o sistema deve criar a conta definitiva com status `active`, autenticar o colaborador automaticamente e redirecioná-lo para a visualização do resultado do teste.

- **RF-013:** A tela de conclusão deve informar, de forma clara e não intimidadora, que o perfil comportamental foi compartilhado com a empresa que enviou o convite.

- **RF-014:** O colaborador deve ter a opção de fechar a tela de conclusão sem ativar a conta. Nesse caso, o sistema deve enviar um email com link de ativação para o endereço informado.

### Fallback de Ativação por Email

- **RF-015:** O email de ativação enviado como fallback deve conter um link único e com prazo de validade. Ao clicar no link, o colaborador deve ser direcionado para uma tela de criação de senha e ativação de conta.

- **RF-016:** Após ativar a conta pelo link de email, o colaborador deve ser autenticado automaticamente e redirecionado para visualizar o resultado do seu teste.

### Canal "Da Base"

- **RF-017:** Quando o convite for enviado pelo canal "Da Base" (colaboradores já existentes na base da empresa), o fluxo de tela de identificação deve ser suprimido, pois os dados do colaborador já existem. O sistema deve apenas criar o vínculo com o teste e enviar a notificação para que o colaborador acesse e realize a avaliação.

---

## Requisitos Não-Funcionais

- **RNF-001 (Unicidade):** O sistema deve garantir que um mesmo email não gere múltiplos registros na plataforma, independente do canal de convite utilizado.
- **RNF-002 (Segurança):** O link de ativação por email deve ter prazo de validade máximo de 72 horas e ser de uso único.
- **RNF-003 (Rastreabilidade):** Toda criação de pré-cadastro, vínculo empresa-colaborador e ativação de conta deve ser registrada com timestamp e canal de origem.
- **RNF-004 (Resiliência):** Falhas no envio do email de fallback não devem impedir o término do fluxo — o pré-cadastro e o vínculo devem ser preservados independentemente.
- **RNF-005 (Experiência):** A tela de conclusão deve ser responsiva e funcionar adequadamente em dispositivos móveis, pois colaboradores frequentemente acessam links de convite pelo celular.

---

## Critérios de Aceitação

### RF-001 / RF-002: Tela de Identificação com Departamento

```gherkin
DADO que um colaborador acessa um link de convite válido de uma empresa
  E a empresa possui departamentos cadastrados em "Minha Equipe"
QUANDO a tela de identificação é exibida
ENTÃO o sistema deve apresentar campos de nome completo, email e um seletor de departamento
  E o seletor deve conter exatamente os departamentos cadastrados pela empresa
```

```gherkin
DADO que um colaborador acessa um link de convite válido de uma empresa
  E a empresa NÃO possui departamentos cadastrados
QUANDO a tela de identificação é exibida
ENTÃO o campo de departamento deve ser ocultado ou exibido como indisponível
  E o sistema deve prosseguir com o departamento como nulo
```

### RF-004: Email Já Cadastrado

```gherkin
DADO que um colaborador informa na tela de identificação um email que já possui conta ativa
QUANDO o colaborador tenta avançar para o teste
ENTÃO o sistema deve reconhecer a conta existente e não criar um novo registro
  E deve criar ou atualizar o vínculo com a empresa que enviou o convite
  E deve permitir o início do teste normalmente
```

### RF-006 / RF-007: Vínculo Automático à Empresa

```gherkin
DADO que um colaborador preenche a tela de identificação e inicia o teste via link público
QUANDO o pré-cadastro é criado
ENTÃO o colaborador deve aparecer imediatamente em "Minha Equipe" da empresa com status "Convite Pendente"
  E o vínculo deve registrar a origem como "invite_link"
  E o departamento informado (ou nulo) deve estar associado ao vínculo
```

### RF-010 / RF-011: Tela de Conclusão

```gherkin
DADO que um colaborador conclui o teste Gauge-Pro
QUANDO a tela de conclusão é exibida
ENTÃO o nome e email devem estar preenchidos e em modo somente leitura
  E deve haver um campo de criação de senha e um campo de confirmação
  E ao digitar a senha, um indicador visual de força deve ser exibido
```

### RF-012: Ativação na Conclusão

```gherkin
DADO que o colaborador preenche uma senha válida e clica em ativar
QUANDO o sistema processa a ativação
ENTÃO a conta deve ser criada com status "active"
  E o colaborador deve ser autenticado automaticamente
  E deve ser redirecionado para a visualização do resultado do seu teste
  E em "Minha Equipe" da empresa seu status deve mudar de "Convite Pendente" para "Ativo"
```

### RF-014 / RF-015: Fallback por Email

```gherkin
DADO que o colaborador fecha a tela de conclusão sem criar senha
QUANDO o sistema detecta o encerramento sem ativação
ENTÃO deve enviar um email com link de ativação para o endereço informado
  E o link deve ter validade de 72 horas
  E ao clicar no link, o colaborador deve ser direcionado para criar senha e ativar a conta
```

### Cenários de Erro

```gherkin
DADO que o colaborador tenta avançar na tela de identificação com um email em formato inválido
QUANDO o sistema valida o campo
ENTÃO deve exibir mensagem de erro informando que o email é inválido
  E não deve permitir o início do teste
```

```gherkin
DADO que o colaborador tenta ativar a conta com senhas que não coincidem
QUANDO o sistema valida o formulário de ativação
ENTÃO deve exibir mensagem indicando que as senhas não coincidem
  E não deve criar a conta nem autenticar o colaborador
```

```gherkin
DADO que o link de ativação por email foi utilizado ou expirou
QUANDO o colaborador tenta acessá-lo
ENTÃO o sistema deve exibir mensagem informando que o link é inválido ou expirado
  E deve oferecer a opção de solicitar um novo link de ativação
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|--------------------|
| 1 | Análise e preparação da estrutura de dados | 0 (apenas análise) |
| 2 | Tela de identificação com coleta de departamento e criação de pré-cadastro | ~4 |
| 3 | Vínculo automático e exibição em "Minha Equipe" | ~3 |
| 4 | Tela de conclusão com ativação de conta | ~3 |
| 5 | Fallback de email e validações finais | ~2 |

### Detalhamento das Fases

#### Fase 1: Análise e Preparação

**Objetivo:** Entender a estrutura atual do fluxo de convites, do módulo de equipes e do sistema de autenticação para identificar onde cada alteração deve ser aplicada.

**Ações:**
- [ ] Mapear os componentes e rotas que atendem o fluxo de convite atual
- [ ] Verificar a estrutura de dados de equipes e departamentos no Supabase
- [ ] Identificar como os vínculos empresa-colaborador são atualmente armazenados
- [ ] Verificar se existe campo de status de conta no modelo de usuário
- [ ] Verificar se existe campo de origem de vínculo no modelo de equipes

**Validação:** Documento ou comentário no PR listando os pontos de alteração identificados antes de qualquer implementação.

#### Fase 2: Tela de Identificação

**Objetivo:** Atualizar a tela de entrada do convite para coletar nome, email e departamento, e criar o pré-cadastro ao avançar.

**Ações:**
- [ ] Adicionar campo de seleção de departamento na tela de identificação, alimentado pelos departamentos da empresa
- [ ] Implementar lógica de ocultação/desabilitação do campo quando não há departamentos
- [ ] Implementar validação de email e verificação de conta existente
- [ ] Criar o pré-cadastro com status `invited` ao confirmar os dados
- [ ] Registrar canal de origem do convite junto ao pré-cadastro

**Validação:** Colaborador consegue preencher tela de identificação, selecionar departamento (quando disponível) e avançar. Pré-cadastro é criado no banco com os dados corretos.

#### Fase 3: Vínculo com a Empresa

**Objetivo:** Garantir que o colaborador apareça em "Minha Equipe" da empresa imediatamente após a criação do pré-cadastro.

**Ações:**
- [ ] Criar ou atualizar o vínculo empresa-colaborador ao salvar o pré-cadastro
- [ ] Incluir o departamento e a origem do convite no vínculo
- [ ] Garantir que colaboradores com status `invited` apareçam em "Minha Equipe" com indicação visual de "Convite Pendente"
- [ ] Garantir que a lógica de de-duplicação funciona corretamente quando o email já existe

**Validação:** Após completar a tela de identificação, o colaborador aparece em "Minha Equipe" com status correto e departamento associado.

#### Fase 4: Tela de Conclusão com Ativação

**Objetivo:** Criar a tela de conclusão do teste com campos de identificação somente leitura, formulário de senha e CTA de ativação.

**Ações:**
- [ ] Criar componente de tela de conclusão conforme mockup aprovado
- [ ] Exibir nome e email pré-preenchidos em modo somente leitura
- [ ] Implementar campos de criação e confirmação de senha com indicador de força
- [ ] Implementar indicador visual de processamento da análise Gauge-Pro
- [ ] Exibir nota de transparência informando o compartilhamento com a empresa
- [ ] Implementar ação de ativação: criar conta, autenticar e redirecionar para resultado
- [ ] Implementar ação de saída sem ativação: disparar envio de email de fallback

**Validação:** Colaborador conclui o teste, visualiza a tela de conclusão, cria senha, é autenticado automaticamente e consegue visualizar seu resultado.

#### Fase 5: Fallback por Email e Ajustes Finais

**Objetivo:** Garantir que colaboradores que saíram sem ativar possam recuperar o acesso e revisar o fluxo completo.

**Ações:**
- [ ] Implementar envio de email de ativação com link único e prazo de 72 horas
- [ ] Criar tela de ativação por link de email (campo de senha + confirmação)
- [ ] Implementar tratamento de links expirados ou já utilizados com opção de reenvio
- [ ] Revisar o fluxo completo para os três canais (link público, email, base)
- [ ] Validar comportamento quando o convite é de um colaborador que já tem conta ativa

**Validação:** Colaborador que saiu sem criar senha recebe email, acessa o link, cria senha e consegue ver seu resultado. Link expirado exibe mensagem adequada com opção de reenvio.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-052 | Hub de Testes Gauge-Pro — fluxo base de convites | ✅ Concluído |
| PRD-055 | Gestão de Equipes Core — estrutura de departamentos e vínculos | ✅ Concluído |
| PRD-063 | Supabase Auth — autenticação e gestão de status de conta | ✅ Concluído |
| PRD-079 | Vinculação de Plano e Trial — contexto de empresa ativa | ✅ Concluído |

### Decisões Pendentes

- [ ] Verificar se a estrutura de dados atual suporta o campo de status `invited` no modelo de usuário ou se é necessário adicioná-lo
- [ ] Verificar se existe campo de origem de vínculo (`invite_link`, `invite_email`, `invite_base`) na tabela de equipes ou se precisa ser criado

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Email do colaborador | PII | Deve seguir as mesmas políticas de proteção dos demais usuários da plataforma |
| Senha criada na ativação | Sensível | Nunca armazenada em texto claro — gerenciada pelo Supabase Auth |
| Link de ativação por email | Sensível | Token único, de uso único, com prazo máximo de 72 horas |

### Autenticação e Autorização

O pré-cadastro com status `invited` não deve conceder nenhum acesso autenticado à plataforma. O colaborador só recebe sessão ativa após criar a senha e ativar a conta (status `active`). A tela de realização do teste é acessada por token de convite, não por sessão de usuário.

### Auditoria

Todos os eventos do fluxo devem ser registrados com timestamp: criação do pré-cadastro, vínculo com a empresa, conclusão do teste, ativação de conta (ou tentativas falhas), e envio do email de fallback.

---

## Fluxos de Usuário

### Fluxo Principal — Link Público ou Email Direto

```
[Colaborador recebe link/email]
    ↓
[Acessa tela de identificação]
    ↓
[Preenche nome, email, departamento (se disponível)]
    ↓
[Sistema cria pré-cadastro e vínculo com empresa]
    ↓
[Colaborador realiza o teste Gauge-Pro]
    ↓
[Tela de conclusão com dados somente leitura e formulário de senha]
    ↓
[Colaborador cria senha → conta ativada → redirecionado para resultado]
```

### Fluxo de Exceção — Saída Sem Ativação

```
[Tela de conclusão exibida]
    ↓
[Colaborador fecha sem criar senha]
    ↓
[Sistema envia email de ativação com link único]
    ↓
[Colaborador clica no link → tela de criação de senha]
    ↓
[Conta ativada → redirecionado para resultado]
```

### Fluxo de Exceção — Email Já Cadastrado

```
[Colaborador informa email de conta existente]
    ↓
[Sistema reconhece conta, não cria duplicata]
    ↓
[Atualiza vínculo com a empresa (se necessário)]
    ↓
[Colaborador realiza o teste normalmente]
    ↓
[Tela de conclusão sem formulário de senha (conta já ativa)]
    ↓
[Redirecionado para resultado]
```

### Fluxo — Canal "Da Base"

```
[Empresa seleciona colaboradores existentes da base]
    ↓
[Sistema cria vínculo empresa-colaborador e envia notificação]
    ↓
[Colaborador recebe notificação e acessa o teste]
    ↓
[Tela de identificação suprimida (dados já existem)]
    ↓
[Colaborador realiza o teste e é redirecionado para resultado]
```

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
>   Ex: `PRD-081-emp-fluxo-convite-semi-cadastro-colaboradores_DONE.md`
> - Atualizar a seção "Status de Implementação" com:
>   - Status: ✅ IMPLEMENTADO
>   - Data de Implementação
>   - Versão do App após implementação
>   - Observações relevantes

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Sugestão contextual: **"Onboard"** — representa a integração de colaboradores existentes à plataforma.

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
| **Não bloquear o teste** | Falhas no processo de pré-cadastro ou vínculo não devem impedir o colaborador de realizar o teste |
| **Fail gracefully** | Se o envio do email de fallback falhar, o pré-cadastro e o vínculo devem ser preservados |
| **Não duplicar registros** | A verificação de email existente é crítica — nunca criar dois registros para o mesmo endereço |
| **Preservar origem** | O canal de convite deve sempre ser registrado para fins de rastreabilidade |
| **Documentar decisões** | Registrar no PR qualquer decisão técnica sobre estrutura de dados não coberta pelo PRD |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Departamento nulo** | Deve ser tratado como valor válido — não forçar seleção quando não há departamentos cadastrados |
| **Status da conta** | Verificar se a estrutura atual suporta o estado `invited` antes de adicionar — pode já existir com outro nome |
| **Tela de conclusão** | Referência visual aprovada disponível como mockup em HTML (conclusao-teste-gaugepro.html). Os campos de nome e email devem ser readonly conforme definido |
| **Canal "Da Base"** | Este canal tem comportamento diferenciado — a tela de identificação é suprimida. Validar na fase 1 como o canal é atualmente identificado no sistema |
| **Link de ativação** | Deve ser gerado e gerenciado pelo Supabase Auth (magic link adaptado) ou por mecanismo equivalente já presente no projeto |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Criar conta ativa no momento da identificação — a conta só é ativada ao criar a senha |
| Exibir campos de nome e email editáveis na tela de conclusão |
| Bloquear o início do teste se o pré-cadastro ou vínculo falhar |
| Criar múltiplos registros para o mesmo email, independentemente do canal |
| Hardcodar o prazo de validade do link de ativação — deve ser configurável |
| Exibir o resultado do teste antes da ativação da conta |
| Aplicar este fluxo ao canal "Da Base" sem verificar se supressão da tela de identificação está correta para o contexto |

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
| 19/02/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
