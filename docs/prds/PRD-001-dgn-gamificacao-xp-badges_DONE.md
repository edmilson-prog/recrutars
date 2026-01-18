# PRD-001-dgn: Sistema de Gamificação - XP, Badges e Níveis

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar sistema de gamificação com XP, badges, níveis e streaks para aumentar engajamento de candidatos |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Média |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 15+ arquivos, lógica de negócio complexa, múltiplos componentes visuais, persistência de estado |

---

## Contexto do Problema

Plataformas de recrutamento tradicionais sofrem com baixo engajamento de candidatos após o cadastro inicial. Candidatos criam perfil, aplicam para algumas vagas e abandonam a plataforma. A falta de incentivos para manter o perfil atualizado, completar testes comportamentais e retornar regularmente resulta em dados desatualizados e menor qualidade de matching.

Estudos mostram que gamificação aumenta engajamento em até 43% (caso Duolingo). O LinkedIn comprovou que badges de skill assessment aumentam chances de contratação em 30%. A RecrutaRS precisa de mecanismos que incentivem candidatos a completar perfil, realizar testes Gauge-Pro, manter-se ativos e retornar regularmente.

O diferencial competitivo está em criar uma gamificação **ética e significativa** — focada em "você melhorou X%" ao invés de rankings competitivos que podem gerar ansiedade em candidatos já sob stress de busca de emprego.

---

## Conceito da Solução

### Situação Atual (As-Is)

```
┌─────────────────────────────────────────────────────────────────┐
│ ESTADO ATUAL                                                    │
├─────────────────────────────────────────────────────────────────┤
│ • Barra de progresso simples para completude de perfil          │
│ • Sem incentivos para completar testes comportamentais          │
│ • Sem reconhecimento de conquistas                              │
│ • Sem motivo para retornar diariamente                          │
│ • Perfis abandonados após cadastro                              │
│ • Candidatos não sabem "próximos passos"                        │
└─────────────────────────────────────────────────────────────────┘
```

### Situação Desejada (To-Be)

