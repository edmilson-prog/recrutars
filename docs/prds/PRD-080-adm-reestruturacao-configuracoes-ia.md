# PRD-080: Reestruturação das Configurações de IA no Painel Admin

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Plataforma de Recrutamento Inteligente |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Reorganizar a seção de configurações de IA do painel admin, separando os parâmetros operacionais do agente dos parâmetros de infraestrutura (chaves de API, modelos e consumo), e consolidar o gerenciamento de provedores LLM em uma nova seção dedicada dentro de Integrações |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Média |
| **Épico** | Admin — Configurações e Infraestrutura de IA |
| **PRDs Relacionados** | PRD-043 (Admin Avançado — Configurações), PRD-044 (Feature Flags / RBAC) |
| **Padrão de código** | camelCase para novos campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

> **Justificativa da complexidade Média:** Afeta 2 telas do painel admin (Agente de Análise e nova tela Provedores LLM), envolve persistência de dados sensíveis (chaves de API) e requer reorganização de componentes existentes sem quebrar funcionalidades em produção.

---

## Contexto do Problema

A tela atual de **Agente de Análise** (em Inteligência Artificial) concentra em um único lugar responsabilidades distintas: parâmetros comportamentais do agente (como gerar a análise e com qual tom), configurações de infraestrutura (qual modelo LLM usar, qual chave de API) e parâmetros técnicos de geração (temperatura, tokens).

Essa mistura dificulta a administração por perfis diferentes: um administrador que quer apenas ajustar o comportamento da análise precisa navegar pelo mesmo espaço de quem está gerenciando chaves de API. Além disso, a ausência de visibilidade sobre consumo de tokens e custo estimado impede decisões informadas sobre qual provedor usar.

À medida que a plataforma evolui para suportar múltiplos provedores LLM (Anthropic, OpenAI, futuramente outros), a estrutura atual não escala. Cada provedor tem suas próprias chaves, modelos disponíveis e comportamentos de geração distintos — faz sentido tratar cada um como uma unidade de configuração independente.

---

## Conceito da Solução

### Situação Atual (As-Is)

A tela **Inteligência Artificial → Agente de Análise** contém, misturados:
- Toggle de ativação geral do Agente IA
- Seleção do modelo Claude a usar
- Campo de chave de API da Anthropic
- Toggles de modo de análise (Prática/Técnica)
- Parâmetros de temperatura e max tokens (globais, sem vínculo ao provedor)

Não existe gerenciamento de outros provedores LLM. Não existe visibilidade de consumo.

### Situação Desejada (To-Be)

**Tela 1 — Inteligência Artificial → Agente de Análise** (simplificada):
- Apenas os parâmetros comportamentais do agente: quais tipos de análise devem ser gerados (Prática para Recrutador e/ou Técnica para Admin)
- Um aviso informativo indicando que ativação, chaves e parâmetros de geração estão em Integrações → Provedores LLM

**Tela 2 — Integrações → Provedores LLM** (nova):
- Toggle de ativação global do Agente IA
- Painel de consumo mensal com duas visões: consolidada (todos os provedores) e por provedor individual
- Seleção do provedor padrão (qual provedor será usado pelas funcionalidades de IA)
- Cards individuais por provedor (Anthropic, OpenAI), cada um com:
  - Chave de API
  - Seleção de modelo disponível (com botão de atualizar lista)
  - Status de configuração ("Configurado" / "Não configurado")
  - Parâmetros de geração exclusivos daquele provedor (temperatura e max tokens), apresentados em acordeão colapsável
  - Botão de teste de conexão com timestamp do último teste

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Manter tudo em Agente de Análise e apenas reorganizar os campos | Não resolve o problema de escala para múltiplos provedores; mistura continua presente |
| Criar uma área separada de "Provedores" fora de Integrações | Inconsistente com a arquitetura do menu lateral, onde integrações com serviços externos já residem |

---

## Escopo

### Incluído

