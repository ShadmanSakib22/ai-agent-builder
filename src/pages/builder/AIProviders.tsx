import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BuilderLayout } from '@/components/BuilderLayout';
import { useAgentBuilderStore } from '@/store/agentBuilderStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const providers = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4 and GPT-3.5 models with advanced reasoning capabilities.',
    icon: '🤖',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude 3 models optimized for complex reasoning and analysis.',
    icon: '🧠',
  },
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Multimodal models with advanced vision and text capabilities.',
    icon: '🔍',
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Enterprise-grade language models with custom training options.',
    icon: '⚡',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Open and efficient models for various use cases.',
    icon: '🌟',
  },
  {
    id: 'llama',
    name: 'Meta Llama',
    description: 'Open-source large language models optimized for performance.',
    icon: '🦙',
  },
];

const AIProviders = () => {
  const navigate = useNavigate();
  const { selectedProvider, setProvider, setCurrentStep } = useAgentBuilderStore();

  const handleSelectProvider = (providerId: string) => {
    setProvider(providerId);
    setCurrentStep(4);
  };

  const handleNext = () => {
    if (!selectedProvider) {
      alert('Please select an AI provider before proceeding');
      return;
    }
    navigate('/builder/blueprint');
  };

  const handleBack = () => {
    setCurrentStep(3);
    navigate('/builder/personalities');
  };

  return (
    <BuilderLayout title="AI Providers" description="Choose the AI provider for your agent">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider) => (
            <Card
              key={provider.id}
              className={`p-6 cursor-pointer transition-all hover:shadow-lg border-2 ${
                selectedProvider === provider.id
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent hover:border-primary/30'
              }`}
              onClick={() => handleSelectProvider(provider.id)}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-4xl">{provider.icon}</span>
                {selectedProvider === provider.id && (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </div>
              <h3 className="font-semibold text-lg">{provider.name}</h3>
              <p className="text-sm text-muted-foreground mt-2">{provider.description}</p>
            </Card>
          ))}
        </div>

        <div className="flex justify-between gap-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={handleBack}>
            Back: Personalities
          </Button>
          <Button onClick={handleNext} disabled={!selectedProvider}>
            Next: Review Blueprint
          </Button>
        </div>
      </div>
    </BuilderLayout>
  );
};

export default AIProviders;
