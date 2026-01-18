# PRD-026: Visibilidade do Perfil (Candidato)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Permitir que candidatos controlem como seu perfil aparece para empresas |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 2 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | Lógica de visibilidade, impacto em múltiplas áreas, configuração persistente |

---

## Contexto do Problema

Candidatos têm diferentes necessidades de privacidade. Alguns querem máxima exposição para receber mais oportunidades, outros preferem anonimato enquanto exploram o mercado (especialmente se estão empregados), e alguns querem controle total sobre quando são visíveis.

### Cenários de Uso

| Cenário | Modo Ideal |
|---------|------------|
| Desempregado buscando ativamente | Público |
| Empregado explorando mercado discretamente | Parcial (Anônimo) |
| Apenas interessado em vagas específicas | Privado |

---

## Conceito da Solução

### Localização na Interface

A configuração de visibilidade fica em: **Configurações > Privacidade** ou como seção dedicada.

### Tela de Configuração

```
┌──────────────────────────────────────────────────────────────────┐
│  🔒 Modo de Visibilidade                                         │
│  Escolha como deseja aparecer nas buscas do sistema              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ● 🌐 Público (Padrão)                                      │  │
│  │                                                            │  │
│  │   Seu perfil é visível em todas as buscas da IA e das     │  │
│  │   empresas. Você receberá mais oportunidades e convites   │  │
│  │   diretos. Informações como nome, foto, experiências e    │  │
│  │   habilidades ficam disponíveis para visualização.        │  │
│  │                                                            │  │
│  │   ✅ Máxima visibilidade                                   │  │
│  │   ✅ Recebe convites diretos                               │  │
│  │   ✅ Aparece em recomendações da IA                        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ○ 👁️ Parcial (Anônimo) ⓘ                                   │  │
│  │                                                            │  │
│  │   A IA usa seu perfil completo para ranqueamento e        │  │
│  │   recomendações, mas oculta informações pessoais          │  │
│  │   identificáveis (nome, foto e empresa atual) das         │  │
│  │   empresas.                                               │  │
│  │                                                            │  │
│  │   ┌──────────────────────────────────────────────────────┐│  │
│  │   │ 💡 Como funciona:                                    ││  │
│  │   │                                                      ││  │
│  │   │ • As empresas veem apenas "Perfil Anônimo #123"     ││  │
│  │   │ • Suas habilidades e experiências são visíveis      ││  │
│  │   │ • Seu nome só é revelado após aceitar um convite    ││  │
│  │   └──────────────────────────────────────────────────────┘│  │
│  │                                                            │  │
│  │   ⚠️ Ideal para quem está empregado e quer explorar       │  │
│  │      o mercado discretamente                              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ○ 🔒 Privado                                               │  │
│  │                                                            │  │
│  │   Seu perfil não aparece em nenhuma busca ou recomendação │  │
│  │   automática do sistema. Você só será visível para        │  │
│  │   empresas quando se candidatar ativamente a uma vaga.    │  │
│  │                                                            │  │
│  │   ┌──────────────────────────────────────────────────────┐│  │
│  │   │ ⚠️ Atenção:                                          ││  │
│  │   │                                                      ││  │
│  │   │ Neste modo, você não receberá convites diretos      ││  │
│  │   │ nem recomendações personalizadas da IA.             ││  │
│  │   └──────────────────────────────────────────────────────┘│  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  [Salvar Configurações]  [Cancelar]                        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  🛡️ Dica de Segurança                                           │
│                                                                  │
│  Independente do modo escolhido, nunca compartilhamos seus      │
│  dados pessoais com terceiros sem sua autorização. Todas as     │
│  configurações podem ser alteradas a qualquer momento.          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Comparativo de Modos

```
┌──────────────────────────────────────────────────────────────────┐
│  Comparativo de Modos de Visibilidade                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                          Público   Parcial   Privado             │
│                          ───────   ───────   ───────             │
│  Aparece nas buscas        ✅        ✅        ❌                │
│  Recebe convites           ✅        ✅        ❌                │
│  Recomendações da IA       ✅        ✅        ❌                │
│  Nome visível              ✅        ❌¹       ❌²               │
│  Foto visível              ✅        ❌        ❌²               │
│  Habilidades visíveis      ✅        ✅        ❌²               │
│  Experiências visíveis     ✅        ✅        ❌²               │
│  Empresa atual visível     ✅        ❌        ❌²               │
│                                                                  │
│  ¹ Revelado após aceitar convite                                │
│  ² Visível apenas ao se candidatar                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Como Empresa Vê Perfil Anônimo

