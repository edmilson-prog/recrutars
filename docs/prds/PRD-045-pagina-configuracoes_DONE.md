# PRD-045: Página de Configurações (Todos os Painéis)

> **AILA - Sistemas Inteligentes**  
> RecrutaRS — Plataforma de Recrutamento Inteligente

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `PRD-043` | Footer Glassmorphism |
| `PRD-044` | Página Sobre e Changelog |
| `PRD-dgn-000` | Design System — Microinterações |

---

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Frontend (Admin, Empresa, Candidato) |
| **Repositório** | github.com/aila-sistemas/recrutars |
| **Objetivo** | Implementar página de Configurações completa com navegação por categorias, busca, histórico de alterações e formulários editáveis, seguindo layout de duas colunas (sidebar + conteúdo) |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Administração e Preferências |
| **PRDs Relacionados** | PRD-043, PRD-044 |
| **Padrão de código** | camelCase para componentes React |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** ✅ | 15+ arquivos, múltiplos painéis, persistência de dados, regras de permissão |

---

## Contexto do Problema

Atualmente, o RecrutaRS não possui uma interface unificada para gerenciamento de configurações. Parâmetros do sistema, preferências de usuário e configurações de empresa estão dispersos ou inexistentes, dificultando a personalização da plataforma.

Uma página de configurações bem estruturada é essencial para:
- **Administradores:** Gerenciar parâmetros globais da plataforma, IA, gamificação e integrações
- **Empresas:** Personalizar marca empregadora, processos seletivos e preferências de matching
- **Candidatos:** Controlar privacidade, notificações e preferências de vagas

Este PRD implementa uma página de configurações completa para os três painéis, seguindo um design consistente com navegação por categorias, busca e histórico de alterações.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Não existe página de configurações estruturada
- Preferências estão hardcoded ou inexistentes
- Não há histórico de alterações de configurações
- Cada painel pode ter abordagens diferentes (inconsistência)

### Situação Desejada (To-Be)

- Página de configurações unificada em todos os painéis
- Layout consistente: sidebar de categorias + área de conteúdo
- Busca global nas configurações
- Histórico de alterações com auditoria
- Opção de restaurar padrões
- Formulários com validação e salvamento automático ou manual

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Configurações em modal | Espaço limitado para muitas opções |
| Página única com scroll | Difícil navegação com muitas categorias |
| Configurações separadas por página | Fragmentação, difícil manutenção |

---

## Escopo

### Incluído

- ✅ Página de Configurações para painel Admin
- ✅ Página de Configurações para painel Empresa
- ✅ Página de Configurações para painel Candidato
- ✅ Layout duas colunas (sidebar categorias + área conteúdo)
- ✅ Navegação por categorias com subcategorias expansíveis
- ✅ Campo de busca global nas configurações
- ✅ Botão "Histórico" com modal/drawer de alterações
- ✅ Botão "Restaurar Padrão" por seção
- ✅ Formulários editáveis com validação
- ✅ Persistência de configurações (banco de dados)
- ✅ Responsividade (mobile: drawer para categorias)

### Excluído

- ❌ Importação/exportação de configurações (PRD futuro)
- ❌ Configurações por ambiente (dev/staging/prod)
- ❌ Versionamento de configurações com rollback
- ❌ Configurações via API pública

---

## Arquitetura de Categorias

### 🔧 Painel ADMIN

| Categoria | Subcategorias | Campos Principais |
|-----------|---------------|-------------------|
| 🏢 **Geral** | Dados da Plataforma | Nome, descrição, logo, favicon |
| | Identidade Visual | Cores primária/secundária, tema padrão |
| | Preferências Regionais | Idioma, timezone, formato data, moeda |
| 🤖 **Inteligência Artificial** | Gauge-Pro | Ativar/desativar, versão do modelo |
| | Matching | Pesos dos critérios, threshold mínimo |
| | Análise Comportamental | Parâmetros DISC, precisão |
| ⭐ **Gamificação** | Níveis | Configurar níveis e XP necessário |
| | Conquistas | Ativar/desativar, criar conquistas |
| | Recompensas | Tipos de recompensas, valores |
| 🔔 **Notificações** | Canais | Email, push, SMS (ativar/desativar) |
| | Templates | Gerenciar templates de mensagem |
| | Frequência | Limites de envio, horários |
| 🔗 **Integrações** | APIs Externas | Configurar conexões |
| | Webhooks | Endpoints, eventos |
| | ATS | Integração com outros sistemas |
| 👥 **Usuários & Permissões** | Roles | Criar/editar papéis |
| | Permissões | Matriz de permissões |
| | Políticas | Senha, sessão, 2FA obrigatório |
| 📊 **Relatórios** | Métricas | KPIs exibidos, periodicidade |
| | Exports | Formatos padrão, agendamentos |
| 💻 **Sistema** | Manutenção | Modo manutenção, mensagem |
| | Logs | Nível de log, retenção |
| | Segurança | Rate limiting, IPs bloqueados |

