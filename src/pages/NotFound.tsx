import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassFooter } from "@/components/layout/GlassFooter";

const NotFound = () => {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background pb-12">
        <div className="text-center px-6">
          <div className="w-24 h-24 mx-auto mb-8 rounded-2xl gradient-primary flex items-center justify-center">
            <span className="text-5xl font-bold text-primary-foreground">404</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Página não encontrada</h1>
          <p className="text-muted-foreground mb-8">A página que você procura não existe.</p>
          <Button asChild>
            <Link to="/"><Home className="w-5 h-5 mr-2" />Ir para o início</Link>
          </Button>
        </div>
      </div>
      <GlassFooter />
    </>
  );
};

export default NotFound;
