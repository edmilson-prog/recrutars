import { Link } from 'react-router-dom';
import { Linkedin, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground dark:bg-card text-primary-foreground dark:text-card-foreground py-16">
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <span className="text-xl font-bold text-secondary-foreground">R</span>
              </div>
              <span className="text-xl font-bold">RecrutaRS</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm mb-4">
              Plataforma de recrutamento inteligente que conecta empresas aos melhores talentos.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-primary-foreground/60 hover:text-secondary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-secondary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-secondary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Produto */}
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/como-funciona" className="hover:text-secondary transition-colors">Como Funciona</Link></li>
              <li><Link to="/planos" className="hover:text-secondary transition-colors">Planos e Preços</Link></li>
              <li><Link to="/testes-corporativos" className="hover:text-secondary transition-colors">Testes Corporativos</Link></li>
              <li><Link to="/para-empresas" className="hover:text-secondary transition-colors">Para Empresas</Link></li>
              <li><Link to="/para-candidatos" className="hover:text-secondary transition-colors">Para Candidatos</Link></li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="font-semibold mb-4">Recursos</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="#" className="hover:text-secondary transition-colors">Blog</Link></li>
              <li><Link to="/ajuda" className="hover:text-secondary transition-colors">Central de Ajuda</Link></li>
              <li><Link to="#" className="hover:text-secondary transition-colors">Webinars</Link></li>
              <li><Link to="#" className="hover:text-secondary transition-colors">E-books</Link></li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/quem-somos" className="hover:text-secondary transition-colors">Sobre Nós</Link></li>
              <li><Link to="/missao-visao-valores" className="hover:text-secondary transition-colors">Missão e Valores</Link></li>
              <li><Link to="#" className="hover:text-secondary transition-colors">Contato</Link></li>
              <li><Link to="/politica-de-privacidade" className="hover:text-secondary transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/termos-de-uso" className="hover:text-secondary transition-colors">Termos de uso</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © 2026 RecrutaRS. Todos os direitos reservados.
          </p>
          <p className="text-sm text-primary-foreground/60">
            Desenvolvido por <span className="text-secondary">AILA Sistemas Inteligentes</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
