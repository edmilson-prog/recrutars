import { motion } from 'framer-motion';
import { ArrowRight, Users, Building2, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden gradient-hero">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-secondary/5 to-transparent rounded-full" />
      </div>

      <div className="container relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-primary-foreground"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-6"
            >
              <Brain className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium">Avaliação comportamental com IA</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Encontre o{' '}
              <span className="text-secondary">talento ideal</span>{' '}
              para sua empresa
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl"
            >
              Plataforma de recrutamento inteligente que conecta empresas a candidatos 
              através de avaliações comportamentais científicas e matching por IA.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button asChild variant="hero-outline" size="xl">
                <Link to="/login">
                  Começar agora
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="xl" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/como-funciona">
                  Saiba mais
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-8 mt-12 pt-8 border-t border-primary-foreground/20"
            >
              <div>
                <div className="text-3xl font-bold text-secondary">+1.200</div>
                <div className="text-sm text-primary-foreground/70">Empresas ativas</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary">+50.000</div>
                <div className="text-sm text-primary-foreground/70">Candidatos cadastrados</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary">78%</div>
                <div className="text-sm text-primary-foreground/70">Taxa de match</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Visual Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Cards Stack */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -left-4 bg-card rounded-2xl shadow-large p-6 w-64"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Novo candidato</div>
                    <div className="text-sm text-muted-foreground">Match 94%</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full">React</span>
                  <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full">Node.js</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/3 -right-8 bg-card rounded-2xl shadow-large p-6 w-72"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Tech Solutions</div>
                    <div className="text-sm text-muted-foreground">5 vagas abertas</div>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '75%' }} />
                </div>
                <div className="text-xs text-muted-foreground mt-2">75% do processo concluído</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-0 left-1/4 bg-card rounded-2xl shadow-large p-6 w-64"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Gauge-Pro</div>
                    <div className="text-sm text-muted-foreground">Teste concluído</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">72</div>
                    <div className="text-[10px] text-muted-foreground">D</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-secondary">45</div>
                    <div className="text-[10px] text-muted-foreground">I</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-success">58</div>
                    <div className="text-[10px] text-muted-foreground">S</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-warning">65</div>
                    <div className="text-[10px] text-muted-foreground">C</div>
                  </div>
                </div>
              </motion.div>

              {/* Center circle decoration */}
              <div className="w-80 h-80 mx-auto rounded-full border-2 border-primary-foreground/20 flex items-center justify-center">
                <div className="w-60 h-60 rounded-full border-2 border-primary-foreground/15 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full border-2 border-primary-foreground/10" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