```
┌─────────────────────────────────────────────────────────────────┐
│ ESTADO DESEJADO                                                 │
├─────────────────────────────────────────────────────────────────┤
│ • Sistema de XP com pontos por ações significativas             │
│ • Níveis de candidato (Iniciante → Expert)                      │
│ • Badges de conquista visíveis no perfil                        │
│ • Streak de login com proteções (freeze)                        │
│ • Progress ring gamificado para completude                      │
│ • Notificações de conquistas desbloqueadas                      │
│ • Seção "Próximas Conquistas" orientando ações                  │
│ • Celebrações visuais ao subir de nível                         │
└─────────────────────────────────────────────────────────────────┘
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Leaderboard público competitivo | Pode gerar ansiedade em candidatos sob stress |
| Gamificação apenas visual (sem persistência) | Não criaria hábito de retorno |
| Sistema de pontos complexo demais | Confuso para usuários, difícil de balancear |

---

## Escopo

### Incluído

- ✅ Sistema de XP com pontuação por ações
- ✅ 5 níveis de candidato com thresholds definidos
- ✅ 15-20 badges iniciais organizados por categoria
- ✅ Sistema de streak com freeze e recuperação
- ✅ Progress ring animado para completude de perfil
- ✅ Componente de exibição de nível atual
- ✅ Galeria de badges no perfil do candidato
- ✅ Seção "Próximas Conquistas" com dicas
- ✅ Notificações/toasts ao desbloquear conquistas
- ✅ Celebração visual ao subir de nível (confetti)
- ✅ Persistência em localStorage (dados mockados)
- ✅ Hook useGamification() para gerenciar estado

### Excluído

- ❌ Leaderboards públicos (pode ser PRD futuro)
- ❌ Integração com backend real (apenas mock)
- ❌ Gamificação para empresas (foco em candidatos)
- ❌ Sistema de recompensas monetárias
- ❌ Competição entre candidatos
- ❌ Badges pagos ou premium

---

## Requisitos Funcionais

### Sistema de XP

- **RF-001:** Cada ação significativa deve conceder XP conforme tabela de pontuação
- **RF-002:** Tabela de XP deve incluir: login diário (10 XP), perfil completo (100 XP), teste Gauge-Pro (200 XP), candidatura enviada (50 XP), entrevista agendada (150 XP)
- **RF-003:** XP acumulado deve ser exibido no header/sidebar do candidato
- **RF-004:** Ao ganhar XP, deve haver feedback visual (animação de +XP)
- **RF-005:** XP não pode ser negativo ou removido

### Níveis

- **RF-006:** Sistema deve ter 5 níveis: Iniciante (0-99 XP), Explorador (100-499 XP), Candidato Ativo (500-1499 XP), Profissional (1500-4999 XP), Expert (5000+ XP)
- **RF-007:** Cada nível deve ter nome, ícone e cor distintivos
- **RF-008:** Ao atingir novo nível, deve disparar celebração visual (confetti)
- **RF-009:** Nível atual deve ser visível no perfil público do candidato
- **RF-010:** Progress bar deve mostrar progresso até próximo nível

### Badges

- **RF-011:** Sistema deve ter mínimo 15 badges organizados em categorias
- **RF-012:** Categorias de badges: Perfil, Atividade, Testes, Candidaturas, Especiais
- **RF-013:** Cada badge deve ter: id, nome, descrição, ícone, critério de desbloqueio, raridade
- **RF-014:** Raridades: Comum, Incomum, Raro, Épico, Lendário
- **RF-015:** Badges desbloqueados devem aparecer coloridos; bloqueados em cinza
- **RF-016:** Ao desbloquear badge, deve exibir notificação/modal de conquista
- **RF-017:** Badges lendários devem ter animação especial ao desbloquear

### Badges Específicos (Mínimo Inicial)

- **RF-018:** Badge "Primeiro Passo" - Completar cadastro básico (Comum)
- **RF-019:** Badge "Perfil Completo" - 100% de completude (Incomum)
- **RF-020:** Badge "Autoconhecimento" - Completar teste Gauge-Pro (Raro)
- **RF-021:** Badge "Candidato Ativo" - Enviar 5 candidaturas (Incomum)
- **RF-022:** Badge "Persistente" - Enviar 20 candidaturas (Raro)
- **RF-023:** Badge "Em Alta" - Receber 3 visualizações de empresa (Incomum)
- **RF-024:** Badge "Streak 7" - Manter streak de 7 dias (Incomum)
- **RF-025:** Badge "Streak 30" - Manter streak de 30 dias (Raro)
- **RF-026:** Badge "Streak 100" - Manter streak de 100 dias (Épico)
- **RF-027:** Badge "Entrevistado" - Receber convite para entrevista (Raro)
- **RF-028:** Badge "Proposta" - Receber proposta de emprego (Épico)
- **RF-029:** Badge "Contratado" - Ser contratado via plataforma (Lendário)
- **RF-030:** Badge "Madrugador" - Acessar antes das 7h (Comum)
- **RF-031:** Badge "Coruja" - Acessar após 23h (Comum)
- **RF-032:** Badge "Explorador" - Visualizar 50 vagas diferentes (Incomum)

### Sistema de Streak

- **RF-033:** Streak deve contar dias consecutivos de login
- **RF-034:** Login deve ser contado uma vez por dia (não múltiplas vezes)
- **RF-035:** Streak deve resetar se usuário não logar por mais de 48h
- **RF-036:** Usuário deve ter 1 "streak freeze" gratuito por semana
- **RF-037:** Streak freeze deve ser ativado automaticamente após 24h sem login
- **RF-038:** Exibir contador de streak atual no dashboard
- **RF-039:** Exibir calendário visual dos últimos 7-30 dias de atividade

### Componentes Visuais

- **RF-040:** Progress Ring deve mostrar completude de perfil com animação
- **RF-041:** Progress Ring deve ter cor gradiente baseada no percentual
- **RF-042:** Card de Nível deve mostrar nível atual, XP e progresso para próximo
- **RF-043:** Galeria de Badges deve ser grid responsivo com hover effects
- **RF-044:** Badge card deve mostrar ícone, nome, raridade e status (locked/unlocked)
- **RF-045:** Seção "Próximas Conquistas" deve listar 3 badges mais próximos de desbloquear

### Notificações e Feedback

- **RF-046:** Ao desbloquear badge, exibir toast com nome e descrição
- **RF-047:** Ao subir de nível, exibir modal de celebração com confetti
- **RF-048:** Ao ganhar XP, exibir animação de "+XX XP" flutuante
- **RF-049:** Notificações de gamificação não devem interromper fluxos críticos

### Persistência

- **RF-050:** Estado de gamificação deve persistir em localStorage
- **RF-051:** Estrutura deve incluir: xp, level, badges[], streak, lastLogin, streakFreezes
- **RF-052:** Hook useGamification() deve expor: state, addXP(), checkBadge(), getNextBadges()

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Cálculos de XP e badges devem ser instantâneos (<50ms)
- **RNF-002 (UX):** Notificações de gamificação não devem bloquear interação por mais de 3s
- **RNF-003 (Ética):** Linguagem deve focar em progresso pessoal, não comparação
- **RNF-004 (Acessibilidade):** Badges devem ter alt text descritivo
- **RNF-005 (Responsividade):** Galeria de badges deve funcionar em mobile
- **RNF-006 (Manutenibilidade):** Adicionar novos badges deve exigir apenas edição de array de config

---

## Critérios de Aceitação

### RF-001/RF-005: Sistema de XP

```gherkin
DADO que o candidato está logado
QUANDO ele completa uma ação que concede XP (ex: enviar candidatura)
ENTÃO seu XP total deve aumentar conforme tabela
  E deve aparecer animação de "+50 XP" na tela
  E o novo total deve refletir imediatamente no header
