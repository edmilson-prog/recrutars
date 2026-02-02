/**
 * TeamMemberCard
 * PRD-055: Card compacto de colaborador para a visualizacao em grid.
 */

import { motion } from "framer-motion";
import { staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GaugeStatusBadge from "./GaugeStatusBadge";
import { DIMENSION_SHORT_NAMES } from "@/types/gaugePro";
import type { GaugeProDimension } from "@/types/gaugePro";
import type { TeamMember, Department, Position } from "@/types/teamManagement";

interface TeamMemberCardProps {
  member: TeamMember;
  department?: Department;
  position?: Position;
  onClick: () => void;
}

const DIMENSION_COLORS: Record<GaugeProDimension, string> = {
  D1: "bg-red-500",
  D2: "bg-amber-500",
  D3: "bg-green-500",
  D4: "bg-blue-500",
  D5: "bg-purple-500",
};

const DIMENSION_ORDER: GaugeProDimension[] = ["D1", "D2", "D3", "D4", "D5"];

export default function TeamMemberCard({
  member,
  department,
  position,
  onClick,
}: TeamMemberCardProps) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <motion.div variants={staggerItem}>
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5",
          !member.isActive && "opacity-60",
        )}
        onClick={onClick}
      >
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col items-center text-center gap-3">
            {/* Avatar */}
            <Avatar className="h-14 w-14">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Name */}
            <div className="min-w-0 w-full">
              <p className="font-bold text-sm truncate">{member.name}</p>
              {department && (
                <p className="text-xs text-muted-foreground truncate">
                  {department.name}
                </p>
              )}
              {position && (
                <p className="text-xs text-muted-foreground/70 truncate">
                  {position.title}
                </p>
              )}
            </div>

            {/* Gauge Status */}
            <GaugeStatusBadge status={member.gaugeStatus} />

            {/* Archetype */}
            {member.gaugeStatus === "mapped" && member.archetype && (
              <p className="text-xs font-medium text-primary">
                {member.archetype}
              </p>
            )}

            {/* Mini dimension bars */}
            {member.gaugeStatus === "mapped" && member.gaugeScores && (
              <div className="w-full space-y-1.5 mt-1">
                {DIMENSION_ORDER.map((dim) => {
                  const score = member.gaugeScores![dim];
                  return (
                    <div key={dim} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-[52px] text-left truncate">
                        {DIMENSION_SHORT_NAMES[dim]}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            DIMENSION_COLORS[dim],
                          )}
                          style={{ width: `${Math.max(score, 5)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
