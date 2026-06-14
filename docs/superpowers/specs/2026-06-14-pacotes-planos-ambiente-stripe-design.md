# Refatoração: Ambiente Stripe em Pacotes & Planos

**Data:** 2026-06-14
**Status:** Aprovado (design) — pronto para plano de implementação
**Telas afetadas:** `/admin/pacotes`, `/admin/planos`
**Mockup de referência:** `.superpowers/brainstorm/mockup.html` (Abordagem A, alta fidelidade)

---

## 1. Contexto e problema

A página `/admin/pacotes` ("Pacotes de Testes") confunde os gestores porque a palavra **"Teste"** aparece com **dois significados** na mesma tela:

1. **"Pacotes de Testes"** (título) → o **produto**: testes comportamentais Gauge-Pro, cujos créditos a empresa compra.
2. **Toggle "Teste / Produção"** → o **ambiente do Stripe** (`test`/sandbox vs `live`/produção). Controla quais Product/Price IDs o card exibe e para qual ambiente o botão "Sincronizar" envia.

O gestor lê *"Pacotes de **Testes**"* e logo abaixo vê um botão *"**Teste**"*, concluindo (erradamente) que o toggle filtra "pacotes de teste vs. produção". Na prática **os mesmos pacotes aparecem nos dois modos** — só mudam IDs internos e a data de "Sync". Como trocar o toggle quase não muda nada visível, o controle parece inútil.

**Agravantes no código atual:**
- **Inconsistência entre telas:** `/admin/planos` abre em **Produção** (ordem Produção | Teste); `/admin/pacotes` abre em **Teste** (ordem Teste | Produção). Mesmo controle, comportamentos opostos (`PlansManagement.tsx:39` vs `PackagesManagement.tsx:44`).
- Toggle inline **duplicado** nas duas páginas.
- Badge "Stripe: Teste" discreto e redundante; comunica o ambiente fracamente.
- Os cards mostram o sync de **apenas um** ambiente por vez.

**Contexto de uso (validado com o usuário):** o sandbox é **episódico** ("só na criação" — valida-se um pacote novo e depois opera-se sempre em Produção). Logo, Produção é o estado normal e o controle de ambiente deve ser **secundário e inequívoco**, nunca um "filtro" competindo com a lista.

## 2. Objetivos / Não-objetivos

**Objetivos**
- Tornar **inequívoco** que o controle de ambiente é "ambiente de cobrança do Stripe", não "tipo de pacote".
- Padronizar **Produção como default** nas duas telas.
- Sinalizar de forma **forte e acessível** quando o usuário está no sandbox.
- Fazer com que trocar de ambiente **deixe de ser invisível** (mostrar o status dos dois ambientes no card).
- Eliminar a duplicação extraindo **componentes compartilhados** usados por Pacotes e Planos.

**Não-objetivos**
- Alterar modelo de dados, RLS, Edge Functions ou a lógica de sincronização.
- Mudar o fluxo de compra/checkout dos pacotes/planos.
- Reescrever os cards além do necessário para o novo bloco de sync e ações existentes.

## 3. Decisões de design (validadas)

| Decisão | Escolha |
|---|---|
| Direção visual | **Abordagem A** — Produção em foco, ambiente recolhido + banner |
| Alcance | **Pacotes + Planos** com componentes compartilhados |
| Default do ambiente | **`live` (Produção)** nas duas telas |
| Nome da página de pacotes | Título: **"Pacotes de Créditos · Gauge-Pro"** · Menu lateral: **"Pacotes de Créditos"** |
| Sinalização de cor | Produção = neutro/verde (calmo); Sandbox = âmbar (atenção). Sempre **cor + ícone + texto** |

## 4. Especificação visual

### 4.1 Seletor de ambiente (recolhido)
- Posicionado nos controles superiores, à direita (junto de "Sincronizar todos").
- Rótulo pequeno **"Ambiente Stripe"** acima do controle (deixa explícito que não é filtro de pacotes).
- Chip com LED + texto + caret:
  - **Produção:** chip verde discreto (`● Produção ▼`).
  - **Teste:** chip âmbar (`● Teste (sandbox) ▼`).
