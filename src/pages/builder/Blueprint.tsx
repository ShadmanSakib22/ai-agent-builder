import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BuilderLayout } from '@/components/BuilderLayout';
import { useAgentBuilderStore } from '@/store/agentBuilderStore';
import { useAgentData } from '@/hooks/useAgentData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight, Edit2 } from 'lucide-react';

const Blueprint = () => {
  const navigate = useNavigate();
  const { selectedProfileId, selectedSkillIds, selectedLayerIds, selectedProvider, editingModelId } =
    useAgentBuilderStore();
  const { data, isLoading } = useAgentData();

  const selectedProfile = data.agentProfiles.find((p) => p.id === selectedProfileId);
  const selectedSkills = data.skills.filter((s) => selectedSkillIds.includes(s.id));
  const selectedLayers = data.layers.filter((l) => selectedLayerIds.includes(l.id));

  const handleEditSection = (path: string) => {
    navigate(path);
  };

  const handleDeploy = () => {
    navigate('/builder/deployments');
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <BuilderLayout title="Blueprint" description="Review your AI agent configuration">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading blueprint...</p>
        </div>
      </BuilderLayout>
    );
  }

  return (
    <BuilderLayout title="Blueprint" description="Review your AI agent configuration">
      <div className="flex flex-col gap-6">
        {/* Profile Section */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Base Profile</h3>
              <p className="text-sm text-muted-foreground">The foundational personality of your agent</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditSection('/builder/base-profiles')}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold text-lg">{selectedProfile?.name || 'No profile selected'}</h4>
            <p className="text-sm text-muted-foreground mt-2">{selectedProfile?.description}</p>
          </div>
        </Card>

        {/* Skills Section */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Skills</h3>
              <p className="text-sm text-muted-foreground">Capabilities your agent will have</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditSection('/builder/skills-library')}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full">No skills selected</p>
            ) : (
              selectedSkills.map((skill) => (
                <div key={skill.id} className="bg-muted p-3 rounded-lg">
                  <h5 className="font-semibold text-sm">{skill.name}</h5>
                  <p className="text-xs text-muted-foreground mt-1">{skill.description}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Layers/Personalities Section */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Personalities & Layers</h3>
              <p className="text-sm text-muted-foreground">Behavioral and personality traits</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditSection('/builder/personalities')}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedLayers.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full">No layers selected</p>
            ) : (
              selectedLayers.map((layer) => (
                <div key={layer.id} className="bg-muted p-3 rounded-lg">
                  <h5 className="font-semibold text-sm">{layer.name}</h5>
                  <p className="text-xs text-muted-foreground mt-1">{layer.description}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Provider Section */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">AI Provider</h3>
              <p className="text-sm text-muted-foreground">The LLM provider powering your agent</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditSection('/builder/ai-providers')}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-semibold capitalize">
              {selectedProvider ? selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1) : 'No provider selected'}
            </p>
          </div>
        </Card>

        {/* Summary */}
        <Card className="p-6 bg-primary/5 border-primary/30">
          <h4 className="font-semibold mb-3">Configuration Summary</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-primary" />
              <span>
                <strong>Profile:</strong> {selectedProfile?.name || 'Not selected'}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-primary" />
              <span>
                <strong>Skills:</strong> {selectedSkills.length} selected
              </span>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-primary" />
              <span>
                <strong>Layers:</strong> {selectedLayers.length} selected
              </span>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-primary" />
              <span>
                <strong>Provider:</strong> {selectedProvider ? selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1) : 'Not selected'}
              </span>
            </li>
          </ul>
        </Card>

        <div className="flex justify-between gap-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleDeploy} size="lg">
            {editingModelId ? 'Update Agent' : 'Deploy Agent'}
          </Button>
        </div>
      </div>
    </BuilderLayout>
  );
};

export default Blueprint;
