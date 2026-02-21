import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const sections = [
  { id: 'o-que-e', title: '1. O que é a LGPD' },
  { id: 'dados-coletados', title: '2. Dados que Coletamos' },
  { id: 'finalidades', title: '3. Finalidades do Tratamento' },
  { id: 'base-legal', title: '4. Base Legal' },
  { id: 'seus-direitos', title: '5. Seus Direitos' },
  { id: 'compartilhamento', title: '6. Compartilhamento de Dados' },
  { id: 'seguranca', title: '7. Segurança dos Dados' },
  { id: 'retencao', title: '8. Retenção de Dados' },
  { id: 'cookies', title: '9. Cookies e Rastreamento' },
  { id: 'encarregado', title: '10. Encarregado (DPO)' },
  { id: 'alteracoes', title: '11. Alterações nesta Política' },
];

export default function LGPD() {
  const [activeSection, setActiveSection] = useState('o-que-e');

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
              Consentimento LGPD
            </motion.h1>
            <motion.p
              className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              Como a RecrutaRS trata seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4 text-primary-foreground/70"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span>Versão 1.0</span>
              <span className="hidden sm:inline">•</span>
              <span>Última atualização: Fevereiro de 2026</span>
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
                {/* 1. O que é a LGPD */}
                <section id="o-que-e" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">1. O que é a LGPD</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">
                      A <strong className="text-foreground">Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)</strong> é a legislação brasileira que regula o tratamento de dados pessoais por pessoas físicas e jurídicas, com o objetivo de proteger os direitos fundamentais de liberdade e de privacidade.
                    </p>
                    <p className="text-muted-foreground mb-4">
                      A LGPD estabelece regras sobre coleta, armazenamento, tratamento e compartilhamento de dados pessoais, garantindo maior proteção e transparência ao titular dos dados.
                    </p>
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">🛡️ Compromisso RecrutaRS:</strong> Tratamos seus dados com total transparência e responsabilidade, seguindo rigorosamente os princípios da LGPD: finalidade, adequação, necessidade, livre acesso, qualidade, transparência, segurança, prevenção, não discriminação e responsabilização.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 2. Dados que Coletamos */}
                <section id="dados-coletados" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">2. Dados que Coletamos</h2>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2.1 Dados de Candidatos</h3>
                  <div className="bg-card rounded-xl p-6 shadow-soft mb-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Dados Pessoais</h4>
                        <ul className="space-y-2 text-muted-foreground text-sm">
                          <li>• Nome completo e CPF</li>
                          <li>• Data de nascimento e gênero</li>
                          <li>• Estado civil e nacionalidade</li>
                          <li>• E-mail e telefone</li>
                          <li>• Cidade e estado de residência</li>
                          <li>• Foto de perfil</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Dados Profissionais</h4>
                        <ul className="space-y-2 text-muted-foreground text-sm">
                          <li>• Experiências profissionais</li>
                          <li>• Formação acadêmica</li>
                          <li>• Habilidades e competências</li>
                          <li>• Pretensão salarial</li>
                          <li>• Disponibilidade e preferências de vaga</li>
                          <li>• Resultados de avaliações comportamentais</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2.2 Dados de Empresas</h3>
                  <div className="bg-card rounded-xl p-6 shadow-soft mb-4">
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Razão social, CNPJ e nome fantasia</li>
                      <li>• Endereço e dados de contato</li>
                      <li>• Dados do responsável pela conta (nome, e-mail, telefone)</li>
                      <li>• Informações de vagas publicadas</li>
                    </ul>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2.3 Dados Coletados Automaticamente</h3>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Endereço IP e tipo de navegador</li>
                      <li>• Páginas visitadas e tempo de navegação</li>
                      <li>• Dados de cookies e tecnologias similares</li>
                      <li>• Registros de acesso (logs) conforme Marco Civil da Internet</li>
                    </ul>
                  </div>
                </section>

                {/* 3. Finalidades do Tratamento */}
                <section id="finalidades" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">3. Finalidades do Tratamento</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">Seus dados são tratados para as seguintes finalidades específicas:</p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> <strong className="text-foreground">Recrutamento e seleção:</strong> conectar candidatos a vagas compatíveis com seu perfil</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> <strong className="text-foreground">Avaliações comportamentais:</strong> gerar perfis de competências por meio do Gauge-Pro</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> <strong className="text-foreground">Matching inteligente:</strong> recomendar candidatos e vagas com base em algoritmos de compatibilidade</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> <strong className="text-foreground">Gestão de conta:</strong> autenticação, comunicação e suporte ao usuário</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> <strong className="text-foreground">Melhoria dos serviços:</strong> análises estatísticas anônimas para aprimorar a plataforma</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> <strong className="text-foreground">Obrigações legais:</strong> cumprimento de legislação trabalhista, fiscal e regulatória</li>
                    </ul>
                    <div className="mt-4 p-4 bg-warning/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">⚠️ Importante:</strong> Seus dados nunca serão utilizados para finalidades diferentes das aqui descritas sem seu consentimento prévio e específico.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 4. Base Legal */}
                <section id="base-legal" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">4. Base Legal para o Tratamento</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">
                      Conforme o Art. 7º da LGPD, o tratamento dos seus dados pela RecrutaRS é fundamentado nas seguintes bases legais:
                    </p>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-foreground mb-1">📋 Consentimento (Art. 7º, I)</h4>
                        <p className="text-sm text-muted-foreground">Para coleta e uso de dados pessoais durante o cadastro, avaliações comportamentais e compartilhamento com empresas recrutadoras.</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-foreground mb-1">📄 Execução de contrato (Art. 7º, V)</h4>
                        <p className="text-sm text-muted-foreground">Para prestação dos serviços contratados, processamento de pagamentos e cumprimento dos Termos de Uso.</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-foreground mb-1">⚖️ Cumprimento de obrigação legal (Art. 7º, II)</h4>
                        <p className="text-sm text-muted-foreground">Para atender exigências do Marco Civil da Internet (logs de acesso), legislação fiscal e trabalhista.</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-foreground mb-1">🔍 Legítimo interesse (Art. 7º, IX)</h4>
                        <p className="text-sm text-muted-foreground">Para melhorias na plataforma, prevenção de fraudes e segurança da informação, sempre respeitando seus direitos fundamentais.</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 5. Seus Direitos */}
                <section id="seus-direitos" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">5. Seus Direitos como Titular</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft mb-4">
                    <p className="text-muted-foreground mb-4">
                      Conforme os Arts. 17 a 22 da LGPD, você tem os seguintes direitos:
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                        <span className="text-success mt-0.5">✓</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">Confirmação e acesso</p>
                          <p className="text-xs text-muted-foreground">Saber se tratamos seus dados e acessá-los</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                        <span className="text-success mt-0.5">✓</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">Correção</p>
                          <p className="text-xs text-muted-foreground">Corrigir dados incompletos ou desatualizados</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                        <span className="text-success mt-0.5">✓</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">Anonimização ou eliminação</p>
                          <p className="text-xs text-muted-foreground">Solicitar exclusão de dados desnecessários</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                        <span className="text-success mt-0.5">✓</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">Portabilidade</p>
                          <p className="text-xs text-muted-foreground">Transferir dados para outro fornecedor</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                        <span className="text-success mt-0.5">✓</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">Revogação do consentimento</p>
                          <p className="text-xs text-muted-foreground">Retirar seu consentimento a qualquer momento</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                        <span className="text-success mt-0.5">✓</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">Oposição</p>
                          <p className="text-xs text-muted-foreground">Opor-se ao tratamento em certas situações</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <h4 className="font-semibold text-foreground mb-3">Como exercer seus direitos</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Você pode exercer seus direitos de duas formas:
                    </p>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> <strong className="text-foreground">Pela plataforma:</strong> nas configurações da sua conta, seção de privacidade</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> <strong className="text-foreground">Por e-mail:</strong> enviando solicitação para privacidade@recrutars.com.br</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-4">
                      <strong className="text-foreground">Prazo de resposta:</strong> até 15 dias úteis, conforme Art. 18, §5º da LGPD.
                    </p>
                  </div>
                </section>

                {/* 6. Compartilhamento */}
                <section id="compartilhamento" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">6. Compartilhamento de Dados</h2>

                  <div className="bg-card rounded-xl p-6 shadow-soft mb-4">
                    <h4 className="font-semibold text-foreground mb-3">Com quem compartilhamos</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="text-success mt-0.5">✓</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">Empresas recrutadoras</p>
                          <p className="text-xs text-muted-foreground">Dados do perfil profissional e resultados de avaliações, quando você se candidata a uma vaga ou está visível no banco de talentos.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-success mt-0.5">✓</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">Provedores de infraestrutura</p>
                          <p className="text-xs text-muted-foreground">Supabase (banco de dados e autenticação) e serviços de hospedagem, sob contratos de proteção de dados.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-success mt-0.5">✓</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">Processadores de pagamento</p>
                          <p className="text-xs text-muted-foreground">Stripe, para processamento seguro de transações financeiras.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <h4 className="font-semibold text-foreground mb-3">Nunca compartilhamos</h4>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Dados com terceiros para fins de marketing ou publicidade</li>
                      <li className="flex items-start gap-2"><span className="text-destructive">✗</span> CPF ou documentos pessoais com empresas recrutadoras</li>
                      <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Informações sensíveis sem consentimento explícito</li>
                      <li className="flex items-start gap-2"><span className="text-destructive">✗</span> Dados com entidades governamentais, exceto por obrigação legal</li>
                    </ul>
                  </div>
                </section>

                {/* 7. Segurança */}
                <section id="seguranca" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">7. Segurança dos Dados</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">
                      Adotamos medidas técnicas e organizacionais para proteger seus dados contra acessos não autorizados, destruição, perda, alteração ou qualquer forma de tratamento inadequado:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Medidas Técnicas</h4>
                        <ul className="space-y-2 text-muted-foreground text-sm">
                          <li className="flex items-start gap-2"><span className="text-success">✓</span> Criptografia em trânsito (HTTPS/TLS)</li>
                          <li className="flex items-start gap-2"><span className="text-success">✓</span> Criptografia de senhas (bcrypt)</li>
                          <li className="flex items-start gap-2"><span className="text-success">✓</span> Row Level Security (RLS) no banco de dados</li>
                          <li className="flex items-start gap-2"><span className="text-success">✓</span> Tokens JWT para autenticação</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Medidas Organizacionais</h4>
                        <ul className="space-y-2 text-muted-foreground text-sm">
                          <li className="flex items-start gap-2"><span className="text-success">✓</span> Acesso restrito a dados por função</li>
                          <li className="flex items-start gap-2"><span className="text-success">✓</span> Logs de auditoria de operações</li>
                          <li className="flex items-start gap-2"><span className="text-success">✓</span> Backups regulares e seguros</li>
                          <li className="flex items-start gap-2"><span className="text-success">✓</span> Política interna de segurança da informação</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-warning/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">⚠️ Em caso de incidente:</strong> Comunicaremos a ANPD (Autoridade Nacional de Proteção de Dados) e os titulares afetados em prazo razoável, conforme Art. 48 da LGPD.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 8. Retenção */}
                <section id="retencao" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">8. Retenção de Dados</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">
                      Os prazos de retenção dos dados variam conforme a finalidade e a base legal:
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 font-semibold text-foreground">Tipo de Dado</th>
                            <th className="text-left py-3 px-2 font-semibold text-foreground">Prazo</th>
                            <th className="text-left py-3 px-2 font-semibold text-foreground">Justificativa</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr className="border-b">
                            <td className="py-3 px-2">Dados de conta ativa</td>
                            <td className="py-3 px-2">Enquanto a conta existir</td>
                            <td className="py-3 px-2">Execução do contrato</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-2">Logs de acesso</td>
                            <td className="py-3 px-2">6 meses</td>
                            <td className="py-3 px-2">Marco Civil da Internet</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-2">Dados de processos seletivos</td>
                            <td className="py-3 px-2">5 anos</td>
                            <td className="py-3 px-2">Obrigação trabalhista</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-2">Dados fiscais e pagamentos</td>
                            <td className="py-3 px-2">5 anos</td>
                            <td className="py-3 px-2">Legislação tributária</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-2">Dados após exclusão da conta</td>
                            <td className="py-3 px-2">90 dias (recuperação)</td>
                            <td className="py-3 px-2">Legítimo interesse</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-2">Dados anonimizados</td>
                            <td className="py-3 px-2">Indeterminado</td>
                            <td className="py-3 px-2">Estatísticas (sem identificação)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Após os prazos indicados, os dados são eliminados de forma segura ou anonimizados irreversivelmente.
                    </p>
                  </div>
                </section>

                {/* 9. Cookies */}
                <section id="cookies" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">9. Cookies e Rastreamento</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">
                      A RecrutaRS utiliza cookies e tecnologias similares para melhorar sua experiência:
                    </p>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-foreground mb-1">🔐 Cookies essenciais</h4>
                        <p className="text-sm text-muted-foreground">Necessários para autenticação, sessão do usuário e funcionamento da plataforma. Não podem ser desabilitados.</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-foreground mb-1">📊 Cookies analíticos</h4>
                        <p className="text-sm text-muted-foreground">Nos ajudam a entender como os usuários navegam na plataforma, permitindo melhorias contínuas. Dados são anonimizados.</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-foreground mb-1">⚙️ Cookies de preferência</h4>
                        <p className="text-sm text-muted-foreground">Lembram suas configurações, como tema (claro/escuro) e idioma, para personalizar sua experiência.</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      <strong className="text-foreground">Nota:</strong> A RecrutaRS <strong className="text-foreground">não utiliza</strong> cookies de publicidade ou rastreamento de terceiros para fins de marketing.
                    </p>
                  </div>
                </section>

                {/* 10. Encarregado (DPO) */}
                <section id="encarregado" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">10. Encarregado de Proteção de Dados (DPO)</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">
                      Conforme o Art. 41 da LGPD, a RecrutaRS designou um Encarregado de Proteção de Dados (DPO) responsável por:
                    </p>
                    <ul className="space-y-2 text-muted-foreground text-sm mb-4">
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Receber e responder solicitações dos titulares de dados</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Interagir com a ANPD (Autoridade Nacional de Proteção de Dados)</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Orientar funcionários e contratados sobre boas práticas de proteção de dados</li>
                      <li className="flex items-start gap-2"><span className="text-success">✓</span> Monitorar a conformidade da RecrutaRS com a LGPD</li>
                    </ul>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-foreground mb-1">📧 E-mail do DPO:</p>
                        <p className="text-muted-foreground">privacidade@recrutars.com.br</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1">📍 Endereço:</p>
                        <p className="text-muted-foreground">Frederico Westphalen - RS, Brasil</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1">🕐 Atendimento:</p>
                        <p className="text-muted-foreground">Segunda a sexta, 9h às 18h (Brasília)</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1">⏱️ Prazo de resposta:</p>
                        <p className="text-muted-foreground">Até 15 dias úteis</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 11. Alterações */}
                <section id="alteracoes" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-foreground mb-4">11. Alterações nesta Política</h2>
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <p className="text-muted-foreground mb-4">
                      Esta política pode ser atualizada periodicamente para refletir mudanças em nossas práticas ou na legislação aplicável.
                    </p>
                    <p className="font-semibold text-foreground mb-2">Procedimento de atualização:</p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Publicaremos a nova versão nesta página com a data de atualização</li>
                      <li>Notificaremos os usuários por e-mail sobre alterações significativas</li>
                      <li>Alterações que exijam novo consentimento serão solicitadas expressamente</li>
                      <li>A versão anterior ficará disponível para consulta por 12 meses</li>
                    </ol>
                  </div>
                </section>

                {/* Aceite */}
                <section className="mb-12">
                  <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 text-center">
                    <p className="text-foreground font-medium mb-2">
                      ✅ Ao utilizar a plataforma RecrutaRS, você declara ter lido e compreendido esta política de tratamento de dados em conformidade com a LGPD.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Consulte também nossos <Link to="/termos-de-uso" className="text-secondary hover:underline">Termos de Uso</Link> e <Link to="/politica-de-privacidade" className="text-secondary hover:underline">Política de Privacidade</Link>.
                    </p>
                  </div>
                </section>

                {/* Footer da página */}
                <div className="text-center text-sm text-muted-foreground border-t pt-8">
                  <p><strong>RecrutaRS Consultoria e Gestão</strong></p>
                  <p>Frederico Westphalen - RS, Brasil</p>
                  <p className="italic mt-2">Conectando Talentos, Construindo Futuros</p>
                  <p className="mt-4">Versão 1.0 | Última atualização: Fevereiro de 2026</p>
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
