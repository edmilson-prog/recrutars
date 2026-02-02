/**
 * Talent Profile Cards
 * PRD-057: Identificacao de 6 perfis de talento baseados nos scores Gauge-Pro
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  Target,
  Heart,
  Lightbulb,
  Zap,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';
import type { TeamMember, TalentProfile, TalentProfileType } from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Icon Mapping
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, React.ElementType> = {
  Crown,
  Target,
  Heart,
  Lightbulb,
  Zap,
  GraduationCap,
};

// ---------------------------------------------------------------------------
// Talent Profiles
// ---------------------------------------------------------------------------

const TALENT_PROFILES: TalentProfile[] = [
  {
    type: 'natural_leader',
    label: 'Lider Natural',
    description: 'Alta assertividade com forte orientacao relacional',
    criteria: 'D1>=70 E D5>=60',
    icon: 'Crown',
    color: '#dc2626',
  },
  {
    type: 'specialist',
    label: 'Especialista',
    description: 'Foco em qualidade e consistencia',
    criteria: 'D4>=75 E D3>=60',
    icon: 'Target',
    color: '#7c3aed',
  },
  {
    type: 'mediator',
    label: 'Mediador',
    description: 'Excelente em resolver conflitos e construir pontes',
    criteria: 'D5>=75 E D2>=60',
    icon: 'Heart',
    color: '#059669',
  },
  {
    type: 'innovator',
    label: 'Inovador',
    description: 'Pensamento criativo com desapego a processos rigidos',
    criteria: 'D1>=60 E D4<40',
    icon: 'Lightbulb',
    color: '#d97706',
  },
  {
    type: 'motor',
    label: 'Motor',
    description: 'Alta energia e execucao com ritmo acelerado',
    criteria: 'D1>=70 E D3>=70',
    icon: 'Zap',
    color: '#0891b2',
  },
  {
    type: 'mentor',
    label: 'Mentor',
    description: 'Capacidade de desenvolver outros com paciencia',
    criteria: 'D5>=70 E D4>=60',
    icon: 'GraduationCap',
    color: '#db2777',
  },
];

// ---------------------------------------------------------------------------
// Matching Logic
// ---------------------------------------------------------------------------

function matchesProfile(
  type: TalentProfileType,
  member: TeamMember,
): boolean {
  const s = member.gaugeScores;
  if (!s) return false;

  switch (type) {
    case 'natural_leader':
      return s.D1 >= 70 && s.D5 >= 60;
    case 'specialist':
      return s.D4 >= 75 && s.D3 >= 60;
    case 'mediator':
      return s.D5 >= 75 && s.D2 >= 60;
    case 'innovator':
      return s.D1 >= 60 && s.D4 < 40;
    case 'motor':
      return s.D1 >= 70 && s.D3 >= 70;
    case 'mentor':
      return s.D5 >= 70 && s.D4 >= 60;
    default:
      return false;
  }
}

function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TalentProfileCardsProps {
  members: TeamMember[];
}

export default function TalentProfileCards({ members }: TalentProfileCardsProps) {
  const profileMatches = useMemo(() => {
    return TALENT_PROFILES.map((profile) => ({
      profile,
      matches: members.filter(
        (m) => m.gaugeStatus === 'mapped' && m.gaugeScores && matchesProfile(profile.type, m),
      ),
    }));
  }, [members]);

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {profileMatches.map(({ profile, matches }) => {
        const Icon = ICON_MAP[profile.icon] ?? Crown;

        return (
          <motion.div key={profile.type} variants={staggerItem}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-lg"
                      style={{
                        backgroundColor: `${profile.color}15`,
                        color: profile.color,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle
                        className="text-sm font-semibold"
                        style={{ color: profile.color }}
                      >
                        {profile.label}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {profile.description}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs tabular-nums',
                      matches.length > 0
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {matches.length}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-[10px] text-muted-foreground/60 mb-3 font-mono">
                  {profile.criteria}
                </p>

                {matches.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-3">
                    Nenhum membro identificado
                  </p>
                ) : (
                  <div className="space-y-2">
                    {matches.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 bg-muted/50"
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarFallback
                            className="text-[10px] font-medium"
                            style={{
                              backgroundColor: `${profile.color}20`,
                              color: profile.color,
                            }}
                          >
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium truncate">
                          {member.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
