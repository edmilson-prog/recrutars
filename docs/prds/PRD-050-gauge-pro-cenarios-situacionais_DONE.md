# PRD-050: Gauge-Pro - Parte 2: Cenários Situacionais

> **AILA - Sistemas Inteligentes**  
> RecrutaRS - Plataforma de Recrutamento Inteligente

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `PRD-046` | Sistema de Avaliação Gauge-Pro 2.0 - Fundação Administrativa |
| `PRD-047` | Avaliação Gauge-Pro para Candidatos - Teste Geral |
| `PRD-048` | Avaliação Gauge-Pro por Vaga - Teste Específico |
| `PRD-049` | Gauge-Pro Parte 1: Seleção de Palavras |
| **`PRD-050`** | ⬅ Você está aqui — Gauge-Pro Parte 2: Cenários Situacionais |

---

# PRD-050: Gauge-Pro - Parte 2: Cenários Situacionais

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS - Painel do Candidato |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Implementar a segunda parte do teste Gauge-Pro: 15 cenários situacionais com múltipla escolha que complementam a avaliação das 5 dimensões comportamentais |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 4 |
| **Prioridade** | Alta |
| **Épico** | Sistema de Avaliação Comportamental Gauge-Pro |
| **PRDs Relacionados** | PRD-046, PRD-047, PRD-048, PRD-049 |
| **Padrão de código** | camelCase para campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

**Justificativa:** Alta complexidade devido a: 15 cenários com 4 opções cada (60 alternativas mapeadas), lógica de pontuação multidimensional por alternativa, combinação de scores com Parte 1, cálculo de perfil arquetípico final, geração de relatório integrado, e análise de IA.

---

## Contexto do Problema

A Parte 1 do Gauge-Pro (Seleção de Palavras - PRD-049) avalia preferências comportamentais através de escolha de adjetivos. Porém, palavras podem ser interpretadas de forma abstrata. A Parte 2 complementa com **cenários situacionais concretos** que revelam como o candidato **agiria** em situações profissionais reais.

Esta metodologia é poderosa porque:
- Força escolhas entre comportamentos igualmente válidos
- Revela preferências em contextos específicos (não abstratos)
- Permite validação cruzada com Parte 1
- Avalia tomada de decisão e valores em ação

Os 15 cenários cobrem situações profissionais universais (pressão, conflito, mudança, liderança, ética) e cada alternativa mapeia para combinações específicas das 5 dimensões.

---

## Conceito da Solução

### Situação Atual (As-Is)

- PRD-049 implementou a Parte 1 (Seleção de Palavras)
- Candidato tem scores parciais das 5 dimensões
- Não existe avaliação situacional implementada
- Perfil arquetípico não pode ser calculado apenas com Parte 1

### Situação Desejada (To-Be)

- Após completar Parte 1, candidato é direcionado para Parte 2
- Candidato responde 15 cenários situacionais em sequência
- Cada cenário apresenta situação profissional + 4 alternativas (A, B, C, D)
- Sistema calcula scores adicionais por dimensão (peso 40%)
- Scores da Parte 1 (peso 60%) + Parte 2 (peso 40%) = Score Final Normalizado
- Sistema determina perfil arquetípico entre 16 possíveis
- Relatório básico é gerado automaticamente
- XP é concedido e perfil é marcado como completo

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Mais de 15 cenários | Teste muito longo, fadiga do candidato |
| Menos de 15 cenários | Cobertura insuficiente das dimensões |
| Cenários adaptativos | Complexidade alta para MVP, considerar futuramente |
| Resposta aberta | Difícil de pontuar automaticamente |

---

## Escopo

### Incluído

- ✅ Banco de 15 cenários situacionais fixos
- ✅ 4 alternativas por cenário (60 alternativas total)
- ✅ Mapeamento de cada alternativa para dimensões (D1±, D2±, etc)
- ✅ Interface de apresentação de cenários um por vez
- ✅ Sistema de pontuação por alternativa selecionada
- ✅ Combinação de scores Parte 1 (60%) + Parte 2 (40%)
- ✅ Normalização final para escala 0-100 por dimensão
- ✅ Determinação de perfil arquetípico (16 perfis)
- ✅ Geração de relatório básico do candidato
- ✅ Gamificação: XP por conclusão do teste completo
- ✅ Timer indicativo (não bloqueante)
- ✅ Design responsivo mobile-first

