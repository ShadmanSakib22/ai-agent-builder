import { createContext, useContext, useEffect, useState } from "react";
import type { AgentData, SavedAgent } from "@/types/agent_types";

interface AgentContextType {
  data: AgentData | null;
  loading: boolean;
  error: string | null;
  selectedProfile: string;
  setSelectedProfile: (id: string) => void;
  selectedSkills: string[];
  setSelectedSkills: (ids: string[]) => void;
  selectedLayers: string[];
  setSelectedLayers: (ids: string[]) => void;
  selectedProvider: string;
  setSelectedProvider: (p: string) => void;
  agentName: string;
  setAgentName: (n: string) => void;
  savedAgents: SavedAgent[];
  saveAgent: () => boolean;
  deleteAgent: (index: number) => void;
  loadAgent: (agent: SavedAgent) => void;
  toggleSkill: (id: string) => void;
  toggleLayer: (id: string) => void;
}

const AgentContext = createContext<AgentContextType | null>(null);

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProfile, setSelectedProfile] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [agentName, setAgentName] = useState("");
  const [savedAgents, setSavedAgents] = useState<SavedAgent[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("savedAgents");
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    fetch("/data.json")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const toggleSkill = (id: string) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleLayer = (id: string) => {
    setSelectedLayers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const saveAgent = (): boolean => {
    if (!agentName.trim()) return false;
    const newAgent: SavedAgent = {
      name: agentName.trim(),
      profileId: selectedProfile,
      skillIds: selectedSkills,
      layerIds: selectedLayers,
      provider: selectedProvider,
      createdAt: new Date().toISOString(),
    };
    const updated = [...savedAgents, newAgent];
    setSavedAgents(updated);
    localStorage.setItem("savedAgents", JSON.stringify(updated));
    return true;
  };

  const deleteAgent = (index: number) => {
    const updated = savedAgents.filter((_, i) => i !== index);
    setSavedAgents(updated);
    localStorage.setItem("savedAgents", JSON.stringify(updated));
  };

  const loadAgent = (agent: SavedAgent) => {
    setSelectedProfile(agent.profileId || "");
    setSelectedSkills(agent.skillIds || []);
    setSelectedLayers(agent.layerIds || []);
    setSelectedProvider(agent.provider || "");
    setAgentName(agent.name);
  };

  return (
    <AgentContext.Provider
      value={{
        data,
        loading,
        error,
        selectedProfile,
        setSelectedProfile,
        selectedSkills,
        setSelectedSkills,
        selectedLayers,
        setSelectedLayers,
        selectedProvider,
        setSelectedProvider,
        agentName,
        setAgentName,
        savedAgents,
        saveAgent,
        deleteAgent,
        loadAgent,
        toggleSkill,
        toggleLayer,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error("useAgent must be used within AgentProvider");
  return ctx;
}
