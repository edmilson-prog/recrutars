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
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-l-[3px] border-l-primary p-6"
        >
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 shrink-0">
              <Grid3X3 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground">Features por Plano</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Configure quais funcionalidades cada plano libera. Defina capabilities e atribua-as aos planos.
              </p>
            </div>
            <Button onClick={() => setEditorOpen(true)} className="shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Nova Capability
            </Button>
          </div>
        </motion.div>

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
