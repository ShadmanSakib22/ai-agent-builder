import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useAgentBuilderStore } from '@/store/agentBuilderStore';
import { useAgentData } from '@/hooks/useAgentData';

interface BuilderLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export const BuilderLayout: React.FC<BuilderLayoutProps> = ({
  children,
  title,
  description,
}) => {
  const { editingModelId, editingModelName, currentStep } = useAgentBuilderStore();
  const { data } = useAgentData();

  const steps = [
    { number: 1, title: 'Base Profiles', path: '/builder/base-profiles' },
    { number: 2, title: 'Skills Library', path: '/builder/skills-library' },
    { number: 3, title: 'Personalities', path: '/builder/personalities' },
    { number: 4, title: 'AI Providers', path: '/builder/ai-providers' },
  ];

  const getProfileName = (profileId: string | null) => {
    if (!profileId) return '';
    return data.agentProfiles.find((p) => p.id === profileId)?.name || '';
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Builder</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{title}</span>
          {editingModelId && (
            <>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-amber-600 font-medium">(Edit mode: {editingModelName})</span>
            </>
          )}
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      {/* Step Indicators */}
      <div className="flex gap-2 mb-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === step.number
                ? 'bg-primary text-primary-foreground'
                : currentStep > step.number
                ? 'bg-green-100 text-green-900'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <span className="font-semibold">{step.number}</span>
            <span className="text-sm font-medium">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};
