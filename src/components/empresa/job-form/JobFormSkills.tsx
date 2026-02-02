import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface JobFormSkillsProps {
  skills: string[];
  newSkill: string;
  onNewSkillChange: (value: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skill: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export function JobFormSkills({
  skills,
  newSkill,
  onNewSkillChange,
  onAddSkill,
  onRemoveSkill,
  onKeyPress,
}: JobFormSkillsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Competências Desejadas</CardTitle>
        <CardDescription>Adicione as skills e competências esperadas dos candidatos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Digite uma skill e pressione Enter"
            value={newSkill}
            onChange={(e) => onNewSkillChange(e.target.value)}
            onKeyDown={onKeyPress}
          />
          <Button type="button" variant="outline" onClick={onAddSkill}>
            Adicionar
          </Button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                {skill}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:bg-transparent"
                  onClick={() => onRemoveSkill(skill)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