### 🏭 Painel EMPRESA

| Categoria | Subcategorias | Campos Principais |
|-----------|---------------|-------------------|
| 🏢 **Dados da Empresa** | Informações | Nome, CNPJ, telefone, email |
| | Endereço | Logradouro, cidade, estado, CEP |
| | Descrição | Sobre a empresa, cultura, benefícios |
| 🎨 **Identidade Visual** | Logo e Cores | Logo, cor primária, cor secundária |
| | Página de Carreiras | Banner, vídeo institucional |
| | Redes Sociais | LinkedIn, Instagram, site |
| 📋 **Vagas & Recrutamento** | Templates de Vaga | Modelos pré-configurados |
| | Etapas do Processo | Etapas padrão, ordem |
| | SLA | Tempo máximo por etapa |
| | Mensagens Automáticas | Templates por etapa |
| 🧠 **Perfil Comportamental** | Preferências DISC | Perfis ideais por cargo |
| | Peso do Matching | Importância do fit cultural |
| | Critérios | Hard skills vs soft skills |
| 🔔 **Notificações** | Alertas | Novas candidaturas, mensagens |
| | Resumos | Frequência (diário/semanal) |
| | Canais | Email, push, plataforma |
| 👥 **Equipe** | Usuários | Lista de recrutadores |
| | Convites | Convidar novos membros |
| | Permissões | Níveis de acesso |
| 🔗 **Integrações** | Calendário | Google Calendar, Outlook |
| | LinkedIn | Conexão com LinkedIn |
| | ATS | Sistemas externos |
| 🔒 **Privacidade & LGPD** | Retenção de Dados | Tempo de retenção de CVs |
| | Consentimento | Termos obrigatórios |
| | Solicitações | Gestão de pedidos LGPD |

### 👤 Painel CANDIDATO

| Categoria | Subcategorias | Campos Principais |
|-----------|---------------|-------------------|
| 👤 **Meu Perfil** | Dados Pessoais | Nome, email, telefone, foto |
| | Endereço | Cidade, estado, país |
| | Currículo | Upload, LinkedIn import |
| 🎯 **Preferências de Vagas** | Áreas de Interesse | Setores, funções |
| | Localização | Cidades, remoto, híbrido |
| | Salário | Faixa pretendida |
| | Modelo de Trabalho | CLT, PJ, tempo integral, parcial |
| 🔔 **Notificações** | Vagas | Alertas de novas vagas |
| | Candidaturas | Atualizações de status |
| | Mensagens | Notificar novas mensagens |
| | Frequência | Imediato, diário, semanal |
| 🔒 **Privacidade** | Visibilidade | Perfil público/privado |
| | Dados | Quem pode ver meu currículo |
| | LGPD | Baixar meus dados, solicitar exclusão |
| 🎨 **Aparência** | Tema | Claro, escuro, sistema |
| | Idioma | Português, English, Español |
| 🔐 **Segurança** | Senha | Alterar senha |
| | Autenticação 2FA | Ativar/desativar |
| | Sessões | Dispositivos conectados |

---

## Requisitos Funcionais

### Layout e Navegação

- **RF-001:** A página deve ter header com título "Configurações" e subtítulo contextual
- **RF-002:** O header deve ter botão "Histórico" no canto direito que abre modal/drawer
- **RF-003:** Abaixo do header, deve haver campo de busca "Buscar configuração..."
- **RF-004:** O layout deve ser dividido em duas colunas: sidebar (30%) e conteúdo (70%)
- **RF-005:** A sidebar deve listar categorias com ícones
- **RF-006:** Categorias com subcategorias devem ser expansíveis (accordion)
- **RF-007:** Ao clicar em uma categoria/subcategoria, o conteúdo da direita deve atualizar
- **RF-008:** A categoria/subcategoria ativa deve ter destaque visual
- **RF-009:** Em mobile, a sidebar deve ser um drawer acessível por botão hamburguer