```

```gherkin
DADO que o candidato tem 450 XP (nível Explorador)
QUANDO ele ganha 100 XP por completar teste
ENTÃO seu XP deve ir para 550 (nível Candidato Ativo)
  E deve disparar celebração de novo nível
  E o nível exibido deve atualizar para "Candidato Ativo"
```

### RF-011/RF-017: Badges

```gherkin
DADO que o candidato não tem o badge "Autoconhecimento"
QUANDO ele completa o teste Gauge-Pro
ENTÃO o badge "Autoconhecimento" deve ser desbloqueado
  E deve aparecer notificação de conquista
  E o badge deve aparecer colorido na galeria
```

```gherkin
DADO que o candidato visualiza a galeria de badges
QUANDO ele passa o mouse sobre um badge bloqueado
ENTÃO deve exibir tooltip com critério de desbloqueio
  E o badge deve estar em escala de cinza
```

### RF-033/RF-039: Streak

```gherkin
DADO que o candidato tem streak de 5 dias
QUANDO ele loga no dia 6
ENTÃO o streak deve aumentar para 6
  E o calendário visual deve mostrar 6 dias consecutivos marcados
```

```gherkin
DADO que o candidato tem streak de 10 dias
  E não logou ontem
  E tem 1 streak freeze disponível
QUANDO ele loga hoje
ENTÃO o streak freeze deve ser consumido automaticamente
  E o streak deve permanecer em 10
  E deve exibir notificação "Streak protegido!"
```

```gherkin
DADO que o candidato tem streak de 10 dias
  E não logou por 48h
  E não tem streak freeze disponível
QUANDO ele loga hoje
ENTÃO o streak deve resetar para 1
  E deve exibir mensagem encorajadora "Novo começo! Vamos construir um novo streak"
```

### Cenários de Erro

```gherkin
DADO que o localStorage está cheio ou indisponível
QUANDO o sistema tenta salvar estado de gamificação
ENTÃO deve falhar silenciosamente
  E não deve quebrar a aplicação
  E deve logar erro no console
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Modelo de Dados e Hook Base | 3-4 |
| 2 | Sistema de XP e Níveis | 3-4 |
| 3 | Sistema de Badges | 4-5 |
| 4 | Sistema de Streak | 2-3 |
| 5 | Componentes Visuais e Integração | 6-8 |

### Detalhamento das Fases

#### Fase 1: Modelo de Dados e Hook Base

**Objetivo:** Estrutura de dados e hook principal

**Ações:**
- [ ] Criar `src/types/gamification.ts` com tipos TypeScript
- [ ] Criar `src/data/gamificationConfig.ts` com tabelas de XP, níveis, badges
- [ ] Criar `src/hooks/useGamification.ts` com estado e funções base
- [ ] Implementar persistência em localStorage
- [ ] Criar contexto GamificationProvider se necessário