- ✅ Simplificação da tela Agente de Análise, mantendo apenas os toggles de modo de análise
- ✅ Criação da tela Provedores LLM dentro da seção Integrações
- ✅ Migração do toggle "Ativar Agente IA" para a nova tela
- ✅ Migração das configurações de Anthropic (chave, modelo) para o card correspondente na nova tela
- ✅ Adição de card para provedor OpenAI (chave, modelo, parâmetros)
- ✅ Parâmetros de geração (temperatura e max tokens) por provedor, em acordeão colapsável
- ✅ Seleção de provedor padrão
- ✅ Painel de consumo mensal com visão consolidada e visão por provedor
- ✅ Histórico semanal de consumo (chamadas, tokens, custo estimado)
- ✅ Botão de teste de conexão com timestamp do último teste realizado
- ✅ Status visual de configuração por provedor (configurado / não configurado / erro)
- ✅ Aviso informativo na tela Agente de Análise com link para Provedores LLM

### Excluído

- ❌ Implementação de novos provedores além de Anthropic e OpenAI (Gemini, etc.)
- ❌ Integração real com APIs de consumo dos provedores (dados de consumo permanecem mockados neste PRD)
- ❌ Validação automática de chave de API ao salvar (apenas via botão "Testar Conexão")
- ❌ Alertas de limite de consumo ou orçamento
- ❌ Histórico de consumo com granularidade maior que semanal
- ❌ Rotação automática de chaves
- ❌ Edição dos planos ou tiers vinculados ao uso de IA

---

## Requisitos Funcionais

### Tela: Agente de Análise (Reorganização)

- **RF-001:** A tela Agente de Análise deve exibir exclusivamente os parâmetros comportamentais do agente: os toggles de modo de análise Prática (Recrutador) e Técnica (Admin).
- **RF-002:** A tela deve exibir um bloco informativo indicando que ativação do agente, chaves de API e parâmetros de geração estão localizados em Integrações → Provedores LLM, com link direto para aquela seção.
- **RF-003:** As alterações nos toggles de modo de análise devem ser persistidas ao salvar.

### Tela: Provedores LLM (Nova — em Integrações)

**Ativação Global**

- **RF-004:** A tela deve apresentar, no topo, um toggle de ativação global do Agente IA, que habilita ou desabilita toda a funcionalidade de análise inteligente da plataforma.
- **RF-005:** Quando o Agente IA estiver desativado, os cards de provedor devem permanecer visíveis e configuráveis, mas com indicação visual de que estão inativos.

**Painel de Consumo**

- **RF-006:** O painel de consumo deve exibir o mês de referência e o provedor atualmente ativo.
- **RF-007:** O painel deve apresentar, na visão consolidada: total de chamadas, total de tokens consumidos e custo estimado do mês corrente.
- **RF-008:** O painel deve apresentar uma barra de progresso indicando o total de chamadas realizadas em relação a um limite de referência configurável.
- **RF-009:** O painel deve apresentar um histórico semanal das últimas semanas com: período, número de chamadas, tokens consumidos e custo estimado.
- **RF-010:** O painel deve permitir alternar entre visão consolidada (todos os provedores somados) e visão por provedor (cada provedor com suas próprias métricas e barra de proporção).
- **RF-011:** Na visão por provedor, o histórico semanal deve discriminar as chamadas por provedor em cada período.
- **RF-012:** O painel deve ter um botão de atualização manual dos dados de consumo.

**Provedor Padrão**

- **RF-013:** O administrador deve poder selecionar qual provedor LLM será utilizado por padrão em todas as funcionalidades de IA da plataforma.
- **RF-014:** A seleção do provedor padrão deve ser salva e refletida no painel de consumo como "Provedor ativo".

**Cards de Provedor**

- **RF-015:** Cada provedor (Anthropic, OpenAI) deve ser representado por um card individual com: nome, família de modelos disponíveis, campo de chave de API, seletor de modelo padrão, status de configuração e botão de teste de conexão.
- **RF-016:** O campo de chave de API deve exibir apenas os últimos caracteres da chave salva, com dica de que deixar o campo vazio preserva a chave atual.
- **RF-017:** O seletor de modelo deve listar os modelos disponíveis para aquele provedor, com a possibilidade de atualizar a lista sob demanda.
- **RF-018:** O status de configuração deve indicar visualmente se o provedor está configurado corretamente, não configurado ou com erro de conexão.
- **RF-019:** O botão de teste de conexão deve verificar se a chave de API e o modelo selecionado estão operacionais, exibindo resultado do teste e timestamp da última verificação.
- **RF-020:** Cada card deve conter uma seção colapsável de Parâmetros de Geração, contendo temperatura (slider com valor numérico) e max tokens (campo numérico), exclusivos daquele provedor.
- **RF-021:** Os parâmetros de geração de cada provedor devem ser salvos e aplicados nas chamadas feitas àquele provedor específico.
- **RF-022:** A seção de Parâmetros de Geração deve iniciar colapsada por padrão, expandindo ao clicar no cabeçalho da seção.

