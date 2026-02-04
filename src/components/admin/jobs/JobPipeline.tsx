/**
 * JobPipeline Component
 * PRD-058: Visual pipeline de etapas do recrutamento
 */

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PipelineStage {
  name: string;
  count: number;
  color: string;
}

interface JobPipelineProps {
  stages: PipelineStage[];
}

export function JobPipeline({ stages }: JobPipelineProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-0">
      {stages.map((stage, index) => (
        <div key={stage.name} className="flex items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'flex flex-col items-center justify-center rounded-2xl p-4 min-w-[140px] border-2',
              'bg-card shadow-soft'
            )}
            style={{ borderColor: stage.color }}
          >
            <span
              className="text-3xl font-bold"
              style={{ color: stage.color }}
            >
              {stage.count}
            </span>
            <span className="text-xs text-muted-foreground mt-1 text-center font-medium">
              {stage.name}
            </span>
          </motion.div>
          {index < stages.length - 1 && (
            <ArrowRight className="w-5 h-5 text-muted-foreground mx-2 hidden md:block flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