**Validação:** Hook exporta estado e funções, persiste em localStorage

#### Fase 2: Sistema de XP e Níveis

**Objetivo:** Lógica de pontuação e progressão

**Ações:**
- [ ] Implementar função addXP() com validações
- [ ] Implementar cálculo de nível baseado em XP
- [ ] Implementar detecção de level up
- [ ] Criar componente LevelBadge para exibir nível atual
- [ ] Criar componente XPProgress para barra de progresso
- [ ] Integrar com sistema de celebrações (PRD-000-dgn)

**Validação:** XP incrementa corretamente, level up dispara celebração

#### Fase 3: Sistema de Badges

**Objetivo:** Conquistas e desbloqueios

**Ações:**
- [ ] Definir array completo de 15+ badges em config
- [ ] Implementar função checkBadge() para verificar critérios
- [ ] Implementar função unlockBadge() com notificação
- [ ] Criar componente BadgeCard (locked/unlocked states)
- [ ] Criar componente BadgeGallery (grid responsivo)
- [ ] Criar componente BadgeUnlockModal para conquistas

**Validação:** Badges desbloqueiam conforme critérios, galeria renderiza

#### Fase 4: Sistema de Streak

**Objetivo:** Engajamento diário

**Ações:**
- [ ] Implementar lógica de contagem de streak
- [ ] Implementar streak freeze automático
- [ ] Criar componente StreakCounter visual
- [ ] Criar componente StreakCalendar (últimos 7-30 dias)
- [ ] Integrar verificação de streak no login

**Validação:** Streak conta corretamente, freeze funciona

#### Fase 5: Componentes Visuais e Integração

**Objetivo:** UI completa e integração nos dashboards

**Ações:**
- [ ] Criar componente ProgressRing animado
- [ ] Criar componente NextAchievements (próximas conquistas)
- [ ] Criar componente XPGainAnimation (+XP flutuante)
- [ ] Integrar gamificação no Dashboard do Candidato
- [ ] Adicionar XP/nível no header/sidebar
- [ ] Criar página/seção dedicada de conquistas
- [ ] Testar todos os fluxos de desbloqueio

**Validação:** Dashboard mostra gamificação, todas as animações funcionam

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-000-dgn | Design System e Microinterações | ⏳ Pendente |
| PRD-008 | Teste Comportamental (para badge Autoconhecimento) | ✅ Concluído |

### Bibliotecas Necessárias

| Biblioteca | Uso | Status |
|------------|-----|--------|
| framer-motion | Animações | ✅ Disponível |
| lucide-react | Ícones de badges | ✅ Disponível |
| date-fns | Cálculos de data para streak | ⏳ A instalar |

### Decisões Pendentes

- [ ] Definir se badges aparecem no perfil público para empresas verem

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| XP e badges do usuário | Dados de perfil | localStorage (client-side) |

### Autenticação e Autorização

Gamificação é vinculada ao usuário logado. Sem autenticação real (mock), dados ficam apenas no browser do usuário.

### Auditoria

Não há requisitos de auditoria para dados de gamificação mockados.

---

## Fluxos de Usuário

### Fluxo: Primeiro Acesso

```
[Candidato faz cadastro]
    ──▶ [Ganha badge "Primeiro Passo" + 50 XP]
    ──▶ [Toast de conquista aparece]
    ──▶ [Dashboard mostra nível "Iniciante"]
    ──▶ [Seção "Próximas Conquistas" sugere completar perfil]
```

### Fluxo: Completar Teste Gauge-Pro

```
[Candidato inicia teste]
    ──▶ [Completa todas as perguntas]
    ──▶ [Resultado é exibido]
    ──▶ [Ganha badge "Autoconhecimento" + 200 XP]
    ──▶ [Se atingiu novo nível, celebração com confetti]
    ──▶ [Toast de conquista aparece]
```

### Fluxo: Manutenção de Streak

```
[Candidato loga após 1 dia]
    ──▶ [Streak incrementa]
    ──▶ [Se streak = 7, desbloqueia badge "Streak 7"]
    ──▶ [StreakCounter atualiza no dashboard]
    ──▶ [Ganha 10 XP de login diário]
```