---

## Requisitos Não-Funcionais

- **RNF-001 (Segurança):** Chaves de API nunca devem ser exibidas em texto claro na interface; apenas uma versão mascarada deve ser visível após o salvamento inicial.
- **RNF-002 (Persistência):** Todas as configurações (chaves, modelos, parâmetros, provedor padrão, toggles) devem ser persistidas no banco de dados e sobreviver a recarregamentos de página.
- **RNF-003 (Responsividade):** A tela de Provedores LLM deve ser funcional em resoluções de tela a partir de 1280px de largura.
- **RNF-004 (Consistência visual):** A nova tela deve seguir o mesmo sistema de design das demais telas do painel admin (cores, tipografia, espaçamentos, componentes).
- **RNF-005 (Acessibilidade):** O acordeão de parâmetros deve ser operável por teclado e ter estados de foco visíveis.

---

## Critérios de Aceitação

### RF-001 a RF-003: Tela Agente de Análise Simplificada

```gherkin
DADO que o administrador acessa Inteligência Artificial → Agente de Análise
QUANDO a tela carrega
ENTÃO deve exibir apenas os dois toggles de modo de análise (Prática e Técnica)
  E deve exibir um bloco informativo com link para Integrações → Provedores LLM
  E NÃO deve exibir campos de chave de API, seleção de modelo ou parâmetros de geração
```

```gherkin
DADO que o administrador altera um toggle de modo de análise
QUANDO clica em "Salvar Alterações"
ENTÃO a configuração deve ser persistida
  E ao recarregar a página, o estado dos toggles deve refletir o valor salvo
```

### RF-004 a RF-005: Toggle de Ativação Global

```gherkin
DADO que o administrador acessa Integrações → Provedores LLM
QUANDO desativa o toggle "Ativar Agente IA"
ENTÃO os cards de provedor devem permanecer visíveis
  E devem exibir indicação visual de que estão inativos
  E nenhuma análise comportamental deve ser gerada na plataforma enquanto desativado
```

### RF-006 a RF-012: Painel de Consumo

```gherkin
DADO que o administrador está na tela Provedores LLM
QUANDO o painel de consumo está na visão consolidada
ENTÃO deve exibir o total de chamadas, tokens e custo estimado do mês corrente
  E deve exibir o histórico das últimas semanas

QUANDO o administrador alterna para visão "Por Provedor"
ENTÃO cada provedor deve exibir suas métricas individualmente
  E o histórico semanal deve discriminar chamadas por provedor
```

### RF-015 a RF-019: Cards de Provedor

```gherkin
DADO que o administrador insere uma nova chave de API em um card de provedor
E clica em "Testar Conexão"
QUANDO a chave é válida e o modelo selecionado está disponível
ENTÃO o status deve exibir "Configurado"
  E o timestamp da última verificação deve ser atualizado

QUANDO a chave é inválida ou o modelo está indisponível
ENTÃO o status deve indicar o tipo de erro
  E o timestamp deve registrar a tentativa falha
```

```gherkin
DADO que o administrador salva uma chave de API
QUANDO recarrega a página
ENTÃO o campo deve exibir apenas os últimos caracteres da chave
  E o campo deve estar vazio (pronto para receber nova chave, sem exibir a atual)
```

### RF-020 a RF-022: Parâmetros de Geração por Provedor

```gherkin
DADO que o administrador acessa o card do provedor Anthropic
QUANDO clica no cabeçalho "Parâmetros de Geração"
ENTÃO a seção deve expandir exibindo os campos de temperatura e max tokens

QUANDO ajusta a temperatura para 0.9 e salva
ENTÃO ao recarregar, o card da Anthropic deve exibir temperatura 0.9
  E o card da OpenAI deve manter seu próprio valor de temperatura independentemente
```

### Cenários de Erro

