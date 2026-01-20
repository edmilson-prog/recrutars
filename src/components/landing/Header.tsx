import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const navLinks = [
  { href: '/', label: 'Início' },
  { href: '/como-funciona', label: 'Como funciona' },
  { href: '/testes-corporativos', label: 'Testes Corporativos' },
  { href: '/planos', label: 'Planos' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  const prefersReducedMotion = useReducedMotion();

  // Suavizar a animação com spring (melhora UX)
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass shadow-soft">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/images/logo-horizontal.png"
              alt="RecrutaRS - Consultoria e Gestão"
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  "text-muted-foreground hover:text-foreground visited:text-muted-foreground",
                  location.pathname === link.href && "text-foreground visited:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button asChild variant="ghost">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild variant="default">
              <Link to="/cadastro">Criar conta</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg transition-colors text-foreground hover:bg-muted"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-card border-t"
        >
          <nav className="container py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="text-foreground hover:text-primary font-medium py-2"
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-border" />
            <Link to="/login" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full">Entrar</Button>
            </Link>
            <Link to="/cadastro" onClick={() => setIsOpen(false)}>
              <Button className="w-full">Criar conta</Button>
            </Link>
          </nav>
        </motion.div>
      )}

      {/* Scroll Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 gradient-primary origin-left"
        style={{ scaleX: prefersReducedMotion ? scrollYProgress : scaleX }}
        role="progressbar"
        aria-label="Progresso de leitura da página"
      />
    </header>
  );
}