- Ao abrir (dropdown shadcn), 2 opções com descrição:
  - **Produção** — "Cobranças reais. É onde os clientes compram."
  - **Teste (sandbox)** — "Valida pacotes sem cobrar de verdade."

### 4.2 Banner de sandbox
- Renderizado **somente** quando `environment === 'test'`.
- Faixa âmbar full-width, `border-left` âmbar, ícone de alerta + texto + botão "Voltar p/ Produção".
- Texto: **"Ambiente de TESTE (sandbox) do Stripe."** As ações aqui não afetam cobranças reais — use para validar um pacote antes de publicar.

### 4.3 Card (Pacote e Plano)
- Mantém anatomia atual (faixa superior gradiente, nome + badge, status Ativo/Inativo, preço/desconto, recursos, ações).
- **Substitui** o badge único de sync por um bloco **"Sincronização Stripe"** com **2 linhas**:
  - `✓ Produção — sincronizado {data}` (verde) ou `✕ Produção — não sincronizado` (cinza).
  - `✓ Sandbox — sincronizado {data}` (verde) ou `✕ Sandbox — não sincronizado` (cinza).
  - Cada linha: ícone em "pílula" + rótulo do ambiente + status/data. Cor + ícone + texto.
- Ações existentes preservadas (Editar, Duplicar, Ativar/Desativar, Excluir, **Sincronizar**). A ação de sincronizar individual continua atuando sobre o **ambiente ativo**.

### 4.4 Estado da página
- Abre sempre em **Produção** (sem banner).
- Trocar para Sandbox: chip vira âmbar + banner aparece; os mesmos cards permanecem, refletindo o ambiente.

## 5. Arquitetura técnica

### 5.1 Componentes novos — `src/components/admin/stripe/`

**`StripeEnvironmentSelector.tsx`**
```ts
interface StripeEnvironmentSelectorProps {
  value: StripeEnvironment;            // 'live' | 'test'
  onChange: (env: StripeEnvironment) => void;
  className?: string;
}
```
- Rótulo "Ambiente Stripe" + chip (verde/âmbar) + `DropdownMenu` (shadcn) com as 2 opções descritas.
- `aria-label` no controle; opção ativa marcada; foco visível.

**`StripeEnvironmentBanner.tsx`**
```ts
interface StripeEnvironmentBannerProps {
  environment: StripeEnvironment;
  onSwitchToProduction?: () => void;
  className?: string;
}
```
- Retorna `null` se `environment === 'live'`. Caso contrário, renderiza o banner âmbar (`role="status"`).

**`StripeSyncStatus.tsx`**
```ts
interface StripeSyncStatusProps {
  liveProductId: string | null;
  liveSyncedAt: string | null;
  testProductId: string | null;
  testSyncedAt: string | null;
  className?: string;
}
```
- Renderiza o bloco de 2 linhas (Produção/Sandbox). `isSynced = !!productId`; data via `toLocaleDateString('pt-BR')`.

**`stripeEnvironmentLabels.ts`** (helper de microcopy)
```ts
export const STRIPE_ENV_LABELS: Record<StripeEnvironment, string> = {
  live: 'Produção',
  test: 'Teste (sandbox)',
};
```

### 5.2 Aplicação nas páginas
- **`PackagesManagement.tsx`**: remover o toggle inline (atualmente `~158–196`); usar `StripeEnvironmentSelector` + `StripeEnvironmentBanner`; `useState<StripeEnvironment>('live')` (era `'test'`, `:44`); título → "Pacotes de Créditos · Gauge-Pro" (`:141`); botão sincronizar todos passa a indicar o ambiente ativo (ex.: "Sincronizar todos · {label}").
- **`PackageCard.tsx`**: substituir o badge único de sync (`~138–156`) por `StripeSyncStatus`; manter "Sincronizar Stripe" no menu `⋯` (ambiente ativo).
- **`PlansManagement.tsx`**: remover o toggle inline (`~104–144`); usar os componentes compartilhados; default já é `'live'`.
- **`PlanCard.tsx`**: substituir o badge único de sync (`~109–135`) por `StripeSyncStatus`; default da prop `stripeEnvironment` `'test'→'live'` (`:34`); **preservar a ação de sincronizar** (`useSyncPlan`) sobre o ambiente ativo; manter a condição `!plan.isFree`.
- **`DashboardLayout.tsx:88`**: label `'Pacotes de Testes'` → `'Pacotes de Créditos'`.