### Fluxo: Perda de Streak com Freeze

```
[Candidato não loga por 24h]
    ──▶ [Sistema verifica streak freeze disponível]
    ──▶ [Freeze é consumido automaticamente]
    ──▶ [No próximo login, toast "Streak protegido!"]
    ──▶ [Streak mantém valor anterior]
```

---

## Modelo de Dados

### Estrutura de Estado (TypeScript)

```typescript
interface GamificationState {
  xp: number;
  level: Level;
  badges: UnlockedBadge[];
  streak: {
    current: number;
    lastLoginDate: string; // ISO date
    freezesAvailable: number;
    freezeUsedThisWeek: boolean;
  };
  stats: {
    totalApplications: number;
    totalJobsViewed: number;
    totalInterviews: number;
    profileCompleteness: number;
    testCompleted: boolean;
  };
}

interface Level {
  id: number;
  name: string;
  minXP: number;
  maxXP: number;
  icon: string;
  color: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'profile' | 'activity' | 'tests' | 'applications' | 'special';
  criteria: BadgeCriteria;
}

interface UnlockedBadge {
  badgeId: string;
  unlockedAt: string; // ISO date
}
```

### Tabela de XP

| Ação | XP | Frequência |
|------|-----|------------|
| Login diário | 10 | 1x/dia |
| Completar campo do perfil | 5 | Por campo |
| Perfil 100% completo | 100 | 1x |
| Completar teste Gauge-Pro | 200 | 1x |
| Enviar candidatura | 50 | Ilimitado |
| Visualizar vaga | 2 | Ilimitado |
| Receber visualização de empresa | 20 | Ilimitado |
| Receber convite de entrevista | 150 | Ilimitado |
| Receber proposta | 300 | Ilimitado |

### Tabela de Níveis

| Nível | Nome | XP Mínimo | XP Máximo | Cor |
|-------|------|-----------|-----------|-----|
| 1 | Iniciante | 0 | 99 | Cinza |
| 2 | Explorador | 100 | 499 | Verde |
| 3 | Candidato Ativo | 500 | 1.499 | Azul |
| 4 | Profissional | 1.500 | 4.999 | Roxo |
| 5 | Expert | 5.000 | ∞ | Dourado |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Renomear este arquivo adicionando `_DONE` ao final
>   Ex: `PRD-001-dgn-gamificacao-xp-badges_DONE.md`
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinome sugerido:** `Quest` (representa a jornada gamificada do candidato)

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
| **Gamificação ética** | Focar em progresso pessoal, não competição |
| **Feedback positivo** | Sempre celebrar conquistas, nunca punir |
| **Fail gracefully** | Se localStorage falhar, app continua funcionando |
| **Configurável** | Badges e XP devem ser facilmente ajustáveis |
| **Extensível** | Fácil adicionar novos badges no futuro |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Persistência** | Usar localStorage com try/catch para falhas |
| **Datas** | Usar date-fns para cálculos de streak |
| **Animações** | Reutilizar sistema do PRD-000-dgn |
| **Celebrações** | Usar confetti do PRD-000-dgn para level up |
| **Linguagem** | Sempre positiva ("Você conquistou!" não "Você ainda não tem...") |
| **Badges** | Definir todos em array de config, não hardcoded em componentes |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Criar rankings públicos competitivos |
| Usar linguagem negativa ("Você perdeu o streak") |
| Remover XP do usuário por qualquer motivo |
| Hardcodar badges nos componentes - usar config |
| Bloquear funcionalidades baseado em nível |
| Criar badges impossíveis ou frustrantes |
| Fazer gamificação parecer manipulativa |
| Spam de notificações - máximo 1 por ação |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 15/01/2026 |
| **Versão do App** | 0.31.0 (Quest) |
| **Implementado por** | Claude Opus 4.5 via Claude Code |
| **Observações** | Sistema completo com 17 badges, 5 níveis, streak com freeze. Componentes prontos para integração nos dashboards. |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 15/01/2026 | v1 | Criação inicial |
| 15/01/2026 | v2 | Implementação completa |

---

**AILA - Sistemas Inteligentes**
