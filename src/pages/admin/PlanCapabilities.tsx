/**
 * PlanCapabilities Page
 * PRD-060: Capability matrix page for plan feature management
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CapabilityMatrix } from '@/components/admin/plans/CapabilityMatrix';
import { CapabilityEditor } from '@/components/admin/plans/CapabilityEditor';
import { useCapabilities } from '@/hooks/useCapabilities';
import { usePlans } from '@/hooks/usePlans';
import type { PlanCapability } from '@/types';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

export default function PlanCapabilities() {
  const { candidatePlans, companyPlans } = usePlans();
  const {
    capabilities,
    categorizedCapabilities,
    assignments,
    updateAssignment,
    addCapability,
  } = useCapabilities();

  const [editorOpen, setEditorOpen] = useState(false);

  const handleUpdateAssignment = (planId: string, capKey: string, value: string | number | boolean) => {
    updateAssignment(planId, capKey, value);
  };

  const handleAddCapability = (capability: PlanCapability) => {
    addCapability(capability);
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Features por Plano"
          description="Configure quais funcionalidades cada plano libera. Defina capabilities e atribua-as aos planos."
          actions={
            <Button onClick={() => setEditorOpen(true)} className="shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Nova Capability
            </Button>
          }
          howItWorks={[
            'Defina quais funcionalidades cada plano oferece',
            'Configure limites de uso por funcionalidade',
            'Use "Nova Capability" para adicionar uma funcionalidade',
          ]}
        />

        <AdminTabNav />

        {/* Tabs */}
        <Tabs defaultValue="candidato" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="candidato">Candidato</TabsTrigger>
            <TabsTrigger value="empresa">Empresa</TabsTrigger>
          </TabsList>

          <TabsContent value="candidato" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CapabilityMatrix
                plans={candidatePlans}
                capabilities={capabilities}
                assignments={assignments}
                categorizedCapabilities={categorizedCapabilities}
                onUpdateAssignment={handleUpdateAssignment}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="empresa" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CapabilityMatrix
                plans={companyPlans}
                capabilities={capabilities}
                assignments={assignments}
                categorizedCapabilities={categorizedCapabilities}
                onUpdateAssignment={handleUpdateAssignment}
              />
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Capability Editor Dialog */}
        <CapabilityEditor
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          onSave={handleAddCapability}
        />
      </div>
    </DashboardLayout>
  );
}