### 5.3 Estado
- Estado do ambiente permanece **local por página** (`useState`), com default `'live'`. Sem persistência (recarregar volta a Produção — coerente com "produção é o normal"). Compartilhar o estado entre as duas telas fica como follow-up opcional.

## 6. Microcopy (pt-BR)
- `live` → **"Produção"**; `test` → **"Teste (sandbox)"** (ou "Sandbox" nas linhas do card).
- Rótulo do seletor: **"Ambiente Stripe"**.
- Banner: ver 4.2.
- "Sincronizar todos" → **"Sincronizar todos · {label do ambiente}"**.

## 7. Arquivos afetados

**Novos**
- `src/components/admin/stripe/StripeEnvironmentSelector.tsx`
- `src/components/admin/stripe/StripeEnvironmentBanner.tsx`
- `src/components/admin/stripe/StripeSyncStatus.tsx`
- `src/components/admin/stripe/stripeEnvironmentLabels.ts`

**Modificados**
- `src/pages/admin/PackagesManagement.tsx`
- `src/components/admin/packages/PackageCard.tsx`
- `src/pages/admin/PlansManagement.tsx`
- `src/components/admin/plans/PlanCard.tsx`
- `src/components/layout/DashboardLayout.tsx`

**Inalterados (confirmado):** `src/types/testPackages.ts`, `src/types/plans.ts`, serviços/Edge Functions de Stripe, migrações.

## 8. Acessibilidade (WCAG AA)
- Nunca comunicar ambiente/sync **só por cor** — sempre cor + ícone + texto.
- Contraste ≥ 4.5:1 em texto; foco visível em chip, dropdown e botões.
- Alvos de toque ≥ 44px; `cursor-pointer` em elementos clicáveis.
- Banner com `role="status"`; dropdown acessível por teclado (componente shadcn).
- Respeitar `prefers-reduced-motion` (animações dos cards já usam Framer Motion com entrada sutil).

## 9. Riscos e mitigações
- **Default `test→live` em pacotes:** alguns cards podem passar a exibir "Produção: não sincronizado" se só o sandbox foi sincronizado. É o comportamento **correto** (reflete a realidade) e fica explícito no bloco de 2 linhas.
- **Consolidar `PlanCard`:** garantir que a ação de sincronizar (hoje botão inline "Sync") não se perca ao introduzir o `StripeSyncStatus`.
- **Planos gratuitos:** manter a regra de não exibir sync quando `plan.isFree`.
- **Regressão de ações:** validar Editar/Duplicar/Ativar/Excluir/Sincronizar nas duas telas após a troca.

## 10. Critérios de aceite
- [ ] Pacotes e Planos abrem em **Produção** por padrão.
- [ ] O controle de ambiente exibe o rótulo "Ambiente Stripe" e **não** se parece com filtro de itens.
- [ ] Banner âmbar aparece **apenas** no sandbox, com cor + ícone + texto e ação de retorno.
- [ ] Todo card mostra **os dois** ambientes (Produção/Sandbox) com status de sync.
- [ ] Título da página e item do menu renomeados.
- [ ] Nenhuma mudança em dados/backend; sync continua por ambiente.
- [ ] Sem regressão nas ações dos cards.
- [ ] Os 3 componentes são compartilhados pelas duas telas (sem toggle inline duplicado).
- [ ] Contraste AA, foco visível, cor nunca isolada.

## 11. Fora de escopo / follow-ups opcionais
- Agrupar `/admin/pacotes` nas tabs de billing (junto de Planos/Assinaturas) via `adminTabConfig.ts`.
- Compartilhar o estado do ambiente entre as duas telas (contexto único).
- CRUD de templates de match (não relacionado — ver memória do projeto).
