import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const sections = [
  { id: 'compromisso', title: 'Compromisso' },
  { id: 'definicoes', title: '1. Definições' },
  { id: 'dados-coletados', title: '2. Dados Coletados' },
  { id: 'finalidades', title: '3. Finalidades' },
  { id: 'bases-legais', title: '4. Bases Legais' },
  { id: 'compartilhamento', title: '5. Compartilhamento' },
  { id: 'controle-privacidade', title: '6. Controle de Privacidade' },
  { id: 'direitos', title: '7. Seus Direitos' },
  { id: 'seguranca', title: '8. Segurança' },
  { id: 'menores', title: '9. Menores de Idade' },
  { id: 'cookies', title: '10. Cookies' },
  { id: 'links-terceiros', title: '11. Links Terceiros' },
  { id: 'dpo', title: '12. DPO' },
  { id: 'alteracoes', title: '13. Alterações' },
  { id: 'legislacao', title: '14. Legislação' },
  { id: 'contato', title: '15. Contato' },
  { id: 'glossario', title: 'Glossário' },
];

export default function PoliticaPrivacidade() {
  const [activeSection, setActiveSection] = useState('compromisso');

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
              Política de Privacidade
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
                {/* Compromisso */}
                <section id="compromisso" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">Compromisso com sua Privacidade</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground">
                      A <strong className="text-foreground">RecrutaRS Consultoria e Gestão</strong> leva sua privacidade muito a sério. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos, compartilhamos e protegemos seus dados pessoais, em total conformidade com a <strong className="text-foreground">Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>.
                    </p>
                    <p className="text-muted-foreground mt-4">
                      Ao utilizar nossa plataforma, você concorda com as práticas descritas neste documento.
                    </p>
                  </div>
                </section>

                {/* 1. Definições */}
                <section id="definicoes" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">1. Definições Importantes</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft space-y-3">
                    <div><strong className="text-foreground">Dados Pessoais:</strong> <span className="text-muted-foreground">Qualquer informação que identifique ou possa identificar uma pessoa física.</span></div>
                    <div><strong className="text-foreground">Dados Sensíveis:</strong> <span className="text-muted-foreground">Dados sobre origem racial/étnica, convicções religiosas, opiniões políticas, filiação sindical, dados de saúde, vida sexual, dados genéticos ou biométricos.</span></div>
                    <div><strong className="text-foreground">Titular:</strong> <span className="text-muted-foreground">Você, pessoa física a quem os dados pessoais se referem.</span></div>
                    <div><strong className="text-foreground">Controlador:</strong> <span className="text-muted-foreground">RecrutaRS, responsável pelas decisões sobre o tratamento de dados.</span></div>
                    <div><strong className="text-foreground">Tratamento:</strong> <span className="text-muted-foreground">Qualquer operação com dados (coleta, armazenamento, consulta, uso, compartilhamento, exclusão).</span></div>
                    <div><strong className="text-foreground">Consentimento:</strong> <span className="text-muted-foreground">Autorização livre, informada e inequívoca para tratamento de dados.</span></div>
                    <div><strong className="text-foreground">Anonimização:</strong> <span className="text-muted-foreground">Processo que torna impossível a identificação do titular.</span></div>
                  </div>
                </section>

                {/* 2. Dados Coletados */}
                <section id="dados-coletados" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">2. Dados Que Coletamos</h2>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2.1 Dados Fornecidos por Candidatos</h3>
                  <div className="bg-card rounded-xl p-6 shadow-soft mb-4">
                    <p className="font-medium text-foreground mb-2">Dados Cadastrais:</p>
                    <p className="text-muted-foreground mb-4">Nome completo, CPF, data de nascimento, e-mail, telefone, endereço, foto de perfil (opcional).</p>

                    <p className="font-medium text-foreground mb-2">Dados Profissionais:</p>
                    <p className="text-muted-foreground mb-4">Formação acadêmica, experiências profissionais, habilidades, idiomas, certificações, pretensão salarial.</p>

                    <p className="font-medium text-foreground mb-2">Dados Comportamentais:</p>
                    <p className="text-muted-foreground">Respostas ao questionário comportamental, escolhas em cenários de trabalho, vídeo de apresentação (opcional).</p>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2.2 Dados Fornecidos por Empresas</h3>
                  <div className="bg-card rounded-xl p-6 shadow-soft mb-4">
                    <p className="text-muted-foreground">Razão social, nome fantasia, CNPJ, endereço comercial, telefone, e-mail corporativo, nome e cargo do responsável, descrição de vagas, requisitos, faixa salarial, histórico de processos seletivos.</p>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2.3 Dados Coletados Automaticamente</h3>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground">Endereço IP, tipo de navegador, sistema operacional, páginas visitadas, tempo de permanência, dispositivo utilizado, data e hora de acesso, cookies essenciais, de desempenho e de preferências.</p>
                  </div>
                </section>

                {/* 3. Finalidades */}
                <section id="finalidades" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">3. Finalidades do Tratamento</h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-card rounded-xl p-6 shadow-soft">
                      <h3 className="font-semibold text-foreground mb-3">Fornecimento dos Serviços</h3>
                      <ul className="space-y-2 text-muted-foreground text-sm">
                        <li className="flex items-start gap-2"><span className="text-success">✓</span> Criar e gerenciar sua conta</li>
                        <li className="flex items-start gap-2"><span className="text-success">✓</span> Realizar avaliações comportamentais</li>
                        <li className="flex items-start gap-2"><span className="text-success">✓</span> Gerar perfis e relatórios</li>
                        <li className="flex items-start gap-2"><span className="text-success">✓</span> Fazer matching inteligente</li>
                        <li className="flex items-start gap-2"><span className="text-success">✓</span> Processar pagamentos</li>
                      </ul>
                    </div>

                    <div className="bg-card rounded-xl p-6 shadow-soft">
                      <h3 className="font-semibold text-foreground mb-3">Melhorias e Desenvolvimento</h3>
                      <ul className="space-y-2 text-muted-foreground text-sm">
                        <li className="flex items-start gap-2"><span className="text-success">✓</span> Analisar uso da plataforma</li>
                        <li className="flex items-start gap-2"><span className="text-success">✓</span> Treinar algoritmos de IA</li>
                        <li className="flex items-start gap-2"><span className="text-success">✓</span> Desenvolver novos recursos</li>
                        <li className="flex items-start gap-2"><span className="text-success">✓</span> Realizar pesquisas de satisfação</li>
                      </ul>
                    </div>

                    <div className="bg-card rounded-xl p-6 shadow-soft">
                      <h3 className="font-semibold text-foreground mb-3">Segurança e Conformidade</h3>
                      <ul className="space-y-2 text-muted-foreground text-sm">
                        <li className="flex items-start gap-2"><span className="text-success">✓</span> Prevenir fraudes</li>
                        <li className="flex items-start gap-2"><span className="text-success">✓</span> Detectar incidentes de segurança</li>
                        <li className="flex items-start gap-2"><span className="text-success">✓</span> Cumprir obrigações legais</li>
                        <li className="flex items-start gap-2"><span className="text-success">✓</span> Responder a processos judiciais</li>
                      </ul>
                    </div>

                    <div className="bg-card rounded-xl p-6 shadow-soft">
                      <h3 className="font-semibold text-foreground mb-3">Comunicação e Marketing</h3>
                      <ul className="space-y-2 text-muted-foreground text-sm">
                        <li className="flex items-start gap-2"><span className="text-success">✓</span> Enviar comunicações sobre serviços</li>
                        <li className="flex items-start gap-2"><span className="text-success">✓</span> Informar sobre atualizações</li>
                        <li className="flex items-start gap-2"><span className="text-success">✓</span> Newsletters (com consentimento)</li>
                        <li className="flex items-start gap-2"><span className="text-success">✓</span> Campanhas segmentadas</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 4. Bases Legais */}
                <section id="bases-legais" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">4. Bases Legais para Tratamento</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground">Consentimento (Art. 7º, I)</h4>
                      <p className="text-muted-foreground text-sm">Para avaliações comportamentais, comunicações de marketing, compartilhamento de perfil com empresas. Você pode revogar a qualquer momento.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Execução de Contrato (Art. 7º, V)</h4>
                      <p className="text-muted-foreground text-sm">Para fornecimento dos serviços contratados, processamento de pagamentos, gestão de processos seletivos.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Exercício Regular de Direitos (Art. 7º, VI)</h4>
                      <p className="text-muted-foreground text-sm">Para defesa em processos judiciais, proteção ao crédito, execução de contratos.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Legítimo Interesse (Art. 7º, IX)</h4>
                      <p className="text-muted-foreground text-sm">Para segurança da plataforma, prevenção de fraudes, melhorias nos serviços, analytics.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Cumprimento de Obrigação Legal (Art. 7º, II)</h4>
                      <p className="text-muted-foreground text-sm">Para emissão de notas fiscais, atendimento a requisições judiciais, obrigações trabalhistas e tributárias.</p>
                    </div>
                  </div>
                </section>

                {/* 5. Compartilhamento */}
                <section id="compartilhamento" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">5. Compartilhamento de Dados</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground">Empresas Parceiras</h4>
                      <p className="text-muted-foreground text-sm">Quando você se candidata a uma vaga ou configura perfil como público/anônimo. Dados compartilhados conforme suas configurações de privacidade.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Prestadores de Serviços</h4>
                      <p className="text-muted-foreground text-sm">Hospedagem em nuvem, gateway de pagamento, serviços de e-mail. Todos assinam contratos de confidencialidade e conformidade LGPD.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Autoridades Públicas</h4>
                      <p className="text-muted-foreground text-sm">Quando há obrigação legal, ordem judicial ou requisição de autoridade competente.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Transferência Internacional</h4>
                      <p className="text-muted-foreground text-sm">Apenas com países ou empresas que oferecem nível adequado de proteção. Você será informado sobre transferências internacionais.</p>
                    </div>
                  </div>
                </section>

                {/* 6. Controle de Privacidade */}
                <section id="controle-privacidade" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">6. Controle de Privacidade - Suas Escolhas</h2>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Configurações de Visibilidade (Candidatos)</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-card rounded-xl p-5 shadow-soft">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                        <span className="text-xl">🌐</span>
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">Perfil Público</h4>
                      <p className="text-muted-foreground text-sm">Nome, foto e empresa atual visíveis. Perfil aparece em todas as buscas.</p>
                    </div>
                    <div className="bg-card rounded-xl p-5 shadow-soft">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                        <span className="text-xl">🕶️</span>
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">Perfil Anônimo</h4>
                      <p className="text-muted-foreground text-sm">IA usa seus dados para matching. Nome e foto ficam ocultos até você decidir revelar.</p>
                    </div>
                    <div className="bg-card rounded-xl p-5 shadow-soft">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                        <span className="text-xl">🔐</span>
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">Perfil Privado</h4>
                      <p className="text-muted-foreground text-sm">Não aparece em buscas. Somente visível quando você se candidata.</p>
                    </div>
                  </div>
                </section>

                {/* 7. Direitos */}
                <section id="direitos" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">7. Seus Direitos como Titular de Dados</h2>
                  <p className="text-muted-foreground mb-4">Conforme a LGPD (Art. 18), você tem direito a:</p>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <ul className="grid md:grid-cols-2 gap-4">
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> <span className="text-muted-foreground"><strong className="text-foreground">Confirmação e Acesso</strong> - Saber se tratamos seus dados e acessar todos eles</span></li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> <span className="text-muted-foreground"><strong className="text-foreground">Correção</strong> - Corrigir dados incompletos ou desatualizados</span></li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> <span className="text-muted-foreground"><strong className="text-foreground">Anonimização, Bloqueio ou Eliminação</strong> - Exclusão de dados desnecessários</span></li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> <span className="text-muted-foreground"><strong className="text-foreground">Portabilidade</strong> - Cópia dos dados em formato estruturado (CSV, JSON)</span></li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> <span className="text-muted-foreground"><strong className="text-foreground">Eliminação</strong> - Exclusão de dados tratados com base em consentimento</span></li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> <span className="text-muted-foreground"><strong className="text-foreground">Informação sobre Compartilhamento</strong> - Saber com quem compartilhamos seus dados</span></li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> <span className="text-muted-foreground"><strong className="text-foreground">Revogação de Consentimento</strong> - Retirar consentimento a qualquer momento</span></li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> <span className="text-muted-foreground"><strong className="text-foreground">Revisão de Decisões Automatizadas</strong> - Solicitar revisão de decisões por algoritmos</span></li>
                    </ul>

                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Para exercer seus direitos:</strong> Entre em contato via <strong>privacidade@recrutars.com.br</strong>. Prazo de resposta: até 15 dias corridos.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 8. Segurança */}
                <section id="seguranca" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">8. Segurança dos Dados</h2>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-card rounded-xl p-6 shadow-soft">
                      <h3 className="font-semibold text-foreground mb-3">🔒 Medidas Técnicas</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>Criptografia AES-256 em repouso</li>
                        <li>SSL/TLS para transmissões</li>
                        <li>Senhas com hash bcrypt</li>
                        <li>Autenticação multifator (2FA)</li>
                        <li>Controle de acesso RBAC</li>
                        <li>Logs de auditoria</li>
                        <li>Detecção de atividades suspeitas</li>
                        <li>Testes de penetração periódicos</li>
                      </ul>
                    </div>

                    <div className="bg-card rounded-xl p-6 shadow-soft">
                      <h3 className="font-semibold text-foreground mb-3">🛡️ Medidas Organizacionais</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>Treinamento contínuo da equipe</li>
                        <li>Políticas internas de segurança</li>
                        <li>Contratos de confidencialidade</li>
                        <li>Gestão de incidentes</li>
                        <li>Backups diários criptografados</li>
                      </ul>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Retenção de Dados</h3>
                  <div className="bg-card rounded-xl p-6 shadow-soft overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 font-semibold text-foreground">Tipo de Dado</th>
                          <th className="text-left py-3 font-semibold text-foreground">Prazo de Retenção</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b"><td className="py-3">Dados de conta ativa</td><td className="py-3">Durante a vigência da conta</td></tr>
                        <tr className="border-b"><td className="py-3">Histórico de processos seletivos</td><td className="py-3">5 anos (obrigação legal trabalhista)</td></tr>
                        <tr className="border-b"><td className="py-3">Dados fiscais e de pagamento</td><td className="py-3">5 anos (obrigação legal tributária)</td></tr>
                        <tr className="border-b"><td className="py-3">Logs de acesso</td><td className="py-3">6 meses</td></tr>
                        <tr className="border-b"><td className="py-3">Dados anonimizados</td><td className="py-3">Indefinidamente</td></tr>
                        <tr><td className="py-3">Dados após exclusão de conta</td><td className="py-3">90 dias, depois eliminação definitiva</td></tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 9. Menores */}
                <section id="menores" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">9. Dados de Menores de Idade</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">A plataforma RecrutaRS <strong className="text-foreground">não é destinada a menores de 18 anos</strong>.</p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Não coletamos intencionalmente dados de menores</li>
                      <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Contas de menores identificadas serão encerradas</li>
                      <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Dados coletados inadvertidamente serão deletados</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-4">
                      Se você é pai/mãe ou responsável e acredita que coletamos dados de um menor, entre em contato: <strong>privacidade@recrutars.com.br</strong>
                    </p>
                  </div>
                </section>

                {/* 10. Cookies */}
                <section id="cookies" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">10. Uso de Cookies</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                    <p className="text-muted-foreground">Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você acessa nosso site.</p>

                    <div>
                      <h4 className="font-semibold text-foreground">Cookies Essenciais (Obrigatórios)</h4>
                      <p className="text-muted-foreground text-sm">Necessários para funcionamento básico. Autenticação e segurança de sessão. Não podem ser desativados.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Cookies de Desempenho e Análise</h4>
                      <p className="text-muted-foreground text-sm">Google Analytics, Hotjar. Dados agregados sobre uso. Podem ser desativados.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Cookies de Preferências</h4>
                      <p className="text-muted-foreground text-sm">Salvam configurações (idioma, tema). Podem ser desativados.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Cookies de Marketing (Opcional)</h4>
                      <p className="text-muted-foreground text-sm">Google Ads, Facebook Pixel. Requer consentimento. Você pode recusar.</p>
                    </div>
                  </div>
                </section>

                {/* 11. Links Terceiros */}
                <section id="links-terceiros" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">11. Links para Sites de Terceiros</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">Nossa plataforma pode conter links para sites externos (ex.: LinkedIn de candidatos, sites de empresas).</p>
                    <div className="p-4 bg-warning/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">⚠️ Atenção:</strong> Não somos responsáveis por políticas de privacidade de terceiros. Recomendamos ler as políticas de cada site que você visitar.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 12. DPO */}
                <section id="dpo" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">12. Encarregado de Proteção de Dados (DPO)</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">Conforme LGPD, designamos um Encarregado de Proteção de Dados para:</p>
                    <ul className="space-y-2 text-muted-foreground mb-4">
                      <li>• Atuar como canal de comunicação entre titular, RecrutaRS e ANPD</li>
                      <li>• Orientar funcionários sobre práticas de proteção de dados</li>
                      <li>• Supervisar conformidade com LGPD</li>
                      <li>• Atender solicitações dos titulares</li>
                    </ul>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Contato do DPO:</strong><br />
                        📧 dpo@recrutars.com.br<br />
                        📧 privacidade@recrutars.com.br
                      </p>
                    </div>
                  </div>
                </section>

                {/* 13. Alterações */}
                <section id="alteracoes" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">13. Alterações nesta Política</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">Podemos atualizar esta Política periodicamente para refletir mudanças na legislação, novas funcionalidades ou melhores práticas de segurança.</p>
                    <p className="text-muted-foreground"><strong className="text-foreground">Quando houver alterações:</strong></p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground mt-2">
                      <li>Versão atualizada será publicada nesta página</li>
                      <li>Data de "Última atualização" será modificada</li>
                      <li>Alterações significativas serão notificadas por e-mail</li>
                      <li>Uso continuado após notificação constitui aceitação</li>
                    </ol>
                  </div>
                </section>

                {/* 14. Legislação */}
                <section id="legislacao" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">14. Legislação e Jurisdição</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">Esta Política de Privacidade é regida pela legislação brasileira, especialmente:</p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</li>
                      <li>• Marco Civil da Internet (Lei nº 12.965/2014)</li>
                      <li>• Código de Defesa do Consumidor (Lei nº 8.078/1990)</li>
                    </ul>
                    <p className="text-muted-foreground mt-4">
                      <strong className="text-foreground">Foro competente:</strong> Comarca de Frederico Westphalen - RS
                    </p>
                  </div>
                </section>

                {/* 15. Contato */}
                <section id="contato" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">15. Contato</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">Para dúvidas, solicitações ou reclamações sobre privacidade:</p>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-foreground mb-1">📧 Privacidade e LGPD:</p>
                        <p className="text-muted-foreground">privacidade@recrutars.com.br</p>
                        <p className="text-muted-foreground">dpo@recrutars.com.br</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1">📧 Suporte Geral:</p>
                        <p className="text-muted-foreground">contato@recrutars.com.br</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1">📍 Endereço:</p>
                        <p className="text-muted-foreground">RecrutaRS Consultoria e Gestão</p>
                        <p className="text-muted-foreground">Frederico Westphalen - RS</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1">💬 Chat Online:</p>
                        <p className="text-muted-foreground">Segunda a sexta, 9h às 18h</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Aceite */}
                <section className="mb-12">
                  <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 text-center">
                    <p className="text-foreground font-medium">
                      ✅ Ao utilizar a plataforma RecrutaRS, você declara ter lido, compreendido e concordado com esta Política de Privacidade.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Se você não concorda com qualquer parte desta política, não utilize nossos serviços.
                    </p>
                  </div>
                </section>

                {/* Glossário */}
                <section id="glossario" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">Glossário LGPD</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <dl className="space-y-3 text-sm">
                      <div><dt className="font-semibold text-foreground inline">ANPD:</dt> <dd className="text-muted-foreground inline">Autoridade Nacional de Proteção de Dados - órgão responsável por zelar pela LGPD</dd></div>
                      <div><dt className="font-semibold text-foreground inline">Consentimento:</dt> <dd className="text-muted-foreground inline">Autorização livre, informada e inequívoca do titular</dd></div>
                      <div><dt className="font-semibold text-foreground inline">Controlador:</dt> <dd className="text-muted-foreground inline">Quem toma decisões sobre tratamento de dados (RecrutaRS)</dd></div>
                      <div><dt className="font-semibold text-foreground inline">Dado Pessoal:</dt> <dd className="text-muted-foreground inline">Informação que identifica ou pode identificar uma pessoa</dd></div>
                      <div><dt className="font-semibold text-foreground inline">Dado Sensível:</dt> <dd className="text-muted-foreground inline">Dado sobre origem racial, religião, saúde, vida sexual, etc.</dd></div>
                      <div><dt className="font-semibold text-foreground inline">DPO:</dt> <dd className="text-muted-foreground inline">Data Protection Officer - Encarregado de Proteção de Dados</dd></div>
                      <div><dt className="font-semibold text-foreground inline">LGPD:</dt> <dd className="text-muted-foreground inline">Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</dd></div>
                      <div><dt className="font-semibold text-foreground inline">Operador:</dt> <dd className="text-muted-foreground inline">Quem trata dados em nome do controlador</dd></div>
                      <div><dt className="font-semibold text-foreground inline">Titular:</dt> <dd className="text-muted-foreground inline">Pessoa física dona dos dados pessoais</dd></div>
                      <div><dt className="font-semibold text-foreground inline">Tratamento:</dt> <dd className="text-muted-foreground inline">Qualquer operação com dados pessoais</dd></div>
                    </dl>
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
