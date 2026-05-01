# Funcionalidades da Plataforma RecrutaRS

A RecrutaRS é uma plataforma de recrutamento inteligente que utiliza avaliações comportamentais Gauge-Pro (inspiradas no Predictive Index) para conectar empresas e candidatos com base em compatibilidade técnica e comportamental. A plataforma opera com três perfis de usuário, cada um com funcionalidades específicas.

---

## 1. Perfil Administrador

O administrador possui acesso total à plataforma, sendo responsável pela gestão operacional, moderação, configurações globais e acompanhamento de métricas.

**Rota base:** `/admin/*`

---

### 1.1 Dashboard Executivo

Painel principal com visão consolidada da plataforma:

- **KPIs em tempo real:** total de empresas, candidatos, vagas ativas e testes comportamentais concluídos
- **Gráfico de crescimento:** evolução de cadastros nos últimos 30 dias (empresas e candidatos)
- **Taxa de match:** percentual de contratações bem-sucedidas
- **Distribuição de candidaturas por status:** pendentes, em análise, entrevista, proposta e rejeitadas
- **Ranking de empresas:** top 5 por número de vagas publicadas
- **Estatísticas de match por categoria:** skills, experiência, perfil comportamental e localização
- **Alertas:** vagas com poucos candidatos de alto match

---

### 1.2 Gestão de Usuários e RBAC

Sistema completo de controle de acesso baseado em papéis (Role-Based Access Control — "Guardian"):

- **Listagem de Usuários:** busca, filtros avançados (tipo, status, papel, data de cadastro), seleção múltipla com ações em lote, exportação CSV e criação manual
- **Detalhamento de Usuário:** dados pessoais, permissões efetivas, perfil específico (candidato ou empresa), gerenciamento de status e senha
- **Papéis e Permissões:** matriz visual de permissões por papel, CRUD de roles customizadas, distinção entre roles de sistema (não editáveis) e roles customizadas
- **Grupos de Permissão:** criação e gestão de grupos que agrupam múltiplas permissões, atribuição de usuários a grupos
- **Auditoria:** log completo de todas as ações administrativas com filtros por usuário, tipo de ação e período, exportável em CSV

---

### 1.3 Gestão de Vagas e Moderação

Gerenciamento centralizado de todo o ciclo de vida das vagas:

- **Dashboard de Vagas:** KPIs (total, ativas, pendentes, finalizadas), gráficos de distribuição por status, evolução temporal e funil de recrutamento
- **Listagem de Vagas:** tabela completa com busca, filtros avançados e ações (ver, ocultar, editar, deletar)
- **Detalhamento de Vaga:** informações completas em abas (detalhes, pipeline de candidatos, moderação e notas), com ações de pausar, ocultar, finalizar ou publicar
- **Fila de Moderação:** vagas aguardando aprovação com indicador de tempo na fila e ações de aprovar, rejeitar ou solicitar correção
- **Configuração de Moderação:** modo automático ou manual, regras de moderação, templates de email para rejeição/correção
- **Vagas Finalizadas:** listagem com filtros por motivo (preenchida, cancelada, expirada)
- **Entrevistas:** gestão em 3 abas (agendadas, realizadas, canceladas) com informações do candidato, empresa, vaga e feedback
- **Contratações:** dashboard com KPIs (total, este mês, tempo médio) e listagem detalhada

---

### 1.4 Testes Comportamentais (Gauge-Pro)

Gestão completa do sistema de avaliação comportamental:

- **Visão Geral de Testes:** dashboard com 4 abas (visão geral, resultados, convites e testes corporativos), KPIs e funil de conversão
- **Categorias de Avaliação:** CRUD de categorias organizadas em árvore hierárquica por dimensão
- **Banco de Perguntas:** gestão paginada de perguntas com busca, filtros por categoria e CRUD completo
- **Adjetivos Gauge-Pro:** gestão dos 100 adjetivos organizados por 5 dimensões (D1–D5), com polaridade alta/baixa e reordenamento
- **Cenários Gauge-Pro:** CRUD dos 15 cenários situacionais com 4 opções de resposta mapeadas para dimensões comportamentais
- **Arquétipos Gauge-Pro:** editor dos 16 perfis comportamentais com nome, descrição, características e representação visual

---

### 1.5 Planos e Assinaturas

Gerenciamento completo de planos e assinaturas com integração Stripe:

- **Gestão de Planos:** CRUD de planos para candidatos e empresas, com informações de preço, período, status e sincronização com Stripe
- **Editor de Plano:** formulário completo em 2 colunas (dados do plano + sidebar com status e ações)
- **Capabilities de Planos:** matriz visual de features/limites por plano
- **Dashboard de Assinaturas:** KPIs (assinantes ativos, MRR, churn rate, tempo médio) e gráficos de distribuição
- **Listagem de Assinaturas:** tabela com busca, filtros por status/plano/período e ações (pausar, cancelar, renovar)

---

### 1.6 Financeiro e Relatórios

Sistema de relatórios analíticos ("Radar"):

- **Dashboard Financeiro:** KPIs de receita, pacotes vendidos e reconciliação Stripe
- **Relatório Financeiro (Radar):** MRR, ARR, receita total, ticket médio, churn, LTV e conversão free-para-paid, com gráficos de evolução
- **Relatório de Crescimento (Radar):** total de candidatos/empresas, curva cumulativa, cadastros semanais, funil de ativação e análise de coorte de retenção
- **Relatório Operacional (Radar):** candidaturas, contratações, entrevistas, testes, taxa de conversão e funil de recrutamento
- **Activity Feed:** feed em tempo real de eventos filtráveis (novo candidato, nova empresa, nova vaga, candidatura, teste concluído, assinatura, cancelamento, contratação)
- **Exportação de Relatórios:** geração em PDF/Excel com download imediato ou agendamento automático (diário, semanal, mensal)

---

### 1.7 Notificações e WhatsApp

Centro de comunicação da plataforma:

- **Central de Notificações:** inbox com filtros por tipo, marcação de lidas/não lidas e navegação para recurso associado
- **Centro de Notificações (Avançado):** dashboard de criação e envio de notificações manuais com seleção de destinatários e canais
- **WhatsApp Center:** hub central com abas para mensagens, campanhas em lote e templates pré-aprovados, com integração Evolution API e métricas de envio/entrega/leitura

---

### 1.8 Feature Flags

Gerenciamento de funcionalidades com controle granular:

- **Listagem de Feature Flags:** busca por nome/descrição, filtros por status (active, beta, deprecated, dead) e categoria
- **Editor de Feature Flag:** formulário completo com conditions builder visual, rollout controls (gradual por percentual ou grupo), user overrides e timeline de auditoria
- **Simulador:** ferramenta para testar flags em diferentes contextos (tipo de usuário, plano, localização) com trace de resolução
- **Auditoria de Flags:** log de todas as mudanças em feature flags com filtros por flag, ação e data

---

### 1.9 Helpdesk

Sistema de suporte ao cliente:

- **Dashboard:** métricas de tickets (total, em aberto, em progresso, resolvidos)
- **Listagem de Tickets:** filtros por status, prioridade e tipo, com cards resumidos
- **Detalhamento de Ticket:** informações completas, histórico de conversação, resposta em thread e ações (responder, mudar status, atribuir, fechar)

---

### 1.10 Configurações

- **Configurações Gerais:** múltiplas categorias de settings, edição de valores, histórico de mudanças e restauração para valores padrão
- **Credenciais Stripe:** gerenciamento de chaves de API com mascaramento de dados sensíveis
- **Log de Webhooks:** visualização de eventos Stripe recebidos com filtros por tipo, ambiente (test/live) e status

---

## 2. Perfil Empresa

O perfil empresa é voltado a recrutadores e gestores de RH, oferecendo ferramentas completas de ATS (Applicant Tracking System) com foco em recrutamento baseado em comportamento.

**Rota base:** `/empresa/*`

---

### 2.1 Dashboard

Painel inicial com métricas consolidadas:

- **Cards de vagas:** total, ativas, rascunhos, pausadas e finalizadas
- **Estatísticas de candidaturas:** totais, novas aplicações e em revisão
- **Métricas de recrutamento:** contratações e dias médios para contratação
- **Status de entrevistas:** agendadas e completadas
- **Testes comportamentais:** completados, pendentes e candidatos avaliados
- **Informações do plano:** tipo de assinatura atual
- **Widget de candidatos sugeridos**

---

### 2.2 Gestão de Vagas

Ciclo completo de criação e gerenciamento de vagas:

- **Minhas Vagas:** listagem com filtros por status (ativas, pausadas, encerradas), busca por título, visualização em lista ou grid, e ações contextuais por status (editar, pausar, reativar, duplicar, encerrar, excluir)
- **Formulário de Vaga:** wizard com 6 abas (básico, salário, descrição, requisitos, benefícios, competências), barra de progresso, assistente de IA com sugestões em tempo real e proteção contra perda de dados

---

### 2.3 Gestão de Candidaturas (Kanban)

Pipeline visual de candidatos com drag-and-drop:

- **Colunas do Kanban:** novas candidaturas, em revisão, entrevista agendada, proposta enviada, contratado e rejeitado
- **Filtros:** por vaga, status, busca por nome/email e candidatos com teste realizado
- **Ações por candidato:** ver perfil, adicionar nota, enviar mensagem, enviar teste comportamental, agendar entrevista, marcar como favorito, atualizar status e ver resultado de teste
- **Indicadores visuais:** avatar, estrela de favorito, badge de teste e score de compatibilidade

---

### 2.4 Banco de Talentos

Acesso ao banco completo de candidatos da plataforma:

- **Busca avançada:** por nome, email, localização, função, nível de experiência e disponibilidade
- **Visualização:** lista ou grid com informações de perfil e indicador de privacidade
- **Ações:** ver perfil, enviar mensagem, adicionar a favoritos, iniciar candidatura para vaga, comparar candidatos e enviar teste
- **Candidatos Salvos (Favoritos):** lista dedicada com classificação por competência e score de match, comparação lado a lado e exportação
- **Candidatos Sugeridos por Vaga:** recomendações por IA com percentual de match, motivo da recomendação e ações de convite

---

### 2.5 Entrevistas

Gestão completa de agendamento:

- **Abas:** pendentes, confirmadas e realizadas
- **Visualizações:** calendário semanal interativo e lista com cards
- **Informações:** candidato, vaga, data/hora, tipo (vídeo, telefone, presencial), status e notas
- **Ações:** aceitar sugestão de horário, cancelar com motivo e marcar como realizada

---

### 2.6 Testes Comportamentais Corporativos

Central de avaliação comportamental para a empresa:

- **Hub de Testes:** dashboard com estatísticas (testes criados, candidatos avaliados, completados), abas para visão geral, criação, listagem e convites, com saldo de créditos
- **Criação de Teste:** wizard com seleção de competências, questões, configuração de expiração e estimativa de tempo
- **Gerenciador de Teste:** abas de convites (com envio, reenvio, cancelamento e magic link), resultados e estatísticas
- **Resultado Individual:** score geral e por competência, gráfico comparativo, respostas detalhadas e decisão do recrutador
- **Comparação de Candidatos:** tabela comparativa com scores lado a lado, gráficos e indicadores de força/fraqueza
- **Métricas:** taxa de conclusão, tempo médio, distribuição de scores e tendências
- **Relatórios:** geração em PDF/Excel (individual e consolidado)
- **Auditoria:** log de conformidade LGPD com filtros

---

### 2.7 Gestão de Equipes

Módulo completo de gestão de colaboradores e análise comportamental contínua:

- **Dashboard de Equipes:** visão geral com CRUD de departamentos e posições, adição de membros (formulário ou importação de planilha), ações em lote (rescisão, transferência)
- **Mapa Comportamental:** radar coletivo da equipe por dimensão
- **Heatmap:** distribuição visual de dimensões comportamentais
- **Team Builder:** composição de equipes com drag-and-drop, visualização de radar por time, avaliação de balanceamento e salvamento de cenários
- **Compatibilidade:** matriz de compatibilidade interpessoal (heatmap), top pares compatíveis e alertas de conflito
- **Gap Analysis:** identificação de lacunas comportamentais com radar, cards de prioridades e recomendações de contratação
- **Identificação de Talentos:** mapeamento de potencial com Nine-Box (Performance vs Potencial) e classificações
- **Cultura Organizacional:** radar de DNA cultural, manifesto organizacional gerado automaticamente, evolução temporal e simulador de fit cultural
- **Desenvolvimento Individual (PDI):** plano personalizado com objetivos, status de progresso, agendamento de reteste e recomendações
- **Evolução do Colaborador:** timeline de testes, tabela de variações (deltas), anotações e gráficos de tendência
- **Perfil do Membro:** página completa com histórico, perfil comportamental e ações (editar, enviar teste, rescindir, afastar, promover, transferir, anonimizar LGPD)
- **Relatórios de Equipe:** geração de PDFs de evolução individual e cultura organizacional

---

### 2.8 Mensagens

Sistema de chat com candidatos:

- **Lista de conversas:** com indicador de mensagens não lidas e busca
- **Chat:** mensagens com status de envio/leitura
- **Templates:** mensagens pré-configuradas com seletor de tom (formal, casual), preview e salvamento de novos templates

---

### 2.9 Plano e Faturamento

Gestão de assinatura e créditos:

- **Meu Plano:** informações do plano atual (nome, período, status, valor, próxima cobrança), com ações de upgrade/downgrade, cancelamento e histórico de pagamentos
- **Pacotes de Créditos:** compra de créditos para testes via Stripe, com saldo atual, preços e comparação de períodos
- **Checkout:** páginas de sucesso e cancelamento do pagamento
- **Trial Expirado:** página de conversão com resumo do que a empresa possuía, comparação de planos e CTAs de compra

---

### 2.10 Configurações

- **Perfil da Empresa:** informações básicas, logo e descrição
- **Segurança:** autenticação e webhooks
- **Equipe:** membros, papéis e permissões internas
- **Notificações:** preferências por tipo (candidaturas, testes, entrevistas, mensagens)
- **Integrações:** webhooks e tokens de API
- **Tema:** preferência de aparência (claro/escuro)

---

## 3. Perfil Candidato

O perfil candidato oferece uma experiência completa de busca de empregos com ênfase em avaliação comportamental e matching inteligente.

**Rota base:** `/candidato/*`

---

### 3.1 Onboarding (4 Etapas)

Fluxo guiado obrigatório após o cadastro, protegido pelo `OnboardingGuard`:

1. **Perfil Pessoal:** data de nascimento (mínimo 16 anos), gênero, estado e cidade (dinâmicos), estado civil, nacionalidade e upload de avatar com recorte de imagem
2. **Perfil Profissional:** experiências profissionais, formação acadêmica, habilidades técnicas, resumo profissional e localização preferida
3. **Teste Gauge-Pro:** avaliação comportamental completa em 2 partes (seleção de palavras + cenários situacionais), com 25 questões e duração estimada de 15–20 minutos
4. **Conclusão:** tela celebrativa com feedback positivo e redirecionamento para o dashboard

---

### 3.2 Dashboard

Hub central com resumo de atividades:

- **Cards de estatísticas:** total de candidaturas, entrevistas agendadas, testes completados e visualizações do perfil
- **Completude do perfil:** barra de progresso (0–100%) com seções faltantes destacadas
- **Card Gauge-Pro:** resultado atual com gráfico de 5 dimensões ou badge de avaliação em andamento
- **Candidaturas recentes:** últimas 5 candidaturas com status e link direto
- **Widget de mensagens:** contador de não lidas e resumo da última conversa
- **Vagas recomendadas:** sugestões baseadas no perfil
- **Banner de incentivo ao teste:** exibido quando match < 80% ou perfil incompleto

---

### 3.3 Busca de Vagas

Exploração completa de oportunidades:

- **Busca por texto:** em título, empresa e descrição, com debounce
- **Filtros avançados:** localização, modalidade (remoto, híbrido, presencial), área, nível de senioridade e faixa salarial
- **Ordenação:** maior match, mais recentes, maior salário e menor salário
- **Visualização:** lista ou grid, com 12/24/48 itens por página
- **Score de match visual:** anel circular com percentual e cores por faixa (0–40 azul, 40–60 âmbar, 60–80 verde, 80+ verde claro)
- **Cards de vaga:** título, empresa, localização, modalidade, faixa salarial, score de match, badges de nível/área, indicador de candidatura enviada e botão de favoritar

**Detalhes da Vaga:**
- Header com informações principais e botões de candidatura e favoritar
- Cards informativos: localização, salário, data de publicação e total de candidaturas
- Breakdown do match: score total por categorias com modal explicativo da metodologia
- Comparação comportamental: perfil do candidato versus perfil ideal da vaga (lado a lado)
- Pontos fortes e oportunidades de desenvolvimento
- Descrição completa, requisitos, benefícios e informações da empresa

**Modal de Candidatura:**
- Mensagem opcional do candidato
- Seletor de highlights: experiências, educação, habilidades e cursos a destacar
- Confirmação com modal de sucesso

**Vagas Favoritas:** lista de vagas salvas com ordenação (recentes, salário, prazo), indicador de vaga encerrada e ações de ver detalhes, candidatar-se ou remover

**Vagas Recomendadas:** lista inteligente baseada no perfil com filtros inline, score de recomendação visual, botão de feedback ("não me interessa") e atualização manual

---

### 3.4 Candidaturas

Histórico e acompanhamento de todas as candidaturas:

- **Cards de estatísticas:** total, em análise, entrevistas agendadas e propostas recebidas
- **Filtros por status:** todas, pendentes, em análise, entrevista, propostas, reprovadas e desistências
- **Cards de candidatura:** empresa, vaga, data, badge de status colorido e ações
- **Cancelamento:** disponível para candidaturas pendentes ou em revisão, com aviso de irreversibilidade
- **Status possíveis:** pendente, em revisão, entrevista, proposta, rejeitada, contratada e desistência