### Excluído

- ❌ Cenários adaptativos (complexidade futura)
- ❌ Análise de IA avançada (fase posterior)
- ❌ Relatório premium pago (modelo de negócio futuro)
- ❌ Matching com vagas neste PRD (já coberto em PRD-048)

---

## Banco de Cenários Situacionais

### Os 15 Cenários

#### CENÁRIO 1: Priorização de Urgência

**Situação:** Seu gerente solicita um projeto urgente que precisa ser entregue até o fim do dia, mas você já tem outras prioridades programadas.

| Opção | Texto | Dimensões |
|-------|-------|-----------|
| **A** | Reorganizo imediatamente minhas prioridades e foco totalmente no urgente | D1+, D3- |
| **B** | Converso com o gerente para entender se há flexibilidade ou posso delegar algo | D1-, D5+ |
| **C** | Peço ajuda aos colegas para dividir as tarefas e cumprir tudo | D2+, D5+ |
| **D** | Analiso tecnicamente o que é viável fazer com qualidade no prazo | D4+, D3+ |

---

#### CENÁRIO 2: Discordância em Reunião

**Situação:** Durante uma reunião, você percebe que a equipe está indo em uma direção que você considera equivocada.

| Opção | Texto | Dimensões |
|-------|-------|-----------|
| **A** | Interrompo educadamente e apresento minha perspectiva com argumentos | D1+, D2+ |
| **B** | Anoto minhas preocupações e abordo o líder em particular depois | D1-, D4+ |
| **C** | Faço perguntas para levar o grupo a refletir sobre outras possibilidades | D5+, D2+ |
| **D** | Aguardo o momento certo e apresento dados que fundamentem outra direção | D4+, D3+ |

---

#### CENÁRIO 3: Apresentação de Resultados Negativos

**Situação:** Você precisa apresentar resultados negativos do trimestre para a diretoria.

| Opção | Texto | Dimensões |
|-------|-------|-----------|
| **A** | Apresento os números objetivamente e as ações corretivas já planejadas | D1+, D4+ |
| **B** | Contextualizo os desafios enfrentados e proponho soluções colaborativas | D5+, D2+ |
| **C** | Preparo uma análise detalhada das causas com evidências e plano estruturado | D4+, D3+ |
| **D** | Assumo a responsabilidade e demonstro comprometimento com a reversão | D1+, D5+ |

---

#### CENÁRIO 4: Colega com Dificuldades

**Situação:** Um novo colega de equipe tem dificuldades para se adaptar aos processos da empresa.

| Opção | Texto | Dimensões |
|-------|-------|-----------|
| **A** | Ofereço ajuda e dedico tempo para ensiná-lo com paciência | D5+, D3+ |
| **B** | Indico os manuais e recursos disponíveis para que ele estude | D4+, D1- |
| **C** | Apresento-o a outros colegas que podem ajudar e integro-o socialmente | D2+, D5+ |
| **D** | Dou feedback direto sobre o que precisa melhorar para acompanhar o ritmo | D1+, D3- |

---

#### CENÁRIO 5: Liberdade de Execução

**Situação:** Você tem liberdade para escolher como executar um novo projeto importante.

| Opção | Texto | Dimensões |
|-------|-------|-----------|
| **A** | Crio um plano estruturado com etapas, prazos e métricas claras | D4+, D3+ |
| **B** | Reúno a equipe para definir colaborativamente a melhor abordagem | D2+, D5+ |
| **C** | Busco referências externas e adapto criativamente para nossa realidade | D4-, D1+ |
| **D** | Defino as diretrizes principais e executo com agilidade ajustando no caminho | D1+, D3- |

---

#### CENÁRIO 6: Conflito na Equipe

**Situação:** Há um conflito entre dois membros da sua equipe que está impactando o clima.

| Opção | Texto | Dimensões |
|-------|-------|-----------|
| **A** | Chamo ambos para uma conversa e medito até chegarem a um acordo | D5+, D2+ |
| **B** | Defino claramente as expectativas e responsabilidades de cada um | D1+, D4+ |
| **C** | Escuto individualmente cada lado e busco entender as causas profundas | D5+, D3+ |
| **D** | Estabeleço regras de convivência e monitoro o cumprimento | D4+, D1+ |

