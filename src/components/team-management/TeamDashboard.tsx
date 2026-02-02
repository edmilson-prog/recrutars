import { useMemo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { TeamKPICards } from "./TeamKPICards";
import { TeamAlertsList } from "./TeamAlertsList";
import { ManagerRecommendations } from "./ManagerRecommendations";
import ArchetypeDistributionChart from "./ArchetypeDistributionChart";
import type { TeamMember, Department, TeamAlert } from "@/types/teamManagement";

interface TeamDashboardProps {
  members: TeamMember[];
  departments: Department[];
  alerts: TeamAlert[];
}

export default function TeamDashboard({
  members,
  departments,
  alerts,
}: TeamDashboardProps) {
  const kpis = useMemo(() => {
    const totalMembers = members.length;
    const mappedMembers = members.filter(
      (m) => m.gaugeStatus === "mapped"
    ).length;
    const pendingMembers = members.filter(
      (m) => m.gaugeStatus !== "mapped"
    ).length;

    const activeDepartments = new Set(
      members
        .filter((m) => m.isActive)
        .map((m) => m.departmentId)
    ).size;

    const archetypeCounts: Record<string, number> = {};
    members.forEach((m) => {
      if (m.gaugeStatus === "mapped" && m.archetype) {
        archetypeCounts[m.archetype] =
          (archetypeCounts[m.archetype] || 0) + 1;
      }
    });

    const predominantArchetype =
      Object.entries(archetypeCounts).sort(
        ([, a], [, b]) => b - a
      )[0]?.[0] ?? "N/A";

    const retestPending = members.filter(
      (m) => m.gaugeStatus === "retest_pending"
    ).length;

    return {
      totalMembers,
      mappedMembers,
      pendingMembers,
      activeDepartments,
      predominantArchetype,
      retestPending,
    };
  }, [members]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <TeamKPICards
          totalMembers={kpis.totalMembers}
          mappedMembers={kpis.mappedMembers}
          pendingMembers={kpis.pendingMembers}
          activeDepartments={kpis.activeDepartments}
          predominantArchetype={kpis.predominantArchetype}
          retestPending={kpis.retestPending}
        />
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="grid gap-6 lg:grid-cols-5"
      >
        <div className="lg:col-span-3">
          <ArchetypeDistributionChart
            members={members}
            departments={departments}
          />
        </div>

        <div className="lg:col-span-2">
          <TeamAlertsList alerts={alerts} />
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <ManagerRecommendations
          members={members}
          departments={departments}
          alerts={alerts}
        />
      </motion.div>
    </motion.div>
  );
}
