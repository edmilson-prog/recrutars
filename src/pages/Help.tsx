/**
 * Help Page
 * PRD-028: Central de Ajuda
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContactInfo } from '@/components/help/ContactInfo';
import { FAQSection } from '@/components/help/FAQSection';
import { TicketsList } from '@/components/help/TicketsList';
import { NewTicketModal } from '@/components/help/NewTicketModal';
import { useTickets } from '@/hooks/useTickets';
import type { UserArea, TicketCategory } from '@/types/help';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

function HelpContent() {
  const { user, isAuthenticated, currentCandidate, currentCompany } = useAuth();
  const navigate = useNavigate();
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);

  // Determinar a área do usuário para filtrar FAQ
  const userArea: UserArea = user?.type === 'candidate'
    ? 'candidate'
    : user?.type === 'company'
    ? 'company'
    : user?.type === 'admin'
    ? 'admin'
    : 'general';

  // Email do usuário
  const userEmail = currentCandidate?.email || currentCompany?.email || '';

  // Hook de tickets (apenas se autenticado)
  const {
    tickets,
    loading: ticketsLoading,
    createTicket,
    getTicketsByStatus,
  } = useTickets(user?.id || '');

  const handleCreateTicket = async (
    category: TicketCategory,
    subject: string,
    description: string,
    attachment?: { url: string; name: string }
  ) => {
    await createTicket(category, subject, description, attachment);
  };

  const handleViewTicketDetails = (ticketId: string) => {
    navigate(`/ajuda/tickets/${ticketId}`);
  };

  return (
    <div className="space-y-8">
      {/* Header - apenas para versão autenticada (dashboard) */}
      {isAuthenticated && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Central de Ajuda</h1>
              <p className="mt-2 text-muted-foreground">
                Encontre respostas para suas dúvidas ou entre em contato conosco.
              </p>
            </div>
            <Button onClick={() => setShowNewTicketModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Ticket
            </Button>
          </div>
        </motion.div>
      )}

      {/* Informações de contato */}
      <motion.div {...fadeInUp}>
        <ContactInfo />
      </motion.div>

      {/* Tabs */}
      <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className={isAuthenticated ? 'grid w-full grid-cols-2' : ''}>
            <TabsTrigger value="faq">Perguntas Frequentes</TabsTrigger>
            {isAuthenticated && <TabsTrigger value="tickets">Meus Tickets</TabsTrigger>}
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            <FAQSection userArea={userArea} />
          </TabsContent>

          {isAuthenticated ? (
            <TabsContent value="tickets" className="space-y-6">
              {ticketsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Carregando tickets...</p>
                </div>
              ) : (
                <TicketsList
                  tickets={tickets}
                  onViewDetails={handleViewTicketDetails}
                />
              )}
            </TabsContent>
          ) : (
            <motion.div
              className="rounded-2xl border border-dashed border-border/50 bg-card/30 p-8 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <p className="mb-4 text-muted-foreground">
                Faça login para acessar seus tickets e criar solicitações de suporte.
              </p>
              <Button onClick={() => navigate('/login')} variant="outline">
                <LogIn className="mr-2 h-4 w-4" />
                Fazer Login
              </Button>
            </motion.div>
          )}
        </Tabs>
      </motion.div>

      {/* Modal de novo ticket */}
      {isAuthenticated && (
        <NewTicketModal
          open={showNewTicketModal}
          onOpenChange={setShowNewTicketModal}
          userEmail={userEmail}
          onSubmit={handleCreateTicket}
        />
      )}
    </div>
  );
}

export default function HelpPage() {
  const { isAuthenticated, user } = useAuth();

  // Se autenticado, usar DashboardLayout
  if (isAuthenticated && user) {
    return (
      <DashboardLayout userType={user.type}>
        <HelpContent />
      </DashboardLayout>
    );
  }

  // Se não autenticado, usar PublicLayout com Hero Section
  return (
    <PublicLayout>
      <div className="min-h-screen pb-12">
        <Header />

        {/* Hero Section */}
        <div className="pt-20 gradient-hero min-h-[40vh] flex items-center">
          <div className="container py-16 text-center text-primary-foreground">
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Central de Ajuda
            </motion.h1>
            <motion.p
              className="text-xl text-primary-foreground/80 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Encontre respostas para suas dúvidas ou entre em contato conosco
            </motion.p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="container py-16">
          <HelpContent />
        </div>

        <Footer />
      </div>
    </PublicLayout>
  );
}
