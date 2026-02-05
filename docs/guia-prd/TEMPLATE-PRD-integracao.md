# TEMPLATE: PRD de Integração Externa

> **AILA - Sistemas Inteligentes**  
> Template para documentação de integrações com sistemas externos

---

## 📚 Documentos Relacionados

Este documento faz parte do sistema de documentação de PRDs da AILA - Sistemas Inteligentes.

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs — **consulte antes de usar este template** |
| `TEMPLATE-PRD-feature.md` | Template para novas funcionalidades |
| `TEMPLATE-PRD-correcao.md` | Template para correções de bugs |
| **`TEMPLATE-PRD-integracao.md`** | ⬅ Você está aqui — Template para integrações externas |
| `TEMPLATE-INDEX-prds.md` | Template do índice/catálogo de PRDs por projeto |

> **Quando usar este template:** Para integrações com APIs externas, webhooks, serviços de terceiros, ou conexões entre sistemas diferentes.

---

## 📋 Como Usar Este Template

1. **Copie** este arquivo para a pasta de PRDs do seu projeto
2. **Renomeie** seguindo o padrão: `PRD-NNN-integracao-nome-servico.md`
3. **Substitua** todos os textos entre `[colchetes]` com informações reais
4. **Remova** esta seção de instruções após preencher
5. **Consulte** o `GuiaPRD.md` para orientações detalhadas

---

# PRD-NNN: Integração [Nome do Serviço/Sistema]

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | [Nome do projeto ou módulo] |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Integrar com [serviço] para [finalidade] |
| **Tipo** | Integração |
| **Complexidade** | [Baixa / Média / Alta] |
| **Total de Fases** | [N] |
| **Prioridade** | [Alta / Média / Baixa] |
| **Épico** | [Nome da tarefa maior, se aplicável] |
| **PRDs Relacionados** | [PRD-NNN, PRD-NNN, se aplicável] |
| **Padrão de código** | [Ex: camelCase para novos campos/tabelas] |

---

## Informações do Serviço Externo

### Dados do Provedor

| Campo | Valor |
|-------|-------|
| **Nome do Serviço** | [Nome oficial] |
| **Provedor** | [Empresa/Organização] |
| **Documentação** | [URL da documentação oficial] |
| **Tipo de API** | [REST / GraphQL / SOAP / Webhook / etc] |
| **Versão da API** | [v1, v2, etc] |
| **Ambiente** | [Sandbox / Produção] |

### Credenciais Necessárias

| Credencial | Tipo | Onde Obter |
|------------|------|------------|
| [API Key] | [Chave de acesso] | [Dashboard do serviço] |
| [Client ID] | [OAuth] | [Configurações] |
| [Secret] | [OAuth] | [Configurações] |

> ⚠️ **NUNCA** incluir credenciais reais neste documento. Usar variáveis de ambiente.

### Limites e Quotas

| Limite | Valor | Consequência se Exceder |
|--------|-------|------------------------|
| Rate Limit | [N requests/min] | [429 Too Many Requests] |
| Quota Diária | [N requests/dia] | [Bloqueio até reset] |
| Payload Máximo | [N MB] | [413 Payload Too Large] |
| Timeout | [N segundos] | [Retry necessário] |

---

## Contexto da Integração

### Por que Integrar?

[Descreva em 2-3 parágrafos:]
- Qual problema a integração resolve?
- Quais dados ou funcionalidades serão obtidos?
- Qual o valor para o negócio?

