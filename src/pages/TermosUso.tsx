import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const sections = [
  { id: 'aceitacao', title: '1. Aceitação dos Termos' },
  { id: 'definicoes', title: '2. Definições' },
  { id: 'elegibilidade', title: '3. Elegibilidade e Cadastro' },
  { id: 'uso-servicos', title: '4. Uso dos Serviços' },
  { id: 'avaliacoes', title: '5. Avaliações Comportamentais' },
  { id: 'planos', title: '6. Planos e Pagamentos' },
  { id: 'propriedade', title: '7. Propriedade Intelectual' },
  { id: 'protecao-dados', title: '8. Proteção de Dados' },
  { id: 'limitacao', title: '9. Limitação de Responsabilidade' },
  { id: 'modificacoes', title: '10. Modificações dos Termos' },
  { id: 'rescisao', title: '11. Rescisão e Suspensão' },
  { id: 'disposicoes', title: '12. Disposições Gerais' },
  { id: 'lei-foro', title: '13. Lei Aplicável e Foro' },
  { id: 'contato', title: '14. Contato' },
];

export default function TermosUso() {
  const [activeSection, setActiveSection] = useState('aceitacao');

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((s) => ({
        id: s.id,
        element: document.getElementById(s.id),
      }));

      for (const section of sectionElements) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-screen pb-12">
        <Header />

        {/* Hero */}
        <div className="pt-20 gradient-hero min-h-[40vh] flex items-center">
          <div className="container py-16 text-center text-primary-foreground">
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Termos de Uso
            </motion.h1>
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4 text-primary-foreground/70"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span>Versão 1.0</span>
              <span className="hidden sm:inline">•</span>
              <span>Última atualização: Novembro de 2025</span>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="container py-12">
          <div className="flex gap-12 max-w-7xl mx-auto">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <nav className="sticky top-24 space-y-1">
                <p className="text-sm font-semibold text-foreground mb-4">Índice</p>
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-secondary/10 text-secondary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {/* 1. Aceitação */}
                <section id="aceitacao" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">1. Aceitação dos Termos</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">
                      Bem-vindo à plataforma RecrutaRS. Ao criar uma conta, acessar ou utilizar nossos serviços, você concorda expressamente com estes Termos de Uso e nossa <Link to="/politica-de-privacidade" className="text-secondary hover:underline">Política de Privacidade</Link>.
                    </p>
                    <div className="p-4 bg-warning/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">⚠️ Importante:</strong> Se você não concorda com alguma parte destes termos, não utilize nossos serviços.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 2. Definições */}
                <section id="definicoes" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">2. Definições</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft space-y-3">
                    <div><strong className="text-foreground">"Plataforma":</strong> <span className="text-muted-foreground">Refere-se ao site, aplicativos e todos os serviços digitais oferecidos pela RecrutaRS.</span></div>
                    <div><strong className="text-foreground">"Usuário":</strong> <span className="text-muted-foreground">Qualquer pessoa física ou jurídica que cria uma conta na plataforma.</span></div>
                    <div><strong className="text-foreground">"Candidato":</strong> <span className="text-muted-foreground">Pessoa física que utiliza a plataforma para buscar oportunidades de emprego.</span></div>
                    <div><strong className="text-foreground">"Empresa":</strong> <span className="text-muted-foreground">Pessoa jurídica que utiliza a plataforma para recrutar profissionais.</span></div>
                    <div><strong className="text-foreground">"Serviços":</strong> <span className="text-muted-foreground">Todas as funcionalidades oferecidas, incluindo avaliações comportamentais, matching de vagas, gestão de processos seletivos e relatórios.</span></div>
                    <div><strong className="text-foreground">"Conteúdo":</strong> <span className="text-muted-foreground">Qualquer informação, texto, dado, arquivo, imagem, vídeo ou material enviado à plataforma.</span></div>
                  </div>
                </section>

                {/* 3. Elegibilidade */}
                <section id="elegibilidade" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">3. Elegibilidade e Cadastro</h2>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.1 Requisitos Mínimos</h3>
                  <div className="bg-card rounded-xl p-6 shadow-soft mb-4">
                    <p className="text-muted-foreground mb-4">Para utilizar a plataforma, você deve:</p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Ter idade mínima de 18 anos completos</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Fornecer informações verdadeiras, precisas e atualizadas</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Manter suas credenciais de acesso em sigilo</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Notificar imediatamente qualquer uso não autorizado de sua conta</li>
                    </ul>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.2 Tipos de Conta</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-card rounded-xl p-6 shadow-soft">
                      <h4 className="font-semibold text-foreground mb-3">Conta de Candidato</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Para pessoas físicas em busca de oportunidades</li>
                        <li>• Requer CPF válido e dados pessoais verídicos</li>
                        <li>• Permite acesso a avaliações e vagas</li>
                      </ul>
                    </div>
                    <div className="bg-card rounded-xl p-6 shadow-soft">
                      <h4 className="font-semibold text-foreground mb-3">Conta Empresarial</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Para pessoas jurídicas que desejam recrutar</li>
                        <li>• Requer CNPJ ativo e documentação</li>
                        <li>• Permite publicação de vagas e acesso ao banco de talentos</li>
                      </ul>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.3 Responsabilidade pelas Informações</h3>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">Você é integralmente responsável por todas as informações fornecidas e atividades realizadas em sua conta.</p>
                    <p className="font-semibold text-foreground mb-2">A RecrutaRS não se responsabiliza por:</p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Informações inverídicas fornecidas pelos usuários</li>
                      <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Conteúdo ofensivo, inadequado ou ilegal publicado por terceiros</li>
                      <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Consequências de contratações baseadas em dados falsos</li>
                    </ul>
                  </div>
                </section>

                {/* 4. Uso dos Serviços */}
                <section id="uso-servicos" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">4. Uso dos Serviços</h2>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">4.1 Licença de Uso</h3>
                  <div className="bg-card rounded-xl p-6 shadow-soft mb-4">
                    <p className="text-muted-foreground">
                      A RecrutaRS concede a você uma licença <strong className="text-foreground">limitada, não exclusiva, intransferível e revogável</strong> para acessar e utilizar a plataforma conforme estes Termos.
                    </p>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">4.2 Usos Permitidos</h3>
                  <div className="bg-card rounded-xl p-6 shadow-soft mb-4">
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Criar e gerenciar seu perfil profissional (Candidatos)</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Realizar avaliações comportamentais fornecidas</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Candidatar-se a vagas compatíveis com seu perfil</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Publicar vagas e buscar candidatos (Empresas)</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Gerenciar processos seletivos</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Acessar relatórios e analytics disponibilizados</li>
                    </ul>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">4.3 Usos Proibidos</h3>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">É estritamente proibido:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <ul className="space-y-2 text-muted-foreground text-sm">
                        <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Fornecer informações falsas ou enganosas</li>
                        <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Criar múltiplas contas com o mesmo CPF/CNPJ</li>
                        <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Utilizar bots, scripts ou automação não autorizada</li>
                        <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Fazer engenharia reversa do código-fonte</li>
                        <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Extrair dados (scraping) de candidatos ou empresas</li>
                      </ul>
                      <ul className="space-y-2 text-muted-foreground text-sm">
                        <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Publicar vagas falsas ou discriminatórias</li>
                        <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Assediar, discriminar ou ofender outros usuários</li>
                        <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Revender ou redistribuir acesso à plataforma</li>
                        <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Tentar burlar sistemas de segurança</li>
                        <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Utilizar a plataforma para fins ilícitos</li>
                      </ul>
                    </div>
                    <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">⚠️ Violações resultarão em suspensão ou exclusão permanente da conta, sem direito a reembolso.</strong>
                      </p>
                    </div>
                  </div>
                </section>

                {/* 5. Avaliações */}
                <section id="avaliacoes" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">5. Avaliações Comportamentais</h2>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">5.1 Natureza das Avaliações</h3>
                  <div className="bg-card rounded-xl p-6 shadow-soft mb-4">
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• São baseadas em metodologias científicas validadas</li>
                      <li>• Fornecem indicadores probabilísticos, não garantias absolutas</li>
                      <li>• Devem ser utilizadas como ferramentas complementares de decisão</li>
                      <li>• São protegidas por direitos autorais e propriedade intelectual</li>
                    </ul>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">5.2 Uso Ético dos Resultados</h3>
                  <div className="bg-card rounded-xl p-6 shadow-soft mb-4">
                    <p className="text-muted-foreground mb-4">Empresas comprometem-se a:</p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Utilizar resultados apenas para fins de recrutamento</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Não discriminar candidatos com base exclusiva em perfis comportamentais</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Manter confidencialidade das avaliações</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Respeitar a legislação trabalhista e de proteção de dados</li>
                    </ul>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">5.3 Limitações</h3>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">As avaliações <strong className="text-foreground">NÃO substituem:</strong></p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Entrevistas presenciais ou virtuais</li>
                      <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Verificação de referências profissionais</li>
                      <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Análise de competências técnicas específicas</li>
                      <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Julgamento humano e expertise do recrutador</li>
                    </ul>
                  </div>
                </section>

                {/* 6. Planos e Pagamentos */}
                <section id="planos" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">6. Planos, Pagamentos e Cancelamentos</h2>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-card rounded-xl p-6 shadow-soft">
                      <h4 className="font-semibold text-foreground mb-3">Planos para Candidatos</h4>
                      <p className="text-muted-foreground text-sm">Básico, Trimestral, Semestral e Anual. Renovação automática, salvo cancelamento.</p>
                    </div>
                    <div className="bg-card rounded-xl p-6 shadow-soft">
                      <h4 className="font-semibold text-foreground mb-3">Planos para Empresas</h4>
                      <p className="text-muted-foreground text-sm">Avulso, Mensal, Trimestral, Semestral e Anual. Vagas ilimitadas ou por publicação.</p>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl p-6 shadow-soft mb-4">
                    <h4 className="font-semibold text-foreground mb-3">Formas de Pagamento</h4>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Cartão de crédito (renovação automática)</li>
                      <li>• Pix (pagamento único)</li>
                      <li>• Boleto bancário (pagamento único)</li>
                    </ul>
                  </div>

                  <div className="bg-card rounded-xl p-6 shadow-soft mb-4">
                    <h4 className="font-semibold text-foreground mb-3">Cancelamento</h4>
                    <p className="text-muted-foreground text-sm mb-4">Você pode cancelar sua assinatura a qualquer momento através do painel de configurações.</p>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Cancelamentos são processados imediatamente</li>
                      <li>• Acesso continua até o final do período já pago</li>
                      <li>• Não há reembolso proporcional de períodos não utilizados</li>
                      <li>• Histórico permanece acessível por 90 dias após cancelamento</li>
                    </ul>
                  </div>

                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <h4 className="font-semibold text-foreground mb-3">Reembolsos</h4>
                    <p className="text-muted-foreground text-sm mb-4">Reembolsos são concedidos apenas em casos de:</p>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Cobrança indevida comprovada</li>
                      <li>• Falha técnica que impossibilite uso por mais de 7 dias</li>
                      <li>• Duplicação de pagamento</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-4">
                      <strong className="text-foreground">Prazo para solicitação:</strong> 7 dias corridos após a cobrança.
                    </p>
                  </div>
                </section>

                {/* 7. Propriedade Intelectual */}
                <section id="propriedade" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">7. Propriedade Intelectual</h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-card rounded-xl p-6 shadow-soft">
                      <h4 className="font-semibold text-foreground mb-3">Direitos da RecrutaRS</h4>
                      <p className="text-muted-foreground text-sm mb-4">Todos os direitos sobre a plataforma pertencem à RecrutaRS:</p>
                      <ul className="space-y-2 text-muted-foreground text-sm">
                        <li>• Código-fonte e arquitetura de software</li>
                        <li>• Algoritmos de matching e IA</li>
                        <li>• Metodologias de avaliação comportamental</li>
                        <li>• Design, interface e elementos visuais</li>
                        <li>• Marca, logotipo e identidade visual</li>
                      </ul>
                    </div>
                    <div className="bg-card rounded-xl p-6 shadow-soft">
                      <h4 className="font-semibold text-foreground mb-3">Direitos dos Usuários</h4>
                      <p className="text-muted-foreground text-sm mb-4">Você mantém propriedade sobre:</p>
                      <ul className="space-y-2 text-muted-foreground text-sm">
                        <li>• Seus dados pessoais e profissionais</li>
                        <li>• Currículos e vídeos de apresentação</li>
                        <li>• Conteúdos criados por você na plataforma</li>
                      </ul>
                      <p className="text-muted-foreground text-sm mt-4">
                        Ao usar a plataforma, você concede à RecrutaRS licença para processar seus dados conforme o serviço.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 8. Proteção de Dados */}
                <section id="protecao-dados" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">8. Proteção de Dados e Privacidade</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">
                      A RecrutaRS está em total conformidade com a <strong className="text-foreground">Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>.
                    </p>
                    <p className="text-muted-foreground mb-4">
                      Para detalhes completos sobre coleta, uso, armazenamento e compartilhamento de dados, consulte nossa <Link to="/politica-de-privacidade" className="text-secondary hover:underline font-medium">Política de Privacidade</Link>.
                    </p>
                    <h4 className="font-semibold text-foreground mb-3">Seus Direitos</h4>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Acessar seus dados pessoais</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Corrigir dados incompletos ou desatualizados</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Solicitar anonimização ou exclusão</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Exportar seus dados (portabilidade)</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Revogar consentimento a qualquer momento</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-4">
                      <strong className="text-foreground">Para exercer seus direitos:</strong> privacidade@recrutars.com.br
                    </p>
                  </div>
                </section>

                {/* 9. Limitação de Responsabilidade */}
                <section id="limitacao" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">9. Limitação de Responsabilidade</h2>

                  <div className="bg-card rounded-xl p-6 shadow-soft mb-4">
                    <h4 className="font-semibold text-foreground mb-3">Disponibilidade da Plataforma</h4>
                    <p className="text-muted-foreground text-sm mb-4">A RecrutaRS se esforça para manter a plataforma disponível 24/7, mas não garante:</p>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Funcionamento ininterrupto ou livre de erros</li>
                      <li>• Disponibilidade durante manutenções programadas</li>
                      <li>• Imunidade a falhas de infraestrutura de terceiros</li>
                    </ul>
                  </div>

                  <div className="bg-card rounded-xl p-6 shadow-soft mb-4">
                    <h4 className="font-semibold text-foreground mb-3">Conteúdo de Terceiros</h4>
                    <p className="text-muted-foreground text-sm mb-4">A RecrutaRS não se responsabiliza por:</p>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Veracidade de informações fornecidas por candidatos ou empresas</li>
                      <li>• Conteúdo ofensivo, ilegal ou inadequado publicado por usuários</li>
                      <li>• Danos decorrentes de interações fora da plataforma</li>
                      <li>• Decisões de contratação baseadas exclusivamente em dados da plataforma</li>
                    </ul>
                  </div>

                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <h4 className="font-semibold text-foreground mb-3">Relações Trabalhistas</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      A RecrutaRS atua exclusivamente como <strong className="text-foreground">intermediadora tecnológica</strong>. Não há vínculo empregatício entre RecrutaRS e candidatos ou empresas.
                    </p>
                    <p className="text-muted-foreground text-sm font-medium">A RecrutaRS não é parte nem responsável por:</p>
                    <ul className="space-y-2 text-muted-foreground text-sm mt-2">
                      <li>• Contratos de trabalho firmados entre empresas e candidatos</li>
                      <li>• Remunerações, benefícios ou questões trabalhistas</li>
                      <li>• Descumprimento de acordos entre as partes</li>
                    </ul>
                  </div>
                </section>

                {/* 10. Modificações */}
                <section id="modificacoes" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">10. Modificações dos Termos</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">
                      A RecrutaRS reserva-se o direito de modificar estes Termos de Uso a qualquer momento.
                    </p>
                    <p className="font-semibold text-foreground mb-2">Procedimento:</p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Usuários serão notificados por e-mail sobre alterações significativas</li>
                      <li>Nova versão será publicada na plataforma com data de atualização</li>
                      <li>Uso continuado após notificação constitui aceitação dos novos termos</li>
                      <li>Se discordar, você deve cancelar sua conta antes da vigência das alterações</li>
                    </ol>
                  </div>
                </section>

                {/* 11. Rescisão */}
                <section id="rescisao" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">11. Rescisão e Suspensão</h2>

                  <div className="bg-card rounded-xl p-6 shadow-soft mb-4">
                    <h4 className="font-semibold text-foreground mb-3">Suspensão pela RecrutaRS</h4>
                    <p className="text-muted-foreground text-sm mb-4">Podemos suspender ou encerrar sua conta imediatamente, sem aviso prévio, em caso de:</p>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Violação destes Termos de Uso</li>
                      <li>• Atividade fraudulenta ou ilegal</li>
                      <li>• Inadimplência superior a 30 dias</li>
                      <li>• Uso inadequado que prejudique outros usuários ou a plataforma</li>
                      <li>• Ordem judicial ou de autoridade competente</li>
                    </ul>
                  </div>

                  <div className="bg-card rounded-xl p-6 shadow-soft mb-4">
                    <h4 className="font-semibold text-foreground mb-3">Rescisão pelo Usuário</h4>
                    <p className="text-muted-foreground text-sm">
                      Você pode encerrar sua conta a qualquer momento através das configurações da plataforma.
                    </p>
                  </div>

                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <h4 className="font-semibold text-foreground mb-3">Efeitos da Rescisão</h4>
                    <p className="text-muted-foreground text-sm mb-4">Após rescisão:</p>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Acesso à plataforma será imediatamente revogado</li>
                      <li>• Dados pessoais serão tratados conforme Política de Privacidade</li>
                      <li>• Histórico de processos seletivos será mantido por 5 anos (obrigação legal)</li>
                      <li>• Dados anonimizados podem ser mantidos para estatísticas</li>
                    </ul>
                  </div>
                </section>

                {/* 12. Disposições Gerais */}
                <section id="disposicoes" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">12. Disposições Gerais</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground">Independência das Cláusulas</h4>
                      <p className="text-muted-foreground text-sm">Se qualquer cláusula destes Termos for considerada inválida, as demais permanecerão em pleno vigor.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Cessão</h4>
                      <p className="text-muted-foreground text-sm">Você não pode transferir ou ceder seus direitos e obrigações sem autorização prévia da RecrutaRS.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Acordo Integral</h4>
                      <p className="text-muted-foreground text-sm">Estes Termos, juntamente com a Política de Privacidade, constituem o acordo integral entre você e a RecrutaRS.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Idioma</h4>
                      <p className="text-muted-foreground text-sm">Em caso de tradução destes Termos, a versão em português prevalecerá.</p>
                    </div>
                  </div>
                </section>

                {/* 13. Lei e Foro */}
                <section id="lei-foro" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">13. Lei Aplicável e Foro</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">
                      Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Foro competente:</strong> Comarca de Frederico Westphalen - RS, com exclusão de qualquer outro, por mais privilegiado que seja.
                    </p>
                  </div>
                </section>

                {/* 14. Contato */}
                <section id="contato" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">14. Contato</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">Para dúvidas, sugestões ou exercício de direitos:</p>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-foreground mb-1">📧 E-mail:</p>
                        <p className="text-muted-foreground">juridico@recrutars.com.br</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1">📧 Dados Pessoais (LGPD):</p>
                        <p className="text-muted-foreground">privacidade@recrutars.com.br</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1">📍 Endereço:</p>
                        <p className="text-muted-foreground">Frederico Westphalen - RS, Brasil</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1">🕐 Horário de atendimento:</p>
                        <p className="text-muted-foreground">Segunda a sexta, 9h às 18h (Brasília)</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Aceite */}
                <section className="mb-12">
                  <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 text-center">
                    <p className="text-foreground font-medium">
                      ✅ Ao criar sua conta e utilizar a plataforma RecrutaRS, você declara ter lido, compreendido e concordado integralmente com estes Termos de Uso.
                    </p>
                  </div>
                </section>

                {/* Footer da página */}
                <div className="text-center text-sm text-muted-foreground border-t pt-8">
                  <p><strong>RecrutaRS Consultoria e Gestão</strong></p>
                  <p>Frederico Westphalen - RS, Brasil</p>
                  <p className="italic mt-2">Conectando Talentos, Construindo Futuros</p>
                  <p className="mt-4">Versão 1.0 | Última atualização: Novembro de 2025</p>
                </div>
              </div>
            </main>
          </div>
        </div>

        <Footer />
      </div>
    </PublicLayout>
  );
}
