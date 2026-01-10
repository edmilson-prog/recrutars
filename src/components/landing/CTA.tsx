import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function CTA() {
  return (
    <section className="py-24 gradient-hero relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Pronto para transformar seu recrutamento?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-10">
            Junte-se a mais de 1.200 empresas que já contratam melhor com a RecrutaRS.
            Teste grátis por 14 dias.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero-outline" size="xl">
              <Link to="/cadastro">
                Começar gratuitamente
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="xl" className="text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/contato">
                Falar com especialista
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