### Área de Conteúdo

- **RF-010:** O título da seção deve exibir ícone + nome da categoria + subcategoria
- **RF-011:** Abaixo do título, exibir descrição da seção
- **RF-012:** No canto direito do título, botão "Restaurar Padrão"
- **RF-013:** O conteúdo deve exibir formulário com os campos da configuração
- **RF-014:** Cada campo deve ter label, input, e helper text explicativo
- **RF-015:** Campos devem ter validação em tempo real
- **RF-016:** Alterações devem ser salvas automaticamente (com debounce) ou via botão "Salvar"

### Busca

- **RF-017:** A busca deve filtrar categorias, subcategorias e campos
- **RF-018:** Ao digitar, a sidebar deve destacar/filtrar itens correspondentes
- **RF-019:** Se a busca encontrar campo específico, navegar para a seção correspondente
- **RF-020:** Busca sem resultados deve exibir mensagem "Nenhuma configuração encontrada"

### Histórico

- **RF-021:** O modal de histórico deve listar alterações de configurações
- **RF-022:** Cada entrada deve mostrar: data/hora, usuário, campo alterado, valor anterior → novo
- **RF-023:** O histórico deve ter filtro por período e categoria
- **RF-024:** Deve ser possível buscar no histórico

### Restaurar Padrão

- **RF-025:** Ao clicar em "Restaurar Padrão", exibir confirmação
- **RF-026:** A restauração deve afetar apenas a seção atual
- **RF-027:** A ação deve ser registrada no histórico

### Permissões (Admin e Empresa)

- **RF-028:** Apenas usuários com permissão adequada podem editar configurações
- **RF-029:** Configurações sensíveis devem requerer confirmação de senha
- **RF-030:** Log de auditoria para todas as alterações

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Carregamento inicial < 2 segundos
- **RNF-002 (UX):** Salvamento automático com feedback visual (toast)
- **RNF-003 (Responsividade):** Funcionar de 320px a 1920px+
- **RNF-004 (Acessibilidade):** Navegação por teclado, ARIA labels
- **RNF-005 (Segurança):** Validação server-side de todas as configurações
- **RNF-006 (Auditoria):** Todas as alterações devem ser logadas

---

## Especificação Visual

### Layout Desktop

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Configurações                                              [🕐 Histórico]   │
│ Gerencie os parâmetros e preferências do sistema                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🔍 Buscar configuração...                                                  │
├──────────────────────┬──────────────────────────────────────────────────────┤
│                      │                                                      │
│ 🏢 Geral        ▼   │ 🏢 Geral - Dados da Empresa    [↻ Restaurar Padrão] │
│   ├─ Dados Empresa ◄─┼─► Configurações gerais da empresa                   │
│   ├─ Identidade      │                                                      │
│   └─ Preferências    │ ┌──────────────────────────────────────────────────┐ │
│                      │ │ Nome da Empresa                                  │ │
│ 🤖 Inteligência ▶   │ │ ┌──────────────────────────────────────────────┐ │ │
│                      │ │ │ AILA - Sistemas Inteligentes                 │ │ │
│ ⭐ Gamificação  ▶   │ │ └──────────────────────────────────────────────┘ │ │
│                      │ │ Nome oficial exibido na plataforma              │ │
│ 🔔 Notificações ▶   │ └──────────────────────────────────────────────────┘ │
│                      │                                                      │
│ 🔗 Integrações  ▶   │ ┌──────────────────────────────────────────────────┐ │
│                      │ │ CNPJ                                            │ │
│ 👥 Usuários     ▶   │ │ ┌──────────────────────────────────────────────┐ │ │
│                      │ │ │ 12.345.678/0001-90                           │ │ │
│ 💻 Sistema      ▶   │ │ └──────────────────────────────────────────────┘ │ │
│                      │ │ CNPJ da empresa (apenas números)                │ │
│                      │ └──────────────────────────────────────────────────┘ │
│                      │                                                      │
│                      │ ┌──────────────────────────────────────────────────┐ │
│                      │ │ Logo da Empresa                                 │ │
│                      │ │ ┌────────┐                                      │ │
│                      │ │ │  📷    │  [Alterar]  [Remover]               │ │
│                      │ │ └────────┘                                      │ │
│                      │ │ PNG ou JPG, máximo 2MB, 400x400px recomendado   │ │
│                      │ └──────────────────────────────────────────────────┘ │
│                      │                                                      │
│                      │                              [ Salvar Alterações ]   │
└──────────────────────┴──────────────────────────────────────────────────────┘
```

### Layout Mobile

```
┌─────────────────────────────┐
│ ☰  Configurações   [🕐]    │
│ Gerencie os parâmetros...   │
├─────────────────────────────┤
│ 🔍 Buscar configuração...   │
├─────────────────────────────┤
│ 🏢 Geral - Dados da Empresa │
│ [↻ Restaurar]               │
│                             │
│ Configurações gerais...     │
│                             │
│ ┌─────────────────────────┐ │
│ │ Nome da Empresa         │ │
│ │ [AILA - Sistemas Int.]  │ │
│ │ Nome oficial exibido    │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ CNPJ                    │ │
│ │ [12.345.678/0001-90]    │ │
│ │ CNPJ da empresa         │ │
│ └─────────────────────────┘ │
│                             │
│ [ Salvar Alterações ]       │
└─────────────────────────────┘

