import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Início' },
  { href: '/como-funciona', label: 'Como funciona' },
  { href: '/planos', label: 'Planos' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass shadow-soft">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">R</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              RecrutaRS
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  "text-muted-foreground hover:text-foreground",
                  location.pathname === link.href && "text-foreground"
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
    </header>
  );
}
