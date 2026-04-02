import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BuilderLayout } from '@/components/BuilderLayout';
import { useAgentBuilderStore } from '@/store/agentBuilderStore';
import { useAgentData } from '@/hooks/useAgentData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const BaseProfiles = () => {
  const navigate = useNavigate();
  const { selectedProfileId, setProfile, setCurrentStep } = useAgentBuilderStore();
  const { data, isLoading } = useAgentData();

  const handleSelectProfile = (profileId: string) => {
    setProfile(profileId);
    setCurrentStep(1);
  };

  const handleNext = () => {
    if (!selectedProfileId) {
      alert('Please select a profile before proceeding');
      return;
    }
    setCurrentStep(2);
    navigate('/builder/skills-library');
  };

  if (isLoading) {
    return (
      <BuilderLayout title="Base Profiles" description="Select a base profile for your AI agent">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading profiles...</p>
        </div>
      </BuilderLayout>
    );
  }

  return (
    <BuilderLayout title="Base Profiles" description="Select a base profile for your AI agent">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.agentProfiles.map((profile) => (
            <Card
              key={profile.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-lg border-2 ${
                selectedProfileId === profile.id
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent hover:border-primary/30'
              }`}
              onClick={() => handleSelectProfile(profile.id)}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{profile.description}</p>
                </div>
                {selectedProfileId === profile.id && (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button onClick={handleNext} disabled={!selectedProfileId}>
            Next: Skills Library
          </Button>
        </div>
      </div>
    </BuilderLayout>
  );
};

export default BaseProfiles;
