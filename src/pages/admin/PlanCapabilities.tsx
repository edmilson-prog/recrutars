/**
 * PlanCapabilities Page
 * PRD-060: Capability matrix page for plan feature management
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CapabilityMatrix } from '@/components/admin/plans/CapabilityMatrix';
import { CapabilityEditor } from '@/components/admin/plans/CapabilityEditor';
import { useCapabilities } from '@/hooks/useCapabilities';
import { usePlans } from '@/hooks/usePlans';
import { toast } from 'sonner';
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
    toast.success('Capability atualizada.');
  };

  const handleAddCapability = (capability: PlanCapability) => {
    addCapability(capability);
    toast.success(`Capability "${capability.name}" adicionada.`);
  };

  return (
    <DashboardLayout userType="admin">
      <AdminTabNav />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Grid3X3 className="w-8 h-8 text-cyan-600" />
              Features por Plano
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure quais funcionalidades cada plano libera
            </p>
          </div>
          <Button onClick={() => setEditorOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Capability
          </Button>
        </div>

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
