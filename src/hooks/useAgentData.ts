import { useState, useEffect } from 'react';

export interface AgentProfile {
  id: string;
  name: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface Layer {
  id: string;
  name: string;
  type: string;
  description: string;
}

export interface AgentData {
  agentProfiles: AgentProfile[];
  skills: Skill[];
  layers: Layer[];
}

export const useAgentData = () => {
  const [data, setData] = useState<AgentData>({
    agentProfiles: [],
    skills: [],
    layers: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/data.json');
        if (!response.ok) {
          throw new Error('Failed to fetch agent data');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('[v0] Error fetching agent data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    data,
    isLoading,
    error,
    agentProfiles: data.agentProfiles,
    skills: data.skills,
    layers: data.layers,
  };
};