---

#### CENÁRIO 7: Projeto sob Pressão

**Situação:** Você precisa trabalhar em um projeto com prazo apertado e muita pressão.

| Opção | Texto | Dimensões |
|-------|-------|-----------|
| **A** | Prospero sob pressão, me mantenho focado e entrego no prazo | D1+, D3- |
| **B** | Mantenho a calma, organizo as etapas e trabalho metodicamente | D3+, D4+ |
| **C** | Mobilizo a equipe, delego e mantenho todos motivados e alinhados | D2+, D5+ |
| **D** | Reviso prioridades, negocio prazos realistas se necessário | D4+, D1- |

---

#### CENÁRIO 8: Feedback Negativo em Público

**Situação:** Você recebe feedback negativo sobre seu trabalho em público.

| Opção | Texto | Dimensões |
|-------|-------|-----------|
| **A** | Agradeço o feedback e busco entender especificamente o que melhorar | D5+, D4+ |
| **B** | Defendo meu ponto de vista se acredito que o feedback não é justo | D1+, D4- |
| **C** | Fico incomodado mas não demonstro, reflito depois sozinho | D2-, D3+ |
| **D** | Peço para conversarmos em particular para entender melhor o contexto | D1-, D5+ |

---

#### CENÁRIO 9: Mudanças Organizacionais

**Situação:** Sua empresa está passando por mudanças organizacionais significativas.

| Opção | Texto | Dimensões |
|-------|-------|-----------|
| **A** | Adapto-me rapidamente e busco oportunidades nas mudanças | D3-, D1+ |
| **B** | Procuro entender o racional das mudanças antes de me posicionar | D4+, D3+ |
| **C** | Preocupo-me com o impacto nas pessoas e ofereço suporte aos colegas | D5+, D2+ |
| **D** | Questiono aspectos que não fazem sentido e proponho alternativas | D1+, D4- |

---

#### CENÁRIO 10: Membro Não Performando

**Situação:** Você está liderando um projeto e um membro da equipe não está entregando conforme o esperado.

| Opção | Texto | Dimensões |
|-------|-------|-----------|
| **A** | Converso individualmente para entender se há algum problema pessoal ou profissional | D5+, D2+ |
| **B** | Estabeleço metas claras e prazos específicos para correção | D1+, D4+ |
| **C** | Ofereço treinamento ou recursos adicionais para apoiar o desenvolvimento | D3+, D5+ |
| **D** | Redireciono as tarefas e ajusto a distribuição da carga de trabalho | D1+, D3- |

---

#### CENÁRIO 11: Ideia Contra Processos

**Situação:** Você tem uma ideia inovadora que vai contra os processos estabelecidos da empresa.

| Opção | Texto | Dimensões |
|-------|-------|-----------|
| **A** | Apresento a ideia para liderança com dados e argumentos sólidos | D1+, D4- |
| **B** | Testo a ideia informalmente primeiro para validar antes de propor oficialmente | D3+, D4- |
| **C** | Busco aliados que apoiem a ideia e construo consenso gradualmente | D2+, D5+ |
| **D** | Respeito os processos atuais e busco inovar dentro das estruturas existentes | D4+, D1- |

---

#### CENÁRIO 12: Promoção vs Equilíbrio

**Situação:** Você precisa escolher entre uma promoção que exige mais horas de trabalho ou manter seu equilíbrio atual.

| Opção | Texto | Dimensões |
|-------|-------|-----------|
| **A** | Aceito o desafio, sei que posso me adaptar e crescer | D1+, D3- |
| **B** | Analiso cuidadosamente prós e contras antes de decidir | D4+, D3+ |
| **C** | Converso com pessoas próximas para considerar o impacto na vida pessoal | D5+, D2+ |
| **D** | Negocio condições que permitam aceitar mantendo qualidade de vida | D1-, D5+ |

---

#### CENÁRIO 13: Evento de Networking

**Situação:** Em um evento de networking profissional, você:

| Opção | Texto | Dimensões |
|-------|-------|-----------|
| **A** | Circulo ativamente, conheço muitas pessoas e troco contatos | D2+, D3- |
| **B** | Foco em conversas profundas com poucas pessoas estratégicas | D2-, D4+ |
| **C** | Apresento-me quando abordado e mantenho conversas educadas | D1-, D2- |
| **D** | Busco pessoas que possam gerar oportunidades de negócio concretas | D1+, D5- |