```gherkin
DADO que o administrador tenta salvar uma configuração de provedor
QUANDO o campo de chave de API está vazio e não havia chave salva anteriormente
ENTÃO o sistema deve exibir mensagem informando que a chave é obrigatória para habilitar o provedor
  E não deve salvar o provedor como "Configurado"
```

```gherkin
DADO que o administrador clica em "Atualizar" na lista de modelos de um provedor
QUANDO a chave de API ainda não foi configurada
ENTÃO o sistema deve informar que a chave precisa ser configurada antes de buscar modelos disponíveis
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|--------------------|
| 1 | Análise e mapeamento do código existente | 0 (apenas leitura) |
| 2 | Simplificação da tela Agente de Análise | 2–3 |
| 3 | Criação da tela Provedores LLM com cards e acordeão | 4–6 |

### Detalhamento das Fases

#### Fase 1: Análise e Mapeamento

**Objetivo:** Identificar todos os arquivos, componentes e dados mockados relacionados às configurações atuais de IA antes de qualquer alteração.

**Ações:**
- [ ] Localizar o componente atual da tela Agente de Análise
- [ ] Mapear quais campos serão removidos da tela e quais serão mantidos
- [ ] Identificar onde os dados de configuração de IA são armazenados (mock ou banco)
- [ ] Verificar se existem outros componentes na plataforma que consomem as configurações que serão movidas
- [ ] Mapear o menu lateral do admin para identificar onde inserir o novo item "Provedores LLM" em Integrações

**Validação:** Lista documentada de todos os pontos de impacto antes de qualquer modificação.

#### Fase 2: Simplificação da Tela Agente de Análise

**Objetivo:** Reduzir a tela Agente de Análise aos dois toggles de modo de análise e adicionar o aviso informativo.

**Ações:**
- [ ] Remover os campos de chave de API, modelo e parâmetros de geração da tela
- [ ] Remover o toggle "Ativar Agente IA" da tela
- [ ] Manter os toggles de modo de análise (Prática e Técnica) funcionais
- [ ] Adicionar bloco informativo com link navegável para Provedores LLM
- [ ] Garantir que as configurações de modo de análise continuam sendo persistidas corretamente

**Validação:** A tela Agente de Análise exibe apenas os dois toggles de modo + aviso informativo. Salvar e recarregar persiste os valores.

#### Fase 3: Criação da Tela Provedores LLM

**Objetivo:** Criar a nova tela em Integrações com toggle global, consumo, seleção de provedor padrão e cards por provedor.

**Ações:**
- [ ] Adicionar item "Provedores LLM" no menu lateral do admin, dentro do grupo Integrações
- [ ] Criar o toggle de ativação global do Agente IA (migrado da tela anterior)
- [ ] Criar o painel de consumo mensal com visão consolidada e visão por provedor
- [ ] Criar o seletor de provedor padrão
- [ ] Criar o card do provedor Anthropic com chave, modelo, status, teste de conexão e acordeão de parâmetros
- [ ] Criar o card do provedor OpenAI com os mesmos elementos
- [ ] Garantir que parâmetros de geração de cada provedor são independentes entre si
- [ ] Garantir que chaves de API são mascaradas após salvamento
- [ ] Garantir que o timestamp do último teste de conexão é exibido corretamente

**Validação:** Todos os RF-004 a RF-022 atendem seus critérios de aceitação. Dados persistem entre sessões. Cards de ambos os provedores funcionam independentemente.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-043 | Admin Avançado — Configurações de plataforma (base da tela de Configurações do admin) | ✅ Concluído |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Anthropic API | Validação de chave via teste de conexão | Disponível |
| OpenAI API | Validação de chave via teste de conexão | Disponível |

### Decisões Pendentes

- [ ] Os dados de consumo (chamadas, tokens, custo) são reais ou permanecem mockados neste PRD? *(Recomenda-se manter mockados; a integração real com APIs de billing dos provedores é escopo futuro)*

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Chave de API Anthropic | Sensível | Armazenada criptografada; exibida apenas mascarada na interface |
| Chave de API OpenAI | Sensível | Armazenada criptografada; exibida apenas mascarada na interface |

### Autenticação e Autorização

A tela de Provedores LLM é exclusiva do perfil Admin. Nenhum usuário do tipo Empresa ou Candidato deve ter acesso a esta seção.

### Auditoria

Alterações nas chaves de API e no provedor padrão devem ser registradas no log de auditoria do sistema, com identificação do admin que realizou a alteração e timestamp.

---

## Fluxos de Usuário

### Fluxo Principal — Configurar novo provedor

```
[Admin] ──▶ [Integrações → Provedores LLM]
         ──▶ [Localiza card do provedor desejado]
         ──▶ [Insere chave de API]
         ──▶ [Seleciona modelo padrão]
         ──▶ [Expande acordeão e ajusta temperatura/tokens se necessário]
         ──▶ [Clica em "Testar Conexão"]
         ──▶ [Status muda para "Configurado"]
         ──▶ [Clica em "Salvar Configurações"]
         ──▶ [Configuração persistida]
