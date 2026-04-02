import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuilderLayout } from '@/components/BuilderLayout';
import { useAgentBuilderStore } from '@/store/agentBuilderStore';
import { useAgentData } from '@/hooks/useAgentData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle, X } from 'lucide-react';

const Personalities = () => {
  const navigate = useNavigate();
  const { selectedLayerIds, addLayer, removeLayer, setCurrentStep } = useAgentBuilderStore();
  const { data, isLoading } = useAgentData();

  const groupedLayers = useMemo(() => {
    const groups: Record<string, typeof data.layers> = {};
    data.layers.forEach((layer) => {
      if (!groups[layer.type]) {
        groups[layer.type] = [];
      }
      groups[layer.type].push(layer);
    });
    return groups;
  }, [data.layers]);

  const handleToggleLayer = (layerId: string) => {
    if (selectedLayerIds.includes(layerId)) {
      removeLayer(layerId);
    } else {
      addLayer(layerId);
    }
  };

  const handleNext = () => {
    setCurrentStep(4);
    navigate('/builder/ai-providers');
  };

  const handleBack = () => {
    setCurrentStep(2);
    navigate('/builder/skills-library');
  };

  if (isLoading) {
    return (
      <BuilderLayout title="Personalities" description="Add personality and behavioral layers to your agent">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading layers...</p>
        </div>
      </BuilderLayout>
    );
  }

  return (
    <BuilderLayout title="Personalities" description="Add personality and behavioral layers to your agent">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {Object.entries(groupedLayers).map(([type, layers]) => (
              <div key={type} className="mb-8">
                <h3 className="text-lg font-semibold capitalize mb-4 text-primary">
                  {type.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {layers.map((layer) => (
                    <Card
                      key={layer.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-lg border-2 ${
                        selectedLayerIds.includes(layer.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent hover:border-primary/30'
                      }`}
                      onClick={() => handleToggleLayer(layer.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {selectedLayerIds.includes(layer.id) ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{layer.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{layer.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Layers Panel */}
          <div>
            <div className="bg-muted p-4 rounded-lg sticky top-4">
              <h4 className="font-semibold mb-4">Selected Layers ({selectedLayerIds.length})</h4>
              <div className="space-y-2">
                {selectedLayerIds.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No layers selected yet</p>
                ) : (
                  data.layers
                    .filter((l) => selectedLayerIds.includes(l.id))
                    .map((layer) => (
                      <div key={layer.id} className="flex items-center justify-between bg-background p-2 rounded">
                        <span className="text-sm font-medium">{layer.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLayer(layer.id);
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
            Back: Skills Library
          </Button>
          <Button onClick={handleNext}>
            Next: AI Providers
          </Button>
        </div>
      </div>
    </BuilderLayout>
  );
};

export default Personalities;