```
┌──────────────────────────────────────────────────────────────────┐
│  Banco de Talentos                                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ┌──────┐                                                  │  │
│  │  │  👤  │  Perfil Anônimo #4721                           │  │
│  │  │ anon │  Desenvolvedor Full Stack                       │  │
│  │  └──────┘  📍 São Paulo, SP                               │  │
│  │                                                            │  │
│  │  ⭐ 92% match com sua vaga                                 │  │
│  │                                                            │  │
│  │  Habilidades                                               │  │
│  │  [React ●●●●●] [Node.js ●●●●○] [TypeScript ●●●●○]         │  │
│  │                                                            │  │
│  │  Experiência                                               │  │
│  │  • 5 anos como Desenvolvedor Full Stack                   │  │
│  │  • Experiência em fintechs e e-commerce                   │  │
│  │                                                            │  │
│  │  📊 DISC: Analítico (C)                                    │  │
│  │                                                            │  │
│  │  [📩 Enviar Convite]  [👁️ Ver Perfil Completo]            │  │
│  │                                                            │  │
│  │  ℹ️ Este candidato está em modo anônimo. Seus dados       │  │
│  │     pessoais serão revelados se ele aceitar seu convite.  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Fluxo de Revelação (Modo Parcial)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Empresa    │────▶│  Candidato  │────▶│  Revelação  │
│  envia      │     │  aceita     │     │  do perfil  │
│  convite    │     │  convite    │     │  completo   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
   Vê apenas          Recebe              Empresa vê
   "Anônimo #123"     notificação         nome, foto,
   + habilidades      do convite          empresa atual
```

---

## Escopo

### Incluído

- ✅ Configuração de modo de visibilidade
- ✅ 3 modos: Público, Parcial (Anônimo), Privado
- ✅ Seleção via radio buttons com descrições detalhadas
- ✅ Alertas e dicas sobre cada modo
- ✅ Persistência da configuração
- ✅ Impacto nas buscas do Banco de Talentos (empresa)
- ✅ Geração de identificador anônimo (ex: "Perfil Anônimo #4721")
- ✅ Indicador visual no perfil para empresa (modo anônimo)
- ✅ Lógica de revelação após aceitar convite

### Excluído

- ❌ Configuração granular por campo (ex: esconder só salário)
- ❌ Bloqueio de empresas específicas
- ❌ Histórico de quem visualizou perfil
- ❌ Modo temporário com data de expiração

---

## Requisitos Funcionais

### Configuração

- **RF-001:** Tela de configuração em Configurações > Privacidade
- **RF-002:** 3 opções mutuamente exclusivas (radio buttons)
- **RF-003:** Descrição detalhada de cada modo
- **RF-004:** Destaque visual para o modo selecionado
- **RF-005:** Botão "Salvar Configurações" com confirmação
- **RF-006:** Modo padrão para novos usuários: Público

### Modo Público

- **RF-007:** Perfil aparece em todas as buscas
- **RF-008:** Todos os dados visíveis para empresas
- **RF-009:** Recebe convites diretos
- **RF-010:** Aparece em recomendações da IA

### Modo Parcial (Anônimo)

- **RF-011:** Perfil aparece nas buscas como "Perfil Anônimo #XXXX"
- **RF-012:** Gerar identificador único por candidato
- **RF-013:** Ocultar: nome, foto, empresa atual
- **RF-014:** Mostrar: habilidades, experiências (sem empresa), formação, DISC
- **RF-015:** Recebe convites (empresa não sabe quem é)
- **RF-016:** Ao aceitar convite, revelar dados completos para aquela empresa

### Modo Privado

- **RF-017:** Perfil NÃO aparece em buscas
- **RF-018:** NÃO recebe convites diretos
- **RF-019:** NÃO aparece em recomendações
- **RF-020:** Dados visíveis apenas ao se candidatar a uma vaga

### Impacto no Sistema