---

#### CENÁRIO 14: Erro em Processo

**Situação:** Você identifica um erro em um processo que pode causar problemas futuros, mas corrigir dará trabalho extra.

| Opção | Texto | Dimensões |
|-------|-------|-----------|
| **A** | Corrijo imediatamente, não deixo para depois | D4+, D1+ |
| **B** | Documento o erro e proponho uma solução estruturada | D4+, D3+ |
| **C** | Avalio a criticidade e priorizo conforme o risco real | D1+, D3+ |
| **D** | Comunico a equipe e delego a correção para quem tem mais expertise | D2+, D1- |

---

#### CENÁRIO 15: Tarefa Repetitiva

**Situação:** Você está trabalhando em uma tarefa repetitiva e monótona que precisa ser concluída.

| Opção | Texto | Dimensões |
|-------|-------|-----------|
| **A** | Foco e concluo com consistência, sem pressa | D3+, D4+ |
| **B** | Busco formas criativas de automatizar ou otimizar o processo | D4-, D1+ |
| **C** | Divido em blocos menores e faço pausas para manter energia | D3-, D2+ |
| **D** | Convido colegas para fazer juntos e tornar mais agradável | D2+, D5+ |

---

## Sistema de Pontuação

### Peso das Partes

| Parte | Peso |
|-------|------|
| Parte 1 (Palavras) | 60% |
| Parte 2 (Cenários) | 40% |

### Cálculo de Score por Dimensão

```
Score_Parte2 = Soma de pontuações das 15 respostas por dimensão

Score_Final = (Score_Parte1 × 0.6) + (Score_Parte2 × 0.4)

Score_Normalizado = (Score_Final / Max_Possível) × 100
```

### Classificação por Dimensão

| Score Normalizado | Classificação |
|-------------------|---------------|
| 0-33 | Baixo |
| 34-66 | Médio |
| 67-100 | Alto |

---

## Perfis Arquetípicos (16 Perfis)

Baseado nas combinações de D1 (Dominância) e D2 (Sociabilidade) como dimensões principais, combinadas com D3, D4, D5 como modificadores:

| Perfil | Características | Vagas Ideais |
|--------|----------------|--------------|
| **O COMANDANTE** | D1 Alto + D2 Baixo + D4 Alto | CEO, Diretor de Operações, Gerente de Projetos |
| **O ESTRATEGISTA** | D1 Alto + D2 Baixo + D4 Alto + D3 Alto | Consultor Estratégico, Analista Sênior, Planejador |
| **O INOVADOR** | D1 Alto + D2 Baixo + D4 Baixo | Empreendedor, Diretor de Inovação, Product Owner |
| **O EXECUTOR ÁGIL** | D1 Alto + D2 Baixo + D3 Baixo | Gerente de Projetos Ágeis, Startup Founder, Líder de Vendas |
| **O INFLUENCIADOR** | D1 Alto + D2 Alto + D4 Baixo | Diretor Comercial, Relações Públicas, Líder de Transformação |
| **O CAPITÃO** | D1 Alto + D2 Alto + D5 Alto | Líder de Equipes, Gerente de RH, Coach Executivo |
| **O PROMOTOR** | D1 Médio + D2 Alto + D4 Baixo + D3 Baixo | Vendas, Marketing, Eventos, Relações Corporativas |
| **O CONSELHEIRO** | D1 Baixo + D2 Alto + D5 Alto | Psicólogo Organizacional, Mediador, Atendimento VIP |
| **O FACILITADOR** | D1 Baixo + D2 Alto + D4 Médio + D5 Alto | Scrum Master, Coordenador de Equipes, Community Manager |
| **O ESPECIALISTA** | D1 Baixo + D2 Baixo + D4 Alto + D3 Alto | Analista Técnico, Pesquisador, Controller Financeiro |
| **O GUARDIÃO** | D1 Baixo + D2 Baixo + D4 Alto + D3 Alto + D5 Médio | Auditor, Compliance, Analista de Qualidade |
| **O ARTESÃO** | D1 Baixo + D2 Baixo + D4 Alto + D3 Alto | Designer Técnico, Desenvolvedor Backend, Arquiteto de Dados |
| **O APOIADOR** | D1 Baixo + D2 Médio + D3 Alto + D5 Alto | Assistente Executivo, Suporte ao Cliente, Professor |
| **O MEDIADOR** | D1 Baixo + D2 Médio + D4 Médio + D5 Alto | Recursos Humanos, Relações Trabalhistas, Ombudsman |
| **O ANALISTA CRIATIVO** | D1 Médio + D2 Baixo + D4 Baixo + D3 Médio | UX Designer, Arquiteto de Soluções, Cientista de Dados |
| **O VERSÁTIL** | Todas dimensões Médias (D1-D5 entre 40-60) | Gerente Geral, Consultor, Analista de Negócios |