```

### Fluxo Secundário — Trocar provedor padrão

```
[Admin] ──▶ [Integrações → Provedores LLM]
         ──▶ [Seção "Provedor Padrão"]
         ──▶ [Seleciona novo provedor no dropdown]
         ──▶ [Salva]
         ──▶ [Painel de consumo atualiza "Provedor ativo"]
```

### Fluxo de Exceção — Chave inválida

```
[Admin] ──▶ [Insere chave inválida]
         ──▶ [Clica em "Testar Conexão"]
         ──▶ [Status exibe erro de autenticação]
         ──▶ [Timestamp registra tentativa falha]
         ──▶ [Admin é informado que o provedor não está funcional]
```

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web). O mockup de referência visual foi aprovado e está disponível como `mockup-config-ia.jsx` no repositório.

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
>   Ex: `PRD-080-adm-reestruturacao-configuracoes-ia_DONE.md`
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

**Codinomes:** Para MINOR ou MAJOR, gerar codinome em inglês baseado no contexto das mudanças. Sugestão para este PRD: **"Cockpit"** (painel de controle de infraestrutura de IA).

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

Tipos de mudança a documentar:
- **Added** — novas funcionalidades
- **Changed** — mudanças em funcionalidades existentes
- **Removed** — funcionalidades removidas

🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não quebrar o que existe** | As configurações atuais do Agente de Análise devem continuar funcionando durante a migração; não deixe a plataforma sem configurações de IA válidas em nenhum momento |
| **Parâmetros isolados por provedor** | Temperatura e max tokens da Anthropic não devem interferir nos da OpenAI e vice-versa |
| **Mascaramento de chaves** | Nunca exibir chave completa na interface após o salvamento; apenas indicação dos últimos caracteres |
| **Acordeão fechado por padrão** | A seção de Parâmetros de Geração deve iniciar colapsada para não poluir visualmente o card |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas durante implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Mockup de referência** | O arquivo `mockup-config-ia.jsx` aprovado pelo Product Owner é a referência visual primária. Seguir a estrutura e hierarquia de componentes apresentada |
| **Consumo mockado** | Os dados do painel de consumo (chamadas, tokens, custo) devem ser mockados neste PRD. A integração com APIs reais de billing é escopo futuro |
| **Dois provedores** | Implementar apenas Anthropic e OpenAI. Não criar estrutura genérica para N provedores neste momento (pode complicar desnecessariamente) |
| **Teste de conexão** | O botão "Testar Conexão" deve fazer uma chamada mínima à API do provedor para validar chave e modelo; não simular o resultado |
| **Menu lateral** | "Provedores LLM" deve ser adicionado ao grupo "Integrações" do menu lateral do admin, após "Stripe" |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Exibir chaves de API em texto claro em qualquer momento após o salvamento |
| Compartilhar parâmetros de temperatura/tokens entre provedores (devem ser independentes) |
| Remover os toggles de modo de análise da tela Agente de Análise (eles ficam lá) |
| Implementar integração real com APIs de billing/consumo dos provedores (fora do escopo) |
| Criar estrutura genérica para N provedores neste PRD — apenas Anthropic e OpenAI |
| Implementar validação de chave em tempo real ao digitar (apenas ao clicar em Testar Conexão) |

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
| 18/02/2026 | v1 | Criação inicial — Reestruturação das configurações de IA: simplificação de Agente de Análise e nova tela Provedores LLM em Integrações |

---

**AILA - Sistemas Inteligentes**