Drawer de categorias (ao clicar ☰):
┌─────────────────────────────┐
│ Categorias            [✕]  │
├─────────────────────────────┤
│ 🏢 Geral              ▼    │
│   ├─ Dados Empresa    ◄    │
│   ├─ Identidade            │
│   └─ Preferências          │
│ 🤖 Inteligência       ▶    │
│ ⭐ Gamificação        ▶    │
│ 🔔 Notificações       ▶    │
│ ...                        │
└─────────────────────────────┘
```

### Modal de Histórico

```
┌─────────────────────────────────────────────────────────────┐
│ Histórico de Alterações                               [✕]  │
├─────────────────────────────────────────────────────────────┤
│ 🔍 Buscar...    [Todas categorias ▼]  [Último mês ▼]       │
├─────────────────────────────────────────────────────────────┤
│ 📅 18/01/2026 14:32                                        │
│ 👤 Admin Master                                            │
│ 📝 Geral > Dados da Empresa > Nome                         │
│    "RecrutaRS" → "RecrutaRS - Plataforma"                  │
├─────────────────────────────────────────────────────────────┤
│ 📅 17/01/2026 09:15                                        │
│ 👤 Admin Master                                            │
│ 📝 Notificações > Canais > Email                           │
│    Desativado → Ativado                                    │
├─────────────────────────────────────────────────────────────┤
│ 📅 15/01/2026 16:45                                        │
│ 👤 João Silva                                              │
│ 📝 Gamificação > Níveis > XP por ação                      │
│    "10" → "15"                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Estrutura de Dados

### Modelo de Configuração

```typescript
interface ConfigCategory {
  id: string;
  key: string;              // "general", "ai", "gamification"
  name: string;             // "Geral"
  icon: string;             // "building"
  description: string;
  subcategories: ConfigSubcategory[];
  panel: 'admin' | 'company' | 'candidate';
  order: number;
}

interface ConfigSubcategory {
  id: string;
  key: string;              // "company_data"
  name: string;             // "Dados da Empresa"
  description: string;
  fields: ConfigField[];
  order: number;
}

interface ConfigField {
  id: string;
  key: string;              // "company_name"
  name: string;             // "Nome da Empresa"
  description: string;      // Helper text
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'multiselect' | 'color' | 'image' | 'password';
  defaultValue: any;
  currentValue: any;
  options?: { value: string; label: string }[];  // Para select
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  sensitive?: boolean;      // Requer confirmação
  order: number;
}
```

### Modelo de Histórico

```typescript
interface ConfigHistory {
  id: string;
  timestamp: string;        // ISO date
  userId: string;
  userName: string;
  categoryKey: string;
  subcategoryKey: string;
  fieldKey: string;
  fieldName: string;
  previousValue: any;
  newValue: any;
  panel: 'admin' | 'company' | 'candidate';
  companyId?: string;       // Se for config de empresa
  candidateId?: string;     // Se for config de candidato
}
```

### Tabelas no Banco

| Tabela | Descrição |
|--------|-----------|
| `config_categories` | Categorias de configuração |
| `config_fields` | Definição dos campos |
| `config_values_admin` | Valores das configs do admin |
| `config_values_company` | Valores das configs por empresa |
| `config_values_candidate` | Valores das configs por candidato |
| `config_history` | Histórico de alterações |