---

### 3.5 Entrevistas

Gerenciamento de entrevistas agendadas:

- **Layout:** sidebar com cards por status (pendentes, confirmadas, realizadas) e mini calendário com marcações
- **Cards de entrevista:** empresa, cargo, data/hora, tipo (vídeo, telefone, presencial) e status
- **Ações contextuais:**
  - Pendente: confirmar (escolhendo slot) ou sugerir horário alternativo
  - Confirmada: cancelar (com motivo obrigatório) ou enviar mensagem
  - Realizada: ver candidatura

---

### 3.6 Testes Comportamentais (Gauge-Pro)

Avaliação comportamental completa:

**Hub de Testes:**
- Hero card com estatísticas (total, concluídos, pendentes) e CTA para iniciar ou refazer (respeitando período de cooldown com countdown)
- Abas: todos, voluntários e solicitados
- Cards de teste com tipo, nome, data, resultado e status

**Avaliação Gauge-Pro (2 partes, 25 questões):**
1. **Parte 1 — Seleção de Palavras (10 passos):** grid com 25 palavras embaralhadas, candidato seleciona 3 por dimensão/perspectiva, 5 dimensões x 2 perspectivas = 10 passos, com transição celebrativa entre dimensões
2. **Parte 2 — Cenários Situacionais (15 passos):** cenário descritivo com 4 opções de resposta (A/B/C/D), barra de progresso geral
3. **Análise:** tela de processamento enquanto os scores são calculados
4. **Salvamento automático:** estado intermediário preservado em caso de interrupção

**Resultado do Gauge-Pro:**
- Arquétipo comportamental (ex: "O Estrategista") com descrição
- 5 dimensões com barras de progresso, score percentual e classificação (baixo/médio/alto)
- Pesos: Parte 1 (60%) + Parte 2 (40%)
- Pontos fortes e áreas de desenvolvimento
- Estilo de trabalho e comunicação
- Carreiras recomendadas
- Análise por IA: insights práticos e técnicos gerados automaticamente

---

### 3.7 Mensagens

Chat com empresas sobre candidaturas:

- **Layout responsivo:** lista de conversas (mobile: tela cheia; desktop: split view)
- **Lista de conversas:** avatar da empresa, cargo da vaga, preview da última mensagem, timestamp e badge de não lidas
- **Chat:** bolhas de mensagem com alinhamento, indicadores de envio/leitura e timestamps
- **Mensagens especiais:** cards de solicitação de teste com botões "Realizar Teste" e "Ver Vaga"
- **Input:** textarea expansível com suporte a Shift+Enter para quebra de linha

---

### 3.8 Perfil Profissional e CV

Gestão completa do perfil/currículo:

- **Dados Pessoais:** nome, título profissional, sobre, email, telefone e LinkedIn, com auto-save
- **Experiências:** lista com reordenamento drag-and-drop, formulário com empresa, cargo, datas e descrição, toggle "trabalho atual"
- **Educação:** instituição, curso, tipo (graduação, pós-graduação etc.), data de conclusão
- **Habilidades:** busca com autocomplete, tags removíveis e suporte a skills customizadas
- **Cursos:** cards de cursos completados com link/upload de certificado

**Importação de CV (PDF):**
1. Upload via drag-and-drop (aceita PDF)
2. Parsing com barra de progresso por etapas (pessoal, experiências, educação, habilidades)
3. Revisão: campos editáveis com destaque para itens de baixa confiança
4. Confirmação e integração automática ao perfil

---

### 3.9 Notificações

Centro de notificações com filtros:

- **Tipos:** vagas compatíveis, atualizações de candidatura, testes solicitados, mensagens, aprovações e processos encerrados
- **Cards:** ícone por tipo, título, descrição, timestamp e indicador de leitura
- **Agrupamento:** por data (hoje, ontem, semana passada etc.)
- **Ações:** marcar como lida (individual) e marcar todas como lidas

---

### 3.10 Meu Plano

Gerenciamento de assinatura do candidato:

- **Informações:** plano atual, status (ativa, trial, cancelada, expirada), valor, próxima cobrança e recursos inclusos
- **Ações:** fazer upgrade, mudar plano
- **Integração:** pagamento via Stripe

---

### 3.11 Configurações

Preferências do candidato:

- **Notificações:** push e email
- **Aparência:** tema claro/escuro
- **Privacidade:** controle de visibilidade do perfil
- **Vagas ideais:** filtros salvos de preferência

---

*Documento gerado em abril de 2026 — Versão 1.52.0 (Crossmatch)*