---

## Requisitos Funcionais

### Interface do Candidato

- **RF-001:** O sistema deve exibir cenários um por vez (não todos de uma vez)
- **RF-002:** Cada cenário deve mostrar: número (1/15), situação, 4 opções (A, B, C, D)
- **RF-003:** O candidato deve selecionar exatamente uma opção por cenário
- **RF-004:** O botão "Próximo" só deve ser habilitado após seleção de uma opção
- **RF-005:** O candidato pode voltar para cenários anteriores e alterar resposta
- **RF-006:** O sistema deve exibir barra de progresso (cenário atual / 15)
- **RF-007:** O sistema deve exibir timer indicativo (estimativa de 15-20 minutos)
- **RF-008:** Ao finalizar cenário 15, deve exibir tela de conclusão
- **RF-009:** Design responsivo e mobile-first

### Lógica de Pontuação

- **RF-010:** Cada alternativa selecionada deve adicionar +1 ponto nas dimensões indicadas
- **RF-011:** Alternativas com dimensão negativa (ex: D1-) devem inverter na normalização
- **RF-012:** O score da Parte 2 deve ser combinado com Parte 1 conforme pesos (60%/40%)
- **RF-013:** O sistema deve calcular score normalizado (0-100) para cada dimensão
- **RF-014:** O sistema deve classificar cada dimensão como Baixo/Médio/Alto
- **RF-015:** O sistema deve determinar o perfil arquetípico entre os 16 possíveis

### Relatório e Resultado

- **RF-016:** Ao concluir, o sistema deve gerar relatório básico automaticamente
- **RF-017:** O relatório deve incluir: perfil arquetípico, scores por dimensão, pontos fortes, áreas de desenvolvimento
- **RF-018:** O candidato deve poder visualizar e baixar o relatório básico (PDF)
- **RF-019:** O relatório deve indicar carreiras/funções compatíveis com o perfil

### Persistência

- **RF-020:** As respostas devem ser salvas após cada cenário (não apenas no final)
- **RF-021:** O sistema deve permitir retomar teste incompleto
- **RF-022:** O timestamp de cada resposta deve ser registrado

### Gamificação

- **RF-023:** O candidato deve receber XP ao completar o teste Gauge-Pro completo
- **RF-024:** O perfil deve ser marcado como "Avaliação Comportamental Completa"
- **RF-025:** Badge específico deve ser concedido

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Cálculo de perfil < 3 segundos
- **RNF-002 (Usabilidade):** Texto dos cenários legível em mobile sem scroll horizontal
- **RNF-003 (Acessibilidade):** Radio buttons com labels adequados
- **RNF-004 (Responsividade):** Funcional em telas de 320px a 1920px
- **RNF-005 (Disponibilidade):** Relatório deve ser gerado mesmo se análise de IA falhar

---

## Critérios de Aceitação

### RF-001/002/003: Exibição de Cenários

```gherkin
DADO que o candidato completou a Parte 1 e iniciou a Parte 2
QUANDO o primeiro cenário é exibido
ENTÃO deve mostrar número "1/15"
  E deve exibir o texto da situação
  E deve mostrar 4 opções (A, B, C, D) com radio buttons
  E nenhuma opção deve estar pré-selecionada
```

### RF-004/005: Navegação entre Cenários

```gherkin
DADO que o candidato está no cenário 5
QUANDO selecionar uma opção
ENTÃO o botão "Próximo" deve ficar habilitado

DADO que o candidato está no cenário 5
QUANDO clicar em "Voltar"
ENTÃO deve exibir cenário 4 com a opção previamente selecionada
```

### RF-010/011/012: Cálculo de Pontuação