---

## Critérios de Aceitação

### RF-001 a RF-009: Layout e Navegação

```gherkin
DADO que o usuário acessa a página de Configurações
QUANDO a página carrega
ENTÃO deve exibir header com título e botão Histórico
  E campo de busca abaixo do header
  E sidebar com categorias à esquerda
  E área de conteúdo à direita

DADO que o usuário clica em uma categoria na sidebar
QUANDO a categoria tem subcategorias
ENTÃO deve expandir mostrando as subcategorias

DADO que o usuário clica em uma subcategoria
QUANDO a ação é executada
ENTÃO a área de conteúdo deve mostrar os campos da subcategoria
  E a subcategoria deve ficar destacada na sidebar
```

### RF-017 a RF-020: Busca

```gherkin
DADO que o usuário digita "email" na busca
QUANDO há categorias/campos relacionados
ENTÃO a sidebar deve filtrar mostrando apenas matches
  E destacar o termo buscado

DADO que a busca não encontra resultados
QUANDO o usuário visualiza
ENTÃO deve exibir "Nenhuma configuração encontrada"
```

### RF-021 a RF-024: Histórico

```gherkin
DADO que o usuário clica em "Histórico"
QUANDO o modal abre
ENTÃO deve listar alterações recentes
  E cada entrada deve mostrar data, usuário, campo e valores

DADO que o usuário filtra por "Última semana"
QUANDO aplica o filtro
ENTÃO deve mostrar apenas alterações da última semana
```

### RF-025 a RF-027: Restaurar Padrão

```gherkin
DADO que o usuário clica em "Restaurar Padrão"
QUANDO o modal de confirmação aparece
  E o usuário confirma
ENTÃO os campos da seção devem voltar aos valores padrão
  E a ação deve ser registrada no histórico
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Estrutura de dados e banco | 5-7 |
| 2 | Componentes base (layout, sidebar, formulários) | 6-8 |
| 3 | Página de Configurações - Admin | 4-6 |
| 4 | Página de Configurações - Empresa e Candidato | 6-8 |
| 5 | Busca, histórico e refinamentos | 4-5 |

### Detalhamento das Fases

#### Fase 1: Estrutura de Dados

**Objetivo:** Criar modelo de dados e tabelas no banco

**Ações:**
- [ ] Definir interfaces TypeScript
- [ ] Criar migrations para tabelas de configuração
- [ ] Criar seed com categorias, subcategorias e campos de cada painel
- [ ] Implementar API/services para CRUD de configurações
- [ ] Implementar registro de histórico

**Validação:** APIs retornam estrutura de configurações corretamente

#### Fase 2: Componentes Base

**Objetivo:** Criar componentes reutilizáveis

**Ações:**
- [ ] Componente `<ConfigLayout />` (header + busca + duas colunas)
- [ ] Componente `<ConfigSidebar />` (categorias accordion)
- [ ] Componente `<ConfigContent />` (título + descrição + formulário)
- [ ] Componentes de campo: `<ConfigTextField />`, `<ConfigToggle />`, `<ConfigSelect />`, `<ConfigColorPicker />`, `<ConfigImageUpload />`
- [ ] Componente `<ConfigHistoryModal />`
- [ ] Hook `useConfig()` para gerenciar estado

**Validação:** Componentes renderizam corretamente em isolamento

#### Fase 3: Configurações Admin

**Objetivo:** Implementar página completa do Admin

**Ações:**
- [ ] Criar rota `/admin/configuracoes`
- [ ] Adicionar item no menu lateral (seção Administração)
- [ ] Implementar todas as categorias do Admin
- [ ] Implementar salvamento (auto-save ou botão)
- [ ] Implementar restaurar padrão
- [ ] Testar permissões

**Validação:** Admin consegue visualizar e editar todas as configurações

#### Fase 4: Configurações Empresa e Candidato

**Objetivo:** Implementar páginas dos outros painéis

**Ações:**
- [ ] Criar rota `/empresa/configuracoes`
- [ ] Criar rota `/candidato/configuracoes`
- [ ] Adicionar itens nos menus laterais
- [ ] Implementar categorias específicas de cada painel
- [ ] Garantir isolamento de dados (empresa X só vê configs de X)

**Validação:** Cada painel exibe apenas suas configurações

#### Fase 5: Busca, Histórico e Refinamentos

**Objetivo:** Finalizar funcionalidades avançadas

**Ações:**
- [ ] Implementar busca global com highlight
- [ ] Implementar modal de histórico com filtros
- [ ] Ajustar responsividade mobile
- [ ] Adicionar loading states e feedback visual
- [ ] Testes E2E

**Validação:** Busca e histórico funcionam corretamente

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| - | Nenhuma dependência crítica | - |

### Serviços Externos

Nenhum serviço externo necessário.

### Decisões Pendentes

- [ ] Definir se salvamento é automático (debounce) ou manual (botão)
- [ ] Definir tempo de retenção do histórico

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Configurações de API keys | Sensível | Criptografia, mascarar exibição |
| Configurações de integração | Sensível | Requer confirmação de senha |
| Preferências do candidato | PII | Isolamento por usuário |

### Autenticação e Autorização

- Admin: Acesso total às configurações do sistema
- Empresa: Acesso apenas às configurações da própria empresa
- Candidato: Acesso apenas às próprias preferências
- Configurações sensíveis exigem re-autenticação

### Auditoria

- Todas as alterações são registradas com timestamp, usuário e valores
- Histórico não pode ser deletado (apenas admin master)
- Logs de acesso às configurações sensíveis

---

## Fluxos de Usuário

### Fluxo Principal: Editar Configuração

```
[Usuário no Painel]
      │
      ▼
