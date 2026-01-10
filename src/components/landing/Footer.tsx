import { Link } from 'react-router-dom';
import { Linkedin, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground py-16">
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
              <li><Link to="/como-funciona" className="hover:text-secondary transition-colors">Como funciona</Link></li>
              <li><Link to="/planos" className="hover:text-secondary transition-colors">Planos e preços</Link></li>
              <li><Link to="#" className="hover:text-secondary transition-colors">Gauge-Pro</Link></li>
              <li><Link to="#" className="hover:text-secondary transition-colors">Para empresas</Link></li>
              <li><Link to="#" className="hover:text-secondary transition-colors">Para candidatos</Link></li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="font-semibold mb-4">Recursos</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="#" className="hover:text-secondary transition-colors">Blog</Link></li>
              <li><Link to="#" className="hover:text-secondary transition-colors">Central de ajuda</Link></li>
              <li><Link to="#" className="hover:text-secondary transition-colors">Webinars</Link></li>
              <li><Link to="#" className="hover:text-secondary transition-colors">E-books</Link></li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="#" className="hover:text-secondary transition-colors">Sobre nós</Link></li>
              <li><Link to="#" className="hover:text-secondary transition-colors">Carreiras</Link></li>
              <li><Link to="#" className="hover:text-secondary transition-colors">Contato</Link></li>
              <li><Link to="#" className="hover:text-secondary transition-colors">Política de privacidade</Link></li>
              <li><Link to="#" className="hover:text-secondary transition-colors">Termos de uso</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © 2024 RecrutaRS. Todos os direitos reservados.
          </p>
          <p className="text-sm text-primary-foreground/60">
            Desenvolvido por <span className="text-secondary">AILA Automação Inteligente</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