```gherkin
DADO que o candidato completou todos os 15 cenários
QUANDO o sistema calcular os scores
ENTÃO deve somar +1 para cada dimensão indicada nas alternativas escolhidas
  E deve combinar com Parte 1 usando pesos 60%/40%
  E deve normalizar para escala 0-100
```

### RF-015: Determinação de Perfil

```gherkin
DADO que os scores normalizados foram calculados
QUANDO o sistema determinar o perfil arquetípico
ENTÃO deve identificar o perfil que melhor corresponde às combinações de D1-D5
  E deve retornar nome do perfil, descrição e carreiras compatíveis
```

### RF-016/017/018: Geração de Relatório

```gherkin
DADO que o candidato concluiu Parte 1 e Parte 2
QUANDO o teste for finalizado
ENTÃO o sistema deve gerar relatório básico automaticamente
  E o relatório deve incluir perfil arquetípico
  E deve incluir gráfico radar com as 5 dimensões
  E deve incluir top 3 pontos fortes
  E deve incluir 2-3 áreas de desenvolvimento
  E deve listar 5-7 carreiras compatíveis
  E o candidato deve poder baixar em PDF
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Modelo de dados de cenários | 3 |
| 2 | Interface de cenários | 4 |
| 3 | Cálculo de perfil e scores | 4 |
| 4 | Geração de relatório e gamificação | 4 |

### Detalhamento das Fases

#### Fase 1: Modelo de Dados de Cenários

**Objetivo:** Criar estrutura de banco para cenários e respostas

**Ações:**
- [ ] Criar tabela `gauge_scenarios` com: id, order, situation_text
- [ ] Criar tabela `gauge_scenario_options` com: id, scenario_id, option_letter (A-D), option_text, dimension_mappings (JSON: {D1: +1, D3: -1, ...})
- [ ] Criar tabela `gauge_scenario_responses` com: candidato_id, test_id, scenario_id, selected_option, created_at
- [ ] Seed com os 15 cenários e 60 opções mapeadas
- [ ] Criar tabela `gauge_archetypes` com os 16 perfis

**Validação:** Query retorna 15 cenários com 4 opções cada, todas com mapeamento de dimensões

#### Fase 2: Interface de Cenários

**Objetivo:** Criar componentes de UI para apresentação de cenários

**Ações:**
- [ ] Criar componente `ScenarioScreen` com progresso e timer
- [ ] Criar componente `ScenarioCard` com situação e opções
- [ ] Implementar navegação entre cenários (próximo/anterior)
- [ ] Implementar salvamento automático por cenário
- [ ] Design responsivo para texto longo em mobile
- [ ] Criar tela de conclusão

**Validação:** Candidato consegue navegar pelos 15 cenários e selecionar opções

#### Fase 3: Cálculo de Perfil e Scores

**Objetivo:** Implementar algoritmo de pontuação e determinação de perfil

**Ações:**
- [ ] Implementar função de cálculo de score bruto Parte 2
- [ ] Implementar combinação de scores Parte 1 + Parte 2
- [ ] Implementar normalização para escala 0-100
- [ ] Implementar classificação Baixo/Médio/Alto
- [ ] Implementar algoritmo de matching com 16 perfis arquetípicos
- [ ] Criar serviço de determinação de perfil

**Validação:** Dado um conjunto de respostas, sistema retorna perfil correto

#### Fase 4: Geração de Relatório e Gamificação

**Objetivo:** Criar relatório e integrar com gamificação

**Ações:**
- [ ] Criar template de relatório básico
- [ ] Implementar gráfico radar das 5 dimensões
- [ ] Gerar lista de pontos fortes e áreas de desenvolvimento
- [ ] Gerar lista de carreiras compatíveis
- [ ] Implementar exportação PDF
- [ ] Configurar XP e badge por conclusão
- [ ] Marcar perfil como avaliação completa

**Validação:** Relatório PDF gerado corretamente com todas as seções

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-046 | Fundação Administrativa Gauge-Pro | ✅ Implementado |
| PRD-047 | Avaliação Gauge-Pro Candidatos | ✅ Implementado |
| PRD-048 | Avaliação Gauge-Pro por Vaga | ✅ Implementado |
| PRD-049 | Gauge-Pro Parte 1: Seleção de Palavras | ⏳ Implementar junto |

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Sistema de Avaliação Comportamental Gauge-Pro"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-046 | Fundação Administrativa | ✅ | Base |
| 2 | PRD-047 | Avaliação Candidatos | ✅ | Depende de 046 |
| 3 | PRD-048 | Avaliação por Vaga | ✅ | Depende de 046, 047 |
| 4 | PRD-049 | Seleção de Palavras | ⏳ | Depende de 046-048 |
| **5** | **PRD-050** | **Cenários Situacionais** | **🔄 ATUAL** | Depende de 049 |

> **Nota:** PRD-049 e PRD-050 devem ser implementados em sequência. PRD-050 depende de PRD-049 estar completo.

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
[Candidato conclui Parte 1] ──▶ [Transição para Parte 2]
                                        │
                                        ▼
                              [Exibe Cenário 1/15]
                                        │
                                        ▼
                              [Seleciona opção A/B/C/D]
                                        │
                                        ▼
                              [Avança para próximo cenário]
                                        │
                                        ▼
                              [...repete até cenário 15...]
                                        │
                                        ▼
                              [Conclui Cenário 15]
                                        │
                                        ▼
                              [Sistema calcula scores]
                                        │
                                        ▼
                              [Determina perfil arquetípico]
                                        │
                                        ▼
                              [Gera relatório básico]
                                        │
                                        ▼
                              [Exibe resultado + Download PDF]
                                        │
                                        ▼
                              [Concede XP e Badge]
```