- **RF-021:** Banco de Talentos (Empresa) deve respeitar modo de visibilidade
- **RF-022:** Exibir indicador "Perfil Anônimo" quando aplicável
- **RF-023:** Tooltip explicativo para empresa sobre perfis anônimos

---

## Requisitos Não-Funcionais

- **RNF-001 (UX):** Descrições claras e não técnicas
- **RNF-002 (Segurança):** Modo de visibilidade aplicado em tempo real
- **RNF-003 (Persistência):** Configuração salva e respeitada em toda a plataforma

---

## Critérios de Aceitação

### RF-001 a RF-006: Configuração

```gherkin
DADO que o candidato acessa Configurações > Privacidade
QUANDO ele visualiza a seção "Modo de Visibilidade"
ENTÃO deve ver 3 opções (Público, Parcial, Privado)
  E deve ver descrição de cada modo
  E modo atual deve estar selecionado
  E deve poder alterar e salvar
```

### RF-011 a RF-016: Modo Parcial

```gherkin
DADO que o candidato está em modo "Parcial (Anônimo)"
QUANDO uma empresa busca no Banco de Talentos
ENTÃO deve ver "Perfil Anônimo #XXXX" no lugar do nome
  E NÃO deve ver foto do candidato
  E NÃO deve ver empresa atual
  E deve ver habilidades, experiências e DISC
  E ao enviar convite aceito, dados são revelados
```

### RF-017 a RF-020: Modo Privado

```gherkin
DADO que o candidato está em modo "Privado"
QUANDO uma empresa busca no Banco de Talentos
ENTÃO o candidato NÃO deve aparecer nos resultados
  E o candidato NÃO deve receber convites
  E o candidato NÃO deve aparecer em recomendações
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Tela de configuração | 2 |
| 2 | Lógica e impacto no sistema | 3 |

### Detalhamento das Fases

#### Fase 1: Tela de Configuração

**Objetivo:** Interface de seleção do modo

**Ações:**
- [ ] Criar componente `VisibilitySettings`
- [ ] Adicionar seção em Configurações do Candidato
- [ ] Implementar radio buttons com descrições
- [ ] Implementar salvamento com toast

**Validação:** Candidato consegue selecionar e salvar modo

#### Fase 2: Lógica e Impacto

**Objetivo:** Aplicar modo no sistema

**Ações:**
- [ ] Criar lógica de filtro no Banco de Talentos
- [ ] Implementar "Perfil Anônimo #XXXX"
- [ ] Ajustar componentes de exibição de candidato
- [ ] Implementar revelação após aceitar convite

**Validação:** Empresa vê perfis conforme modo configurado

---

## Modelo de Dados

### CandidateVisibility

```typescript
type VisibilityMode = 'public' | 'partial' | 'private';

interface CandidateSettings {
  visibilityMode: VisibilityMode;
  anonymousId: string; // "4721" - gerado uma vez
}

// Usado quando empresa visualiza candidato anônimo
interface AnonymousProfile {
  displayName: string; // "Perfil Anônimo #4721"
  skills: Skill[];
  experienceYears: number;
  experienceAreas: string[]; // sem nomes de empresas
  education: Education[];
  discProfile: string;
  location: string; // cidade/estado apenas
  // NÃO inclui: name, photo, email, phone, currentCompany
}
```

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-011 | Configurações (Candidato) | ✅ Implementado |
| PRD-014 | Banco de Talentos (Empresa) | ✅ Implementado |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.25.0 → 0.26.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.26.0] - 2026-01-XX

### Added
- Configuração de visibilidade do perfil
- Modo Público: perfil totalmente visível
- Modo Parcial (Anônimo): "Perfil Anônimo #XXXX" nas buscas
- Modo Privado: perfil oculto de buscas
- Lógica de revelação após aceitar convite
- Indicadores visuais para empresas sobre perfis anônimos
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **anonymousId** | Gerar número aleatório único (4 dígitos) ao criar conta |
| **Filtro** | Aplicar no momento da busca, não salvar dados duplicados |
| **Revelação** | Quando candidato aceita convite, marcar empresa como "revelada" |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Mostrar dados ocultos em modo anônimo (nem no HTML/console) |
| Permitir empresa "adivinhar" candidato por dados parciais |
| Resetar anonymousId (deve ser fixo por candidato) |
| Revelar dados antes do aceite do convite |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 15/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
