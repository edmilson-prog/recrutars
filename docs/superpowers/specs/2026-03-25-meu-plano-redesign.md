# Redesign da Tab "Meu Plano" — Loja da Empresa

**Data:** 2026-03-25
**Escopo:** `src/pages/empresa/Packages.tsx` — TabsContent "plano"
**Motivação:** A tab "Meu Plano" não exibe opções de ciclo de pagamento e mostra apenas preço mensal, impedindo o usuário de ver descontos para períodos mais longos.

---

## Contexto

A tab "Meu Plano" dentro da página Loja (`/empresa/pacotes?tab=plano`) atualmente:
- Mostra apenas `prices.monthly` hardcoded
- Não oferece seletor de ciclo de pagamento
- Não exibe descontos (`discountPercentage`, `discountMinPeriod`)
- Não exibe preços de lançamento (`launchPrices`)
- Não exibe bônus de testes (`bonusTests`)
- Não exibe info de trial (`trialDurationDays`)
- Cards genéricos sem a identidade visual do restante da Loja
- `CheckoutButton` hardcoded para `period='monthly'`

A página pública `/planos` (Plans.tsx) já resolve o problema de ciclos com um seletor de período. A página admin (PlanCard.tsx) mostra todos os períodos simultaneamente. Nenhum dos dois padrões está presente na tab "Meu Plano" da empresa.

---

## Design Escolhido: Seletor Global + Economia (Opção B)

### 1. Card Hero — Plano Atual

Substituir o Card shadcn atual por um card hero com gradient escuro.

**Conteúdo:**
- Label "Seu Plano Atual" (uppercase, cyan)
- Nome do plano (22px, bold)
- Status badge (Ativa/Trial/Cancelada/Pagamento Pendente)
- Período atual + data de renovação
- Preço atual (32px, bold, à direita)
- Link "Gerenciar assinatura" → `/empresa/meu-plano`

**Estilo:**
- Background: gradient `from-cyan-900/60 via-cyan-800/40 to-blue-900/60`
- Border: `border-cyan-500/20`
- Radial gradient decorativo no canto superior direito

### 2. Seção "Alterar Plano"

**Título:** "Alterar Plano"
**Subtítulo:** "Compare os planos e escolha o melhor para sua empresa."

### 3. Seletor de Período Global

Barra de botões acima do grid de planos.

**Opções:** Mensal | Trimestral | Semestral | Anual
- `one_time` excluído do seletor (não é ciclo recorrente)
- Botão ativo: `bg-background text-foreground shadow-sm`
- Botões com desconto: badge inline (ex: `-10%`) em verde
- Estado padrão: `selectedPeriod = 'monthly'`

**Lógica de desconto no botão** (agregação do maior desconto entre planos visíveis):
```typescript
const maxDiscount = Math.max(...companyPlans.map(p => p.discountPercentage ?? 0));
const periodHasDiscount = (period: PlanPeriod) =>
  maxDiscount > 0 && companyPlans.some(p =>
    (p.discountPercentage ?? 0) > 0 && shouldApplyDiscount(period, p.discountMinPeriod)
  );
// Badge mostra: `-${maxDiscount}%`
```
Padrão idêntico ao de `Plans.tsx` (linhas 41-49). Usar `shouldApplyDiscount` de `src/lib/subscriptionRules.ts`.

### 4. Cards de Plano — Redesenhados

Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (ou `lg:grid-cols-4` se >= 4 planos).

**Cada card inclui:**

1. **Gradient top bar** (4px) — diferente por plano:
   - Trial/Free: `from-teal-400 to-cyan-500`
   - Normal: `from-cyan-500 to-blue-600`
   - Badge plans: `from-blue-500 to-violet-500` (opcional, por tier)

2. **Badge flutuante** (se `plan.badge`): posicionado no topo do card

3. **Preço dinâmico** para o período selecionado:
   - `basePrice = prices.monthly` (referência para comparação)
   - `periodPrice = prices[selectedPeriod]`
   - **Precedência de exibição** (mutuamente exclusivas):
     1. **Launch price** (prioridade alta): se `launchPrices?.[selectedPeriod]` existe, é > 0, e < `periodPrice`:
        - Mostra `periodPrice` riscado + `launchPrices[selectedPeriod]` em cyan
     2. **Desconto por período** (prioridade normal): se `shouldApplyDiscount(selectedPeriod, plan.discountMinPeriod)` E `periodPrice < basePrice`:
        - Mostra `basePrice` riscado + `periodPrice` em destaque
        - Badge "Economize X%"
     3. **Sem desconto**: mostra `periodPrice` normal
   - Free/Trial: mostra "Grátis" + badge trial com duração

4. **Bônus de testes** (se `bonusTests[selectedPeriod] > 0`):
   - Linha extra em cyan: "+N testes comportamentais"

5. **Features list**: checklist com ícone verde

6. **Botão de ação**:
   - Plano atual: "Plano Atual" (disabled, outline)
   - Free: "Plano Gratuito" (disabled)
   - Outros: `CheckoutButton` com `period={selectedPeriod}` ← fix principal

### 5. Banner de Preço de Lançamento

Se qualquer plano visível tiver `launchPrices` ativo e `launchPriceEndDate` futuro:
- Banner informativo abaixo do grid
- Ícone + texto: "Preço de lançamento disponível para [plano] até DD/MM/YYYY"

---

## Arquivos Afetados

| Arquivo | Mudança |
|---------|---------|
| `src/pages/empresa/Packages.tsx` | Reescrever TabsContent "plano" (linhas 518-644) |

**Reutilizar de código existente:**
- `shouldApplyDiscount()` de `src/lib/subscriptionRules.ts`
- `formatBRL()` de `src/lib/formatters`
- `PERIOD_LABELS` (criar localmente, excluindo `one_time`)
- `CheckoutButton` de `src/components/billing/CheckoutButton.tsx`

**Nenhum novo arquivo necessário.** Toda a mudança é dentro do TabsContent existente.

**Nota sobre tipagem:** O código atual usa `plan as Record<string, unknown>` com acesso dual (`plan.description_short ?? plan.descriptionShort`). Manter esse padrão por consistência, sem refatorar a tipagem neste escopo.

**Loading state:** Reutilizar o mesmo spinner `<Loader2>` já presente nas outras tabs (linhas 493-494).

---

## Verificação

1. Selecionar cada período e verificar que preços mudam corretamente
2. Verificar que desconto aparece quando `shouldApplyDiscount` é true
3. Verificar que launch price aparece quando ativo e menor que regular
4. Verificar que bônus de testes aparece no período correto
5. Verificar que trial badge aparece para planos gratuitos com trial
6. Clicar em CheckoutButton e confirmar que `period` enviado é o selecionado
7. Verificar responsividade em mobile (1 col), tablet (2 col), desktop (3-4 col)
8. Verificar tema claro e escuro