### Fluxo de Dados

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   NOSSO     │ ──────▶ │   SERVIÇO   │ ──────▶ │   NOSSO     │
│   SISTEMA   │ Request │   EXTERNO   │ Response│   SISTEMA   │
└─────────────┘         └─────────────┘         └─────────────┘
```

### Direção da Integração

| Direção | Descrição |
|---------|-----------|
| [ ] **Outbound** | Nosso sistema envia dados para o serviço externo |
| [ ] **Inbound** | Serviço externo envia dados para nosso sistema (webhook) |
| [ ] **Bidirecional** | Dados fluem em ambas as direções |

---

## Escopo da Integração

### Endpoints/Operações Incluídas

| Operação | Endpoint | Método | Prioridade |
|----------|----------|--------|------------|
| [Nome da operação] | [/endpoint/path] | [GET/POST/PUT/DELETE] | [Alta/Média/Baixa] |
| [Nome da operação] | [/endpoint/path] | [GET/POST/PUT/DELETE] | [Alta/Média/Baixa] |

### Operações Excluídas (Escopo Futuro)

| Operação | Motivo da Exclusão |
|----------|-------------------|
| [Operação] | [Será feita em PRD separado / Não necessária agora] |

---

## Especificação Técnica

### Autenticação

| Campo | Valor |
|-------|-------|
| **Tipo** | [API Key / OAuth 2.0 / Basic Auth / Bearer Token] |
| **Header** | [Authorization: Bearer {token}] |
| **Expiração** | [N horas / Não expira] |
| **Refresh** | [Como renovar token se aplicável] |

### Endpoints Detalhados

#### Endpoint 1: [Nome da Operação]

| Campo | Valor |
|-------|-------|
| **URL** | `[https://api.servico.com/v1/endpoint]` |
| **Método** | [GET / POST / PUT / DELETE] |
| **Content-Type** | [application/json] |

**Headers:**

| Header | Valor |
|--------|-------|
| Authorization | Bearer {token} |
| Content-Type | application/json |

**Request Body (se aplicável):**

```json
{
  "campo1": "valor",
  "campo2": 123
}
```

**Response Success (200):**

```json
{
  "id": "abc123",
  "status": "success",
  "data": {}
}
```

**Response Error:**

| Código | Significado | Ação |
|--------|-------------|------|
| 400 | Bad Request | Validar payload |
| 401 | Unauthorized | Renovar token |
| 404 | Not Found | Verificar ID |
| 429 | Rate Limited | Aguardar e retry |
| 500 | Server Error | Retry com backoff |

---

## Mapeamento de Dados

### Dados Enviados (Request)

| Campo Nosso Sistema | Campo API Externa | Tipo | Obrigatório | Transformação |
|--------------------|-------------------|------|-------------|---------------|
| [usuario.email] | [email] | string | Sim | Nenhuma |
| [usuario.nome] | [full_name] | string | Sim | Concatenar nome + sobrenome |
| [data_nascimento] | [birth_date] | date | Não | Formato ISO 8601 |

### Dados Recebidos (Response)

| Campo API Externa | Campo Nosso Sistema | Tipo | Transformação |
|-------------------|---------------------|------|---------------|
| [external_id] | [servico_externo_id] | string | Nenhuma |
| [created_at] | [data_criacao_externa] | datetime | Parse para Date |
| [status] | [status_integracao] | string | Mapear para enum interno |

---

## Tratamento de Erros

### Estratégia de Retry

| Cenário | Estratégia | Máximo de Tentativas |
|---------|-----------|---------------------|
| Timeout | Retry imediato | 3 |
| Rate Limit (429) | Exponential backoff | 5 |
| Server Error (5xx) | Retry com delay | 3 |
| Client Error (4xx) | Não fazer retry | 0 |

### Fallback

| Cenário | Comportamento Fallback |
|---------|----------------------|
| Serviço indisponível | [Enfileirar para retry posterior / Usar cache / Notificar usuário] |
| Dados inválidos | [Logar e prosseguir / Bloquear operação] |
| Quota excedida | [Aguardar reset / Usar plano B] |

### Monitoramento

| Métrica | Como Monitorar |
|---------|---------------|
| Taxa de sucesso | [Log de requests bem-sucedidos] |
| Tempo de resposta | [Média de latência] |
| Erros por tipo | [Contagem por código HTTP] |

---

## Fases de Implementação

| Fase | Objetivo | Arquivos |
|------|----------|----------|
| 1 | Configuração e autenticação | [N] |
| 2 | Implementação de endpoints | [N] |
| 3 | Tratamento de erros e retry | [N] |
| 4 | Testes e validação | [N] |

### Detalhamento das Fases

#### Fase 1: Configuração

**Objetivo:** Estabelecer conexão básica com o serviço

**Ações:**
- [ ] Configurar variáveis de ambiente para credenciais
- [ ] Implementar autenticação
- [ ] Testar conexão básica
- [ ] Validar ambiente (sandbox/produção)

**Validação:** Request autenticado retorna 200

#### Fase 2: Endpoints

**Objetivo:** Implementar operações principais

**Ações:**
- [ ] Implementar [operação 1]
- [ ] Implementar [operação 2]
- [ ] Implementar mapeamento de dados

**Validação:** Operações funcionando com dados reais

#### Fase 3: Resiliência

**Objetivo:** Garantir robustez da integração

**Ações:**
- [ ] Implementar retry com backoff
- [ ] Implementar tratamento de erros
- [ ] Implementar fallback
- [ ] Adicionar logging

**Validação:** Sistema se recupera de falhas simuladas

#### Fase 4: Validação

**Objetivo:** Garantir qualidade da integração

**Ações:**
- [ ] Testar todos os cenários de sucesso
- [ ] Testar todos os cenários de erro
- [ ] Validar performance
- [ ] Documentar troubleshooting

---

## Critérios de Aceitação

### Conexão e Autenticação

```gherkin
DADO que as credenciais estão configuradas corretamente
QUANDO o sistema faz uma request autenticada
ENTÃO a API deve retornar 200 OK
  E o token deve ser válido
```

### Operação Principal

```gherkin
DADO que [pré-condição]
QUANDO [ação via integração]
ENTÃO [resultado esperado]
  E os dados devem estar sincronizados
```

### Tratamento de Erros

```gherkin
DADO que a API externa está indisponível
QUANDO o sistema tenta fazer uma request
ENTÃO deve fazer retry conforme estratégia definida
  E deve logar o erro
  E deve executar fallback se retry falhar
```

---

## Cadeia de PRDs

> **Preencher se este PRD faz parte de um épico (tarefa maior dividida em múltiplos PRDs).**

Este PRD faz parte do épico **"[Nome do Épico]"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | [PRD-NNN] | [Título] | [✅/⏳] | Base |
| **N** | **[Este PRD]** | **[Título]** | **🔄 ATUAL** | Depende de [...] |
| N+1 | [PRD-NNN] | [Título] | ⏳ | Depende de [...] |

> **Nota:** Implemente na ordem indicada. PRDs anteriores devem estar ✅ antes de iniciar este.

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Credenciais

| Item | Requisito |
|------|-----------|
| Armazenamento | Variáveis de ambiente, nunca em código |
| Rotação | [Frequência de rotação se aplicável] |
| Acesso | Apenas servidores autorizados |

### Dados em Trânsito

| Item | Requisito |
|------|-----------|
| Protocolo | HTTPS obrigatório |
| Certificado | Validar certificado SSL |
| Dados sensíveis | [Criptografar / Não transmitir] |

### Logs

| O que Logar | O que NÃO Logar |
|-------------|-----------------|
| Request ID | Credenciais |
| Timestamps | Tokens completos |
| Códigos de erro | Dados pessoais sensíveis |
| Payloads sanitizados | Senhas |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. CREDENCIAIS:**
> - NUNCA hardcodar credenciais no código
> - Usar variáveis de ambiente
> - Verificar se está usando ambiente correto (sandbox vs produção)

> **⚠️ 3. APÓS IMPLEMENTAR:**
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

**Codinomes:** Para MINOR ou MAJOR, gerar codinome em inglês baseado no contexto das mudanças (ex: "Bridge" para integração de sistemas, "Gateway" para API externa). PATCH mantém o codinome anterior.

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
| **Não bloquear fluxo principal** | Falha na integração não deve travar o sistema |
| **Fail gracefully** | Sempre ter fallback definido |
| **Preservar evidências** | Logar requests e responses para debug |
| **Testar incrementalmente** | Validar cada endpoint antes de integrar |
| **Documentar decisões** | Registrar decisões técnicas tomadas durante implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Timeout** | Configurar timeout adequado (não muito curto, não muito longo) |
| **Retry** | Implementar com exponential backoff |
| **Cache** | Considerar cache para dados que mudam pouco |
| **Idempotência** | Garantir que retries não causem duplicação |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Hardcodar credenciais |
| Ignorar erros da API externa |
| Fazer requests síncronas bloqueantes em fluxos críticos |
| Confiar cegamente nos dados retornados (sempre validar) |
| Logar dados sensíveis |

---

## Troubleshooting

### Problemas Comuns

| Problema | Causa Provável | Solução |
|----------|---------------|---------|
| 401 Unauthorized | Token expirado ou inválido | Verificar/renovar credenciais |
| 429 Too Many Requests | Rate limit excedido | Implementar backoff, verificar quotas |
| Timeout | Servidor lento ou request grande | Aumentar timeout, otimizar payload |
| Dados incorretos | Mapeamento errado | Verificar transformações |

### Como Debugar

1. Verificar logs de request/response
2. Testar endpoint isoladamente (Postman/curl)
3. Verificar variáveis de ambiente
4. Consultar status do serviço externo
5. Verificar rate limits e quotas

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Implementado por** | - |
| **Ambiente Testado** | [Sandbox / Produção] |
| **Observações** | - |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| [DD/MM/AAAA] | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
