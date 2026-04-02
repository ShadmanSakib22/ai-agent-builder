import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuilderLayout } from '@/components/BuilderLayout';
import { useAgentBuilderStore } from '@/store/agentBuilderStore';
import { useModelStore } from '@/store/modelStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const Deployments = () => {
  const navigate = useNavigate();
  const {
    selectedProfileId,
    selectedSkillIds,
    selectedLayerIds,
    selectedProvider,
    editingModelId,
    editingModelName,
    resetBuilder,
  } = useAgentBuilderStore();

  const { saveModel, updateModel, models } = useModelStore();

  const [deploymentName, setDeploymentName] = useState(editingModelName || '');
  const [isDeploying, setIsDeploying] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isEditMode = !!editingModelId;
  const isValid = deploymentName.trim().length > 0 && selectedProfileId && selectedProvider;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeploymentName(e.target.value);
    setErrorMessage('');
  };

  const validateDeployment = () => {
    if (!deploymentName.trim()) {
      setErrorMessage('Agent name is required');
      return false;
    }

    if (deploymentName.trim().length < 3) {
      setErrorMessage('Agent name must be at least 3 characters');
      return false;
    }

    // Check for duplicate names (excluding current model if editing)
    const isDuplicate = models.some(
      (m) => m.name.toLowerCase() === deploymentName.toLowerCase() && m.id !== editingModelId
    );

    if (isDuplicate) {
      setErrorMessage('An agent with this name already exists');
      return false;
    }

    if (!selectedProfileId) {
      setErrorMessage('Please select a profile');
      return false;
    }

    if (!selectedProvider) {
      setErrorMessage('Please select an AI provider');
      return false;
    }

    return true;
  };

  const handleDeploy = async () => {
    if (!validateDeployment()) {
      return;
    }

    setIsDeploying(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const agentData = {
        name: deploymentName.trim(),
        profileId: selectedProfileId,
        skillIds: selectedSkillIds,
        layerIds: selectedLayerIds,
        providerId: selectedProvider,
      };

      if (isEditMode && editingModelId) {
        // Update existing model
        updateModel(editingModelId, agentData);
        setSuccessMessage(`Agent "${deploymentName}" updated successfully!`);
      } else {
        // Save new model
        const newId = saveModel(agentData);
        setSuccessMessage(`Agent "${deploymentName}" deployed successfully! (ID: ${newId})`);
      }

      // Reset builder state after successful deployment
      setTimeout(() => {
        resetBuilder();
        navigate('/builder/models');
      }, 1500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to deploy agent');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCancel = () => {
    resetBuilder();
    navigate('/builder/blueprint');
  };

  return (
    <BuilderLayout
      title={isEditMode ? 'Update Agent' : 'Deploy Agent'}
      description={isEditMode ? `Update existing agent: ${editingModelName}` : 'Deploy your AI agent'}
    >
      <div className="flex flex-col gap-6">
        <Card className="p-8">
          <div className="space-y-6">
            {/* Mode Indicator */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
              {isEditMode ? (
                <>
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    <strong>Edit Mode:</strong> You are updating an existing agent
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800">
                    <strong>New Agent:</strong> You are creating a new agent
                  </span>
                </>
              )}
            </div>

            {/* Deployment Name Input */}
            <div>
              <label htmlFor="agentName" className="block text-sm font-semibold mb-2">
                Agent Name *
              </label>
              <input
                id="agentName"
                type="text"
                value={deploymentName}
                onChange={handleNameChange}
                placeholder="Enter a unique name for your agent (e.g., 'Customer Support Bot')"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isDeploying}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Name must be unique and at least 3 characters long
              </p>
            </div>

            {/* Deployment Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Profile</p>
                <p className="text-sm font-semibold">Configured</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Skills</p>
                <p className="text-sm font-semibold">{selectedSkillIds.length}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Layers</p>
                <p className="text-sm font-semibold">{selectedLayerIds.length}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Provider</p>
                <p className="text-sm font-semibold">Configured</p>
              </div>
            </div>

            {/* Messages */}
            {errorMessage && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            )}

            {successMessage && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between gap-3 pt-6 border-t">
          <Button variant="outline" onClick={handleCancel} disabled={isDeploying}>
            Cancel
          </Button>
          <Button onClick={handleDeploy} disabled={!isValid || isDeploying} size="lg">
            {isDeploying ? 'Processing...' : isEditMode ? 'Update Agent' : 'Deploy Agent'}
          </Button>
        </div>
      </div>
    </BuilderLayout>
  );
};

export default Deployments;