### Fluxo de Retomada

```
[Candidato] ──▶ [Acessa Gauge-Pro] ──▶ [Detecta Parte 2 incompleta]
                                              │
                                              ▼
                                    [Mostra: "Continue de onde parou"]
                                              │
                                              ▼
                                    [Retoma do cenário onde parou]
```

---

## Conteúdo do Relatório Básico

### Estrutura do Relatório (2 páginas)

**Página 1:**
1. **Seu Perfil Comportamental** - Nome do arquétipo + descrição breve
2. **Suas 5 Dimensões** - Gráfico radar com scores 0-100
3. **Pontos Fortes** - Top 3 características baseadas em scores altos

**Página 2:**
4. **Áreas de Desenvolvimento** - 2-3 sugestões baseadas em scores
5. **Carreiras Recomendadas** - Lista de 5-7 funções compatíveis com o perfil
6. **Dica de Desenvolvimento** - Sugestão personalizada

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Respostas dos cenários | Sensível | RLS por candidato |
| Perfil arquetípico | Sensível | Acesso restrito |
| Relatório gerado | Pessoal | Download apenas pelo próprio candidato |

### LGPD

- Consentimento explícito para coleta de dados comportamentais
- Opção de exclusão de dados a qualquer momento
- Portabilidade de dados (exportação do relatório)

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. IMPLEMENTAR PRD-049 PRIMEIRO:**
> Este PRD depende de PRD-049 estar completo. A Parte 2 só pode ser acessada após conclusão da Parte 1.

> **⚠️ 3. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Atualizar o registro de versão no banco de dados (se aplicável)
> - Renomear este arquivo adicionando `_DONE` ao final
>   Ex: `PRD-050-gauge-pro-cenarios-situacionais_DONE.md`
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Para MINOR ou MAJOR, gerar codinome em inglês baseado no contexto das mudanças. Sugestão: "Profile" ou "Archetype" para este épico.

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
| **Não bloquear fluxo principal** | Se geração de PDF falhar, mostrar resultado na tela |
| **Fail gracefully** | Se cálculo de perfil falhar, mostrar scores sem arquétipo |
| **Preservar evidências** | Salvar resposta de cada cenário individualmente |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas durante implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Texto dos cenários** | Manter legível em mobile, considerar accordion se necessário |
| **Salvamento** | Salvar após cada cenário, não apenas no final |
| **PDF** | Usar biblioteca confiável (ex: jsPDF, react-pdf) |
| **Perfil arquetípico** | Algoritmo de matching deve ser testável unitariamente |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Revelar mapeamento de dimensões ao candidato |
| Permitir pular cenários sem responder |
| Gerar relatório incompleto se Parte 1 não foi feita |
| Hardcodar cenários no código (usar banco de dados) |
| Cache que impeça atualização de cenários futuramente |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Implementado por** | - |
| **Observações** | Depende de PRD-049 |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 27/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