[Menu → Configurações]
      │
      ▼
[Página carrega com primeira categoria]
      │
      ▼
[Navega pela sidebar]
      │
      ▼
[Seleciona subcategoria]
      │
      ▼
[Edita campo no formulário]
      │
      ▼
[Salvamento automático ou clica Salvar]
      │
      ▼
[Toast de confirmação]
```

### Fluxo: Buscar Configuração

```
[Página de Configurações]
      │
      ▼
[Digita termo na busca]
      │
      ▼
[Sidebar filtra em tempo real]
      │
      ▼
[Clica no resultado]
      │
      ▼
[Navega para seção/campo]
```

### Fluxo: Visualizar Histórico

```
[Página de Configurações]
      │
      ▼
[Clica botão Histórico]
      │
      ▼
[Modal abre com lista]
      │
      ▼
[Aplica filtros se necessário]
      │
      ▼
[Visualiza alterações]
```

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. ESTE É UM PRD GRANDE:**
> - Implemente fase por fase
> - Valide cada fase antes de prosseguir
> - Priorize o painel Admin primeiro (Fase 3)
> - Reutilize componentes para Empresa e Candidato (Fase 4)

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

**Codinomes:** Sugestão para este PRD: "Settings", "Control", "Preferences".

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
| **Componentização** | Criar componentes reutilizáveis para os três painéis |
| **Isolamento de dados** | Garantir que cada painel veja apenas suas configs |
| **Fail gracefully** | Se uma config falhar ao salvar, não perder outras |
| **Feedback visual** | Sempre informar o usuário sobre ações (toast, loading) |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Sidebar** | Usar Radix UI Accordion ou similar |
| **Formulários** | Usar React Hook Form + Zod para validação |
| **Auto-save** | Debounce de 1-2 segundos após última alteração |
| **Toast** | Usar sistema de toast existente no projeto |
| **Histórico** | Paginação server-side (10-20 itens por página) |
| **Busca** | Client-side para configurações, server-side para histórico |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Criar página separada para cada categoria (deve ser SPA com navegação interna) |
| Hardcodar categorias/campos no frontend (buscar do banco ou config) |
| Salvar configurações sem validação server-side |
| Permitir que empresa A veja/edite configs de empresa B |
| Ignorar histórico de alterações (é requisito de auditoria) |
| Implementar tudo de uma vez (seguir as fases) |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ CONCLUIDO (Fase Admin) |
| **Data de Implementação** | 18/01/2026 |
| **Versão do App** | 0.41.0 |
| **Implementado por** | Claude Opus 4.5 via Claude Code |
| **Observações** | Implementada Fase 3 (Admin Settings). Fases 4 e 5 (Empresa/Candidato) pendentes para PRDs futuros. |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 18/01/2026 | v1 | Criação inicial |
| 18/01/2026 | v2 | Implementação da Fase Admin (Settings completo) |

---

**AILA - Sistemas Inteligentes**
