/**
 * BulkActionToolbar
 * PRD-090 Phase 6: Floating toolbar for bulk team member actions.
 *
 * Appears fixed at bottom center when members are selected.
 * Uses Framer Motion for entrance/exit animation (slide up from bottom).
 * Styling follows the InvitationBulkActionBar glassmorphic pattern.
 */

import { Button } from '@/components/ui/button';
import { UserMinus, ArrowRightLeft, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BulkActionToolbarProps {
  selectedCount: number;
  onBulkTerminate: () => void;
  onBulkTransferDepartment: () => void;
  onBulkStartLeave: () => void;
  onClearSelection: () => void;
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const toolbarVariants = {
  hidden: {
    y: 80,
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    y: 80,
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BulkActionToolbar({
  selectedCount,
  onBulkTerminate,
  onBulkTransferDepartment,
  onBulkStartLeave,
  onClearSelection,
}: BulkActionToolbarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          key="bulk-action-toolbar"
          variants={toolbarVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-primary/10 border border-primary/30 backdrop-blur-md rounded-lg px-5 py-3 shadow-lg"
          role="toolbar"
          aria-label="Acoes em lote para colaboradores"
        >
          {/* Selection count */}
          <span className="text-sm font-medium whitespace-nowrap">
            {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
          </span>

          <div className="h-4 w-px bg-border" aria-hidden="true" />

          {/* Terminate */}
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkTerminate}
            className="gap-1.5"
          >
            <UserMinus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Desligar</span>
            <span>({selectedCount})</span>
          </Button>

          {/* Transfer department */}
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkTransferDepartment}
            className="gap-1.5"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Mover Departamento</span>
          </Button>

          {/* Start leave */}
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkStartLeave}
            className="gap-1.5"
          >
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Registrar Afastamento</span>
          </Button>

          <div className="h-4 w-px bg-border" aria-hidden="true" />

          {/* Clear selection */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-xs text-muted-foreground gap-1"
          >
            <X className="h-3 w-3" />
            Limpar seleção
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
