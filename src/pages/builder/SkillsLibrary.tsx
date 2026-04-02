import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuilderLayout } from '@/components/BuilderLayout';
import { useAgentBuilderStore } from '@/store/agentBuilderStore';
import { useAgentData } from '@/hooks/useAgentData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle, X } from 'lucide-react';

const SkillsLibrary = () => {
  const navigate = useNavigate();
  const { selectedSkillIds, addSkill, removeSkill, setCurrentStep } = useAgentBuilderStore();
  const { data, isLoading } = useAgentData();

  const groupedSkills = useMemo(() => {
    const groups: Record<string, typeof data.skills> = {};
    data.skills.forEach((skill) => {
      if (!groups[skill.category]) {
        groups[skill.category] = [];
      }
      groups[skill.category].push(skill);
    });
    return groups;
  }, [data.skills]);

  const handleToggleSkill = (skillId: string) => {
    if (selectedSkillIds.includes(skillId)) {
      removeSkill(skillId);
    } else {
      addSkill(skillId);
    }
  };

  const handleNext = () => {
    setCurrentStep(3);
    navigate('/builder/personalities');
  };

  const handleBack = () => {
    setCurrentStep(1);
    navigate('/builder/base-profiles');
  };

  if (isLoading) {
    return (
      <BuilderLayout title="Skills Library" description="Select skills for your AI agent">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading skills...</p>
        </div>
      </BuilderLayout>
    );
  }

  return (
    <BuilderLayout title="Skills Library" description="Select skills that your AI agent will have">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {Object.entries(groupedSkills).map(([category, skills]) => (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-semibold capitalize mb-4 text-primary">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map((skill) => (
                    <Card
                      key={skill.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-lg border-2 ${
                        selectedSkillIds.includes(skill.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent hover:border-primary/30'
                      }`}
                      onClick={() => handleToggleSkill(skill.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {selectedSkillIds.includes(skill.id) ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{skill.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Skills Panel */}
          <div>
            <div className="bg-muted p-4 rounded-lg sticky top-4">
              <h4 className="font-semibold mb-4">Selected Skills ({selectedSkillIds.length})</h4>
              <div className="space-y-2">
                {selectedSkillIds.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No skills selected yet</p>
                ) : (
                  data.skills
                    .filter((s) => selectedSkillIds.includes(s.id))
                    .map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between bg-background p-2 rounded">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSkill(skill.id);
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={handleBack}>
            Back: Base Profiles
          </Button>
          <Button onClick={handleNext}>
            Next: Personalities
          </Button>
        </div>
      </div>
    </BuilderLayout>
  );
};

export default SkillsLibrary;
