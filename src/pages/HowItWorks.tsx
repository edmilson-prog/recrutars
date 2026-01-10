import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-20 gradient-hero min-h-[40vh] flex items-center">
        <div className="container py-16 text-center text-primary-foreground">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Como funciona</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Descubra como a RecrutaRS transforma seu processo de recrutamento.
          </p>
        </div>
      </div>
      <div className="container py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-muted/50 rounded-2xl p-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">🚧 Página em construção</h2>
            <p className="text-muted-foreground">
              Estamos preparando conteúdo incrível sobre como nossa plataforma funciona. 
              Volte em breve!
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
